//=================================================
// AWS RDS Database Wrapper
//=================================================
// This wrapper provides a simple interface to interact with AWS RDS
// Supports both regular connections and IAM authentication
//=================================================

const mysql = require('mysql2/promise');
const { defaultProvider } = require('@aws-sdk/credential-providers');
const { RDSClient, GenerateDBAuthTokenCommand } = require('@aws-sdk/client-rds');

//=================================================
// Configuration from environment variables
//=================================================
const DB_CONFIG = {
    host: process.env.DB_HOST,
    port: process.env.DB_PORT || 3306,
    database: process.env.DB_NAME,
    user: process.env.DB_USER,
    password: process.env.DB_PASSWORD,
    region: process.env.AWS_REGION || process.env.DB_REGION || 'us-east-2',
    useIAMAuth: process.env.DB_USE_IAM_AUTH === 'true' || process.env.DB_USE_IAM_AUTH === '1',
    ssl: process.env.DB_SSL === 'true' || process.env.DB_SSL === '1' ? { rejectUnauthorized: false } : false,
    connectionLimit: parseInt(process.env.DB_CONNECTION_LIMIT || '20'),
    waitForConnections: true,
    queueLimit: 0,
    connectTimeout: parseInt(process.env.DB_CONNECT_TIMEOUT || '10000'), // 10 seconds default
    acquireTimeout: parseInt(process.env.DB_ACQUIRE_TIMEOUT || '10000'), // 10 seconds default
    timeout: parseInt(process.env.DB_TIMEOUT || '10000') // 10 seconds default
};

//=================================================
// Connection Pool
//=================================================
let pool = null;

//=================================================
// Initialize Database Connection Pool
//=================================================
async function initializePool() {
    try {
        // Validate required database configuration
        if (!DB_CONFIG.host || !DB_CONFIG.database || !DB_CONFIG.user) {
            const missing = [];
            if (!DB_CONFIG.host) missing.push('DB_HOST');
            if (!DB_CONFIG.database) missing.push('DB_NAME');
            if (!DB_CONFIG.user) missing.push('DB_USER');
            throw new Error(`Missing required database configuration: ${missing.join(', ')}. Please check your .env file.`);
        }

        let config = {
            host: DB_CONFIG.host,
            port: DB_CONFIG.port,
            database: DB_CONFIG.database,
            ssl: DB_CONFIG.ssl,
            waitForConnections: DB_CONFIG.waitForConnections,
            connectionLimit: DB_CONFIG.connectionLimit,
            queueLimit: DB_CONFIG.queueLimit,
            connectTimeout: DB_CONFIG.connectTimeout,
            acquireTimeout: DB_CONFIG.acquireTimeout,
            timeout: DB_CONFIG.timeout
        };

        // Use IAM authentication if enabled
        if (DB_CONFIG.useIAMAuth) {
            const rdsClient = new RDSClient({ 
                region: DB_CONFIG.region,
                credentials: defaultProvider() // Uses default credential chain: env vars, ~/.aws/credentials, instance profile, etc.
            });

            const command = new GenerateDBAuthTokenCommand({
                region: DB_CONFIG.region,
                hostname: DB_CONFIG.host,
                port: DB_CONFIG.port,
                username: DB_CONFIG.user
            });

            const token = await rdsClient.send(command);
            config.user = DB_CONFIG.user;
            config.password = token;
        } else {
            // Regular username/password authentication
            config.user = DB_CONFIG.user;
            config.password = DB_CONFIG.password;
        }

        pool = mysql.createPool(config);
        console.log(`Database connection pool initialized successfully (host: ${DB_CONFIG.host}, database: ${DB_CONFIG.database})`);
        
        // Test the connection immediately
        try {
            const testConnection = await pool.getConnection();
            await testConnection.ping();
            testConnection.release();
            console.log('Database connection test successful');
        } catch (testError) {
            console.error('Database connection test failed:', testError.message);
            console.error('This may indicate:');
            console.error('  1. Database host is unreachable from this network');
            console.error('  2. Database credentials are incorrect');
            console.error('  3. Database is behind a firewall/VPC');
            console.error('  4. SSL configuration is incorrect');
            // Don't throw here - let it fail on first query for better error context
        }
        
        return pool;
    } catch (error) {
        console.error('Error initializing database pool:', error);
        console.error('Database configuration:', {
            host: DB_CONFIG.host,
            port: DB_CONFIG.port,
            database: DB_CONFIG.database,
            user: DB_CONFIG.user,
            hasPassword: !!DB_CONFIG.password,
            useIAMAuth: DB_CONFIG.useIAMAuth,
            ssl: DB_CONFIG.ssl
        });
        throw error;
    }
}

//=================================================
// Get Connection Pool (lazy initialization)
//=================================================
async function getPool() {
    if (!pool) {
        await initializePool();
    }
    return pool;
}

//=================================================
// Execute Query
//=================================================
/**
 * Execute a SQL query with optional parameters
 * @param {string} query - SQL query string
 * @param {Array} params - Query parameters (optional)
 * @returns {Promise<Array>} Query results
 */
async function query(query, params = []) {
    try {
        const pool = await getPool();
        const [rows] = await pool.execute(query, params);
        return rows;
    } catch (error) {
        console.error('Database query error:', error.message);
        console.error('Error code:', error.code);
        console.error('Error sqlState:', error.sqlState);
        
        // Provide more helpful error messages
        if (error.code === 'ETIMEDOUT' || error.code === 'ECONNREFUSED') {
            const detailedError = new Error(`Database connection failed: Cannot connect to ${DB_CONFIG.host}:${DB_CONFIG.port}. ` +
                `This usually means the database is unreachable from your network. ` +
                `Check if: 1) The database is running, 2) Your IP is allowed in security groups, 3) VPN/tunnel is needed.`);
            detailedError.originalError = error;
            detailedError.code = error.code;
            throw detailedError;
        } else if (error.code === 'ER_ACCESS_DENIED_ERROR') {
            const detailedError = new Error(`Database authentication failed: Invalid username or password for ${DB_CONFIG.user}@${DB_CONFIG.host}`);
            detailedError.originalError = error;
            detailedError.code = error.code;
            throw detailedError;
        } else if (error.code === 'ENOTFOUND') {
            const detailedError = new Error(`Database host not found: ${DB_CONFIG.host}. Check your DB_HOST configuration.`);
            detailedError.originalError = error;
            detailedError.code = error.code;
            throw detailedError;
        }
        
        throw error;
    }
}

//=================================================
// Execute Query (returns metadata)
//=================================================
/**
 * Execute a SQL query and return both rows and metadata
 * @param {string} query - SQL query string
 * @param {Array} params - Query parameters (optional)
 * @returns {Promise<Object>} Object with rows and metadata
 */
async function queryWithMetadata(query, params = []) {
    try {
        const pool = await getPool();
        const [rows, fields] = await pool.execute(query, params);
        return { rows, fields };
    } catch (error) {
        console.error('Database query error:', error);
        throw error;
    }
}

//=================================================
// Get Connection (for transactions)
//=================================================
/**
 * Get a single connection from the pool (for transactions)
 * @returns {Promise<Connection>} Database connection
 */
async function getConnection() {
    try {
        const pool = await getPool();
        return await pool.getConnection();
    } catch (error) {
        console.error('Error getting database connection:', error);
        throw error;
    }
}

//=================================================
// Execute Transaction
//=================================================
/**
 * Execute multiple queries within a transaction
 * @param {Function} callback - Async function that receives a connection and executes queries
 * @returns {Promise<any>} Result from the callback
 */
async function transaction(callback) {
    const connection = await getConnection();
    try {
        await connection.beginTransaction();
        const result = await callback(connection);
        await connection.commit();
        return result;
    } catch (error) {
        await connection.rollback();
        throw error;
    } finally {
        connection.release();
    }
}

//=================================================
// Test Connection
//=================================================
/**
 * Test the database connection
 * @returns {Promise<boolean>} True if connection is successful
 */
async function testConnection() {
    try {
        const result = await query('SELECT 1 as test');
        return result.length > 0 && result[0].test === 1;
    } catch (error) {
        console.error('Database connection test failed:', error);
        return false;
    }
}

//=================================================
// Close Pool
//=================================================
/**
 * Close all connections in the pool
 * @returns {Promise<void>}
 */
async function closePool() {
    if (pool) {
        await pool.end();
        pool = null;
        console.log('Database connection pool closed');
    }
}

//=================================================
// Health Check
//=================================================
/**
 * Check database health
 * @returns {Promise<Object>} Health status object
 */
async function healthCheck() {
    try {
        const isConnected = await testConnection();
        return {
            status: isConnected ? 'healthy' : 'unhealthy',
            connected: isConnected,
            host: DB_CONFIG.host,
            database: DB_CONFIG.database,
            poolSize: pool ? pool.pool._allConnections.length : 0,
            activeConnections: pool ? pool.pool._acquiredConnections.length : 0
        };
    } catch (error) {
        return {
            status: 'error',
            connected: false,
            error: error.message
        };
    }
}

//=================================================
// Module Exports
//=================================================
module.exports = {
    query,
    queryWithMetadata,
    getConnection,
    transaction,
    testConnection,
    closePool,
    healthCheck,
    initializePool,
    getPool
};


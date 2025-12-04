//=================================================
// Database Wrapper Usage Examples
//=================================================

const db = require('../database');

// Example 1: Simple query
async function example1() {
    try {
        const users = await db.query('SELECT * FROM users WHERE id = ?', [1]);
        console.log('Users:', users);
    } catch (error) {
        console.error('Error:', error);
    }
}

// Example 2: Query with metadata
async function example2() {
    try {
        const result = await db.queryWithMetadata('SELECT * FROM users LIMIT 10');
        console.log('Rows:', result.rows);
        console.log('Field info:', result.fields);
    } catch (error) {
        console.error('Error:', error);
    }
}

// Example 3: Transaction
async function example3() {
    try {
        const result = await db.transaction(async (connection) => {
            // Execute multiple queries in a transaction
            await connection.execute('INSERT INTO users (name, email) VALUES (?, ?)', ['John', 'john@example.com']);
            const [rows] = await connection.execute('SELECT LAST_INSERT_ID() as id');
            const userId = rows[0].id;
            
            await connection.execute('INSERT INTO user_profiles (user_id, bio) VALUES (?, ?)', [userId, 'Bio here']);
            
            return userId;
        });
        console.log('Transaction completed, user ID:', result);
    } catch (error) {
        console.error('Transaction error:', error);
    }
}

// Example 4: Health check
async function example4() {
    const health = await db.healthCheck();
    console.log('Database health:', health);
}

// Example 5: Using connection directly for complex operations
async function example5() {
    const connection = await db.getConnection();
    try {
        await connection.beginTransaction();
        
        // Your queries here
        await connection.execute('UPDATE users SET status = ? WHERE id = ?', ['active', 1]);
        
        await connection.commit();
    } catch (error) {
        await connection.rollback();
        throw error;
    } finally {
        connection.release();
    }
}

// Example 6: Test connection
async function example6() {
    const isConnected = await db.testConnection();
    if (isConnected) {
        console.log('Database connection successful!');
    } else {
        console.log('Database connection failed!');
    }
}

module.exports = {
    example1,
    example2,
    example3,
    example4,
    example5,
    example6
};


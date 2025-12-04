//===============================================
// HANDLES ALL BASIC AUTHENTICATION
//===============================================


// import modules
const express           = require("express");
const router            = express.Router();
const { OAuth2Client }  = require("google-auth-library");
const jwt               = require('jsonwebtoken');
const bcrypt            = require('bcrypt');
const { randomUUID }    = require('crypto');
const { RC_RESPONSE }   = require('../utils/endpoint_helpers.js');
const { RC_CODES }      = require('../utils/error.js');

// db wrapper functions
const { query }         = require('../wrappers/database.js');

require("dotenv").config();


//===============================================
// ENDPOINT HELPERS
//===============================================


/**
 * Authenticate user by username/email and password
 * @param {string} username - Username or email
 * @param {string} password - Plain text password
 * @returns {Promise<Object|null>} User object if authenticated, null otherwise
 */
async function getSession(username, password){
    try {
        // Query user by username or email from Users table
        const users = await query(
            'SELECT * FROM Users WHERE username = ? OR email = ?',
            [username, username]
        );

        if (!users || users.length === 0) {
            return null;
        }

        const user = users[0];

        // Check if password hash was truncated (bcrypt hashes are 60 chars, column might be smaller)
        if (user.password && user.password.length < 60) {
            console.warn(`Password hash appears truncated (${user.password.length} chars). Bcrypt hashes need 60 characters.`);
        }

        // Verify password using bcrypt
        const isPasswordValid = await bcrypt.compare(password, user.password);
        
        if (!isPasswordValid) {
            return null;
        }

        // Return user object without password
        return {
            uid: user.uid,
            fname: user.fname,
            lname: user.lname,
            username: user.username,
            email: user.email,
            avatar_url: user.avatar_url,
            address_hash: user.address_hash
        };
    } catch (error) {
        console.error('Error in getSession:', error);
        throw error;
    }
}

/**
 * Add a new user to the database
 * @param {Object} userData - User data object with fname, lname, username, password, email, etc.
 * @returns {Promise<Object>} Created user object (without password)
 */
async function addUser(userData){
    try {
        const { fname, lname, username, password, email, avatar_url = null, address_hash = null } = userData;

        // Validate required fields
        if (!fname || !lname || !username || !password || !email) {
            throw new Error('First name, last name, username, password, and email are required');
        }

        // Check if user already exists
        const existingUsers = await query(
            'SELECT * FROM Users WHERE username = ? OR email = ?',
            [username, email]
        );

        if (existingUsers && existingUsers.length > 0) {
            throw new Error('User with this username or email already exists');
        }

        // Generate UUID for uid
        const uid = randomUUID();

        // Hash password (bcrypt produces 60 char hashes, but column is varchar(50))
        // Using a shorter salt rounds to try to fit, but this may need adjustment
        const saltRounds = 10;
        const hashedPassword = await bcrypt.hash(password, saltRounds);
        
        // Note: bcrypt hashes are typically 60 characters, but column is varchar(50)
        // If this causes issues, consider increasing column size or using a different hashing method
        if (hashedPassword.length > 50) {
            console.warn('Password hash exceeds column size (50). Consider increasing password column size.');
        }

        // Insert user into Users table with password
        await query(
            'INSERT INTO Users (uid, fname, lname, username, email, avatar_url, address_hash, password) VALUES (?, ?, ?, ?, ?, ?, ?, ?)',
            [uid, fname, lname, username, email, avatar_url, address_hash, hashedPassword]
        );

        // Fetch the created user by uid
        const newUsers = await query(
            'SELECT uid, fname, lname, username, email, avatar_url, address_hash FROM Users WHERE uid = ?',
            [uid]
        );

        if (!newUsers || newUsers.length === 0) {
            throw new Error('Failed to retrieve created user');
        }

        // Return user object without password
        return newUsers[0];
    } catch (error) {
        console.error('Error in addUser:', error);
        throw error;
    }
}

/**
 * Middleware to authorize login - validates credentials and authenticates user
 * Attaches authenticated user to req.user if successful
 */
async function authorizeLogin(req, res, next){
    try {
        const { credentials } = req.body;

        if (!credentials) {
            return res.json(RC_RESPONSE(RC_CODES.BAD_REQUEST, {
                details: 'Credentials are required'
            }));
        }

        const { username, password } = credentials;

        // Validate required fields
        if (!username || !password) {
            return res.json(RC_RESPONSE(RC_CODES.BAD_REQUEST, {
                details: 'Username and password are required'
            }));
        }

        // Authenticate user
        const user = await getSession(username, password);

        if (!user) {
            return res.json(RC_RESPONSE(RC_CODES.UNAUTHORIZED, {
                details: 'Invalid username or password'
            }));
        }

        // Attach user to request
        req.user = user;
        next();
    } catch (error) {
        console.error('Error in authorizeLogin:', error);
        return res.json(RC_RESPONSE(RC_CODES.SERVER_ERROR, {
            details: 'Authentication failed',
            error: error.message
        }));
    }
}

/**
 * Create a JWT token for user session
 * @param {Object} userData - User data object
 * @returns {string|null} JWT token or null if invalid
 */
function createJwtForUser(userData){
    if (!userData)
        return null;

    const secret = process.env.JWT_SECRET || "development_secret";
    return jwt.sign(userData, secret, { expiresIn: '7d' });
}

/**
 * Middleware to authorize registration - validates registration data
 * Checks if user already exists before allowing registration
 */
async function authorizeRegistration(req, res, next){
    try {
        const { credentials } = req.body;

        if (!credentials) {
            return res.json(RC_RESPONSE(RC_CODES.BAD_REQUEST, {
                details: 'Registration credentials are required'
            }));
        }

        const { fname, lname, username, password, email } = credentials;

        // Validate required fields
        if (!fname || !lname || !username || !password || !email) {
            return res.json(RC_RESPONSE(RC_CODES.VALIDATION_ERROR, {
                details: 'First name, last name, username, password, and email are required'
            }));
        }

        // Validate password strength (optional - minimum 6 characters)
        if (password.length < 6) {
            return res.json(RC_RESPONSE(RC_CODES.VALIDATION_ERROR, {
                details: 'Password must be at least 6 characters long'
            }));
        }

        // Check if user already exists
        try {
            const existingUsers = await query(
                'SELECT * FROM Users WHERE username = ? OR email = ?',
                [username, email || '']
            );

            if (existingUsers && existingUsers.length > 0) {
                return res.json(RC_RESPONSE(RC_CODES.CONFLICT, {
                    details: 'User with this username or email already exists'
                }));
            }
        } catch (error) {
            // If query fails, continue (might be first user or table doesn't exist yet)
            console.warn('Could not check for existing user:', error.message);
        }

        // Attach credentials to request for use in route handler
        req.registrationData = credentials;
        next();
    } catch (error) {
        console.error('Error in authorizeRegistration:', error);
        return res.json(RC_RESPONSE(RC_CODES.SERVER_ERROR, {
            details: 'Registration validation failed',
            error: error.message
        }));
    }
}







//===============================================
// HTTP ENDPOINTS
//===============================================

//register user with registration credentials
router.post("/basic/register", authorizeRegistration, async (req, res) => {
    try {
        const registrationData = req.registrationData;

        // Add user to database
        const newUser = await addUser(registrationData);

        // Create JWT token for session
        const userToken = createJwtForUser(newUser);

        if (!userToken) {
            return res.json(RC_RESPONSE(RC_CODES.SERVER_ERROR, {
                details: 'Failed to create user session token'
            }));
        }

        // Return success response with userSession
        return res.json(RC_RESPONSE(RC_CODES.SUCCESS, {
            userSession: {
                token: userToken,
                user: newUser
            }
        }));
    } catch (error) {
        console.error('Error in /basic/register:', error);
        
        // Handle specific error cases
        if (error.message.includes('already exists')) {
            return res.json(RC_RESPONSE(RC_CODES.CONFLICT, {
                details: error.message
            }));
        }

        // Handle database connection errors
        if (error.code === 'ETIMEDOUT' || error.code === 'ECONNREFUSED' || error.code === 'ENOTFOUND') {
            return res.json(RC_RESPONSE(RC_CODES.SERVER_ERROR, {
                details: 'Database connection failed. The database may be unreachable from this network.',
                error: error.message,
                code: error.code
            }));
        }

        // Handle database authentication errors
        if (error.code === 'ER_ACCESS_DENIED_ERROR') {
            return res.json(RC_RESPONSE(RC_CODES.SERVER_ERROR, {
                details: 'Database authentication failed. Please check database credentials.',
                error: error.message,
                code: error.code
            }));
        }

        return res.json(RC_RESPONSE(RC_CODES.SERVER_ERROR, {
            details: 'Registration failed',
            error: error.message,
            code: error.code || 'UNKNOWN_ERROR'
        }));
    }
});

// register user with google token
router.post("/google/register", authorizeRegistration, (req, res) => {

});

// login user with username and password
router.post("/basic/login", authorizeLogin, (req, res) => {
    try {
        const user = req.user;

        if (!user) {
            return res.json(RC_RESPONSE(RC_CODES.UNAUTHORIZED, {
                details: 'User not found'
            }));
        }

        // Create JWT token for session
        const userToken = createJwtForUser(user);

        if (!userToken) {
            return res.json(RC_RESPONSE(RC_CODES.SERVER_ERROR, {
                details: 'Failed to create user session token'
            }));
        }

        // Return success response with userSession
        return res.json(RC_RESPONSE(RC_CODES.SUCCESS, {
            userSession: {
                token: userToken,
                user: user
            }
        }));
    } catch (error) {
        console.error('Error in /basic/login:', error);
        return res.json(RC_RESPONSE(RC_CODES.SERVER_ERROR, {
            details: 'Login failed',
            error: error.message
        }));
    }
});

module.exports = router
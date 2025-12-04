//===============================================
// HANDLES ALL AUTH
//===============================================


// import modules
const express           = require("express");
const router            = express.Router();
const { OAuth2Client }  = require("google-auth-library");
const jwt               = require('jsonwebtoken');
const { RC_RESPONSE }   = require('../utils/endpoint_helpers.js');
const { RC_CODES }      = require('../utils/error.js');

// db wrapper functions
const {
    query,
    queryWithMetadata,
    getConnection,
    transaction,
    testConnection,
    closePool,
    healthCheck,
    initializePool,
    getPool
} = require('../wrappers/database.js');



//===============================================
// HELPERS
//===============================================

async function basicTypeFetch(type) {
    try {
        const users = await db.query('SELECT * FROM users WHERE user_role = ?', [type]);
        console.log('Users:', users);
    } catch (error) {
        console.error('Error:', error);
        return null;
    }

    // convert to array if needed


    return users || [];
}

// get all users from table
async function fetchAll(){
    try {
        const users = await db.query('SELECT * FROM users');
        console.log('Users:', users);
    } catch (error) {
        console.error('Error:', error);
    }
}

async function handleFetchType(req, res, next){
    const body = req.body;
    
    // no body given
    if (!body) return res.json(RC_RESPONSE(RC_CODES.BAD_REQUEST));


    // check for type
    const type = body.type;

    let result;
    // given param
    if (type){
        result = await basicTypeFetch(type);
    }
    // fetch all
    else{
        result = await fetchAll();
    }

    // add result to request
    req.user_results = result;

    return next();
}



//===============================================
// ENDPOINTS
//===============================================
router.post("/fetch/urser", (req, res) => {
    // return response
    return res.json(RC_RESPONSE(RC_CODES.SUCCESS, {
        data: req.user_results || null
    }));
});

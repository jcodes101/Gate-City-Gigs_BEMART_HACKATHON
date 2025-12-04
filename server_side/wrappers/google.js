//===============================================
// GOOGLE CLOUD ENDPOINTS
//===============================================



// import modules
const express           = require("express");
const router            = express.Router();
const { OAuth2Client }  = require("google-auth-library");
const jwt               = require('jsonwebtoken');
const { randomUUID }    = require('crypto');
const { RC_RESPONSE }   = require('../utils/endpoint_helpers.js');
const { RC_CODES }      = require('../utils/error.js');
const { query }         = require('./database.js');

require("dotenv").config();

// google client
const clientId = process.env.GOOGLE_CLIENT_ID;
const client = new OAuth2Client(clientId);

// helper methods----------------------------------------------------------------------

/**
 * decodes and verifies given
 * JWT, and passes to next callback()
 * @param {*} req 
 * @param {*} res 
 * @param {*} next 
 */
async function decodeToken(req, res, next){
    console.log("Google auth endpoint hit");
    console.log("Request body:", req.body);
    
    const token = req.body.token || req.body.idToken || req.body;
    try{
        const ticket = await client.verifyIdToken({
            idToken: token,
            audience: clientId,
        });

        // extract values from signed token
        const payload = ticket.getPayload();

        // add new section to http request
        req.user = {
            googleId: payload.sub,
            email: payload.email,
            fullName: payload.name,
            firstName: payload.given_name,
            lastName: payload.family_name,
            picture: payload.picture,
          };
          // go to next middleware layer
          next();

    }catch(error){
        console.error("Couldnt verify google JWT:", error);
        return res.json(RC_RESPONSE(RC_CODES.UNAUTHORIZED, {
            details: "Google JWT verification failed",
            error: error.message
        }));
    }

}

/**
 * checks users table to see if
 * user exists in the database by email
 * Only allows sign-in if email exists in database
 * @param {*} req 
 * @param {*} res 
 * @param {*} next 
 */
async function userExists(req, res, next){
    if (!req.user) {
        return res.json(RC_RESPONSE(RC_CODES.BAD_REQUEST, {
            details: "User data not found in request"
        }));
    }

    try{
        const googleUser = req.user;
        const email = googleUser.email;

        // Check if user exists by email in the database
        const existingUsers = await query(
            'SELECT * FROM Users WHERE email = ?',
            [email]
        );

        if (existingUsers && existingUsers.length > 0) {
            // User exists in database, retrieve and attach to request
            const user = existingUsers[0];
            
            // Use database values, but fallback to Google data if null/empty
            req.user = {
                uid: user.uid,
                email: user.email || googleUser.email,
                fname: user.fname || googleUser.firstName || 'User',
                lname: user.lname || googleUser.lastName || '',
                username: user.username || email.split('@')[0],
                avatar_url: user.avatar_url || googleUser.picture,
                googleId: googleUser.googleId,
                fullName: googleUser.fullName,
                firstName: googleUser.firstName,
                lastName: googleUser.lastName,
                picture: googleUser.picture
            };
            console.log('Google user found in database:', user.email);
            console.log('User data retrieved:', {
                uid: req.user.uid,
                email: req.user.email,
                fname: req.user.fname,
                lname: req.user.lname,
                username: req.user.username
            });
            
            // sends to next callback()
            next();
        } else {
            // User doesn't exist in database - return error
            console.log('Google sign-in attempted with email not in database:', email);
            return res.json(RC_RESPONSE(RC_CODES.UNAUTHORIZED, {
                details: "No account found with this email address. Please create an account first.",
                email: email
            }));
        }
    }catch(error){
        console.error("Error finding user in database:", error);
        return res.json(RC_RESPONSE(RC_CODES.SERVER_ERROR, {
            details: "Unexpected error during user lookup",
            error: error.message
        }));
    }
}

/**
 * creates a custom JWT for user session
 * that allows use to not be dependent
 * on Google API after we get the first JWT
 * @param {*} token 
 * @returns custom JWT for user
 */
function createJwtForUser(userPayload){
    if (!userPayload)
        return null;

    // create json token with user data from database
    const userData = {
        uid:            userPayload.uid,
        email:          userPayload.email,
        fname:          userPayload.fname,
        lname:          userPayload.lname,
        username:       userPayload.username,
        avatar_url:     userPayload.avatar_url,
        googleId:       userPayload.googleId || null,
    };

    const secret = process.env.JWT_SECRET || "development_secret";
    console.log("Using JWT secret:", secret);
    return jwt.sign(userData, secret, { expiresIn: '7d' });
}


// ------------------------------------------------------------------------------------

router.post("/auth", decodeToken, userExists, (req, res)=>{
    try {
        console.log('creating token');

        const payload = req.user || null; // user found
        const customToken = createJwtForUser(payload);
        console.log('token completed');

        // send back response
        res.json(RC_RESPONSE(RC_CODES.SUCCESS, {
            userToken: customToken
        }));

    } catch(err){
        console.error("Error in /auth route:", err);
        res.json(RC_RESPONSE(RC_CODES.SERVER_ERROR, {
            details: "Unexpected error during authentication",
            error: err.message
        }));
    }
});


// export routes
module.exports = router;
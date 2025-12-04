const { RC_CODES } = require('./error.js');

//------------------------------------------------------------------
// Standard response formatting
//------------------------------------------------------------------

/**
 * Creates a standardized response object for API endpoints
 * @param {number} status - HTTP status code
 * @param {string} message - Response message
 * @returns {object} Standardized response object
 * @deprecated Use RC_CODES instead for better error handling
 */
function STANDARD_RESPONSE(status, message) {
    return {
        status: status,
        message: message
    };
}

/**
 * Creates a standardized response using RC_CODE system
 * @param {RC} rcCode - RC_CODE object from errors.js
 * @param {object} additionalData - Additional data to include in response
 * @returns {object} Standardized response object with RC_CODE structure
 */
function RC_RESPONSE(rcCode, additionalData = {}) {
    return {
        ...rcCode.HTTP_RC(rcCode.CODE),
        ...additionalData
    };
}

//------------------------------------------------------------------
// Authorization Functions
//------------------------------------------------------------------

/**
 * makes sure that user session
 * has permission to do certain 
 * operations and access certain 
 * API requests
 * @param {Array} allowList - Array of allowed user roles
 * @param {boolean} hasReqBody - Whether the request has a body
 * @returns {Function} Express middleware function
 */
function authorizeUse(allowList = [], hasReqBody = true) {
    return (req, res, next) => {
        // no restriction on permissions
        if (allowList.length === 0)
            return next();

        let session;
        // access session data
        if (hasReqBody)
            session = req.body.session.token;
        else
            session = req.headers["session"]["token"];

        // checks if user exists
        if (session && session.approved == true) {
            // if user has permission
            if (allowList.includes(session.role))
                return next();
            // handle user not permitted
            else
                return res.json(RC_RESPONSE(RC_CODES.FORBIDDEN, {
                    details: "User role not in allowed list",
                    userRole: session.role,
                    allowedRoles: allowList
                }));
        }
        // handle user not found error
        else {
            return res.json(RC_RESPONSE(RC_CODES.NOT_FOUND, {
                details: "User session not found or not approved",
                hasSession: !!session,
                sessionApproved: session ? session.approved : false
            }));
        }
    }
}
//------------------------------------------------------------------
// Module Exports
//------------------------------------------------------------------

module.exports = {
    RC_RESPONSE,
    authorizeUse
};
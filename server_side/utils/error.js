
class RC {
    //---------------------------------------------------------------
    // Attributes
    CODE;       // Numeric representation of the return code
    MESSAGE;    // Message to include in responses/logs
    CAUSES;     // Array of strings describing possible causes
    LOG_LEVEL;  // Logging priority (CRITICAL, ERROR, WARN, INFO, DEBUG, etc)

    //---------------------------------------------------------------
    // Constructor
    constructor(code, message = '', causes = [], level = 'INFO') {
        this.CODE       = code;
        this.MESSAGE    = message;
        this.CAUSES     = Array.isArray(causes) ? causes : [String(causes)];
        this.LOG_LEVEL  = level;
    }

    //---------------------------------------------------------------
    // Create a standardized JSON HTTP response
    HTTP_RC(status) {
        return {
            status:     status,
            code:       this.CODE,
            message:    this.MESSAGE,
            causes:     this.CAUSES,
            priority:   this.LOG_LEVEL,
            timestamp:  new Date().toISOString()
        };
    }

    //---------------------------------------------------------------
    // Utility methods
    log() {
        // You could replace console with a proper logger later
        console.log(`[${this.LOG_LEVEL}] ${this.MESSAGE}`, {
            code: this.CODE,
            causes: this.CAUSES
        });
    }

    toJSON() {
        // Define how this object serializes in JSON.stringify()
        return this.HTTP_RC(this.CODE);
    }
}

//---------------------------------------------------------------
// add new RC to this object
const RC_CODES = {
    // RC name |    RC object  | RC message                         | List of causes               | Log level
    SUCCESS:                new RC(200, 'Request successful.',      [],                             'INFO'),
    BAD_REQUEST:            new RC(400, 'Bad request syntax.',      ['Invalid parameters'],         'WARN'),
    UNAUTHORIZED:           new RC(401, 'Unauthorized access.',     ['Missing or invalid token'],   'ERROR'),
    FORBIDDEN:              new RC(403, 'Access forbidden.',        ['Insufficient permissions'],   'ERROR'),
    NOT_FOUND:              new RC(404, 'Not found.',               ['Data not found', "Bad HTTP request", "Bad HTTP body sent", "Check HTTP method"], 'ERROR'),
    CONFLICT:               new RC(409, 'Resource conflict.',       ['Duplicate data', 'Resource already exists'],          'WARN'),
    VALIDATION_ERROR:       new RC(422, 'Validation failed.',     ['Invalid input data', 'Missing required fields'],        'WARN'),
    SERVER_ERROR:           new RC(500, 'Internal server error.',   ['Unexpected failure'],                                 'CRITICAL'),
    SERVICE_UNAVAILABLE:    new RC(503, 'Service unavailable.', ['Database connection failed', 'External service down'],    'ERROR')
};

//---------------------------------------------------------------
// Export module
module.exports = { RC, RC_CODES };

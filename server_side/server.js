//=================================================
// IMPORT MODULES
//=================================================
const express    = require("express");
const dotenv     = require("dotenv");
const path       = require("path");
const bodyParser = require("body-parser");
const cors       = require('cors');


//=================================================
// LOAD .ENV VARIABLES
//=================================================
// Determine environment (default to 'development' if NODE_ENV is not set)
const env = process.env.NODE_ENV || 'development';
const envPath = path.join(__dirname, `.env.${env}`);
const result = dotenv.config({ path: envPath });
if (result.error) {
    console.warn(`Warning: Could not load .env.${env} file:`, result.error.message);
} else {
    console.log(`Loaded environment variables from .env.${env}`);
}
const PORT = process.env.PORT;
const BASE_URL = process.env.BASE_URL;

//=================================================
// IMPORT ENDPOINT MODULES HERE
//=================================================
const googleEndpoints       = require("./wrappers/google.js");
const authEndpoints         = require("./route_modules/auth.js");
const gigsEndpoints         = require("./route_modules/gigs.js");
const bedrockEndpoints      = require("./route_modules/bedrock.js");
const filesEndpoints        = require("./route_modules/files.js");


//=================================================
// SET UP SERVER INSTANCE
//=================================================
const app = express();

//=================================================
// ADD MIDDLEWARE
//=================================================

app.use(bodyParser.urlencoded({extended:true, limit: '50mb'}));  // allows for passing info through url
app.use(express.json({limit: '50mb'}));                         // allows for json request and responses

const allowedOrigins = [
    'http://localhost:8080', // nodejs dev server
    'http://localhost:5173', // Vite dev server
    'http://localhost:3000', // Local server
    'http://ec2-52-15-61-144.us-east-2.compute.amazonaws.com:3000', // Production EC2
    'http://52.15.61.144:3000', // Production IP
];
  
app.use(cors({
    origin: function(origin, callback) {
      // Allow requests with no origin (like mobile apps or curl)
      if (!origin) return callback(null, true);
  
      if (allowedOrigins.includes(origin)) {
        callback(null, true);
      } else {
        callback(new Error('Not allowed by CORS'));
      }
    },
    methods: ['POST', 'GET', 'OPTIONS'],
    credentials: true
}));
  

app.use((req, res, next) => {
    res.setHeader("Cross-Origin-Opener-Policy", "same-origin-allow-popups");
    res.setHeader("Cross-Origin-Embedder-Policy", "same-origin-allow-popups"); 
    next();
});

//=================================================
// SET SERVER INSTANCE TO USE MODULE ENDPOINTS
//=================================================
// API routes must be defined BEFORE static file serving
// to ensure they are matched first

// google routes
app.use("/api/google", googleEndpoints);

// auth routes
app.use("/api/auth", authEndpoints);

// gigs routes
app.use("/api/gigs", gigsEndpoints);

// bedrock routes
app.use("/api/bedrock", bedrockEndpoints);

// files routes
app.use("/api/files", filesEndpoints);

// database health check route
app.get("/api/health/database", async (req, res) => {
    try {
        const { healthCheck } = require("./wrappers/database.js");
        const health = await healthCheck();
        res.json(health);
    } catch (error) {
        res.status(500).json({
            status: 'error',
            connected: false,
            error: error.message
        });
    }
});

// access react build from dist folder
const BUILD_PATH   = path.join(__dirname, "../be-smart/dist");

// Serve static files from the React build (JS, CSS, images, etc.)
// This should come AFTER API routes
app.use(express.static(BUILD_PATH));
//==============================================================================
// SERVER ENPOINTS
//==============================================================================
app.get("/", (req, res)=>{
    // home route, initial request
    res.sendFile(path.join(BUILD_PATH, "index.html"));
});

// catch all route -> just renders the react build
app.use((req, res) => {
    res.sendFile(path.join(BUILD_PATH, "index.html"));
});


// node server listener at PORT
// Listen on 0.0.0.0 to accept connections from all network interfaces
app.listen(PORT, '0.0.0.0', async ()=>{
    console.log("Server is listening on 0.0.0.0:" + PORT);
    console.log("Serving static files at:", BASE_URL);
});
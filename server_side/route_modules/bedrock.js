//===============================================
// HANDLES ALL BEDROCK-RELATED ENDPOINTS
//===============================================

// import modules
const express       = require("express");
const router = express.Router();
const { RC_RESPONSE } = require('../utils/endpoint_helpers.js');
const { RC_CODES } = require('../utils/error.js');
const bedrock = require('../wrappers/aws_bedrock.js');
const { query } = require('../wrappers/database.js');
const {
    cacheData,
    checkCache,
    isRedisRunning
} = require('../wrappers/redis.js');

//===============================================
// HTTP ENDPOINTS
//===============================================

// Send prompt to Bedrock for smart search or chat
router.post("/search", async (req, res) => {
    try {
        const { prompt, script, mode } = req.body;
        
        if (!prompt || typeof prompt !== 'string') {
            return res.json(RC_RESPONSE(RC_CODES.BAD_REQUEST, {
                details: "Prompt is required and must be a string",
                received: typeof prompt
            }));
        }

        // Validate mode (default to 'chat-mode')
        const validModes = ['chat-mode', 'smart-search'];
        const selectedMode = mode && validModes.includes(mode) ? mode : 'chat-mode';

        console.log(`[Bedrock] Request received - Mode: ${selectedMode}, Prompt: "${prompt.substring(0, 50)}..."`);

        // Load all gigs from database (with caching)
        let gigsData = [];
        const CACHE_KEY = 'bedrock:all_gigs';
        const CACHE_EXPIRATION = 60; // Cache for 60 seconds
        
        try {
            // Check cache first
            const redisRunning = await isRedisRunning();
            if (redisRunning) {
                const cachedGigs = await checkCache(CACHE_KEY);
                if (cachedGigs !== null) {
                    gigsData = cachedGigs;
                    console.log(`[Bedrock] Loaded ${gigsData.length} gigs from cache`);
                }
            }
            
            // If not in cache, query database
            if (gigsData.length === 0) {
                const gigs = await query('SELECT * FROM gigs ORDER BY gig_created DESC');
                gigsData = gigs || [];
                console.log(`[Bedrock] Loaded ${gigsData.length} gigs from database`);
                
                // Cache the results
                if (redisRunning && gigsData.length > 0) {
                    await cacheData(CACHE_KEY, gigsData, CACHE_EXPIRATION);
                    console.log(`[Bedrock] Cached ${gigsData.length} gigs for ${CACHE_EXPIRATION} seconds`);
                }
            }
        } catch (dbError) {
            console.error('[Bedrock] Error loading gigs from database:', dbError);
            // Continue without gigs data if database query fails
        }

        // Check if prompt matches "what jobs are available" pattern - return formatted gigs directly
        const promptLower = prompt.toLowerCase().trim();
        const jobsAvailablePatterns = [
            /what\s+(jobs?|gigs?|work|opportunities?)\s+(are\s+)?(available|in|at)/i,
            /(show|list|get|find|search)\s+(me\s+)?(all\s+)?(jobs?|gigs?|work|opportunities?)/i,
            /(jobs?|gigs?|work|opportunities?)\s+(available|in|at)\s+greensboro/i,
            /all\s+(jobs?|gigs?|work|opportunities?)/i
        ];

        const isJobsAvailableQuery = jobsAvailablePatterns.some(pattern => pattern.test(promptLower));
        
        if (isJobsAvailableQuery && selectedMode === 'chat-mode') {
            console.log('[Bedrock] Detected "jobs available" query - returning formatted gigs list');
            
            // Format gigs for user display
            let formattedResponse = 'chatbot-response: ';
            
            if (gigsData.length === 0) {
                formattedResponse += 'No matching gigs found';
            } else {
                const gigsList = gigsData.map((gig, index) => {
                    const name = gig.gig_name || 'N/A';
                    const description = gig.gig_description || 'No description';
                    const address = gig.gig_address || 'Address not specified';
                    // Format: Name on first line, Description on second, Address on third
                    return `${name}\nDescription: ${description}\nAddress: ${address}`;
                }).join('\n\n');
                
                formattedResponse += gigsList;
            }
            
            return res.json(RC_RESPONSE(RC_CODES.SUCCESS, {
                response: formattedResponse,
                prompt: prompt,
                script: script || null,
                mode: selectedMode
            }));
        }

        // Combine prompt and script if script is provided (for chat-mode context)
        let fullPrompt = prompt;
        if (script && typeof script === 'string' && script.trim().length > 0) {
            fullPrompt = `${prompt}\n\nContext:\n${script}`;
        }

        // Call Bedrock with the prompt, mode, and gigs data
        const response = await bedrock.prompt(fullPrompt, null, { 
            mode: selectedMode,
            gigsData: gigsData
        });
        
        console.log(`[Bedrock] Response received - Length: ${response.length} chars, Mode: ${selectedMode}`);
        
        return res.json(RC_RESPONSE(RC_CODES.SUCCESS, {
            response: response,
            prompt: prompt,
            script: script || null,
            mode: selectedMode
        }));
    } catch (error) {
        console.error("Error calling Bedrock:", error);
        return res.json(RC_RESPONSE(RC_CODES.SERVER_ERROR, {
            details: "Error processing Bedrock request",
            error: error.message
        }));
    }
});

module.exports = router;


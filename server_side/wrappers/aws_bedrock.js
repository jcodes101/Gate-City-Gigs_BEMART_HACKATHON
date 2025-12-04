//=================================================
// AWS Bedrock Client Wrapper
//=================================================
// Simple interface to send text prompts to AWS Bedrock models
// Supports model override with Llama as default
//=================================================

const { BedrockRuntimeClient, InvokeModelCommand } = require('@aws-sdk/client-bedrock-runtime');
const { BedrockAgentRuntimeClient, RetrieveAndGenerateCommand } = require('@aws-sdk/client-bedrock-agent-runtime');
const { fromNodeProviderChain }                    = require('@aws-sdk/credential-providers');

//=================================================
// Configuration from environment variables
//=================================================
const BEDROCK_CONFIG = {
    region: process.env.AWS_REGION || process.env.BEDROCK_REGION || 'us-east-2',
    // Using Claude 3 Haiku for fast, accurate responses - good for concise tasks
    // Alternative: 'anthropic.claude-3-sonnet-20240229-v1:0' for better reasoning (slower, more expensive)
    defaultModel: process.env.BEDROCK_DEFAULT_MODEL || 'anthropic.claude-3-haiku-20240307-v1:0',
    knowledgeBaseId: process.env.BEDROCK_KNOWLEDGE_BASE_ID || null,
    useKnowledgeBase: process.env.BEDROCK_USE_KNOWLEDGE_BASE === 'true' || false
};

//=================================================
// Bedrock Clients (lazy initialization)
//=================================================
let bedrockClient = null;
let bedrockAgentClient = null;



//=================================================
// BEDROCK PROMPT TAILORING
//=================================================


const schemas = `
    CREATE TABLE \`Users\` (
  \`uid\` varchar(36) NOT NULL,
  \`fname\` varchar(80) NOT NULL,
  \`lname\` varchar(80) NOT NULL,
  \`username\` varchar(160) NOT NULL,
  \`email\` varchar(255) NOT NULL,
  \`avatar_url\` varchar(512) DEFAULT NULL,
  \`User_roles\` enum('RESIDENT','R&D','OFFICIAL') NOT NULL,
  \`address_hash\` char(64) DEFAULT NULL,
  \`password\` varchar(255) NOT NULL,
  PRIMARY KEY (\`uid\`),
  UNIQUE KEY \`username\` (\`username\`),
  UNIQUE KEY \`email\` (\`email\`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

CREATE TABLE \`gigs\` (
  \`uid\` varchar(225) NOT NULL,
  \`gig_owner\` varchar(225) NOT NULL,
  \`gig_name\` varchar(225) NOT NULL,
  \`gig_address\` varchar(100) NOT NULL,
  \`paid\` tinyint(1) NOT NULL DEFAULT '0',
  \`gig_created\` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP,
  \`gig_description\` varchar(500) NOT NULL DEFAULT 'no desc',
  \`gig_tag\` enum('REAL_ESTATE','VOLUNTEERING','INFRASTRUCTURE','HOSPITALITY') NOT NULL,
  \`gig_urgency\` enum('LOW','MEDIUM','HIGH') NOT NULL DEFAULT 'LOW',
  PRIMARY KEY (\`uid\`),
  KEY \`gig_owner\` (\`gig_owner\`),
  CONSTRAINT \`gigs_ibfk_1\` FOREIGN KEY (\`gig_owner\`) REFERENCES \`Users\` (\`uid\`) ON DELETE CASCADE ON UPDATE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;
`;

// Enhanced mode-specific prompts with structured format and examples
const bedrock_modes = {
    "chat-mode": `# ROLE
You are a specialized gig platform assistant for Gate City Gigs, a local gig marketplace in Greensboro, North Carolina.

# YOUR TASK
Match user queries to EXACT gig names from the provided database. Return ONLY matching gig names, nothing else.

# CRITICAL RULES - VIOLATING THESE WILL CAUSE REJECTION
- **ONLY** list gigs that EXACTLY MATCH names in the database below
- **NEVER** create, invent, or suggest gigs not in the database
- **NEVER** mention Fiverr, Upwork, TaskRabbit, Uber, Lyft, or any other platform
- **NEVER** use generic categories (e.g., "music gigs", "event planning gigs")
- **ONLY** use exact gig names from the database
- **NEVER** discuss job interviews, clothing, outfits, or any topic unrelated to gigs
- **NEVER** provide general advice, greetings, or conversational responses
- **NEVER** say "Hi", "Hello", "I can help", "You're welcome", "Good luck", or any conversational phrases
- **ONLY** respond with gig names or "No matching gigs found"
- Response must be EXACTLY 20 words or less - be extremely concise
- Start with "chatbot-response: " prefix
- If you cannot find matching gigs, respond ONLY with: "chatbot-response: No matching gigs found"

# OUTPUT FORMAT
Your response must follow this exact format:

\`\`\`
chatbot-response: [Gig Name 1]
[Gig Name 2]
[Gig Name 3]
\`\`\`

If no matches found:
\`\`\`
chatbot-response: No matching gigs found
\`\`\`

# EXAMPLES OF CORRECT RESPONSES

**Example 1:**
User: "What music gigs are available?"
Database contains: "Jazz Band Performance", "Concert Setup Assistant"
Response:
\`\`\`
chatbot-response: Jazz Band Performance
Concert Setup Assistant
\`\`\`

**Example 2:**
User: "I need event planning help"
Database contains: "Wedding Coordinator", "Corporate Event Planner"
Response:
\`\`\`
chatbot-response: Wedding Coordinator
Corporate Event Planner
\`\`\`

**Example 3:**
User: "Show me all gigs"
Database contains: "Gig A", "Gig B", "Gig C"
Response:
\`\`\`
chatbot-response: Gig A
Gig B
Gig C
\`\`\`

**Example 4:**
User: "Find me photography gigs"
Database contains: "Event Photographer", "Portrait Session"
Response:
\`\`\`
chatbot-response: Event Photographer
Portrait Session
\`\`\`

**Example 5:**
User: "What construction jobs are there?"
Database contains no construction-related gigs
Response:
\`\`\`
chatbot-response: No matching gigs found
\`\`\`

# WHAT NOT TO DO

❌ **WRONG:** "Based on the database, here are some music-related gigs: Jazz Band Performance"
✅ **CORRECT:** "chatbot-response: Jazz Band Performance"

❌ **WRONG:** "You might find these on Fiverr or other platforms..."
✅ **CORRECT:** "chatbot-response: No matching gigs found"

❌ **WRONG:** "Here are some event planning opportunities: Wedding Coordinator, Corporate Event Planner"
✅ **CORRECT:** "chatbot-response: Wedding Coordinator\nCorporate Event Planner"

# DATABASE
The database below contains ALL available gigs. You CANNOT mention anything not in that list.`,

    "smart-search": `You are a SQL query generation expert. Your task is to convert natural language search requests into valid MySQL SELECT queries.

DATABASE SCHEMA:
${schemas}

INSTRUCTIONS:
1. Analyze the user's search request carefully
2. Generate a valid MySQL SELECT query that searches the \`gigs\` table
3. Use appropriate WHERE clauses to match:
   - \`gig_name\` (partial matches using LIKE)
   - \`gig_description\` (partial matches using LIKE)
   - \`gig_tag\` (exact matches: 'REAL_ESTATE', 'VOLUNTEERING', 'INFRASTRUCTURE', 'HOSPITALITY')
   - \`gig_urgency\` (exact matches: 'LOW', 'MEDIUM', 'HIGH')
   - \`paid\` (boolean: 0 for unpaid, 1 for paid)
   - \`gig_address\` (partial matches using LIKE)
4. If the search terms don't clearly match any specific fields, create a query that searches across multiple relevant fields using OR conditions
5. Always return a valid SQL query - never return ['none'] or empty results
6. Use proper SQL syntax with backticks for table and column names
7. Return ONLY the SQL query, nothing else - no explanations, no markdown formatting, just the raw SQL

Example format: SELECT * FROM \`gigs\` WHERE \`gig_tag\` = 'VOLUNTEERING' AND \`paid\` = 0;

Generate the SQL query now:`
};


//=================================================
// Initialize Bedrock Clients
//=================================================
function getBedrockClient() {
    if (!bedrockClient) {
        bedrockClient = new BedrockRuntimeClient({
            region: BEDROCK_CONFIG.region,
            credentials: fromNodeProviderChain() // Uses default credential chain: env vars, ~/.aws/credentials, instance profile, etc.
        });
    }
    return bedrockClient;
}

function getBedrockAgentClient() {
    if (!bedrockAgentClient) {
        bedrockAgentClient = new BedrockAgentRuntimeClient({
            region: BEDROCK_CONFIG.region,
            credentials: fromNodeProviderChain()
        });
    }
    return bedrockAgentClient;
}

//=================================================
// Format Gigs Data for Prompt
//=================================================
/**
 * Formats gigs data into a readable string for the prompt
 * @param {Array} gigsData - Array of gig objects from database
 * @returns {string} Formatted string of gigs data
 */
function formatGigsData(gigsData) {
    if (!gigsData || gigsData.length === 0) {
        return 'No gigs are currently available in the database.';
    }
    
    let formatted = `\nACTUAL GIGS IN DATABASE (${gigsData.length} total):\n\n`;
    
    gigsData.forEach((gig, index) => {
        formatted += `[GIG ${index + 1}]\n`;
        formatted += `Name: "${gig.gig_name || 'N/A'}"\n`;
        formatted += `Description: "${gig.gig_description || 'N/A'}"\n`;
        formatted += `Category: ${gig.gig_tag || 'N/A'}\n`;
        formatted += `Urgency: ${gig.gig_urgency || 'N/A'}\n`;
        formatted += `Paid: ${gig.paid === 1 ? 'Yes' : 'No'}\n`;
        formatted += `Location: ${gig.gig_address || 'N/A'}\n`;
        formatted += `---\n\n`;
    });
    
    return formatted;
}

//=================================================
// Build Enhanced Prompt with Mode
//=================================================
/**
 * Builds an enhanced prompt by prepending mode-specific instructions
 * @param {string} userPrompt - The user's original prompt
 * @param {string} mode - The mode to use ('chat-mode' or 'smart-search')
 * @param {Array} gigsData - Array of gig objects from database
 * @returns {string} The enhanced prompt with mode instructions and gigs data
 */
function buildPromptWithMode(userPrompt, mode = 'chat-mode', gigsData = []) {
    const modePrompt = bedrock_modes[mode] || bedrock_modes['chat-mode'];
    const gigsInfo = formatGigsData(gigsData);
    
    // Extract all gig names for validation
    const gigNames = gigsData.map(gig => (gig.gig_name || '').toLowerCase().trim()).filter(name => name);
    
    if (mode === 'smart-search') {
        // For smart-search, include schema, gigs data, and instructions
        return `${modePrompt}\n\n${gigsInfo}\n\nIMPORTANT: Use the actual gigs data above to generate a SQL query that will return relevant results. The query should match the user's search request against the actual data in the database.\n\nUser search request: ${userPrompt}`;
    } else {
        // For chat-mode: structured prompt with clear sections
        return `${modePrompt}

# AVAILABLE GIGS DATABASE
${gigsInfo}

# VALID GIG NAMES (ONLY USE THESE - CASE INSENSITIVE)
${gigNames.length > 0 ? gigNames.join(', ') : 'No gigs available'}

# USER QUERY
${userPrompt}

# YOUR RESPONSE
Remember: Start with "chatbot-response: " followed by matching gig names only, one per line.`;
    }
}

//=================================================
// Clean Response - Remove User's Question
//=================================================
/**
 * Removes the user's original prompt/question from the response
 * @param {string} response - The raw response from the model
 * @param {string} userPrompt - The user's original prompt/question
 * @param {string} mode - The mode used ('chat-mode' or 'smart-search')
 * @returns {string} The cleaned response without the user's question
 */
function cleanResponse(response, userPrompt, mode = 'chat-mode') {
    if (!response || !userPrompt) return response;
    
    let cleaned = response;
    const promptEscaped = userPrompt.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
    
    // Remove "Assistant:" prefix if present (chat-mode)
    if (mode === 'chat-mode') {
        cleaned = cleaned.replace(/^Assistant:\s*/i, '').trim();
    }
    
    // Remove the user's prompt if it appears at the very start (exact match)
    const promptLower = userPrompt.toLowerCase().trim();
    const responseLower = cleaned.toLowerCase().trim();
    
    if (responseLower.startsWith(promptLower)) {
        // Remove the question and any following punctuation/whitespace
        cleaned = cleaned.substring(userPrompt.length).trim();
        cleaned = cleaned.replace(/^[:\-\n\r\s]+/, '').trim();
    }
    
    // Remove patterns like "User: [question]" or "[question]?" only at the start
    const startPattern = new RegExp(`^\\s*(User:\\s*)?${promptEscaped}\\s*[:\n\r]?\\s*`, 'i');
    cleaned = cleaned.replace(startPattern, '').trim();
    
    // Remove the question if it appears as a standalone line at the start
    const standalonePattern = new RegExp(`^${promptEscaped}\\s*[?]?\\s*[\n\r]+`, 'i');
    cleaned = cleaned.replace(standalonePattern, '').trim();
    
    // Remove any duplicate newlines and clean up whitespace
    cleaned = cleaned.replace(/\n{3,}/g, '\n\n').trim();
    
    return cleaned || response; // Return original if cleaning removed everything
}

//=================================================
// Invoke Knowledge Base (RetrieveAndGenerate)
//=================================================
/**
 * Use Bedrock Knowledge Base with RetrieveAndGenerate API
 * @param {string} prompt - The user's prompt
 * @param {string} mode - The mode ('chat-mode' or 'smart-search')
 * @param {Array} gigsData - Array of gig objects for context
 * @returns {Promise<string>} The model's response
 */
async function invokeKnowledgeBase(prompt, mode = 'chat-mode', gigsData = []) {
    try {
        const agentClient = getBedrockAgentClient();
        const knowledgeBaseId = BEDROCK_CONFIG.knowledgeBaseId;
        
        if (!knowledgeBaseId) {
            throw new Error('Knowledge Base ID not configured. Set BEDROCK_KNOWLEDGE_BASE_ID environment variable.');
        }

        // Build custom prompt template using our existing mode prompts
        const modePrompt = bedrock_modes[mode] || bedrock_modes['chat-mode'];
        const gigsInfo = formatGigsData(gigsData);
        
        // Create custom prompt template for Knowledge Base
        // The template uses {context} for retrieved documents and {input} for user query
        let customPromptTemplate = '';
        
        if (mode === 'chat-mode') {
            customPromptTemplate = `# ROLE
You are a specialized gig platform assistant for Gate City Gigs, a local gig marketplace in Greensboro, North Carolina.

# YOUR TASK
Match user queries to EXACT gig names from the provided database. Return ONLY matching gig names, nothing else.

# CRITICAL RULES
- **ONLY** list gigs that EXACTLY MATCH names in the database below
- **NEVER** create, invent, or suggest gigs not in the database
- **NEVER** mention Fiverr, Upwork, TaskRabbit, Uber, Lyft, or any other platform
- **NEVER** use generic categories (e.g., "music gigs", "event planning gigs")
- **ONLY** use exact gig names from the database
- Response must be EXACTLY 20 words or less - be extremely concise
- Start with "chatbot-response: " prefix
- **IGNORE** Knowledge Base context unless it specifically mentions Greensboro gigs/jobs
- **NEVER** discuss temples, religion, spirituality, or any topic unrelated to gigs

# OUTPUT FORMAT
Your response must follow this exact format:

\`\`\`
chatbot-response: [Gig Name 1]
[Gig Name 2]
\`\`\`

If no matches found:
\`\`\`
chatbot-response: No matching gigs found
\`\`\`

# AVAILABLE GIGS DATABASE (PRIMARY SOURCE)
${gigsInfo}

# VALID GIG NAMES (ONLY USE THESE)
${gigsData.map(g => (g.gig_name || '').toLowerCase().trim()).filter(n => n).join(', ')}

# KNOWLEDGE BASE CONTEXT (USE ONLY IF RELEVANT TO GREENSBORO GIGS)
{context}

**IMPORTANT:** If the Knowledge Base context is about self-care, mindfulness, books, organizations, or anything NOT related to Greensboro gigs, COMPLETELY IGNORE IT.

# USER QUERY
{input}

# YOUR RESPONSE
Remember: Start with "chatbot-response: " followed by matching gig names only, one per line.`;
        } else {
            customPromptTemplate = `${modePrompt}

DATABASE SCHEMA AND GIGS DATA:
${gigsInfo}

Context from Knowledge Base:
{context}

User search request: {input}

Generate SQL query:`;
        }

        const command = new RetrieveAndGenerateCommand({
            input: {
                text: prompt
            },
            retrieveAndGenerateConfiguration: {
                type: 'KNOWLEDGE_BASE',
                knowledgeBaseConfiguration: {
                    knowledgeBaseId: knowledgeBaseId,
                    modelArn: `arn:aws:bedrock:${BEDROCK_CONFIG.region}::foundation-model/${BEDROCK_CONFIG.defaultModel}`,
                    retrievalConfiguration: {
                        vectorSearchConfiguration: {
                            numberOfResults: mode === 'chat-mode' ? 3 : 10  // Reduce results for chat-mode to minimize irrelevant context
                        }
                    }
                },
                generationConfiguration: {
                    textPromptTemplate: customPromptTemplate,
                    inferenceConfig: {
                        maxTokens: mode === 'smart-search' ? 256 : 40, // Reduced to 40 tokens for 20 words
                        temperature: mode === 'smart-search' ? 0.3 : 0.05, // Very low temp for more accurate responses
                        topP: mode === 'smart-search' ? 0.9 : 0.7 // Lower for more focused responses
                    }
                }
            }
        });

        const response = await agentClient.send(command);
        
        // Extract the generated text from the response
        // Response structure: { output: { text: string }, citations: [...] }
        if (response.output && response.output.text) {
            let responseText = response.output.text;
            
            // Apply the same cleaning as direct invocation
            responseText = cleanResponse(responseText, prompt, mode);
            
            // For chat-mode, validate that response is about gigs, not unrelated topics
            if (mode === 'chat-mode') {
                const responseLower = responseText.toLowerCase();
                const validGigNames = gigsData.map(g => (g.gig_name || '').toLowerCase().trim()).filter(n => n);
                
                // Check for unrelated topics
                const unrelatedTopics = [
                    'self-care', 'mindfulness', 'meditation', 'yoga', 'wellness',
                    'book', 'organization', 'namaste', 'routine', 'technique',
                    'practice', 'insight', 'experience', 'thought', 'schedule'
                ];
                
                const hasUnrelatedTopic = unrelatedTopics.some(topic => responseLower.includes(topic));
                const hasValidGig = validGigNames.some(gigName => responseLower.includes(gigName));
                const isNoMatchMessage = /no\s+(matching\s+)?gigs?/i.test(responseLower);
                
                // If response contains unrelated topics and no valid gigs, reject it
                if (hasUnrelatedTopic && !hasValidGig && !isNoMatchMessage) {
                    console.warn('[Bedrock Knowledge Base] Response contained unrelated topics - rejecting');
                    responseText = 'chatbot-response: No matching gigs found';
                }
            }
            
            return responseText;
        }
        
        throw new Error('No response text found in Knowledge Base response');
    } catch (error) {
        console.error('[Bedrock Knowledge Base] Error:', error);
        throw error;
    }
}

//=================================================
// Invoke Model
//=================================================
/**
 * Send a text prompt to AWS Bedrock and get a response
 * Uses Knowledge Base if configured, otherwise uses direct model invocation
 * @param {string} prompt - The text prompt to send
 * @param {string} modelId - Optional model ID to override default (e.g., 'meta.llama3-70b-instant-v1:0')
 * @param {object} options - Optional parameters (maxTokens, temperature, mode, etc.)
 *   - mode: 'chat-mode' (default) or 'smart-search'
 * @returns {Promise<string>} The model's text response
 */
async function invokeModel(prompt, modelId = null, options = {}) {
    // Check if Knowledge Base should be used
    if (BEDROCK_CONFIG.useKnowledgeBase && BEDROCK_CONFIG.knowledgeBaseId) {
        const mode = options.mode || 'chat-mode';
        const gigsData = options.gigsData || [];
        console.log('[Bedrock] Using Knowledge Base for mode:', mode);
        return await invokeKnowledgeBase(prompt, mode, gigsData);
    }
    
    // Fall back to direct model invocation
    try {
        const client = getBedrockClient();
        const model = modelId || BEDROCK_CONFIG.defaultModel;

        // Get mode from options, default to 'chat-mode'
        const mode = options.mode || 'chat-mode';
        
        // Get gigs data from options
        const gigsData = options.gigsData || [];
        
        // Store original user prompt for cleaning
        const userPrompt = prompt;
        
        // Extract valid gig names for post-processing validation
        const validGigNames = gigsData.map(gig => (gig.gig_name || '').toLowerCase().trim()).filter(name => name);
        
        // Build enhanced prompt with mode-specific instructions and gigs data
        const enhancedPrompt = buildPromptWithMode(prompt, mode, gigsData);

        // Default parameters - optimized for accuracy and conciseness
        // For chat-mode: very low temperature and tokens for ultra-concise responses (40 tokens = ~20 words)
        const params = {
            max_gen_len: options.maxTokens || (mode === 'smart-search' ? 256 : 40), // Reduced to 40 tokens for 20 words
            temperature: options.temperature !== undefined ? options.temperature : (mode === 'smart-search' ? 0.3 : 0.05), // Very low temp = more accurate
            top_p: options.topP !== undefined ? options.topP : (mode === 'smart-search' ? 0.9 : 0.7) // Lower for more focused responses
        };

        // Prepare the request body based on model family
        let body;
        if (model.startsWith('anthropic.claude')) {
            // Claude models use messages format
            body = JSON.stringify({
                anthropic_version: "bedrock-2023-05-31",
                max_tokens: params.max_gen_len,
                temperature: params.temperature,
                top_p: params.top_p,
                messages: [
                    {
                        role: "user",
                        content: enhancedPrompt
                    }
                ]
            });
        } else if (model.startsWith('meta.')) {
            // Llama models use this format
            body = JSON.stringify({
                prompt: enhancedPrompt,
                max_gen_len: params.max_gen_len,
                temperature: params.temperature,
                top_p: params.top_p
            });
        } else if (model.startsWith('amazon.')) {
            // Titan models use this format
            body = JSON.stringify({
                inputText: enhancedPrompt,
                textGenerationConfig: {
                    maxTokenCount: params.max_gen_len,
                    temperature: params.temperature,
                    topP: params.top_p
                }
            });
        } else {
            // Default format (try Llama format)
            body = JSON.stringify({
                prompt: enhancedPrompt,
                max_gen_len: params.max_gen_len,
                temperature: params.temperature,
                top_p: params.top_p
            });
        }

        const command = new InvokeModelCommand({
            modelId: model,
            contentType: 'application/json',
            accept: 'application/json',
            body: body
        });

        const response      = await client.send(command);
        const responseBody  = JSON.parse(Buffer.from(response.body).toString());

        // get text from response based on model type
        let text;
        if (model.startsWith('anthropic.claude')) {
            // Claude models return: { content: [{ type: "text", text: "..." }] }
            if (responseBody.content && Array.isArray(responseBody.content)) {
                text = responseBody.content
                    .filter(item => item.type === 'text')
                    .map(item => item.text)
                    .join('');
            } else {
                text = responseBody.text || '';
            }
        } else if (model.startsWith('meta.')) {
            // Llama models return: { generation: "text" }
            text = responseBody.generation || responseBody.generations?.[0]?.text || '';
        } else if (model.startsWith('amazon.')) {
            // Titan models return: { results: [{ outputText: "text" }] }
            text = responseBody.results?.[0]?.outputText || '';
        } else {
            // Try common fields
            text = responseBody.generation || responseBody.outputText || responseBody.text || JSON.stringify(responseBody);
        }

        // Clean the response to remove user's question
        let cleanedText = cleanResponse(text.trim(), userPrompt, mode);
        
        // For chat-mode, enforce 20-word limit, remove platform mentions, and validate gig names
        if (mode === 'chat-mode') {
            const responseLower = cleanedText.toLowerCase();
            
            // Extract valid gig names for validation (from earlier in the function)
            const validGigNames = gigsData.map(gig => (gig.gig_name || '').toLowerCase().trim()).filter(name => name);
            
            // Check if response contains ANY valid gig name
            const hasValidGig = validGigNames.length > 0 && validGigNames.some(gigName => responseLower.includes(gigName));
            const isNoMatchMessage = /no\s+(matching\s+)?gigs?/i.test(responseLower);
            
            // CRITICAL: If response doesn't contain valid gigs AND isn't a "no match" message, reject it
            if (!hasValidGig && !isNoMatchMessage) {
                console.warn('[Bedrock] Response does not contain valid gig names - rejecting');
                cleanedText = "chatbot-response: No matching gigs found";
            }
            
            // Check for completely unrelated topics (temples, religion, job interviews, clothing, etc.)
            const unrelatedTopics = [
                'temple', 'deity', 'brahma', 'vishnu', 'shiva', 'hindu', 'pilgrim', 'devotee',
                'puja', 'ritual', 'shrine', 'gopuram', 'darshan', 'pushkarini', 'chola',
                'sculpture', 'carving', 'architecture', 'spirituality', 'religion', 'worship',
                'self-care', 'mindfulness', 'meditation', 'yoga', 'wellness', 'book', 'organization',
                'namaste', 'routine', 'technique', 'practice', 'insight', 'experience', 'thought',
                'job interview', 'interview', 'clothing', 'outfit', 'dress', 'wear', 'blazer',
                'jeans', 'skirt', 'shirt', 'shoes', 'jewelry', 'makeup', 'hair', 'professional',
                'business casual', 'marketing role', 'tech company', 'company culture', 'formal',
                'casual environment', 'personality', 'style', 'impression', 'confident', 'prepared',
                'help you', 'happy to help', 'glad i could', 'welcome', 'good luck', 'hope you get'
            ];
            
            const hasUnrelatedTopic = unrelatedTopics.some(topic => responseLower.includes(topic));
            
            // If response contains unrelated topics, reject immediately (even if it has gigs, it's probably wrong)
            if (hasUnrelatedTopic) {
                console.warn('[Bedrock] Response contained unrelated topics - rejecting');
                cleanedText = "chatbot-response: No matching gigs found";
            }
            
            // Check if response contains forbidden platform names - if so, reject it
            const forbiddenPlatforms = [
                'fiverr', 'fiver', 'upwork', 'freelancer', 'taskrabbit', 'uber', 'lyft',
                'doordash', 'postmates', 'shipt', 'instacart', 'grubhub', 'caviar',
                'thumbtack', 'handy', 'gigwalk', 'rover', 'wag', 'turo', 'getaround',
                'airbnb', 'booking.com', 'care.com', 'angie', 'craigslist', 'gumtree'
            ];
            
            const containsForbiddenPlatform = forbiddenPlatforms.some(platform => 
                responseLower.includes(platform)
            );
            
            // If response mentions forbidden platforms, replace with error message
            if (containsForbiddenPlatform) {
                console.warn('[Bedrock] Response contained forbidden platform mention - rejecting');
                cleanedText = "chatbot-response: No matching gigs found";
            } else {
                // Also check for phrases like "According to Fiverr", "On Fiverr", etc.
                const platformPhrases = [
                    /according\s+to\s+(fiverr|upwork|taskrabbit|uber|lyft|any\s+platform)/gi,
                    /on\s+(fiverr|upwork|taskrabbit|uber|lyft)/gi,
                    /(fiverr|upwork|taskrabbit|uber|lyft)\s+(says|reports|shows)/gi,
                    /(fiverr|upwork|taskrabbit|uber|lyft)\s+data/gi,
                    /platforms?\s+like\s+(fiverr|upwork)/gi
                ];
                
                platformPhrases.forEach(pattern => {
                    if (pattern.test(cleanedText)) {
                        console.warn('[Bedrock] Response contained platform phrase - rejecting');
                        cleanedText = "No matching gigs found";
                        return;
                    }
                });
                // Remove mentions of other platforms (case-insensitive) - comprehensive list
                const platformPatterns = [
                    /\b(Uber|Lyft|TaskRabbit|Fiverr|Fiver|Upwork|Freelancer|DoorDash|Postmates|Shipt|GigWalk|Instacart|Grubhub|Caviar|Thumbtack|Handy|Angie|Care\.com|Rover|Wag|Turo|Getaround|Airbnb|Booking\.com|Craigslist|Gumtree)\b/gi,
                    /\baccording\s+to\s+(fiverr|upwork|taskrabbit|uber|lyft|any\s+platform|platforms?)/gi,
                    /\bon\s+(fiverr|upwork|taskrabbit|uber|lyft|platforms?)/gi,
                    /\b(fiverr|upwork|taskrabbit|uber|lyft)\s+(says|reports|shows|data|according)/gi,
                    /\bgig economy platforms?\b/gi,
                    /\bother platforms?\b/gi,
                    /\bplatforms? like\b/gi,
                    /\bsign up with\s+(a\s+)?(gig\s+)?(economy\s+)?platform/gi,
                    /\b(gig\s+)?(economy\s+)?platforms?\s+(like|such as|including)/gi,
                    /\bcheck out\s+(other\s+)?(gig\s+)?(economy\s+)?platforms?/gi,
                    /\bconsider\s+(other\s+)?(gig\s+)?(economy\s+)?platforms?/gi,
                    /\byou can also\s+(try|use|check|find)/gi,
                    /\bwebsites?\s+like\b/gi,
                    /\bapps?\s+like\b/gi,
                    /\b(online|web)\s+(gig\s+)?(economy\s+)?platforms?/gi
                ];
                
                platformPatterns.forEach(pattern => {
                    cleanedText = cleanedText.replace(pattern, '');
                });
                
                // Remove sentences that mention platforms or other cities
                const sentences = cleanedText.split(/[.!?]+/);
                cleanedText = sentences.filter(sentence => {
                    const sentLower = sentence.toLowerCase();
                    const hasForbiddenPlatform = forbiddenPlatforms.some(platform => sentLower.includes(platform));
                    const hasPlatformWords = sentLower.includes('platform') || sentLower.includes('website') || sentLower.includes('app');
                    // Filter out mentions of other cities (but keep Greensboro)
                    const hasOtherCities = /(charlotte|raleigh|durham|winston|asheville|wilmington|fayetteville|cary|high point|concord|gastonia|hickory|jacksonville|chapel hill|burlington|kannapolis|wilson|goldsboro|thomasville|rocky mount)/i.test(sentLower) && !sentLower.includes('greensboro');
                    
                    return !hasForbiddenPlatform && !hasPlatformWords && !hasOtherCities;
                }).join('. ').trim();
            }
            
            // STRICT VALIDATION: Only keep lines that contain valid gig names or "no matching gigs"
            if (validGigNames.length > 0) {
                const lines = cleanedText.split('\n');
                const validLines = [];
                
                for (const line of lines) {
                    const lineLower = line.toLowerCase().trim();
                    // Check if line contains any valid gig name
                    const containsValidGig = validGigNames.some(gigName => lineLower.includes(gigName));
                    // Check if line is just "no matching gigs" or similar
                    const isNoMatchMessage = /no\s+(matching\s+)?gigs?/i.test(lineLower);
                    // Check if line is just the prefix "chatbot-response:"
                    const isJustPrefix = /^chatbot-response:\s*$/i.test(lineLower);
                    
                    // Only keep lines with valid gigs, no-match message, or just the prefix
                    if (containsValidGig || isNoMatchMessage || isJustPrefix) {
                        validLines.push(line);
                    }
                }
                
                // If we filtered out everything, replace with no match message
                if (validLines.length === 0 || (validLines.length === 1 && /^chatbot-response:\s*$/i.test(validLines[0]))) {
                    cleanedText = "chatbot-response: No matching gigs found";
                } else {
                    cleanedText = validLines.join('\n');
                }
            } else {
                // If no valid gig names available, just return no match
                cleanedText = "chatbot-response: No matching gigs found";
            }
            
            // Clean up extra spaces and punctuation
            cleanedText = cleanedText.replace(/\s+/g, ' ').replace(/\s*,\s*,/g, ',').trim();
            
            // Enforce 20-word limit (ultra-concise)
            const words = cleanedText.split(/\s+/);
            if (words.length > 20) {
                // Truncate to 20 words
                cleanedText = words.slice(0, 20).join(' ');
            }
            
            // Ensure response starts with "chatbot-response: " if it doesn't already
            if (!cleanedText.toLowerCase().startsWith('chatbot-response:')) {
                cleanedText = 'chatbot-response: ' + cleanedText;
            }
        }
        
        return cleanedText;
    } catch (error) {
        console.error('AWS Bedrock error:', error);
        throw new Error(`Bedrock invocation failed: ${error.message}`);
    }
}

//=================================================
// Simple Prompt (alias for invokeModel)
//=================================================
/**
 * Simple function to send a prompt and get a response
 * @param {string} prompt - The text prompt
 * @param {string} modelId - Optional model override
 * @param {object} options - Optional parameters (mode, maxTokens, temperature, etc.)
 * @returns {Promise<string>} The model's response
 */
async function prompt(prompt, modelId = null, options = {}) {
    return await invokeModel(prompt, modelId, options);
}

//=================================================
// Test Connection
//=================================================
/**
 * Test if Bedrock is accessible with a simple prompt
 * @returns {Promise<boolean>} True if connection is successful
 */
async function testConnection() {
    try {
        const response = await invokeModel('Hello', null, { maxTokens: 10 });
        return response.length > 0;
    } catch (error) {
        console.error('Bedrock connection test failed:', error);
        return false;
    }
}

//=================================================
// Module Exports
//=================================================
module.exports = {
    invokeModel,
    prompt,
    testConnection,
    getBedrockClient
};


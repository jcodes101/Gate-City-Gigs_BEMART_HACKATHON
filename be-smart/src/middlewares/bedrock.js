//======================================
// HANDLE ALL BEDROCK-RELATED SERVER COMMUNICATION
//======================================
import * as API from "../utils/api.js"

/**
 * Send a prompt to Bedrock for smart search or chat
 * @param {string} prompt - The text prompt to send to Bedrock
 * @param {string} script - Optional context script
 * @param {string} mode - Optional mode: 'chat-mode' (default) or 'smart-search'
 * @returns {Promise<string>} The response from Bedrock
 */
export async function smartSearch(prompt, script = null, mode = 'chat-mode') {
    if (!prompt || typeof prompt !== 'string') {
        console.error("Prompt must be a non-empty string");
        return null;
    }

    try {
        const response = await API.post("/api/bedrock/search", { 
            prompt: prompt, 
            script: script,
            mode: mode
        });

        if (response.status !== 200) {
            console.error("Error calling Bedrock:", response);
            return null;
        }

        return response.response || null;
    } catch (error) {
        console.error("Error when calling Bedrock smart search:", error);
        return null;
    }
}

export default {
    smartSearch
};

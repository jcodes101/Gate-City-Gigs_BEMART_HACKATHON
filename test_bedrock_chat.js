//=================================================
// Test Bedrock Chat-Mode
//=================================================
// Simple test script to verify chat-mode functionality
// Make sure the server is running before executing this script
// Usage: node test_bedrock_chat.js

const http = require('http');

const BASE_URL = process.env.VITE_BASE_URL || 'http://localhost:3000';
const ENDPOINT = '/api/bedrock/search';

const testPrompt = {
    prompt: "What types of gigs are available in Greensboro?",
    mode: "chat-mode"
};

console.log("==========================================");
console.log("Testing Bedrock Chat-Mode");
console.log("==========================================");
console.log(`Base URL: ${BASE_URL}`);
console.log(`Endpoint: ${ENDPOINT}`);
console.log(`Test Prompt:`, testPrompt);
console.log("");

const postData = JSON.stringify(testPrompt);

const options = {
    hostname: BASE_URL.replace('http://', '').replace('https://', '').split(':')[0],
    port: BASE_URL.includes(':') ? BASE_URL.split(':').pop() : (BASE_URL.includes('https') ? 443 : 3000),
    path: ENDPOINT,
    method: 'POST',
    headers: {
        'Content-Type': 'application/json',
        'Content-Length': Buffer.byteLength(postData)
    }
};

const req = http.request(options, (res) => {
    let data = '';

    console.log(`Status Code: ${res.statusCode}`);
    console.log(`Headers:`, res.headers);
    console.log("");

    res.on('data', (chunk) => {
        data += chunk;
    });

    res.on('end', () => {
        console.log("==========================================");
        console.log("Response Received:");
        console.log("==========================================");
        try {
            const parsed = JSON.parse(data);
            console.log(JSON.stringify(parsed, null, 2));
            
            if (parsed.status === 200 && parsed.data) {
                console.log("");
                console.log("==========================================");
                console.log("Chat Response (Mode:", parsed.data.mode || "chat-mode", "):");
                console.log("==========================================");
                console.log(parsed.data.response);
                console.log("");
                console.log("Response Length:", parsed.data.response.length, "characters");
            }
        } catch (e) {
            console.log("Raw Response:");
            console.log(data);
        }
        console.log("");
        console.log("==========================================");
        console.log("Test Complete");
        console.log("==========================================");
    });
});

req.on('error', (error) => {
    console.error("Error making request:", error);
    console.error("Make sure the server is running at", BASE_URL);
});

req.write(postData);
req.end();


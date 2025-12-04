//=================================================
// AWS Bedrock Wrapper Usage Examples
//=================================================

const bedrock = require('../aws_bedrock');

// Example 1: Simple prompt with default model (Llama)
async function example1() {
    try {
        const response = await bedrock.prompt('What is the capital of France?');
        console.log('Response:', response);
    } catch (error) {
        console.error('Error:', error);
    }
}

// Example 2: Prompt with specific model override
async function example2() {
    try {
        const response = await bedrock.invokeModel(
            'Explain quantum computing in simple terms.',
            'meta.llama3-70b-instruct-v1:0' // Override to use 70B instruct model
        );
        console.log('Response:', response);
    } catch (error) {
        console.error('Error:', error);
    }
}

// Example 3: Prompt with custom options
async function example3() {
    try {
        const response = await bedrock.invokeModel(
            'Write a short poem about coding.',
            null, // Use default model
            {
                maxTokens: 200,
                temperature: 0.9, // More creative
                topP: 0.95
            }
        );
        console.log('Response:', response);
    } catch (error) {
        console.error('Error:', error);
    }
}

// Example 4: Using Amazon Titan model
async function example4() {
    try {
        const response = await bedrock.invokeModel(
            'Summarize the benefits of cloud computing.',
            'amazon.titan-text-lite-v1'
        );
        console.log('Response:', response);
    } catch (error) {
        console.error('Error:', error);
    }
}

// Example 5: Test connection
async function example5() {
    const isConnected = await bedrock.testConnection();
    if (isConnected) {
        console.log('Bedrock connection successful!');
    } else {
        console.log('Bedrock connection failed!');
    }
}

module.exports = {
    example1,
    example2,
    example3,
    example4,
    example5
};


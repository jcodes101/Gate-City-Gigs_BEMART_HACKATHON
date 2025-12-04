//=================================================
// Chatbot Component
//=================================================

import React, { useState, useRef, useEffect } from 'react'
import { SiGreenhouse } from "react-icons/si";
import { FaMicrophone, FaPaperPlane, FaVolumeUp, FaStop } from "react-icons/fa";

// Prewritten greeting
const GREETING_MESSAGE = "Hello! I'm here to help you find gigs in Greensboro, NC. What are you looking for?";

// Map of user prompts to prewritten responses (case-insensitive matching)
const PrewrittenResponses = {
    'hi': 'chatbot-response: Hello! How can I help you find gigs in Greensboro today?',
    'hello': 'chatbot-response: Hi there! What kind of gigs are you looking for in Greensboro?',
    'hey': 'chatbot-response: Hey! I can help you find gigs in Greensboro, NC. What do you need?',
    'what gigs are available': 'chatbot-response: Check out our available gigs in Greensboro! What type of work are you interested in?',
    'what jobs are available': 'chatbot-response: We have various gig opportunities in Greensboro. What skills do you have?',
    'help': 'chatbot-response: I can help you find gigs in Greensboro! Tell me what you\'re looking for.',
    'what can you do': 'chatbot-response: I help connect people with gig opportunities in Greensboro, NC. What are you looking for?',
    'thanks': 'chatbot-response: You\'re welcome! Let me know if you need help finding more gigs.',
    'thank you': 'chatbot-response: Happy to help! Feel free to ask about other gigs anytime.',
    'bye': 'chatbot-response: Goodbye! Come back anytime to find more gigs in Greensboro.',
    'goodbye': 'chatbot-response: See you later! Check back for new gig opportunities.',
};

export default function Chatbot() {
    // state for if chatbot is open or not
    const [isOpen, setIsOpen] = useState(false);
    const [inputText, setInputText] = useState('');
    const [messages, setMessages] = useState([]);
    const [isListening, setIsListening] = useState(false);
    const [isLoading, setIsLoading] = useState(false);
    const [isSpeaking, setIsSpeaking] = useState(false);
    const [speakingMessageIndex, setSpeakingMessageIndex] = useState(null);
    const [hasShownGreeting, setHasShownGreeting] = useState(false);
    const messagesEndRef = useRef(null);
    const recognitionRef = useRef(null);
    const speechUtteranceRef = useRef(null);

    // Auto-scroll to bottom when new messages are added
    useEffect(() => {
        messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    }, [messages]);

    // Show greeting when chatbot opens for the first time
    useEffect(() => {
        if (isOpen && !hasShownGreeting && messages.length === 0) {
            setHasShownGreeting(true);
            setMessages([{ type: 'bot', text: GREETING_MESSAGE }]);
        }
    }, [isOpen, hasShownGreeting, messages.length]);

    // Helper function to check if user input matches a prewritten prompt
    const findPrewrittenResponse = (userInput) => {
        const inputLower = userInput.toLowerCase().trim();
        
        // Check for exact matches first
        if (PrewrittenResponses[inputLower]) {
            return PrewrittenResponses[inputLower];
        }
        
        // Check for partial matches (if user input contains the key)
        for (const [key, response] of Object.entries(PrewrittenResponses)) {
            if (inputLower.includes(key.toLowerCase()) || key.toLowerCase().includes(inputLower)) {
                return response;
            }
        }
        
        return null;
    };

    // Handle speech-to-text
    const handleSpeechToText = () => {
        const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
        
        if (!SpeechRecognition) {
            alert('Speech recognition is not supported in your browser');
            return;
        }

        if (isListening) {
            // Stop listening
            if (recognitionRef.current) {
                recognitionRef.current.stop();
                recognitionRef.current = null;
            }
            setIsListening(false);
            return;
        }

        const recognition = new SpeechRecognition();
        recognition.continuous = false;
        recognition.interimResults = false;
        recognition.lang = 'en-US';

        recognition.onstart = () => {
            setIsListening(true);
        };

        recognition.onresult = (event) => {
            const transcript = event.results[0][0].transcript;
            setInputText(prev => prev + (prev ? ' ' : '') + transcript);
            setIsListening(false);
        };

        recognition.onerror = (event) => {
            console.error('Speech recognition error:', event.error);
            setIsListening(false);
        };

        recognition.onend = () => {
            setIsListening(false);
        };

        recognitionRef.current = recognition;
        recognition.start();
    };

    // Handle text-to-speech
    const handleTextToSpeech = (text, messageIndex) => {
        if (!text) return;
        
        // If clicking on the same message that's currently speaking, stop it
        if (isSpeaking && speakingMessageIndex === messageIndex) {
            window.speechSynthesis.cancel();
            setIsSpeaking(false);
            setSpeakingMessageIndex(null);
            speechUtteranceRef.current = null;
            return;
        }
        
        // If another message is speaking, stop it first
        const wasSpeaking = isSpeaking;
        if (wasSpeaking) {
            window.speechSynthesis.cancel();
            setIsSpeaking(false);
            setSpeakingMessageIndex(null);
            speechUtteranceRef.current = null;
        }
        
        // Start speaking the new message (with a brief delay if we just stopped another)
        setTimeout(() => {
            startSpeech(text, messageIndex);
        }, wasSpeaking ? 100 : 0);
    };
    
    // Helper function to start speech
    const startSpeech = (text, messageIndex) => {
        const utterance = new SpeechSynthesisUtterance(text);
        utterance.lang = 'en-US';
        utterance.rate = 1.0;
        utterance.pitch = 1.0;
        
        utterance.onstart = () => {
            setIsSpeaking(true);
            setSpeakingMessageIndex(messageIndex);
        };
        
        utterance.onend = () => {
            setIsSpeaking(false);
            setSpeakingMessageIndex(null);
            speechUtteranceRef.current = null;
        };
        
        utterance.onerror = () => {
            setIsSpeaking(false);
            setSpeakingMessageIndex(null);
            speechUtteranceRef.current = null;
        };
        
        speechUtteranceRef.current = utterance;
        window.speechSynthesis.speak(utterance);
    };

    // Handle send message
    const handleSendMessage = async () => {
        if (!inputText.trim() || isLoading) return;

        const userMessage = inputText.trim();
        setInputText('');
        
        // Add user message to chat
        setMessages(prev => [...prev, { type: 'user', text: userMessage }]);
        
        // Check if there's a prewritten response for this prompt
        const prewrittenResponse = findPrewrittenResponse(userMessage);
        
        // Show loading for 2 seconds, then show response
        setIsLoading(true);
        
        setTimeout(() => {
            if (prewrittenResponse) {
                // Parse response for "chatbot-response:" delimiter
                let botResponse = prewrittenResponse;
                const delimiter = 'chatbot-response:';
                const delimiterIndex = prewrittenResponse.toLowerCase().indexOf(delimiter.toLowerCase());
                
                if (delimiterIndex !== -1) {
                    // Extract everything after the colon
                    botResponse = prewrittenResponse.substring(delimiterIndex + delimiter.length).trim();
                }
                
                // Remove leading periods, commas, and other leading punctuation
                botResponse = botResponse.replace(/^[.\s,;:!?-]+/, '').trim();
                
                setMessages(prev => [...prev, { type: 'bot', text: botResponse }]);
            } else {
                // If no prewritten response found, show default message
                setMessages(prev => [...prev, { type: 'bot', text: "I'm still learning! Try asking about gigs in Greensboro, or say 'help' for assistance." }]);
            }
            setIsLoading(false);
        }, 2000); // 2 second delay
    };

    // Handle Enter key press
    const handleKeyPress = (e) => {
        if (e.key === 'Enter' && !e.shiftKey) {
            e.preventDefault();
            handleSendMessage();
        }
    };

    return (
        <>
            {/* Chat Panel - 500x650px */}
            {isOpen && (
                <div 
                    className="fixed right-0 w-[500px] h-[650px] border-2 bg-green-600 border-green-600 rounded-lg shadow-2xl z-50 flex flex-col m-[30px]"
                    style={{ bottom: '100px' }} // Above the button at bottom
                >
                    {/* Chat Panel Header */}
                    <div className="bg-green-600 text-white p-2 rounded-t-lg flex justify-between items-center w-full">
                        <span className="text-sm font-semibold">Chat</span>
                        <button 
                            onClick={() => setIsOpen(false)}
                            className="text-white hover:text-gray-200 text-lg"
                        >
                            ×
                        </button>
                    </div>
                    
                    {/* Chat Messages Area */}
                    <div className="flex-1 p-4 overflow-y-auto bg-gray-50">
                        <div className="space-y-4">
                            {messages.map((msg, index) => (
                                <div
                                    key={index}
                                    className={`flex ${msg.type === 'user' ? 'justify-end' : 'justify-start'}`}
                                >
                                    <div
                                        className={`max-w-[80%] rounded-lg p-3 ${
                                            msg.type === 'user'
                                                ? 'bg-green-600 text-white'
                                                : 'bg-white text-gray-800 border border-gray-200'
                                        }`}
                                    >
                                        <p className="text-sm whitespace-pre-wrap">{msg.text}</p>
                                        {msg.type === 'bot' && (
                                            <button
                                                onClick={() => handleTextToSpeech(msg.text, index)}
                                                className={`mt-2 text-xs flex items-center gap-1 transition-colors ${
                                                    isSpeaking && speakingMessageIndex === index
                                                        ? 'text-red-600 hover:text-red-700'
                                                        : 'text-green-600 hover:text-green-700'
                                                }`}
                                                title={isSpeaking && speakingMessageIndex === index ? 'Stop reading' : 'Read aloud'}
                                            >
                                                {isSpeaking && speakingMessageIndex === index ? (
                                                    <>
                                                        <FaStop size={12} />
                                                        <span>Stop</span>
                                                    </>
                                                ) : (
                                                    <>
                                                        <FaVolumeUp size={12} />
                                                        <span>Read</span>
                                                    </>
                                                )}
                                            </button>
                                        )}
                                    </div>
                                </div>
                            ))}
                            {isLoading && (
                                <div className="flex justify-start">
                                    <div className="bg-white border border-gray-200 rounded-lg p-3">
                                        <div className="flex space-x-2">
                                            <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce"></div>
                                            <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '0.2s' }}></div>
                                            <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '0.4s' }}></div>
                                        </div>
                                    </div>
                                </div>
                            )}
                            <div ref={messagesEndRef} />
                        </div>
                    </div>

                    {/* Input Area */}
                    <div className="border-t border-gray-200 p-3 bg-white rounded-b-lg">
                        <div className="flex items-center gap-2">
                            {/* Speech-to-Text Button */}
                            <button
                                onClick={handleSpeechToText}
                                className={`p-2 rounded-full transition-colors ${
                                    isListening
                                        ? 'bg-red-500 text-white animate-pulse'
                                        : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
                                }`}
                                title={isListening ? 'Stop listening' : 'Start voice input'}
                            >
                                <FaMicrophone size={16} />
                            </button>

                            {/* Text Input */}
                            <input
                                type="text"
                                value={inputText}
                                onChange={(e) => setInputText(e.target.value)}
                                onKeyPress={handleKeyPress}
                                placeholder="Type your message..."
                                className="flex-1 px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-600 focus:border-transparent"
                                disabled={isLoading}
                            />

                            {/* Send Button */}
                            <button
                                onClick={handleSendMessage}
                                disabled={!inputText.trim() || isLoading}
                                className={`p-2 rounded-full transition-colors ${
                                    inputText.trim() && !isLoading
                                        ? 'bg-green-600 text-white hover:bg-green-700'
                                        : 'bg-gray-300 text-gray-500 cursor-not-allowed'
                                }`}
                                title="Send message"
                            >
                                <FaPaperPlane size={16} />
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {/* Fixed Button - Always visible at bottom right */}
            <button 
                onClick={() => setIsOpen(!isOpen)}
                className="fixed bottom-[30px] right-[30px] w-[60px] h-[60px] rounded-full bg-green-600 flex justify-center items-center shadow-lg hover:bg-green-700 transition-colors z-50"
            >
                {/* logo */}
                <SiGreenhouse size={30} color='white'/>
            </button>
        </>
    );
}

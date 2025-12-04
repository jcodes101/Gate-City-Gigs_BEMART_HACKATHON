//===============================================
// REDIS CACHING SYSTEM
//===============================================

// import modules
const redis     = require("redis");
const dotenv    = require("dotenv");

// access env variables
dotenv.config();

//===============================================
// CREATE REDIS CLIENT
//===============================================
const REDIS_HOST = process.env.REDIS_HOST || 'localhost';
const REDIS_PORT = process.env.REDIS_PORT || 6379;
const redisClient = redis.createClient({
    socket: {
        host: REDIS_HOST,
        port: REDIS_PORT
    }
});

// Connect to Redis
redisClient.connect().catch((error) => {
    console.error('Failed to connect to Redis:', error.message);
    console.error(`Redis connection: ${REDIS_HOST}:${REDIS_PORT}`);
});


//===============================================
// REDIS HELPERS
//===============================================

/**
 * Adds a key:value pair to redis cache
 * @param {*} key 
 * @param {*} value 
 * @param {*} expiration (optional) sets an expiration date of how long cached data will live in redis (in seconds)
 */
async function cacheData(key, value, expiration=null){
    try {
        if (expiration) {
            // Set with expiration in seconds
            await redisClient.setEx(key, expiration, JSON.stringify(value));
        } else {
            // Set without expiration
            await redisClient.set(key, JSON.stringify(value));
        }
        return true;
    } catch (error) {
        console.error("Error when trying to cache data:", error);
        return null;
    }
}

/**
 * checks to see if data is cached in redis
 * @param {*} key 
 * @returns data found in cache or null
 */
async function checkCache(key){
    // bad key given
    if (!key)
        return null;

    try{
        // attempt to get data from the cache
        const data = await redisClient.get(key);
        return data ? JSON.parse(data) : null;
    }catch(error){
        console.error("Error when trying to get value from cache:", error);
        return null;
    }
}

/**
 * Check if Redis is running and connected
 * @returns {Promise<boolean>} True if Redis is running, false otherwise
 */
async function isRedisRunning(){
    try {
        // Check if client is connected
        if (!redisClient.isReady) {
            return false;
        }
        
        // Try to ping Redis
        await redisClient.ping();
        return true;
    } catch (error) {
        console.error("Redis is not running or not connected:", error.message);
        return false;
    }
}

/**
 * Delete a key from Redis cache
 * @param {string} key - Key to delete
 * @returns {Promise<boolean>} True if deleted successfully, false otherwise
 */
async function deleteCache(key){
    if (!key)
        return false;

    try {
        await redisClient.del(key);
        return true;
    } catch (error) {
        console.error("Error when trying to delete cache:", error);
        return false;
    }
}

/**
 * Delete multiple keys from Redis cache (supports pattern matching)
 * @param {string} pattern - Pattern to match keys (e.g., "gig:*")
 * @returns {Promise<number>} Number of keys deleted
 */
async function deleteCachePattern(pattern){
    if (!pattern)
        return 0;

    try {
        // Get all keys matching the pattern
        const keys = await redisClient.keys(pattern);
        
        if (keys.length === 0) {
            return 0;
        }

        // Delete all matching keys
        await redisClient.del(keys);
        return keys.length;
    } catch (error) {
        console.error("Error when trying to delete cache pattern:", error);
        return 0;
    }
}

// utils export
module.exports = {
    redisClient,
    cacheData,
    checkCache,
    isRedisRunning,
    deleteCache,
    deleteCachePattern
}
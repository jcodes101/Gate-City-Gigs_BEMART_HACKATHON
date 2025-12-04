//===============================================
// HANDLES ALL GIG ENDPOINTS
//===============================================

// import modules
const express           = require("express");
const router            = express.Router();
const { randomUUID }    = require('crypto');
const { RC_RESPONSE }   = require('../utils/endpoint_helpers.js');
const { RC_CODES }      = require('../utils/error.js');

// db wrapper functions
const { query }         = require('../wrappers/database.js');

// redis wrapper functions
const {
    cacheData,
    checkCache,
    isRedisRunning,
    deleteCache,
    deleteCachePattern
} = require('../wrappers/redis.js');

//===============================================
// VALIDATION HELPERS
//===============================================

const GIG_TAGS = ['REAL_ESTATE', 'VOLUNTEERING', 'INFRASTRUCTURE', 'HOSPITALITY'];
const GIG_URGENCIES = ['LOW', 'MEDIUM', 'HIGH'];

/**
 * Validate gig tag
 * @param {string} tag - Gig tag to validate
 * @returns {boolean} True if valid
 */
function isValidGigTag(tag) {
    return GIG_TAGS.includes(tag);
}

/**
 * Validate gig urgency
 * @param {string} urgency - Gig urgency to validate
 * @returns {boolean} True if valid
 */
function isValidGigUrgency(urgency) {
    return GIG_URGENCIES.includes(urgency);
}

/**
 * Validate gig data for creation
 * @param {Object} gigData - Gig data object
 * @returns {Object} Validation result with isValid and errors
 */
function validateGigData(gigData, isUpdate = false) {
    const errors = [];

    if (!isUpdate) {
        // Required fields for creation
        if (!gigData.gig_owner) errors.push('gig_owner is required');
        if (!gigData.gig_name) errors.push('gig_name is required');
        if (!gigData.gig_address) errors.push('gig_address is required');
        if (!gigData.gig_tag) errors.push('gig_tag is required');
    }

    // Validate gig_tag if provided
    if (gigData.gig_tag && !isValidGigTag(gigData.gig_tag)) {
        errors.push(`gig_tag must be one of: ${GIG_TAGS.join(', ')}`);
    }

    // Validate gig_urgency if provided
    if (gigData.gig_urgency && !isValidGigUrgency(gigData.gig_urgency)) {
        errors.push(`gig_urgency must be one of: ${GIG_URGENCIES.join(', ')}`);
    }

    // Validate string lengths
    if (gigData.gig_name && gigData.gig_name.length > 225) {
        errors.push('gig_name must be 225 characters or less');
    }
    if (gigData.gig_address && gigData.gig_address.length > 100) {
        errors.push('gig_address must be 100 characters or less');
    }
    if (gigData.gig_description && gigData.gig_description.length > 500) {
        errors.push('gig_description must be 500 characters or less');
    }

    return {
        isValid: errors.length === 0,
        errors
    };
}

//===============================================
// CACHE HELPERS
//===============================================

/**
 * Generate cache key for a single gig
 * @param {string} uid - Gig uid
 * @returns {string} Cache key
 */
function getGigCacheKey(uid) {
    return `gig:${uid}`;
}

/**
 * Generate cache key for all gigs with filters
 * @param {Object} filters - Filter object
 * @returns {string} Cache key
 */
function getAllGigsCacheKey(filters = {}) {
    const filterStr = Object.keys(filters)
        .sort()
        .map(key => `${key}:${filters[key]}`)
        .join('|');
    return `gigs:all:${filterStr || 'none'}`;
}

/**
 * Invalidate all gig-related cache entries
 * This is called when gigs are created, updated, or deleted
 */
async function invalidateGigCache() {
    try {
        const redisRunning = await isRedisRunning();
        if (!redisRunning) {
            return;
        }
        // Delete all cache entries matching the pattern
        await deleteCachePattern('gig:*');
        await deleteCachePattern('gigs:*');
    } catch (error) {
        console.error('Error invalidating gig cache:', error);
    }
}

//===============================================
// ENDPOINT HELPERS
//===============================================

/**
 * Check if user exists
 * @param {string} uid - User uid
 * @returns {Promise<boolean>} True if user exists
 */
async function userExists(uid) {
    try {
        const users = await query('SELECT uid FROM Users WHERE uid = ?', [uid]);
        return users && users.length > 0;
    } catch (error) {
        console.error('Error checking user existence:', error);
        return false;
    }
}

/**
 * Create a new gig
 * @param {Object} gigData - Gig data
 * @returns {Promise<Object>} Created gig object
 */
async function createGig(gigData) {
    try {
        const {
            gig_owner,
            gig_name,
            gig_address,
            paid = false,
            gig_description = 'no desc',
            gig_tag,
            gig_urgency = 'LOW'
        } = gigData;

        // Generate UUID for gig
        const uid = randomUUID();

        // Insert gig into database
        await query(
            `INSERT INTO gigs (uid, gig_owner, gig_name, gig_address, paid, gig_description, gig_tag, gig_urgency)
             VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
            [uid, gig_owner, gig_name, gig_address, paid ? 1 : 0, gig_description, gig_tag, gig_urgency]
        );

        // Fetch the created gig
        const gigs = await query('SELECT * FROM gigs WHERE uid = ?', [uid]);
        
        if (!gigs || gigs.length === 0) {
            throw new Error('Failed to retrieve created gig');
        }

        const newGig = gigs[0];

        // Invalidate cache after creating gig
        await invalidateGigCache();

        // Cache the new gig individually (5 minutes)
        const redisRunning = await isRedisRunning();
        if (redisRunning) {
            await cacheData(getGigCacheKey(uid), newGig, 300); // 5 minutes
        }

        return newGig;
    } catch (error) {
        console.error('Error in createGig:', error);
        throw error;
    }
}

/**
 * Get all gigs with optional filters
 * @param {Object} filters - Optional filters (gig_owner, gig_tag, gig_urgency, paid)
 * @returns {Promise<Array>} Array of gig objects
 */
async function getAllGigs(filters = {}) {
    try {
        // Check cache first (minimal caching for GET all - 30 seconds)
        const redisRunning = await isRedisRunning();
        if (redisRunning) {
            const cacheKey = getAllGigsCacheKey(filters);
            const cachedData = await checkCache(cacheKey);
            if (cachedData !== null) {
                return cachedData;
            }
        }

        // Query database
        let sql = 'SELECT * FROM gigs WHERE 1=1';
        const params = [];

        if (filters.gig_owner) {
            sql += ' AND gig_owner = ?';
            params.push(filters.gig_owner);
        }
        if (filters.gig_tag) {
            sql += ' AND gig_tag = ?';
            params.push(filters.gig_tag);
        }
        if (filters.gig_urgency) {
            sql += ' AND gig_urgency = ?';
            params.push(filters.gig_urgency);
        }
        if (filters.paid !== undefined) {
            sql += ' AND paid = ?';
            params.push(filters.paid ? 1 : 0);
        }

        sql += ' ORDER BY gig_created DESC';

        const gigs = await query(sql, params);
        const result = gigs || [];

        // Cache result with short expiration (30 seconds) for GET all
        if (redisRunning) {
            const cacheKey = getAllGigsCacheKey(filters);
            await cacheData(cacheKey, result, 30); // 30 seconds - minimal caching
        }

        return result;
    } catch (error) {
        console.error('Error in getAllGigs:', error);
        throw error;
    }
}

/**
 * Get a gig by uid
 * @param {string} uid - Gig uid
 * @returns {Promise<Object|null>} Gig object or null if not found
 */
async function getGigByUid(uid) {
    try {
        // Check cache first
        const redisRunning = await isRedisRunning();
        if (redisRunning) {
            const cacheKey = getGigCacheKey(uid);
            const cachedGig = await checkCache(cacheKey);
            if (cachedGig !== null) {
                return cachedGig;
            }
        }

        // Query database
        const gigs = await query('SELECT * FROM gigs WHERE uid = ?', [uid]);
        const gig = gigs && gigs.length > 0 ? gigs[0] : null;

        // Cache result if found (5 minutes)
        if (gig && redisRunning) {
            const cacheKey = getGigCacheKey(uid);
            await cacheData(cacheKey, gig, 300); // 5 minutes
        }

        return gig;
    } catch (error) {
        console.error('Error in getGigByUid:', error);
        throw error;
    }
}

/**
 * Update a gig
 * @param {string} uid - Gig uid
 * @param {Object} updateData - Fields to update
 * @returns {Promise<Object|null>} Updated gig object or null if not found
 */
async function updateGig(uid, updateData) {
    try {
        const allowedFields = ['gig_name', 'gig_address', 'paid', 'gig_description', 'gig_tag', 'gig_urgency'];
        const updates = [];
        const params = [];

        // Build update query dynamically
        for (const field of allowedFields) {
            if (updateData[field] !== undefined) {
                if (field === 'paid') {
                    updates.push(`${field} = ?`);
                    params.push(updateData[field] ? 1 : 0);
                } else {
                    updates.push(`${field} = ?`);
                    params.push(updateData[field]);
                }
            }
        }

        if (updates.length === 0) {
            throw new Error('No valid fields to update');
        }

        params.push(uid);

        await query(
            `UPDATE gigs SET ${updates.join(', ')} WHERE uid = ?`,
            params
        );

        // Invalidate cache first to ensure we get fresh data
        await invalidateGigCache();

        // Fetch the updated gig directly from database (bypass cache)
        const gigs = await query('SELECT * FROM gigs WHERE uid = ?', [uid]);
        const updatedGig = gigs && gigs.length > 0 ? gigs[0] : null;

        // Re-cache the updated gig (5 minutes)
        if (updatedGig) {
            const redisRunning = await isRedisRunning();
            if (redisRunning) {
                await cacheData(getGigCacheKey(uid), updatedGig, 300); // 5 minutes
            }
        }

        return updatedGig;
    } catch (error) {
        console.error('Error in updateGig:', error);
        throw error;
    }
}

/**
 * Delete a gig
 * @param {string} uid - Gig uid
 * @returns {Promise<boolean>} True if deleted successfully
 */
async function deleteGig(uid) {
    try {
        await query('DELETE FROM gigs WHERE uid = ?', [uid]);
        
        // Verify deletion by checking if gig still exists (direct query, bypass cache)
        const gigs = await query('SELECT * FROM gigs WHERE uid = ?', [uid]);
        const deleted = !gigs || gigs.length === 0;

        // Invalidate cache after deleting
        if (deleted) {
            await invalidateGigCache();
            // Also delete the specific gig cache key
            const redisRunning = await isRedisRunning();
            if (redisRunning) {
                await deleteCache(getGigCacheKey(uid));
            }
        }

        return deleted;
    } catch (error) {
        console.error('Error in deleteGig:', error);
        throw error;
    }
}

//===============================================
// MIDDLEWARE
//===============================================

/**
 * Middleware to validate gig creation data
 * Validates required fields and data types
 * Attaches validated gig data to req.gigData if successful
 */
async function validateGigCreation(req, res, next) {
    try {
        const gigData = req.body;

        if (!gigData) {
            return res.json(RC_RESPONSE(RC_CODES.BAD_REQUEST, {
                details: 'Gig data is required'
            }));
        }

        // Validate input
        const validation = validateGigData(gigData, false);
        if (!validation.isValid) {
            return res.json(RC_RESPONSE(RC_CODES.VALIDATION_ERROR, {
                details: 'Validation failed',
                errors: validation.errors
            }));
        }

        // Attach validated data to request
        req.gigData = gigData;
        next();
    } catch (error) {
        console.error('Error in validateGigCreation:', error);
        return res.json(RC_RESPONSE(RC_CODES.SERVER_ERROR, {
            details: 'Validation failed',
            error: error.message
        }));
    }
}

/**
 * Middleware to validate gig owner exists
 * Checks if gig_owner exists in Users table
 * Should be used after validateGigCreation
 */
async function validateGigOwner(req, res, next) {
    try {
        const gigData = req.gigData || req.body;
        const gig_owner = gigData.gig_owner;

        if (!gig_owner) {
            return res.json(RC_RESPONSE(RC_CODES.BAD_REQUEST, {
                details: 'gig_owner is required'
            }));
        }

        // Check if gig_owner exists
        const ownerExists = await userExists(gig_owner);
        if (!ownerExists) {
            return res.json(RC_RESPONSE(RC_CODES.NOT_FOUND, {
                details: 'Gig owner (user) not found'
            }));
        }

        next();
    } catch (error) {
        console.error('Error in validateGigOwner:', error);
        return res.json(RC_RESPONSE(RC_CODES.SERVER_ERROR, {
            details: 'Failed to validate gig owner',
            error: error.message
        }));
    }
}

/**
 * Middleware to validate gig update data
 * Validates optional fields and data types
 * Attaches validated update data to req.updateData if successful
 */
async function validateGigUpdate(req, res, next) {
    try {
        const updateData = req.body;

        if (!updateData || Object.keys(updateData).length === 0) {
            return res.json(RC_RESPONSE(RC_CODES.BAD_REQUEST, {
                details: 'Update data is required'
            }));
        }

        // Validate input (isUpdate = true allows optional fields)
        const validation = validateGigData(updateData, true);
        if (!validation.isValid) {
            return res.json(RC_RESPONSE(RC_CODES.VALIDATION_ERROR, {
                details: 'Validation failed',
                errors: validation.errors
            }));
        }

        // Attach validated data to request
        req.updateData = updateData;
        next();
    } catch (error) {
        console.error('Error in validateGigUpdate:', error);
        return res.json(RC_RESPONSE(RC_CODES.SERVER_ERROR, {
            details: 'Validation failed',
            error: error.message
        }));
    }
}

/**
 * Middleware to validate gig exists by uid
 * Checks if gig exists and attaches it to req.existingGig
 */
async function validateGigExists(req, res, next) {
    try {
        const { uid } = req.params;

        if (!uid) {
            return res.json(RC_RESPONSE(RC_CODES.BAD_REQUEST, {
                details: 'Gig uid is required'
            }));
        }

        const gig = await getGigByUid(uid);

        if (!gig) {
            return res.json(RC_RESPONSE(RC_CODES.NOT_FOUND, {
                details: 'Gig not found'
            }));
        }

        // Attach gig to request
        req.existingGig = gig;
        next();
    } catch (error) {
        console.error('Error in validateGigExists:', error);
        return res.json(RC_RESPONSE(RC_CODES.SERVER_ERROR, {
            details: 'Failed to validate gig existence',
            error: error.message
        }));
    }
}

/**
 * Middleware to extract and validate query filters for GET all gigs
 * Extracts filters from query parameters and validates them
 * Attaches validated filters to req.gigFilters
 */
async function extractGigFilters(req, res, next) {
    try {
        const filters = {
            gig_owner: req.query.gig_owner,
            gig_tag: req.query.gig_tag,
            gig_urgency: req.query.gig_urgency,
            paid: req.query.paid !== undefined ? req.query.paid === 'true' : undefined
        };

        // Validate gig_tag if provided
        if (filters.gig_tag && !isValidGigTag(filters.gig_tag)) {
            return res.json(RC_RESPONSE(RC_CODES.VALIDATION_ERROR, {
                details: `gig_tag must be one of: ${GIG_TAGS.join(', ')}`
            }));
        }

        // Validate gig_urgency if provided
        if (filters.gig_urgency && !isValidGigUrgency(filters.gig_urgency)) {
            return res.json(RC_RESPONSE(RC_CODES.VALIDATION_ERROR, {
                details: `gig_urgency must be one of: ${GIG_URGENCIES.join(', ')}`
            }));
        }

        // Remove undefined filters
        Object.keys(filters).forEach(key => filters[key] === undefined && delete filters[key]);

        // Attach filters to request
        req.gigFilters = filters;
        next();
    } catch (error) {
        console.error('Error in extractGigFilters:', error);
        return res.json(RC_RESPONSE(RC_CODES.SERVER_ERROR, {
            details: 'Failed to extract filters',
            error: error.message
        }));
    }
}

//===============================================
// HTTP ENDPOINTS
//===============================================

// CREATE - Create a new gig
router.post("/create", validateGigCreation, validateGigOwner, async (req, res) => {
    try {
        const gigData = req.gigData;

        // Create gig
        const newGig = await createGig(gigData);

        return res.json(RC_RESPONSE(RC_CODES.SUCCESS, {
            gig: newGig
        }));
    } catch (error) {
        console.error('Error in POST /api/gigs:', error);
        
        // Handle foreign key constraint errors
        if (error.message.includes('FOREIGN KEY') || error.message.includes('gig_owner')) {
            return res.json(RC_RESPONSE(RC_CODES.NOT_FOUND, {
                details: 'Gig owner (user) not found',
                error: error.message
            }));
        }

        return res.json(RC_RESPONSE(RC_CODES.SERVER_ERROR, {
            details: 'Failed to create gig',
            error: error.message
        }));
    }
});

// READ - Get all gigs (with optional filters)
router.get("/get/all", extractGigFilters, async (req, res) => {
    try {
        const filters = req.gigFilters;
        const gigs = await getAllGigs(filters);

        return res.json(RC_RESPONSE(RC_CODES.SUCCESS, {
            gigs: gigs,
            count: gigs.length
        }));
    } catch (error) {
        console.error('Error in GET /api/gigs:', error);
        return res.json(RC_RESPONSE(RC_CODES.SERVER_ERROR, {
            details: 'Failed to fetch gigs',
            error: error.message
        }));
    }
});

// READ - Get gigs by tag
router.get("/by-tag", async (req, res) => {
    try {
        const { tag } = req.query;
        
        if (!tag || typeof tag !== 'string') {
            return res.json(RC_RESPONSE(RC_CODES.BAD_REQUEST, {
                details: 'Tag is required and must be a string'
            }));
        }

        // Validate tag
        if (!isValidGigTag(tag)) {
            return res.json(RC_RESPONSE(RC_CODES.VALIDATION_ERROR, {
                details: `gig_tag must be one of: ${GIG_TAGS.join(', ')}`
            }));
        }

        const filters = { gig_tag: tag };
        const gigs = await getAllGigs(filters);

        return res.json(RC_RESPONSE(RC_CODES.SUCCESS, {
            gigs: gigs,
            count: gigs.length,
            tag: tag
        }));
    } catch (error) {
        console.error('Error in GET /api/gigs/by-tag:', error);
        return res.json(RC_RESPONSE(RC_CODES.SERVER_ERROR, {
            details: 'Failed to fetch gigs by tag',
            error: error.message
        }));
    }
});

// READ - Get a specific gig by uid
router.get("/:uid", validateGigExists, async (req, res) => {
    try {
        const gig = req.existingGig;

        return res.json(RC_RESPONSE(RC_CODES.SUCCESS, {
            gig: gig
        }));
    } catch (error) {
        console.error('Error in GET /api/gigs/:uid:', error);
        return res.json(RC_RESPONSE(RC_CODES.SERVER_ERROR, {
            details: 'Failed to fetch gig',
            error: error.message
        }));
    }
});

// UPDATE - Update a gig
router.put("/:uid", validateGigExists, validateGigUpdate, async (req, res) => {
    try {
        const { uid } = req.params;
        const updateData = req.updateData;

        // Update gig
        const updatedGig = await updateGig(uid, updateData);

        if (!updatedGig) {
            return res.json(RC_RESPONSE(RC_CODES.NOT_FOUND, {
                details: 'Gig not found after update'
            }));
        }

        return res.json(RC_RESPONSE(RC_CODES.SUCCESS, {
            gig: updatedGig
        }));
    } catch (error) {
        console.error('Error in PUT /api/gigs/:uid:', error);
        return res.json(RC_RESPONSE(RC_CODES.SERVER_ERROR, {
            details: 'Failed to update gig',
            error: error.message
        }));
    }
});

// DELETE - Delete a gig
router.delete("/:uid", validateGigExists, async (req, res) => {
    try {
        const { uid } = req.params;
        const existingGig = req.existingGig;

        // Delete gig
        const deleted = await deleteGig(uid);

        if (!deleted) {
            return res.json(RC_RESPONSE(RC_CODES.SERVER_ERROR, {
                details: 'Failed to delete gig'
            }));
        }

        return res.json(RC_RESPONSE(RC_CODES.SUCCESS, {
            message: 'Gig deleted successfully',
            deletedGig: existingGig
        }));
    } catch (error) {
        console.error('Error in DELETE /api/gigs/:uid:', error);
        return res.json(RC_RESPONSE(RC_CODES.SERVER_ERROR, {
            details: 'Failed to delete gig',
            error: error.message
        }));
    }
});

module.exports = router;

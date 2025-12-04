//======================================
// HANDLE ALL GIGS-RELATED SERVER COMMUNICATION
//======================================
import * as API from "../utils/api.js"

/**
 * @param {Object} gigData
 * @returns {Promise<Object>} The created gig object
 */
export async function addGig(gigData) {
    if (!gigData || typeof gigData !== 'object' || Object.keys(gigData).length === 0) {
        console.error("Gig data must be a non-empty object");
        return null;
    }

    try {
        const response = await API.post("/api/gigs/create", gigData);

        if (response.status !== 200) {
            console.error("Error adding gig:", response);
            return null;
        }

        return response.gig || null;
    } catch (error) {
        console.error("Error when adding gig:", error);
        return null;
    }
}

/**
 * @returns {Promise<Array>} 
 */
export async function getAllGigs() {
    try {
        const response = await API.get("/api/gigs/get/all");

        if (response.status !== 200) {
            console.error("Error fetching gigs:", response);
            return [];
        }

        return Array.isArray(response.gigs) ? response.gigs : [];
    } catch (error) {
        console.error("Error when fetching all gigs:", error);
        return [];
    }
}

export async function getByTag(tag) {
    if (!tag || typeof tag !== "string") {
        console.error("Tag must be a non-empty string");
        return [];
    }

    try {
        const response = await API.get(`/api/gigs/by-tag?tag=${encodeURIComponent(tag)}`);

        if (response.status !== 200) {
            console.error("Error fetching gigs by tag:", response);
            return [];
        }

        return Array.isArray(response.gigs) ? response.gigs : [];
    } catch (error) {
        console.error("Error when fetching gigs by tag:", error);
        return [];
    }
}
    


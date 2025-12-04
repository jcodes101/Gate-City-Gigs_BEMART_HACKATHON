//===============================================
// HANDLES ALL BASIC AUTHENTICATION
//===============================================

import * as API from "../utils/api.js"

/**
 * fetches all users
 */
async function fetchUsers(){
    
}

/**
 * fetch by username
 * @param {*} username 
 */
async function fetchUsers(username){
    if (!username) return null;

    // send request to api to get user by username
    try {
        
    } catch (error) {
        console.error("Error on api request:", error);
        return null;
    }
}

//======================================
// HANDLE ALL SERVER COMMUNICATION
//======================================
import * as API  from "../utils/api.js"
import { jwtDecode } from "jwt-decode"

/**
 * sends jwt from google to be verified and then 
 * returns a new custom session token
 * @param {*} jwt 
 * @returns jwt - encoded
 */
async function invokeGoogleAuth(jwt) {
    if (!jwt) return { success: false, error: "JWT token is required" };
    try {
        // request for authenticated user session
        const response = await API.post(`/api/google/auth`,{ token: jwt });

        console.log("Google auth response:", response);

        // check for status
        if (response.status != 200){
            console.error("Unable to make request:", response);
            // Return error details from response
            return { 
                success: false, 
                error: response.details || "Google authentication failed. Please try again." 
            };
        }

        // handle success
        if (response.status == 200 && response.userToken){
            // decrypt jwt to get user data
            const decodedUser = jwtDecode(response.userToken);
            
            console.log("Decoded JWT user data:", decodedUser);
            
            // Format user object to match what frontend expects
            // Handle null/undefined values gracefully
            const user = {
                uid: decodedUser.uid || null,
                email: decodedUser.email || null,
                fname: decodedUser.fname || null,
                lname: decodedUser.lname || null,
                username: decodedUser.username || null,
                avatar_url: decodedUser.avatar_url || null
            };
            
            // Store the token for future requests
            localStorage.setItem("authToken", response.userToken);
            
            console.log("Formatted user object:", user);
            
            return { success: true, user: user };
        }
        
        console.error("Response missing userToken:", response);
        return { 
            success: false, 
            error: response.details || "Google authentication failed. Please try again." 
        };
    } catch (error) {
        console.error("Error when requesting continue with google auth:", error);
        return { 
            success: false, 
            error: error.message || "An error occurred during Google authentication. Please try again." 
        };
    }
}

/**
 * sends request to log in with username and password
 * @param {*} userData 
 * @returns user session
 */
async function invokeBasicLogin(userData) {
    if (!userData) return { success: false, error: "User data is required" };

    try {
        // send auth request to server
        const response = await API.post(`/api/auth/basic/login`, { credentials: userData });

        // check for status
        if (response.status != 200){
            console.error("Unable to make request:", response);
            // Return error details from response
            return { 
                success: false, 
                error: response.details || "Login failed. Please try again." 
            };
        }
     
        // handle success
        if (response.status == 200){
            // sends back to jsx file I assume to be setUser context
            return { success: true, userSession: response.userSession };
        }else{
            console.error("Unable to log user in:", response);
            return { 
                success: false, 
                error: response.details || "Login failed. Please try again." 
            };
        }
        
    } catch (error) {
        console.error("Error when trying to invoke login request:", error);
        return { 
            success: false, 
            error: error.message || "An error occurred during login. Please try again." 
        };
    }
    
}

/**
 * sends request to register user
 *  with registration form data
 * @param {*} userData 
 * @returns user session
 */
async function invokeBasicRegister(userData) {
    if (!userData) return { success: false, error: "User data is required" };

    try {
        // send auth request to server
        const response = await API.post(`/api/auth/basic/register`, { credentials: userData });

        // check for status
        if (response.status != 200){
            console.error("Unable to make request:", response);
            // Return error details from response
            return { 
                success: false, 
                error: response.details || "Registration failed. Please try again." 
            };
        }
     
        // handle success
        if (response.status == 200){
            // sends back to jsx file I assume to be setUser context
            console.log("Result:", response.userSession);
            return { success: true, userSession: response.userSession };
        }else{
            console.error("Unable to register user:", response);
            return { 
                success: false, 
                error: response.details || "Registration failed. Please try again." 
            };
        }
        
    } catch (error) {
        console.error("Error when trying to invoke register request:", error);
        return { 
            success: false, 
            error: error.message || "An error occurred during registration. Please try again." 
        };
    }
}

export {
    invokeGoogleAuth,
    invokeBasicLogin,
    invokeBasicRegister
};

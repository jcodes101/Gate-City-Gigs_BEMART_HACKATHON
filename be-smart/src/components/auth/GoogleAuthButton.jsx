import { useState, useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom";
import { invokeGoogleAuth } from "../../middlewares/auth.js";
import { useUser } from "../global-context/context_provider.jsx";

const GoogleAuthButton = () => {
  const [token, setToken] = useState(null);
  const [error, setError] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const buttonRef = useRef(null);
  const navigate = useNavigate();
  const { setUser } = useUser();
  const GOOGLE_CLIENT_ID = import.meta.env.VITE_GOOGLE_CLIENT_ID;

  // Handle Google authentication response
  const handleCredentialResponse = async (response) => {
    const jwtToken = response.credential;
    setToken(jwtToken);
    setIsLoading(true);
    setError(null);
    console.log("Google JWT Token received, sending to backend...");
    
    try {
      // Send token to backend using invokeGoogleAuth
      const result = await invokeGoogleAuth(jwtToken);
      
      if (result.success && result.user) {
        console.log("Google auth successful, user:", result.user);
        // Set user in context (invokeGoogleAuth already stores token)
        setUser(result.user);
        
        // Redirect to home page
        navigate("/");
      } else {
        // Display error message from backend
        const errorMessage = result.error || "Google authentication failed. Please try again.";
        setError(errorMessage);
        console.error("Google auth failed:", errorMessage);
      }
    } catch (err) {
      console.error("Error during Google authentication:", err);
      setError("An error occurred during Google authentication. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  // check for environment variables
  useEffect(() => {
    console.log("GoogleAuthButton: Checking for CLIENT_ID...", GOOGLE_CLIENT_ID ? "Found" : "NOT FOUND");
    
    if (!GOOGLE_CLIENT_ID) {
      const errorMsg = "VITE_GOOGLE_CLIENT_ID is not set. Please create a .env file in the be-smart directory with: VITE_GOOGLE_CLIENT_ID=your-client-id";
      console.error(errorMsg);
      setError(errorMsg);
      return;
    }

    console.log("GoogleAuthButton: CLIENT_ID found, initializing...");

    // Function to initialize Google Auth
    const initializeGoogleAuth = () => {
      let retryCount = 0;
      const maxRetries = 50; // 5 seconds max
      
      const checkGoogle = () => {
        if (typeof window.google !== "undefined" && window.google.accounts?.id) {
          console.log("GoogleAuthButton: Google script loaded, initializing...");
          
          try {
            window.google.accounts.id.initialize({
              client_id: GOOGLE_CLIENT_ID,
              callback: handleCredentialResponse,
              use_fedcm_for_prompt: false,
            });

            // Render the button
            if (buttonRef.current) {
              console.log("GoogleAuthButton: Rendering button...");
              try {
                window.google.accounts.id.renderButton(buttonRef.current, {
                  theme: "outline",
                  size: "large",
                  type: "standard",
                  text: "signin_with",
                });
                console.log("GoogleAuthButton: Button rendered successfully!");
                setError(null);
              } catch (renderError) {
                console.error("GoogleAuthButton: Could not render button:", renderError);
                setError(`Failed to render button: ${renderError.message}`);
              }
            } else {
              console.warn("GoogleAuthButton: buttonRef.current is null");
            }
          } catch (initError) {
            console.error("GoogleAuthButton: Initialization error:", initError);
            setError(`Initialization failed: ${initError.message}`);
          }
        } else {
          retryCount++;
          if (retryCount < maxRetries) {
            setTimeout(checkGoogle, 100);
          } else {
            const timeoutError = "Google Sign-In script failed to load after 5 seconds. Check your internet connection.";
            console.error("GoogleAuthButton:", timeoutError);
            setError(timeoutError);
          }
        }
      };
      checkGoogle();
    };

    // Load Google Identity Services script if not already loaded
    if (!window.google?.accounts) {
      console.log("GoogleAuthButton: Loading Google script...");
      
      // Check if script already exists in DOM
      const existingScript = document.querySelector('script[src="https://accounts.google.com/gsi/client"]');
      
      if (existingScript) {
        console.log("GoogleAuthButton: Script already in DOM, waiting for load...");
        if (existingScript.complete || existingScript.readyState === 'complete') {
          // Script already loaded
          initializeGoogleAuth();
        } else {
          existingScript.addEventListener('load', initializeGoogleAuth);
          existingScript.addEventListener('error', () => {
            setError("Failed to load Google Sign-In script. Check your internet connection.");
          });
        }
      } else {
        // Create new script
        const script = document.createElement("script");
        script.src = "https://accounts.google.com/gsi/client";
        script.async = true;
        script.defer = true;
        script.onload = () => {
          console.log("GoogleAuthButton: Script loaded successfully");
          initializeGoogleAuth();
        };
        script.onerror = () => {
          const scriptError = "Failed to load Google Sign-In script. Check your internet connection and that the script URL is accessible.";
          console.error("GoogleAuthButton:", scriptError);
          setError(scriptError);
        };
        document.head.appendChild(script);
        console.log("GoogleAuthButton: Script tag added to head");
      }
    } else {
      console.log("GoogleAuthButton: Google already loaded, initializing directly...");
      initializeGoogleAuth();
    }

    // Cleanup code
    return () => {
      if (buttonRef.current) {
        buttonRef.current.innerHTML = "";
      }
    };
  }, [GOOGLE_CLIENT_ID]);

  // Show error if there's an issue
  if (error) {
    return (
      <div className="text-center p-4">
        <p className="text-sm text-red-600 mb-2">{error}</p>
        {!GOOGLE_CLIENT_ID && (
          <p className="text-xs text-gray-500">
            Create a .env file in the be-smart directory with: VITE_GOOGLE_CLIENT_ID=your-client-id
          </p>
        )}
      </div>
    );
  }

  return (
    <div className="flex flex-col items-center">
      {isLoading && (
        <p className="text-sm text-gray-600 mb-2">Signing in with Google...</p>
      )}
      <div className="flex justify-center">
        <div ref={buttonRef} id="google-signin-button"></div>
      </div>
    </div>
  );
};

export default GoogleAuthButton;


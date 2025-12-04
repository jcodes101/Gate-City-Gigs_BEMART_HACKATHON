# Google Authentication Setup Guide

## Issue: GoogleAuthButton Not Rendering

If the Google Sign-In button is not appearing, it's likely because the `VITE_GOOGLE_CLIENT_ID` environment variable is not set.

## Steps to Fix:

### 1. Create a `.env` file in the `be-smart` directory

Create a file named `.env` in the `be-smart` folder with the following content:

```env
VITE_GOOGLE_CLIENT_ID=your-google-client-id-here.apps.googleusercontent.com
VITE_BASE_URL=http://localhost:3000
```

### 2. Get a Google OAuth Client ID

1. Go to [Google Cloud Console](https://console.cloud.google.com/)
2. Create a new project or select an existing one
3. Enable the Google+ API:
   - Navigate to "APIs & Services" > "Library"
   - Search for "Google+ API" or "Identity Toolkit API"
   - Click "Enable"
4. Create OAuth 2.0 credentials:
   - Go to "APIs & Services" > "Credentials"
   - Click "Create Credentials" > "OAuth client ID"
   - Choose "Web application" as the application type
   - Add authorized JavaScript origins:
     - `http://localhost:5173` (for Vite dev server)
     - `http://localhost:3000` (if using different port)
     - Your production domain (when deploying)
   - Add authorized redirect URIs (if needed for your backend)
   - Click "Create"
5. Copy the Client ID (it ends with `.apps.googleusercontent.com`)
6. Paste it into your `.env` file as `VITE_GOOGLE_CLIENT_ID`

### 3. Restart Your Development Server

After creating/updating the `.env` file:

- Stop your dev server (Ctrl+C)
- Start it again with `npm run dev`
- The environment variables will be loaded

### 4. Verify It's Working

- The Google Sign-In button should now appear on the login and create account pages
- If you see an error message, check the browser console for details
- The button should be positioned below the "Or continue with" divider

## Troubleshooting

### Button still not showing?

1. **Check the browser console** for error messages
2. **Verify the environment variable** is set:
   - Open browser DevTools
   - Check if `VITE_GOOGLE_CLIENT_ID` is defined (it won't show in console, but errors will indicate if it's missing)
3. **Check network tab** to see if the Google script is loading
4. **Verify your Client ID** is correct in the `.env` file
5. **Make sure you restarted** the dev server after creating/updating `.env`

### Common Errors:

- **"VITE_GOOGLE_CLIENT_ID is not set"**: Create the `.env` file with the variable
- **"Failed to load Google Sign-In script"**: Check your internet connection
- **"Failed to initialize Google Sign-In"**: Verify your Client ID is correct and the API is enabled
- **Button renders but doesn't work**: Check authorized JavaScript origins in Google Cloud Console

## Notes

- The `.env` file should be in the `be-smart` directory (same level as `package.json`)
- Never commit your `.env` file to version control (it should be in `.gitignore`)
- For production, set environment variables in your hosting platform's settings

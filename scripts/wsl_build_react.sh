#!/bin/bash
# ======================================================
# ADD ALL DEPENDENCIES TO THE $DEPENDENCIES VARIABLE
# ======================================================

set -e  # Exit on error

# Get the directory where the script is located
SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
PROJECT_ROOT="$(cd "$SCRIPT_DIR/.." && pwd)"
REACT_DIR="$PROJECT_ROOT/be-smart"

# Change to react app directory
cd "$REACT_DIR"

# install list of react modules (add dependencies here if needed)
DEPENDENCIES="react-loading-skeleton react-google-button jwt-decode tailwindcss @tailwindcss/vite google-one-tap react-icons react-router-dom @supabase/supabase-js motion usehooks-ts jwt-decode bcrypt @arcgis/core mapbox-gl" 

# install all dependencies
echo "Installing modules...."
if [ -n "$DEPENDENCIES" ]; then
    npm install $DEPENDENCIES
else
    npm install
fi

# build react app
echo "Building React app...."
npm run build
echo "React build completed successfully!"

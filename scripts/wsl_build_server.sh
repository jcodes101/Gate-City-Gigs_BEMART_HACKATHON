#!/bin/bash
# ======================================================
# ADD ALL DEPENDENCIES TO THE $DEPENDENCIES VARIABLE
# ======================================================

set -e

# Resolve project root relative to this script
SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
PROJECT_ROOT="$(cd "$SCRIPT_DIR/.." && pwd)"
SERVER_DIR="$PROJECT_ROOT/server_side"

cd "$SERVER_DIR"

# Install server dependencies (kept identical to original)
DEPENDENCIES="express body-parser url path fs dotenv cors google-auth-library jsonwebtoken bcrypt @aws-sdk/client-bedrock-runtime @aws-sdk/client-rds @aws-sdk/client-s3 @aws-sdk/s3-request-presigner @aws-sdk/credential-providers mysql2 redis multer"

# install all dependencies
echo "Installing modules...."
if [ -f package.json ]; then
    if [ -n "$DEPENDENCIES" ]; then
        npm install $DEPENDENCIES
    else
        npm install
    fi
fi

# run server
# Set NODE_ENV to development if not already set
export NODE_ENV=${NODE_ENV:-development}
echo "Running server in ${NODE_ENV} mode..."

# Find Node.js - try WSL node first, then Windows node.exe
if command -v node >/dev/null 2>&1; then
    NODE_BIN="node"
elif [ -x "/mnt/c/Program Files/nodejs/node.exe" ]; then
    NODE_BIN="/mnt/c/Program Files/nodejs/node.exe"
elif [ -x "/mnt/c/Program Files (x86)/nodejs/node.exe" ]; then
    NODE_BIN="/mnt/c/Program Files (x86)/nodejs/node.exe"
else
    echo "Error: Node.js not found. Please install Node.js in WSL or Windows."
    exit 127
fi

"$NODE_BIN" server.js

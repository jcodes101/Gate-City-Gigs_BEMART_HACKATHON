#!/bin/bash
# ======================================================
# ADD ALL DEPENDENCIES TO THE $DEPENDENCIES VARIABLE
# ======================================================

# install list of server modules
DEPENDENCIES="express body-parser url path fs dotenv cors google-auth-library jsonwebtoken bcrypt @aws-sdk/client-bedrock-runtime @aws-sdk/client-rds @aws-sdk/client-s3 @aws-sdk/s3-request-presigner @aws-sdk/credential-providers mysql2 redis multer"

# make sure node server is init

# install all dependencies
echo "Installing modules...."
cd server_side
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
node server.js

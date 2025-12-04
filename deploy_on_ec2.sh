#!/bin/bash
# ======================================================
# EC2 Deployment Script (Run this on EC2 instance)
# ======================================================
# This script should be run on your EC2 instance
# It pulls code from git, builds, and deploys
# ======================================================

set -e  # Exit on error

# Configuration
APP_DIR="/home/ubuntu/be-smart-app"
REACT_DIR="/home/ubuntu/be-smart"
GIT_REPO_URL="${GIT_REPO_URL:-https://github.com/Eliaslopes248/BE_SMART_HACKATHON.git}"  # Set this environment variable or update below
PROJECT_DIR="/home/ubuntu/BE_SMART_HACKATHON"

echo "=========================================="
echo "Deploying Be Smart Application on EC2"
echo "=========================================="

# Check if we're on EC2
if [ ! -f "/etc/system-release" ] && [ ! -f "/etc/os-release" ]; then
    echo "Warning: This script is designed to run on EC2"
fi

# Step 1: Install Node.js if not installed
if ! command -v node &> /dev/null; then
    echo "Step 1: Installing Node.js..."
    curl -fsSL https://deb.nodesource.com/setup_20.x | sudo -E bash -
    sudo apt-get install -y nodejs
else
    echo "Step 1: Node.js already installed ($(node --version))"
fi

# Step 2: Install PM2 globally if not installed
if ! command -v pm2 &> /dev/null; then
    echo "Step 2: Installing PM2..."
    sudo npm install -g pm2
else
    echo "Step 2: PM2 already installed"
fi

# Step 3: Clone or update repository
echo "Step 3: Setting up repository..."
if [ -d "$PROJECT_DIR" ]; then
    echo "Updating existing repository..."
    cd "$PROJECT_DIR"
    git pull origin main || git pull origin master
else
    echo "Cloning repository..."
    if [ -z "$GIT_REPO_URL" ]; then
        echo "Error: GIT_REPO_URL not set. Please set it or update this script."
        echo "Example: export GIT_REPO_URL=https://github.com/username/repo.git"
        echo "Or clone manually: git clone <your-repo-url> $PROJECT_DIR"
        exit 1
    fi
    git clone "$GIT_REPO_URL" "$PROJECT_DIR"
    cd "$PROJECT_DIR"
fi

# Step 4: Build React app
echo "Step 4: Building React app..."
cd "$PROJECT_DIR/be-smart"
npm install
npm run build

if [ ! -d "dist" ]; then
    echo "Error: React build failed - dist directory not found"
    exit 1
fi

echo "React build completed successfully!"

# Step 5: Install server dependencies
echo "Step 5: Installing server dependencies..."
cd "$PROJECT_DIR/server_side"
npm install --production

# Step 6: Setup application directories
echo "Step 6: Setting up application directories..."
sudo mkdir -p "$APP_DIR"
sudo mkdir -p "$REACT_DIR/dist"
sudo chown -R ubuntu:ubuntu "$APP_DIR"
sudo chown -R ubuntu:ubuntu "$REACT_DIR"

# Step 7: Copy server files
echo "Step 7: Copying server files..."
cp -r "$PROJECT_DIR/server_side"/* "$APP_DIR/"
cp "$PROJECT_DIR/server_side/.env.production" "$APP_DIR/" 2>/dev/null || {
    echo "Warning: .env.production not found. Creating from template..."
    cat > "$APP_DIR/.env.production" << 'EOF'
# Database Configuration
DB_HOST=be-smart-db.cn8ygsogocy8.us-east-2.rds.amazonaws.com
DB_PORT=3306
DB_NAME=besmart
DB_USER=admin
DB_PASSWORD=be-smart-password
DB_REGION=us-east-2
DB_SSL=true
DB_USE_IAM_AUTH=false
DB_CONNECTION_LIMIT=20

# Server Configuration
PORT=3000
BASE_URL=http://ec2-52-15-61-144.us-east-2.compute.amazonaws.com:3000
EOF
}

# Step 8: Copy React build
echo "Step 8: Copying React build..."
cp -r "$PROJECT_DIR/be-smart/dist"/* "$REACT_DIR/dist/"

# Step 9: Copy PM2 ecosystem config
if [ -f "$PROJECT_DIR/server_side/ecosystem.config.js" ]; then
    cp "$PROJECT_DIR/server_side/ecosystem.config.js" "$APP_DIR/"
else
    echo "Creating default PM2 ecosystem config..."
    cat > "$APP_DIR/ecosystem.config.js" << 'EOF'
module.exports = {
  apps: [{
    name: 'be-smart-server',
    script: 'server.js',
    instances: 1,
    exec_mode: 'fork',
    env: {
      NODE_ENV: 'production',
      PORT: 3000
    },
    error_file: './logs/err.log',
    out_file: './logs/out.log',
    log_file: './logs/combined.log',
    time: true,
    autorestart: true,
    watch: false,
    max_memory_restart: '1G'
  }]
};
EOF
fi

# Step 10: Create logs directory
mkdir -p "$APP_DIR/logs"

# Step 11: Setup PM2 to start on boot (first time only)
echo "Step 11: Setting up PM2 startup..."
if pm2 startup | grep -q "already setup"; then
    echo "PM2 startup already configured."
else
    echo "PM2 startup requires sudo. Running setup..."
    # Get the startup command and execute it
    STARTUP_CMD=$(pm2 startup systemd -u ubuntu --hp /home/ubuntu | grep "sudo" | head -1)
    if [ -n "$STARTUP_CMD" ]; then
        echo "Executing: $STARTUP_CMD"
        eval "$STARTUP_CMD" || echo "Warning: PM2 startup setup failed. You may need to run it manually."
    else
        echo "Warning: Could not extract PM2 startup command. Continuing anyway..."
        echo "You can set up PM2 startup later with: pm2 startup systemd -u ubuntu --hp /home/ubuntu"
    fi
fi

# Step 12: Restart application
echo "Step 12: Restarting application..."
cd "$APP_DIR"

# Verify files are in place
if [ ! -f "server.js" ]; then
    echo "Error: server.js not found in $APP_DIR"
    exit 1
fi

if [ ! -f "ecosystem.config.js" ]; then
    echo "Error: ecosystem.config.js not found in $APP_DIR"
    exit 1
fi

# Stop existing instance if running
pm2 delete be-smart-server 2>/dev/null || true

# Start application
echo "Starting application with PM2..."
pm2 start ecosystem.config.js

# Save PM2 configuration
pm2 save

echo "=========================================="
echo "Deployment completed successfully!"
echo "=========================================="
echo ""
echo "Application Status:"
pm2 status
echo ""
echo "Application is running at:"
echo "http://$(curl -s ifconfig.me):3000"
echo ""
echo "Useful commands:"
echo "  pm2 status              - Check application status"
echo "  pm2 logs be-smart-server - View application logs"
echo "  pm2 restart be-smart-server - Restart application"
echo "  pm2 stop be-smart-server    - Stop application"
echo ""


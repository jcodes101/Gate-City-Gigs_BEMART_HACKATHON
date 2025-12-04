#!/bin/bash
#========================================================
# STARTS REDIS CACHING SERVICE RUNNING IN BACKGROUND
# Checks for Redis installation, installs if needed,
# and starts Redis on an available port
#========================================================

set -e

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# Default Redis port
DEFAULT_PORT=6379
REDIS_PORT=${REDIS_PORT:-$DEFAULT_PORT}

# Function to check if a port is available
check_port() {
    local port=$1
    if command -v lsof >/dev/null 2>&1; then
        lsof -i :$port >/dev/null 2>&1
    elif command -v netstat >/dev/null 2>&1; then
        netstat -an | grep -q ":$port.*LISTEN"
    else
        # Fallback: try to connect
        (echo > /dev/tcp/localhost/$port) 2>/dev/null
    fi
}

# Function to find an available port
find_available_port() {
    local port=$DEFAULT_PORT
    while check_port $port; do
        echo -e "${YELLOW}Port $port is in use, trying next port...${NC}" >&2
        port=$((port + 1))
        if [ $port -gt 65535 ]; then
            echo -e "${RED}Error: Could not find an available port${NC}" >&2
            exit 1
        fi
    done
    echo $port
}

# Function to check if Redis is installed
check_redis_installed() {
    if command -v redis-server >/dev/null 2>&1; then
        return 0
    else
        return 1
    fi
}

# Function to check if Redis is already running and get its port
check_redis_running() {
    # Check if redis-server process is running
    if pgrep -x redis-server >/dev/null 2>&1 || pgrep -f "redis-server" >/dev/null 2>&1; then
        # Try to detect the port by checking common ports or process info
        # First, try the default port
        if check_port 6379; then
            # Try to connect with redis-cli to verify it's actually Redis
            if command -v redis-cli >/dev/null 2>&1; then
                if redis-cli -p 6379 ping >/dev/null 2>&1; then
                    echo "6379"
                    return 0
                fi
            else
                # If redis-cli not available, assume it's Redis on 6379
                echo "6379"
                return 0
            fi
        fi
        
        # Check other common ports (6380-6390)
        for port in {6380..6390}; do
            if check_port $port; then
                if command -v redis-cli >/dev/null 2>&1; then
                    if redis-cli -p $port ping >/dev/null 2>&1; then
                        echo "$port"
                        return 0
                    fi
                else
                    echo "$port"
                    return 0
                fi
            fi
        done
    fi
    
    return 1
}

# Function to install Redis on macOS
install_redis_macos() {
    echo -e "${YELLOW}Redis not found. Installing Redis via Homebrew...${NC}"
    
    if ! command -v brew >/dev/null 2>&1; then
        echo -e "${RED}Error: Homebrew not found. Please install Homebrew first:${NC}"
        echo "  /bin/bash -c \"\$(curl -fsSL https://raw.githubusercontent.com/Homebrew/install/HEAD/install.sh)\""
        exit 1
    fi
    
    brew install redis
    echo -e "${GREEN}Redis installed successfully!${NC}"
}

# Function to install Redis on Linux
install_redis_linux() {
    echo -e "${YELLOW}Redis not found. Installing Redis via apt...${NC}"
    
    if [ "$EUID" -ne 0 ]; then
        echo -e "${YELLOW}Note: This may require sudo privileges${NC}"
        sudo apt-get update
        sudo apt-get install -y redis-server
    else
        apt-get update
        apt-get install -y redis-server
    fi
    
    echo -e "${GREEN}Redis installed successfully!${NC}"
}

# Function to update .env file with Redis configuration
update_env_file() {
    local env_file=$1
    local redis_host=$2
    local redis_port=$3
    
    if [ ! -f "$env_file" ]; then
        # Create .env file if it doesn't exist
        echo "# Redis Configuration" > "$env_file"
        echo "REDIS_HOST=$redis_host" >> "$env_file"
        echo "REDIS_PORT=$redis_port" >> "$env_file"
        return
    fi
    
    # Check if REDIS_HOST or REDIS_PORT already exist
    if grep -q "^REDIS_HOST=" "$env_file" 2>/dev/null; then
        # Update existing REDIS_HOST
        if [[ "$OSTYPE" == "darwin"* ]]; then
            # macOS
            sed -i '' "s|^REDIS_HOST=.*|REDIS_HOST=$redis_host|" "$env_file"
        else
            # Linux
            sed -i "s|^REDIS_HOST=.*|REDIS_HOST=$redis_host|" "$env_file"
        fi
    else
        # Add REDIS_HOST if it doesn't exist
        echo "REDIS_HOST=$redis_host" >> "$env_file"
    fi
    
    if grep -q "^REDIS_PORT=" "$env_file" 2>/dev/null; then
        # Update existing REDIS_PORT
        if [[ "$OSTYPE" == "darwin"* ]]; then
            # macOS
            sed -i '' "s|^REDIS_PORT=.*|REDIS_PORT=$redis_port|" "$env_file"
        else
            # Linux
            sed -i "s|^REDIS_PORT=.*|REDIS_PORT=$redis_port|" "$env_file"
        fi
    else
        # Add REDIS_PORT if it doesn't exist
        echo "REDIS_PORT=$redis_port" >> "$env_file"
    fi
}

# Detect OS and install Redis if needed
if ! check_redis_installed; then
    OS="$(uname -s)"
    case "${OS}" in
        Linux*)
            install_redis_linux
            ;;
        Darwin*)
            install_redis_macos
            ;;
        *)
            echo -e "${RED}Error: Unsupported OS: ${OS}${NC}"
            echo "Please install Redis manually:"
            echo "  macOS: brew install redis"
            echo "  Linux: sudo apt-get install redis-server"
            exit 1
            ;;
    esac
else
    echo -e "${GREEN}Redis is already installed${NC}"
fi

# Get project root directory (where this script is located)
# Script is in scripts/caching/, so go up two levels to get project root
SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
PROJECT_ROOT="$(cd "$SCRIPT_DIR/../.." && pwd)"
SERVER_DIR="$PROJECT_ROOT/server_side"
REDIS_PORT_FILE="$SERVER_DIR/.redis_port"

# Check if Redis is already running
echo -e "${YELLOW}Checking if Redis is already running...${NC}"
EXISTING_PORT=$(check_redis_running)
if [ -n "$EXISTING_PORT" ]; then
    REDIS_PORT=$EXISTING_PORT
    echo -e "${GREEN}✓ Redis is already running on port $REDIS_PORT${NC}"
    echo -e "${GREEN}Using existing Redis instance${NC}"
    
    # Save port info
    echo "REDIS_PORT=$REDIS_PORT" > "$REDIS_PORT_FILE"
    echo "REDIS_HOST=localhost" >> "$REDIS_PORT_FILE"
    
    # Update .env files
    update_env_file "$SERVER_DIR/.env" "localhost" "$REDIS_PORT"
    update_env_file "$SERVER_DIR/.env.development" "localhost" "$REDIS_PORT"
    update_env_file "$SERVER_DIR/.env.production" "localhost" "$REDIS_PORT"
    
    echo ""
    echo -e "${GREEN}========================================${NC}"
    echo -e "${GREEN}Redis Configuration:${NC}"
    echo -e "${GREEN}  Host: localhost${NC}"
    echo -e "${GREEN}  Port: $REDIS_PORT${NC}"
    echo -e "${GREEN}========================================${NC}"
    echo ""
    echo -e "${GREEN}✓ Updated .env files with Redis configuration${NC}"
    echo "  - $SERVER_DIR/.env"
    echo "  - $SERVER_DIR/.env.development"
    echo "  - $SERVER_DIR/.env.production"
    echo ""
    echo "Your .env files now contain:"
    echo "  REDIS_HOST=localhost"
    echo "  REDIS_PORT=$REDIS_PORT"
    exit 0
fi

# Redis is not running, find an available port and start it
echo -e "${YELLOW}Redis is not running. Starting new instance...${NC}"
REDIS_PORT=$(find_available_port)
echo -e "${GREEN}Using Redis port: $REDIS_PORT${NC}"

# Create Redis data directory if it doesn't exist
REDIS_DATA_DIR="${HOME}/.redis_data"
mkdir -p "$REDIS_DATA_DIR"

# Start Redis in the background
echo -e "${YELLOW}Starting Redis server on port $REDIS_PORT in background...${NC}"

# Start Redis with custom port
redis-server --port $REDIS_PORT --daemonize yes --dir "$REDIS_DATA_DIR" --dbfilename "dump.rdb" --save "" --appendonly no 2>/dev/null || {
    # If daemonize fails, try without it (some versions don't support it)
    nohup redis-server --port $REDIS_PORT --dir "$REDIS_DATA_DIR" --dbfilename "dump.rdb" --save "" --appendonly no > /dev/null 2>&1 &
    REDIS_PID=$!
    sleep 1
    
    # Check if Redis started successfully
    if ! kill -0 $REDIS_PID 2>/dev/null; then
        echo -e "${RED}Error: Failed to start Redis server${NC}"
        exit 1
    fi
}

# Wait a moment for Redis to start
sleep 1

# Verify Redis is running
if check_port $REDIS_PORT; then
    echo -e "${GREEN}✓ Redis server started successfully on port $REDIS_PORT${NC}"
    
    # Save port info to file for easy access
    echo "REDIS_PORT=$REDIS_PORT" > "$REDIS_PORT_FILE"
    echo "REDIS_HOST=localhost" >> "$REDIS_PORT_FILE"
    
    # Update .env files with Redis configuration
    update_env_file "$SERVER_DIR/.env" "localhost" "$REDIS_PORT"
    update_env_file "$SERVER_DIR/.env.development" "localhost" "$REDIS_PORT"
    update_env_file "$SERVER_DIR/.env.production" "localhost" "$REDIS_PORT"
    
    echo ""
    echo -e "${GREEN}========================================${NC}"
    echo -e "${GREEN}Redis Configuration:${NC}"
    echo -e "${GREEN}  Host: localhost${NC}"
    echo -e "${GREEN}  Port: $REDIS_PORT${NC}"
    echo -e "${GREEN}========================================${NC}"
    echo ""
    echo -e "${GREEN}✓ Updated .env files with Redis configuration${NC}"
    echo "  - $SERVER_DIR/.env"
    echo "  - $SERVER_DIR/.env.development"
    echo "  - $SERVER_DIR/.env.production"
    echo ""
    echo "Your .env files now contain:"
    echo "  REDIS_HOST=localhost"
    echo "  REDIS_PORT=$REDIS_PORT"
else
    echo -e "${RED}Error: Redis server failed to start${NC}"
    exit 1
fi

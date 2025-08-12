#!/bin/bash

# Flux Studio Development Server Script

PORT=3456
APP_NAME="Flux Studio"

# Colors for output
GREEN='\033[0;32m'
RED='\033[0;31m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

echo -e "${GREEN}🚀 Starting $APP_NAME Development Server${NC}"
echo "----------------------------------------"

# Check if port is in use
if lsof -Pi :$PORT -sTCP:LISTEN -t >/dev/null ; then
    echo -e "${YELLOW}⚠️  Port $PORT is already in use${NC}"
    
    # Get process info
    PROCESS_INFO=$(lsof -i :$PORT | grep LISTEN | awk '{print $1, $2}')
    echo -e "Process using port: ${YELLOW}$PROCESS_INFO${NC}"
    
    # Ask user if they want to kill the process
    read -p "Do you want to kill the process and start the server? (y/n): " -n 1 -r
    echo
    
    if [[ $REPLY =~ ^[Yy]$ ]]; then
        # Kill the process
        lsof -ti:$PORT | xargs kill -9 2>/dev/null
        echo -e "${GREEN}✅ Process killed${NC}"
        sleep 1
    else
        echo -e "${RED}❌ Exiting without starting the server${NC}"
        exit 1
    fi
fi

# Check if node_modules exists
if [ ! -d "node_modules" ]; then
    echo -e "${YELLOW}📦 Installing dependencies...${NC}"
    npm install
    if [ $? -ne 0 ]; then
        echo -e "${RED}❌ Failed to install dependencies${NC}"
        exit 1
    fi
fi

# Clear terminal
clear

# Display startup banner
echo -e "${GREEN}"
echo "╔═══════════════════════════════════════╗"
echo "║       FLUX STUDIO DEVELOPMENT         ║"
echo "╚═══════════════════════════════════════╝"
echo -e "${NC}"

echo -e "${GREEN}🎨 Starting Flux Studio on port $PORT...${NC}"
echo ""

# Start the development server
npm run dev

# Handle exit
echo ""
echo -e "${YELLOW}👋 Flux Studio development server stopped${NC}"
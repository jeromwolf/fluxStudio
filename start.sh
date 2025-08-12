#!/bin/bash

# Flux Studio Production Server Script

PORT=3456
APP_NAME="Flux Studio"

# Colors for output
GREEN='\033[0;32m'
RED='\033[0;31m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

echo -e "${GREEN}🚀 Starting $APP_NAME Production Server${NC}"
echo "----------------------------------------"

# Check if build exists
if [ ! -d ".next" ]; then
    echo -e "${YELLOW}📦 Building application...${NC}"
    npm run build
    if [ $? -ne 0 ]; then
        echo -e "${RED}❌ Build failed${NC}"
        exit 1
    fi
fi

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

# Clear terminal
clear

# Display startup banner
echo -e "${BLUE}"
echo "╔═══════════════════════════════════════╗"
echo "║       FLUX STUDIO PRODUCTION          ║"
echo "╚═══════════════════════════════════════╝"
echo -e "${NC}"

echo -e "${GREEN}🎨 Starting Flux Studio Production Server on port $PORT...${NC}"
echo -e "${YELLOW}URL: http://localhost:$PORT${NC}"
echo ""

# Start the production server
PORT=$PORT npm start

# Handle exit
echo ""
echo -e "${YELLOW}👋 Flux Studio production server stopped${NC}"
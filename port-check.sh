#!/bin/bash

# Port Check Utility for Flux Studio

PORT=3456
APP_NAME="Flux Studio"

# Colors for output
GREEN='\033[0;32m'
RED='\033[0;31m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

echo -e "${BLUE}🔍 Checking port $PORT for $APP_NAME${NC}"
echo "----------------------------------------"

# Check if port is in use
if lsof -Pi :$PORT -sTCP:LISTEN -t >/dev/null ; then
    echo -e "${RED}❌ Port $PORT is currently in use${NC}"
    echo ""
    
    # Get detailed process info
    echo -e "${YELLOW}Process Information:${NC}"
    lsof -i :$PORT | grep LISTEN
    echo ""
    
    # Get PID
    PID=$(lsof -ti:$PORT)
    echo -e "${YELLOW}Process ID: $PID${NC}"
    
    # Ask user what to do
    echo ""
    echo "What would you like to do?"
    echo "1) Kill the process"
    echo "2) Keep the process running"
    echo "3) Show more details"
    read -p "Enter your choice (1-3): " choice
    
    case $choice in
        1)
            kill -9 $PID 2>/dev/null
            if [ $? -eq 0 ]; then
                echo -e "${GREEN}✅ Process killed successfully${NC}"
            else
                echo -e "${RED}❌ Failed to kill process${NC}"
            fi
            ;;
        2)
            echo -e "${BLUE}👍 Process kept running${NC}"
            ;;
        3)
            echo ""
            echo -e "${YELLOW}Detailed Process Information:${NC}"
            ps -p $PID -o pid,ppid,user,comm,args
            ;;
        *)
            echo -e "${RED}Invalid choice${NC}"
            ;;
    esac
else
    echo -e "${GREEN}✅ Port $PORT is available${NC}"
fi

echo ""
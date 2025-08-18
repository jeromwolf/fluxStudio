#!/bin/bash

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

echo -e "${YELLOW}🚀 Starting Flux Metaverse Platform...${NC}"

# Load environment variables
source .env.local 2>/dev/null || true

# Kill processes on specific ports
kill_port() {
    local port=$1
    echo -e "${YELLOW}Checking port $port...${NC}"
    
    # Find PIDs using the port
    local pids=$(lsof -ti :$port 2>/dev/null)
    
    if [ ! -z "$pids" ]; then
        echo -e "${RED}Port $port is in use. Killing processes: $pids${NC}"
        for pid in $pids; do
            kill -9 $pid 2>/dev/null
            if [ $? -eq 0 ]; then
                echo -e "${GREEN}✓ Killed process $pid${NC}"
            else
                echo -e "${RED}✗ Failed to kill process $pid${NC}"
            fi
        done
        sleep 1
    else
        echo -e "${GREEN}✓ Port $port is free${NC}"
    fi
}

# Kill any existing Next.js dev server
echo -e "${YELLOW}Stopping existing services...${NC}"
pkill -f "next dev" 2>/dev/null
pkill -f "tsx watch" 2>/dev/null
pkill -f "multiplayer-server" 2>/dev/null
pkill -f "node.*server/multiplayer-server" 2>/dev/null

# Wait a moment for processes to die
sleep 2

# Clean up specific ports
kill_port 3456  # Next.js port
kill_port 3002  # Multiplayer server port
kill_port 3001  # Alternative multiplayer port

# Clear Next.js cache
echo -e "${YELLOW}Clearing Next.js cache...${NC}"
rm -rf .next

# Install dependencies if needed
if [ ! -d "node_modules" ]; then
    echo -e "${YELLOW}Installing dependencies...${NC}"
    npm install
fi

# Export environment variables
export MULTIPLAYER_PORT=3002
export NEXT_PUBLIC_MULTIPLAYER_SERVER=http://localhost:3002
export NEXT_PUBLIC_APP_URL=http://localhost:3456

# Start the services
echo -e "${GREEN}Starting services...${NC}"
echo -e "${GREEN}📱 Next.js: http://localhost:3456${NC}"
echo -e "${GREEN}🌐 Multiplayer Server: http://localhost:3002${NC}"
echo -e "${GREEN}🎮 Metaverse: http://localhost:3456/metaverse${NC}"
echo ""

# Run both services
npm run dev:all
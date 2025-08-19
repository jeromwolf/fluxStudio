#!/bin/bash

# Flux Studio Metaverse Platform Startup Script
# This script starts all necessary services for the metaverse platform

echo "🚀 Starting Flux Studio Metaverse Platform..."

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Default ports
NEXT_PORT=3456
MULTIPLAYER_PORT=3003
COLYSEUS_PORT=2567

# Function to kill process on port
kill_port() {
  local port=$1
  echo -e "${YELLOW}Checking port $port...${NC}"
  
  # Find PID using the port
  local pid=$(lsof -ti:$port)
  
  if [ ! -z "$pid" ]; then
    echo -e "${RED}Port $port is in use by PID $pid${NC}"
    echo -e "${YELLOW}Killing process on port $port...${NC}"
    kill -9 $pid 2>/dev/null
    sleep 1
    echo -e "${GREEN}✓ Port $port cleared${NC}"
  else
    echo -e "${GREEN}✓ Port $port is available${NC}"
  fi
}

# Function to check if port is available
check_port() {
  local port=$1
  if lsof -Pi :$port -sTCP:LISTEN -t >/dev/null ; then
    return 1
  else
    return 0
  fi
}

# Parse command line arguments
while [[ $# -gt 0 ]]; do
  case $1 in
    --kill-ports)
      KILL_PORTS=true
      shift
      ;;
    --next-port)
      NEXT_PORT="$2"
      shift 2
      ;;
    --multiplayer-port)
      MULTIPLAYER_PORT="$2"
      shift 2
      ;;
    --help)
      echo "Usage: $0 [options]"
      echo ""
      echo "Options:"
      echo "  --kill-ports         Kill processes using required ports before starting"
      echo "  --next-port PORT     Set Next.js port (default: 3456)"
      echo "  --multiplayer-port   Set multiplayer server port (default: 3003)"
      echo "  --help              Show this help message"
      exit 0
      ;;
    *)
      echo "Unknown option: $1"
      echo "Use --help for usage information"
      exit 1
      ;;
  esac
done

# Kill ports if requested
if [ "$KILL_PORTS" = true ]; then
  echo -e "${BLUE}=== Clearing ports ===${NC}"
  kill_port $NEXT_PORT
  kill_port $MULTIPLAYER_PORT
  kill_port $COLYSEUS_PORT
  echo ""
fi

# Check if ports are available
echo -e "${BLUE}=== Checking port availability ===${NC}"
PORTS_AVAILABLE=true

if ! check_port $NEXT_PORT; then
  echo -e "${RED}✗ Port $NEXT_PORT is already in use (Next.js)${NC}"
  echo -e "${YELLOW}  Run with --kill-ports to automatically free the ports${NC}"
  PORTS_AVAILABLE=false
else
  echo -e "${GREEN}✓ Port $NEXT_PORT is available (Next.js)${NC}"
fi

if ! check_port $MULTIPLAYER_PORT; then
  echo -e "${RED}✗ Port $MULTIPLAYER_PORT is already in use (Multiplayer Server)${NC}"
  echo -e "${YELLOW}  Run with --kill-ports to automatically free the ports${NC}"
  PORTS_AVAILABLE=false
else
  echo -e "${GREEN}✓ Port $MULTIPLAYER_PORT is available (Multiplayer Server)${NC}"
fi

if ! check_port $COLYSEUS_PORT; then
  echo -e "${RED}✗ Port $COLYSEUS_PORT is already in use (Colyseus)${NC}"
  echo -e "${YELLOW}  Run with --kill-ports to automatically free the ports${NC}"
  PORTS_AVAILABLE=false
else
  echo -e "${GREEN}✓ Port $COLYSEUS_PORT is available (Colyseus)${NC}"
fi

if [ "$PORTS_AVAILABLE" = false ]; then
  echo ""
  echo -e "${RED}Cannot start services. Ports are in use.${NC}"
  echo -e "${YELLOW}Run: $0 --kill-ports${NC}"
  exit 1
fi

echo ""
echo -e "${BLUE}=== Starting services ===${NC}"

# Check if npm is installed
if ! command -v npm &> /dev/null; then
  echo -e "${RED}npm is not installed. Please install Node.js first.${NC}"
  exit 1
fi

# Check if dependencies are installed
if [ ! -d "node_modules" ]; then
  echo -e "${YELLOW}Dependencies not installed. Running npm install...${NC}"
  npm install
fi

# Function to handle script termination
cleanup() {
  echo ""
  echo -e "${YELLOW}Shutting down services...${NC}"
  # Kill all child processes
  pkill -P $$
  echo -e "${GREEN}Services stopped.${NC}"
  exit 0
}

# Set up signal handlers
trap cleanup INT TERM

# Start services based on package.json scripts
if grep -q "dev:all" package.json; then
  # Use the combined script if available
  echo -e "${GREEN}Starting all services with dev:all...${NC}"
  echo -e "${BLUE}Next.js will run on: http://localhost:$NEXT_PORT${NC}"
  echo -e "${BLUE}Multiplayer server will run on: http://localhost:$MULTIPLAYER_PORT${NC}"
  npm run dev:all
else
  # Start services individually
  echo -e "${GREEN}Starting services individually...${NC}"
  
  # Start Next.js in background
  echo -e "${YELLOW}Starting Next.js on port $NEXT_PORT...${NC}"
  PORT=$NEXT_PORT npm run dev &
  NEXT_PID=$!
  
  # Wait a bit for Next.js to start
  sleep 3
  
  # Start multiplayer server if script exists
  if grep -q "server:multiplayer" package.json; then
    echo -e "${YELLOW}Starting multiplayer server on port $MULTIPLAYER_PORT...${NC}"
    npm run server:multiplayer &
    MULTIPLAYER_PID=$!
  fi
  
  echo ""
  echo -e "${GREEN}=== Services started ===${NC}"
  echo -e "${BLUE}Next.js: http://localhost:$NEXT_PORT${NC}"
  echo -e "${BLUE}Multiplayer: http://localhost:$MULTIPLAYER_PORT${NC}"
  echo ""
  echo -e "${YELLOW}Press Ctrl+C to stop all services${NC}"
  
  # Wait for any process to exit
  wait
fi
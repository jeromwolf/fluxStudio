#!/bin/bash

# Flux Studio Port Cleanup Script
# This script kills processes using the metaverse platform ports

echo "🧹 Flux Studio Port Cleanup"

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Default ports
PORTS=(3456 3003 2567)

# Function to kill process on port
kill_port() {
  local port=$1
  echo -e "${YELLOW}Checking port $port...${NC}"
  
  # Find PID using the port
  local pid=$(lsof -ti:$port)
  
  if [ ! -z "$pid" ]; then
    echo -e "${RED}Port $port is in use by PID $pid${NC}"
    
    # Get process name
    local process_name=$(ps -p $pid -o comm= 2>/dev/null)
    if [ ! -z "$process_name" ]; then
      echo -e "  Process: $process_name"
    fi
    
    echo -e "${YELLOW}Killing process on port $port...${NC}"
    kill -9 $pid 2>/dev/null
    sleep 1
    
    # Verify the port is free
    if lsof -ti:$port > /dev/null 2>&1; then
      echo -e "${RED}✗ Failed to kill process on port $port${NC}"
      return 1
    else
      echo -e "${GREEN}✓ Port $port cleared${NC}"
    fi
  else
    echo -e "${GREEN}✓ Port $port is already free${NC}"
  fi
  echo ""
  return 0
}

# Parse command line arguments
if [[ $# -gt 0 ]]; then
  # If ports are specified, use them instead of defaults
  PORTS=("$@")
fi

echo -e "${BLUE}=== Cleaning up ports ===${NC}"
echo "Ports to check: ${PORTS[@]}"
echo ""

# Kill processes on all specified ports
FAILED=false
for port in "${PORTS[@]}"; do
  if ! kill_port $port; then
    FAILED=true
  fi
done

# Summary
echo -e "${BLUE}=== Summary ===${NC}"
if [ "$FAILED" = true ]; then
  echo -e "${RED}Some ports could not be cleared${NC}"
  echo "You may need to run this script with sudo:"
  echo "  sudo $0 ${PORTS[@]}"
  exit 1
else
  echo -e "${GREEN}All ports are now free!${NC}"
  echo ""
  echo "You can now start the metaverse platform:"
  echo "  npm run dev"
  echo "  # or"
  echo "  ./scripts/start-metaverse.sh"
fi
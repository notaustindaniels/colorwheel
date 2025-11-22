#!/bin/bash

# Adobe Color Wheel Launcher
# This script starts a local server and opens the color wheel page

PORT=8080
COLOR_WHEEL_PATH="/create/color-wheel"

echo "🎨 Adobe Color Wheel Launcher"
echo "================================"
echo ""
echo "Starting server on port $PORT..."
echo ""

# Start http-server in the background
# Note: The ? must be escaped in the shell
npx -y http-server -p $PORT --proxy "http://localhost:$PORT?" &
SERVER_PID=$!

# Wait for server to start
sleep 2

# Check if server is running
if lsof -Pi :$PORT -sTCP:LISTEN -t >/dev/null 2>&1; then
    echo "✓ Server started successfully"
    echo ""
    echo "🌐 Color Wheel is available at:"
    echo "   http://localhost:$PORT$COLOR_WHEEL_PATH"
    echo ""
    echo "Opening in browser..."
    open "http://localhost:$PORT$COLOR_WHEEL_PATH"
    echo ""
    echo "Press Ctrl+C to stop the server"
    echo "================================"

    # Wait for the server process
    wait $SERVER_PID
else
    echo "✗ Failed to start server on port $PORT"
    echo "  Port may already be in use"
    exit 1
fi

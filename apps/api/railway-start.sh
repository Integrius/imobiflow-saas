#!/bin/bash

# Railway startup script for WhatsApp backend

echo "🚂 Starting ImobiFlow API on Railway..."

# Set Puppeteer to use system Chromium
export PUPPETEER_SKIP_CHROMIUM_DOWNLOAD=true
export PUPPETEER_EXECUTABLE_PATH=$(which chromium || which chromium-browser || echo "/usr/bin/chromium")

# Check if Chromium exists
if [ -z "$PUPPETEER_EXECUTABLE_PATH" ] || [ ! -f "$PUPPETEER_EXECUTABLE_PATH" ]; then
  echo "⚠️  Warning: Chromium not found. WhatsApp may not work."
  echo "Trying to find Chromium..."
  find /nix/store -name chromium 2>/dev/null | head -1
fi

# Start the server
echo "🚀 Starting server..."
node dist/server.js

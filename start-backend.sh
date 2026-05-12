#!/bin/bash
# Start the TeamRegister backend API server

echo "Starting TeamRegister Backend..."
cd "$(dirname "$0")/backend"
node server.js

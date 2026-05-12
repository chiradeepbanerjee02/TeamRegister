#!/bin/bash
# Start the TeamRegister Angular frontend (dev server)

echo "Starting TeamRegister Frontend..."
cd "$(dirname "$0")/frontend"
npx ng serve --proxy-config proxy.conf.json --open

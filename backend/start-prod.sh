#!/bin/bash
set -e

echo "Starting production server..."
echo "DATABASE_URL is set: ${DATABASE_URL:0:30}..."

# Run Prisma migrations
npx prisma migrate deploy

# Start the server
node src/index.js

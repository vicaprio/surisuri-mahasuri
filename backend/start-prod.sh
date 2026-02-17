#!/bin/bash
set -e

echo "Starting production server..."
echo "DATABASE_URL length: ${#DATABASE_URL}"

# Run Prisma migrations with explicit URL
DATABASE_URL="$DATABASE_URL" npx prisma migrate deploy

# Start the server
node src/index.js

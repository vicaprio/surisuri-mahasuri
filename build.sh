#!/bin/bash

# Cloudflare Pages build script for monorepo

echo "📦 Installing dependencies..."
cd web
npm install

echo "🏗️  Building React app..."
npm run build

echo "✅ Build complete!"

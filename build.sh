#!/bin/bash

echo "🚀 Starting build process..."

# Install backend dependencies
echo "📦 Installing backend dependencies..."
cd back
npm install

# Install frontend dependencies
echo "📦 Installing frontend dependencies..."
cd ../Shop
npm install

# Build React app
echo "🔨 Building React application..."
npm run build

# Check if build was successful
if [ -d "dist" ]; then
    echo "✅ React build completed successfully!"
    echo "📁 Build files created in: $(pwd)/dist"
    ls -la dist/
else
    echo "❌ React build failed!"
    exit 1
fi

# Go back to root
cd ..

echo "🎉 Build process completed!" 
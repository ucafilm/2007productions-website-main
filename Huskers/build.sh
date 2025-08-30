#!/bin/bash
# Build script for Nebraska Huskers Game Sheet Generator

echo "🏈 Building Nebraska Huskers Game Sheet Generator..."

# Check if Node.js is installed
if ! command -v node &> /dev/null; then
    echo "❌ Node.js is not installed. Please install Node.js first."
    exit 1
fi

# Check if npm is installed
if ! command -v npm &> /dev/null; then
    echo "❌ npm is not installed. Please install npm first."
    exit 1
fi

# Install dependencies if node_modules doesn't exist
if [ ! -d "node_modules" ]; then
    echo "📦 Installing dependencies..."
    npm install
fi

# Build Tailwind CSS
echo "🎨 Building Tailwind CSS..."
npx tailwindcss -i ./src/input.css -o ./assets/css/tailwind.css --minify

# Check if build was successful
if [ -f "./assets/css/tailwind.css" ]; then
    echo "✅ Tailwind CSS built successfully!"
    echo "📊 File size: $(wc -c < ./assets/css/tailwind.css) bytes"
else
    echo "❌ Failed to build Tailwind CSS"
    exit 1
fi

echo "🚀 Build complete! The application is ready for production."
echo "🌐 Open index.html in your browser to test."

@echo off
REM Build script for Nebraska Huskers Game Sheet Generator

echo 🏈 Building Nebraska Huskers Game Sheet Generator...

REM Check if Node.js is installed
node --version >nul 2>&1
if %errorlevel% neq 0 (
    echo ❌ Node.js is not installed. Please install Node.js first.
    exit /b 1
)

REM Check if npm is installed
npm --version >nul 2>&1
if %errorlevel% neq 0 (
    echo ❌ npm is not installed. Please install npm first.
    exit /b 1
)

REM Install dependencies if node_modules doesn't exist
if not exist "node_modules" (
    echo 📦 Installing dependencies...
    npm install
)

REM Build Tailwind CSS
echo 🎨 Building Tailwind CSS...
npx tailwindcss -i ./src/input.css -o ./assets/css/tailwind.css --minify

REM Check if build was successful
if exist "./assets/css/tailwind.css" (
    echo ✅ Tailwind CSS built successfully!
    for %%A in ("./assets/css/tailwind.css") do echo 📊 File size: %%~zA bytes
) else (
    echo ❌ Failed to build Tailwind CSS
    exit /b 1
)

echo 🚀 Build complete! The application is ready for production.
echo 🌐 Open index.html in your browser to test.
pause

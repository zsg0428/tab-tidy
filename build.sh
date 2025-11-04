#!/bin/bash

# Build script for TabTidy
# Usage: ./build.sh [version]

VERSION=${1:-"1.0.0-beta"}

echo "🧹 Building TabTidy v$VERSION..."

# Clean and create dist directory
rm -rf dist
mkdir -p dist

# Copy necessary files only
echo "📦 Copying files..."
cp manifest.json dist/
cp popup.html dist/
cp popup.css dist/
cp popup.js dist/
cp background.js dist/
cp -r icons dist/
cp README.md dist/
cp LICENSE dist/

# Create ZIP
echo "🗜️  Creating ZIP package..."
cd dist
zip -r "../tabtidy-v${VERSION}.zip" .
cd ..

# Show result
echo ""
echo "✅ Built successfully!"
echo "📦 Package: tabtidy-v${VERSION}.zip"
echo "📏 Size: $(du -h tabtidy-v${VERSION}.zip | cut -f1)"
echo ""
echo "📤 Share this ZIP file with beta testers!"
echo ""
echo "Installation instructions:"
echo "1. Unzip the file"
echo "2. Open chrome://extensions/"
echo "3. Enable Developer mode"
echo "4. Click 'Load unpacked'"
echo "5. Select the unzipped folder"

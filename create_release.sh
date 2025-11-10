#!/bin/bash

# Extract version from manifest.json
VERSION=$(grep -o '"version": "[^"]*"' manifest.json | cut -d'"' -f4)

# Create release directory
mkdir -p release
cd release

# Copy necessary files
cp ../manifest.json .
cp ../popup.html ../popup.css ../popup.js .
cp ../settings.html ../settings.css ../settings.js .
cp ../background.js .
cp -r ../icons .

# Create ZIP file with version number
zip -r ../tabtidy-v${VERSION}.zip .

# Go back and cleanup
cd ..
rm -rf release

echo "✓ Created tabtidy-v${VERSION}.zip"
ls -lh tabtidy-v${VERSION}.zip

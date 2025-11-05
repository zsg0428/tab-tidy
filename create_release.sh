#!/bin/bash

# Create release directory
mkdir -p release
cd release

# Copy necessary files
cp ../manifest.json .
cp ../popup.html ../popup.css ../popup.js .
cp ../settings.html ../settings.css ../settings.js .
cp ../background.js .
cp -r ../icons .

# Create ZIP file
zip -r ../tabtidy-v1.0.0.zip .

# Go back and cleanup
cd ..
rm -rf release

echo "✓ Created tabtidy-v1.0.0.zip"
ls -lh tabtidy-v1.0.0.zip

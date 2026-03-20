#!/usr/bin/env bash
# Build the Chord Detection App standalone executable for macOS.
# Output: dist/ChordDetectionApp/ChordDetectionApp
set -e

echo "Installing build dependencies..."
pip install pyinstaller imageio-ffmpeg

echo "Building standalone app..."
pyinstaller chord_detection_app.spec --clean --noconfirm

echo ""
echo "Done! Run with:"
echo "  ./dist/ChordDetectionApp/ChordDetectionApp"
echo ""
echo "To distribute: zip the dist/ChordDetectionApp/ folder."

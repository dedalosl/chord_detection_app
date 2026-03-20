@echo off
REM Build the Chord Detection App standalone executable for Windows.
REM Output: dist\ChordDetectionApp\ChordDetectionApp.exe

echo Installing build dependencies...
pip install pyinstaller imageio-ffmpeg

echo Building standalone app...
pyinstaller chord_detection_app.spec --clean --noconfirm

echo.
echo Done! Run with:
echo   dist\ChordDetectionApp\ChordDetectionApp.exe
echo.
echo To distribute: zip the dist\ChordDetectionApp\ folder.

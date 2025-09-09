#!/bin/bash
# Kiosk Tablet Emulator Launcher
# This script starts the tablet emulator optimized for kiosk deployment

export ANDROID_SDK_ROOT=/home/ben/Android/Sdk
export JAVA_HOME=/usr/lib/jvm/java-17-openjdk
export PATH=$JAVA_HOME/bin:$ANDROID_SDK_ROOT/platform-tools:$ANDROID_SDK_ROOT/emulator:$PATH

echo "Starting Kiosk Tablet Emulator..."
echo "Emulator: Pixel Tablet (API 36)"
echo "Optimized for: Kiosk deployment"
echo ""

# Start the emulator with optimized settings for kiosk
$ANDROID_SDK_ROOT/emulator/emulator \
  -avd Kiosk_Tablet_API_36 \
  -netdelay none \
  -netspeed full \
  -no-snapshot-save \
  -no-snapshot-load \
  -wipe-data \
  &

echo "Tablet emulator is starting..."
echo "Use 'npm run android:dev' to deploy your app"
echo "Or use 'npm run android:build' to open in Android Studio"

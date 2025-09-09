# Android WebView Kiosk App

This is a native Android application that displays a WebView pointing to the breakfast ordering website with a Wi-Fi information header.

## Features

- **Wi-Fi Header**: Shows current Wi-Fi network name and password at the top
- **Full-Screen WebView**: Displays https://breakfast.innatthecape.com with the authentication token
- **Kiosk Mode**: 
  - Blocks hardware keys (home, back, menu)
  - Runs in immersive full-screen mode
  - Keeps screen on
  - Acts as home launcher
  - Prevents exiting the app

## URL
The app loads: `https://breakfast.innatthecape.com/?t=wR94jsbHmgXaFacDJKxM6aU8BTtF98Am9Dx6SvvAUScVR62ghGwMdDxEQsdz8qVtnZ8NMBGeyBZBLcvRpU89W8L3MFSpmSyhcDdATFRGC2Pab3pxvcT6DwCuMKV7yYRjGmAC3AgXFwmVzHxYSaGPq3qm7y6Evz9Z`

## Building
```bash
./gradlew assembleDebug
```

## Installation
The APK will be generated in `app/build/outputs/apk/debug/app-debug.apk`

## Configuration
- Wi-Fi password is hardcoded in MainActivity.kt as "InnAtTheCape2024"
- App is configured as a home launcher for kiosk deployment
- Uses Android API 24+ (Android 7.0+)

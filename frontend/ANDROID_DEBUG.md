# Android Debugging Guide

## 📱 Debugging Your App on Real Hardware

### 1. Enable USB Debugging on Your Device

1. **Enable Developer Options:**
   - Go to **Settings** > **About tablet** (or **About phone**)
   - Tap **Build number** 7 times until "You are now a developer" appears

2. **Enable USB Debugging:**
   - Go to **Settings** > **Developer options**
   - Enable **USB debugging**
   - Enable **Stay awake** (keeps screen on while charging)

### 2. Chrome DevTools Debugging

1. **Connect device via USB**
2. **Open Chrome browser** on your computer
3. **Go to:** `chrome://inspect/#devices`
4. **Your device should appear** with the app listed
5. **Click "Inspect"** to open DevTools

### 3. ADB (Android Debug Bridge) Commands

```bash
# Check connected devices
adb devices

# View app logs
adb logcat | grep -i capacitor
adb logcat | grep -i chromium
adb logcat | grep -i web

# Clear app data and restart
adb shell pm clear com.breakfastorder.app

# Install APK manually
adb install path/to/app-debug.apk

# Take screenshot
adb shell screencap /sdcard/screenshot.png
adb pull /sdcard/screenshot.png
```

### 4. Capacitor Debugging

Your app is configured with:
- `webContentsDebuggingEnabled: true` - Enables Chrome DevTools
- `loggingBehavior: 'debug'` - Shows detailed logs

### 5. Common Issues & Solutions

#### **Blank Screen Issues:**

1. **Check Console Errors:**
   - Use Chrome DevTools (chrome://inspect)
   - Look for JavaScript errors in Console tab

2. **Check Network Issues:**
   - Verify internet connection
   - Check if API calls are working

3. **Check Platform Detection:**
   - App logs should show: "Platform detected: android, isAndroid: true"

4. **Clear App Data:**
   ```bash
   adb shell pm clear com.breakfastorder.app
   ```

5. **Rebuild and Redeploy:**
   ```bash
   npm run build
   npx cap sync android
   npx cap run android
   ```

#### **Performance Issues:**
- Use Chrome DevTools Performance tab
- Check Memory usage
- Look for memory leaks in heap snapshots

#### **Network Issues:**
- Check Network tab in DevTools
- Verify CORS settings
- Test API endpoints manually

### 6. Debug Build Commands

```bash
# Development build with debugging
npm run android:dev

# Production build (for final testing)
npm run android:prod

# Kiosk build (with hardcoded token)
npm run tablet:deploy:kiosk
```

### 7. Log Monitoring

Monitor logs in real-time:
```bash
# General app logs
adb logcat | grep "breakfast-order-app"

# Web console logs
adb logcat | grep "CONSOLE"

# Capacitor specific logs
adb logcat | grep "Capacitor"
```

### 8. Emergency Debugging

If the app won't start at all:

1. **Check app installation:**
   ```bash
   adb shell pm list packages | grep breakfastorder
   ```

2. **Force stop and restart:**
   ```bash
   adb shell am force-stop com.breakfastorder.app
   adb shell monkey -p com.breakfastorder.app 1
   ```

3. **Check available storage:**
   ```bash
   adb shell df /data
   ```

4. **Reinstall the app:**
   ```bash
   adb uninstall com.breakfastorder.app
   npm run android:dev
   ```

### 9. Wi-Fi Information Display

The app now shows Wi-Fi credentials at the top when running on Android:
- **Network:** InnGuest
- **Password:** Welcome2024

You can modify these in `src/app/app.ts`:
```typescript
protected wifiName = 'YourWiFiName';
protected wifiPassword = 'YourWiFiPassword';
```

# Breakfast Ordering Kiosk Setup

This app is configured to run as a dedicated kiosk for breakfast ordering. The tablet will function solely as a breakfast ordering terminal.

## Kiosk Features

### Hardware Protection
- **Flexible Orientation**: Supports both landscape and portrait modes
- **Immersive Mode**: Full-screen with hidden navigation and status bars
- **Screen Always On**: Prevents the screen from turning off
- **Hardware Key Blocking**: Disables home, back, and recent apps buttons

### Software Protection
- **App as Launcher**: The app registers as the device's home screen
- **Exit Prevention**: Users cannot exit the app through normal means
- **Developer Tools Disabled**: F12, right-click, and keyboard shortcuts blocked
- **Auto-Focus**: App automatically regains focus if somehow minimized

### User Experience
- **Clean Interface**: Simple breakfast ordering without kiosk branding
- **Wi-Fi Information**: Always visible at the top for guest convenience
- **Touch-Optimized**: Large buttons and clear interface for tablet use in any orientation

## Build Commands

### Deploy to Kiosk Device
```bash
npm run kiosk:launcher
```

### Deploy to Tablet for Testing
```bash
npm run tablet:deploy:kiosk
```

### Build for Production Kiosk
```bash
npm run build:kiosk
```

## Android Setup for Kiosk Mode

### 1. Device Settings
- **Disable Sleep**: Settings > Display > Sleep = Never
- **Disable Notifications**: Settings > Notifications = Off
- **Enable Unknown Sources**: Settings > Security > Unknown Sources = On
- **Disable Automatic Updates**: Google Play Store > Settings > Auto-update apps = Don't auto-update

### 2. Set as Default Launcher
1. Install the app using `npm run kiosk:launcher`
2. Press the home button
3. Select "Breakfast Ordering Kiosk" 
4. Choose "Always" to set as default launcher

### 3. Optional: Device Administrator
For enhanced security, you can set the app as a device administrator:
1. Settings > Security > Device administrators
2. Enable the breakfast ordering app if available

### 4. Disable Developer Options
1. Settings > About tablet > Tap build number 7 times (if enabled)
2. Settings > Developer options > OFF

## Troubleshooting

### If Users Can Exit the App
1. Check that the app is set as the default launcher
2. Verify that hardware keys are properly disabled in MainActivity.java
3. Ensure the device is not in developer mode

### If Screen Turns Off
1. Check power settings: Settings > Display > Sleep = Never
2. Verify the app has the WAKE_LOCK permission
3. Check that the "keep screen on" flag is set in MainActivity

### If App Crashes or Exits
1. Check Android logs: `adb logcat`
2. Ensure all required permissions are granted
3. Verify the app has proper error handling

## Security Notes

- The app prevents most standard exit methods
- Hardware buttons are disabled through software
- Right-click and developer tools are blocked
- Auto-focus ensures the app stays active

## Wi-Fi Information Display

The kiosk displays Wi-Fi credentials at the top:
- **Network**: The Inn  
- **Password**: 12345678

Update these values in `src/app/app.ts` around line 68 if needed:
```typescript
// Wi-Fi information for Android
protected wifiName = 'The Inn';
protected wifiPassword = '12345678';
```

## Setting Up the Tablet as Kiosk

### Step 1: Install the Kiosk App
1. Run: `npm run kiosk:launcher`
2. This installs the app on your tablet

### Step 2: Set as Default Launcher
1. Press the **Home** button on the tablet
2. You'll see a dialog asking which launcher to use
3. Select **"Breakfast Ordering Kiosk"**
4. Choose **"Always"** to set it as the default

### Step 3: Test Kiosk Mode
- Try pressing Home, Back, or Recent Apps buttons - they should be disabled
- The app should stay in full-screen mode
- Wi-Fi information should be visible at the top
- The header should show "🏨 Breakfast Ordering Kiosk"

## Production Deployment

For permanent kiosk installation:
1. Use the production build: `npm run kiosk:launcher`
2. Set up the device following the Android Setup steps above
3. Test all exit prevention mechanisms
4. Place the device in a secure mounting solution
5. Consider physical security measures for the tablet

## Development vs Kiosk Mode

- **Development**: Normal app behavior, can exit freely
- **Kiosk Mode**: Activated automatically on Android devices
- **Testing**: Use tablet emulator or physical device with `npm run tablet:deploy:kiosk`

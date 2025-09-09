# Ultimate Kiosk Mode Setup Guide

This guide will help you lock down the tablet so users absolutely cannot exit the breakfast ordering app.

## Method 1: Built-in App Lock (Easiest)

### Step 1: Install the App
```bash
npm run tablet:deploy:kiosk
```

### Step 2: Set as Default Launcher
1. Press **Home** button on tablet
2. Select "Breakfast Ordering Kiosk"
3. Choose **"Always"**

### Step 3: Enable Screen Pinning (Recommended)
1. Go to **Settings** > **Security** > **Screen Pinning**
2. Turn ON **Screen Pinning**
3. Turn ON **Ask for PIN before unpinning**
4. Open the breakfast app
5. Press **Recent Apps** button (square icon)
6. Find the breakfast app card
7. Tap the **pin icon** 📌 on the app card
8. The app is now pinned - users cannot exit!

**To unpin later**: Hold Back + Recent Apps buttons for 3 seconds, then enter PIN

## Method 2: Guided Access (If Available)

Some Android tablets have "Guided Access" or "Single App Mode":

1. **Settings** > **Accessibility** > **Guided Access**
2. Turn it ON
3. Open breakfast app
4. Triple-tap power button to enable
5. Set areas to disable (if any)
6. Tap **Start**

## Method 3: Third-Party Kiosk App (Nuclear Option)

If the above methods don't work, install a dedicated kiosk app:

1. Install **"SureLock Kiosk Lockdown"** or **"Hexnode Kiosk Lockdown"**
2. Set breakfast app as the only allowed app
3. Enable full lockdown mode

## Method 4: Developer Options (Advanced)

1. **Settings** > **About Tablet** > Tap **Build Number** 7 times
2. **Settings** > **Developer Options**
3. Turn ON **Stay Awake**
4. Turn OFF **USB Debugging** (security)
5. Find **"Select Runtime"** or **"WebView"** and set to **System WebView**

## Tablet Settings Checklist

### Display Settings
- **Sleep**: Never
- **Auto-rotate**: ON (supports portrait/landscape)
- **Brightness**: Auto or fixed at comfortable level

### Security Settings
- **Screen Lock**: None (or PIN for admin access only)
- **Unknown Sources**: ON (to install the app)
- **Device Admin**: Enable breakfast app if prompted

### Apps Settings
- **Default Apps** > **Home App**: Breakfast Ordering Kiosk
- **App Permissions**: Grant all requested permissions

### Network Settings
- **Wi-Fi**: Connect to "The Inn" network
- **Mobile Data**: OFF (if applicable)

## Testing Exit Prevention

Try these to verify the app is locked down:

✅ **Should NOT work** (app should stay open):
- Press Home button
- Press Back button  
- Press Recent Apps button
- Swipe down from top (notifications)
- Long-press any buttons
- Try to open settings
- Try to open other apps

✅ **Should work normally**:
- Rotate tablet (portrait/landscape)
- Touch the breakfast ordering interface
- Fill out the form
- Submit orders

## Troubleshooting

### If users can still exit:
1. Check that app is set as default launcher
2. Enable Screen Pinning and pin the app
3. Disable developer options
4. Use a third-party kiosk solution

### If app crashes or freezes:
1. The app will automatically restart
2. Check that all permissions are granted
3. Ensure stable Wi-Fi connection

### If screen turns off:
1. **Settings** > **Display** > **Sleep** = Never
2. Check that app has WAKE_LOCK permission

## Physical Security

Consider these additional measures:

- **Tablet Mount**: Secure the tablet to prevent removal
- **Case**: Use a tamper-resistant case
- **Cable Management**: Hide power/charging cables
- **Location**: Place in a supervised area

## Emergency Exit (For Administrators)

If you need to exit for maintenance:

### Method 1: Screen Pinning
- Hold **Back + Recent Apps** for 3 seconds
- Enter the PIN you set up

### Method 2: Safe Mode
- Hold **Power** button
- Long-press **Power Off** option
- Select **Safe Mode**
- Tablet will restart in safe mode where you can access settings

### Method 3: Factory Reset
- Last resort: **Settings** > **System** > **Reset** > **Factory Reset**

## Quick Setup Commands

```bash
# Install the kiosk app
npm run tablet:deploy:kiosk

# Or deploy to specific device
npm run kiosk:launcher
```

## Final Checklist

- [ ] App installed and set as default launcher
- [ ] Screen pinning enabled and app pinned
- [ ] Sleep set to "Never"
- [ ] Unknown sources enabled
- [ ] Wi-Fi connected
- [ ] All permissions granted
- [ ] Hardware buttons disabled (tested)
- [ ] Exit prevention verified
- [ ] Physical mounting secured

Your tablet is now locked down as a dedicated breakfast ordering kiosk! 🔒🥞

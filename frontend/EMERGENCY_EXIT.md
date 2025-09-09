# 🚨 EMERGENCY KIOSK EXIT GUIDE 🚨

Your breakfast ordering app is now **EXTREMELY** secure (maybe too secure! 😅). Here are the secret ways to exit kiosk mode:

## Method 1: Secret PIN Exit (Easiest)

### Option A: Wi-Fi Icon Click (IMPROVED!)
1. **Click the Wi-Fi icon** in the header **7 times rapidly** (within 3 seconds)
2. Enter the PIN: **`1234`**
3. Choose from multiple exit options:
   - **🏠 Launch Samsung Home** (automatic)
   - **📱 Minimize App** (manual exit)
   - **📋 Manual Instructions** (step-by-step guide)

### Option B: Konami Code
1. Press this key sequence on a connected keyboard:
   **↑ ↑ ↓ ↓ ← → ← →** (Arrow keys)
2. Enter the PIN: **`1234`**
3. Confirm you want to exit

## Method 2: Android System Methods

### Screen Pinning (If Enabled)
1. Hold **Back + Recent Apps** buttons for 3 seconds
2. Enter your device PIN/password

### Safe Mode
1. Hold **Power** button
2. Long-press **"Power Off"**
3. Select **"Restart in Safe Mode"**
4. Device will restart with kiosk protections disabled

### Force Stop via Settings (If Accessible)
1. If you can access Settings somehow
2. **Apps** > **Breakfast Ordering App** > **Force Stop**

## Method 3: Nuclear Options

### ADB (If USB Debugging Enabled)
```bash
adb shell am force-stop com.example.app
adb shell pm clear com.example.app
```

### Factory Reset (Last Resort)
1. Power off tablet completely
2. Hold **Volume Up + Power** button simultaneously
3. Use volume buttons to navigate to "Factory Reset"
4. **WARNING**: This will erase EVERYTHING!

## Changing the Exit PIN

To change the PIN from `1234` to something else:

1. Edit `/src/app/app.ts`
2. Find line: `private readonly exitPin = '1234';`
3. Change `'1234'` to your preferred PIN
4. Rebuild and deploy: `npm run tablet:deploy:kiosk`

## Temporarily Disabling Kiosk Mode

To make the app easier to exit during development:

1. Edit `/src/app/app.ts`
2. Find: `this.isKioskMode = this.isAndroid;`
3. Change to: `this.isKioskMode = false;`
4. Rebuild: `npm run build`

## Secret Methods Summary

| Method | Trigger | PIN Required |
|--------|---------|--------------|
| Wi-Fi Icon | 7 rapid clicks on Wi-Fi icon | Yes (1234) |
| Konami Code | ↑↑↓↓←→←→ on keyboard | Yes (1234) |
| Screen Pinning | Back + Recent Apps (3 sec) | Device PIN |
| Safe Mode | Power button menu | No |
| ADB | USB debugging + computer | No |

## Testing the Exit

To test that the secret exit works:

1. Deploy the app: `npm run tablet:deploy:kiosk`
2. Set as launcher and enable screen pinning
3. Try the secret methods above
4. Verify you can exit when needed

## Pro Tips

- **Remember the PIN**: Default is `1234` (change it!)
- **Top-left corner**: A 50x50 pixel invisible area
- **Keep this guide**: You'll need it when you're locked out! 😉
- **Physical access**: Sometimes you need to restart the tablet

---

**⚠️ Important**: Keep this document handy! The kiosk mode is VERY effective at preventing exits.

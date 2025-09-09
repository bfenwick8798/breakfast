# Build Commands Documentation

## Development vs Production Builds

### Development Builds
- Extract token from URL parameter `?t=...`
- Use `environment.ts` (no hardcoded token)
- Enable debugging and source maps

### Production/Kiosk Builds
- Use hardcoded token: `wR94jsbHmgXaFacDJKxM6aU8BTtF98Am9Dx6SvvAUScVR62ghGwMdDxEQsdz8qVtnZ8NMBGeyBZBLcvRpU89W8L3MFSpmSyhcDdATFRGC2Pab3pxvcT6DwCuMKV7yYRjGmAC3AgXFwmVzHxYSaGPq3qm7y6Evz9Z`
- Use `environment.prod.ts`
- Optimized for production

## Available Commands

### Web Builds
```bash
# Development build
npm run build

# Production build with hardcoded token
npm run build:prod
npm run build:kiosk
```

### Mobile Builds
```bash
# Development mobile build
npm run build:mobile
npm run android:dev

# Production mobile build with hardcoded token
npm run build:mobile:prod
npm run android:prod
npm run build:mobile:kiosk
npm run android:kiosk
```

### Tablet Kiosk Deployment
```bash
# Start tablet emulator
npm run tablet:start

# Deploy development version to tablet
npm run tablet:deploy

# Deploy kiosk version (with hardcoded token) to tablet
npm run tablet:deploy:kiosk
```

### Android Studio Integration
```bash
# Open in Android Studio (development)
npm run android:build

# Open in Android Studio (production)
npm run android:build:prod
```

## Token Configuration

- **Development**: Token extracted from URL `?t=your_token_here`
- **Production/Kiosk**: Hardcoded token in `src/environments/environment.prod.ts`

To change the hardcoded token, edit `src/environments/environment.prod.ts`.

## For Kiosk Deployment

Use these commands for kiosk deployment:
- `npm run tablet:deploy:kiosk` - Deploy to tablet with hardcoded token
- `npm run android:kiosk` - Build and run with hardcoded token on any Android device

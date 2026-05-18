# Building APK for Marker Detection App

This document provides comprehensive instructions for building the APK for Android devices.

## Prerequisites

1. **Node.js and npm**:
   - Download from https://nodejs.org/
   - Verify: `node --version` and `npm --version`

2. **Android SDK**:
   - Install Android Studio
   - Download Android SDK (API level 26-34)
   - Set `ANDROID_HOME` environment variable

3. **Expo CLI**:
   ```bash
   npm install -g expo-cli
   ```

4. **EAS CLI** (for advanced building):
   ```bash
   npm install -g eas-cli
   ```

## Building Options

### Option 1: Expo Build (Recommended for beginners)

**Command**:
```bash
cd MarkerDetectionApp
expo build:android -t apk
```

**What it does**:
- Builds on Expo servers
- Generates APK file
- No local Android SDK needed

**Output**:
- APK download link in terminal
- Takes 15-20 minutes

### Option 2: EAS Build (Recommended for production)

**Setup**:
```bash
eas login
eas build --platform android
```

**Advantages**:
- Faster builds
- Better version management
- Native module support

### Option 3: Local Build (Advanced)

**Prerequisites**:
- Android SDK properly configured
- Java Development Kit (JDK)

**Command**:
```bash
cd MarkerDetectionApp
npm install -g expo-cli
expo prebuild --clean
cd android
./gradlew bundleRelease  # For AAB
./gradlew assembleRelease  # For APK
```

**Output Location**:
- `android/app/build/outputs/bundle/release/app-release.aab`
- `apk/app-release.apk`

## Quick Build Steps

### Step 1: Setup Project
```bash
cd "E:\J projs\Alemeno Frontend intern\Code\MarkerDetectionApp"
npm install
```

### Step 2: Verify Installation
```bash
npm run android    # Or web to test quickly
```

### Step 3: Build APK
```bash
expo build:android -t apk
```

### Step 4: Wait & Download
- Check terminal for build status
- APK ready when build completes
- Download APK from provided link

### Step 5: Install on Device
```bash
adb install apk/app-release.apk
```

Or use Android Studio emulator to install.

## Configuration Files

### app.json
Defines app metadata, permissions, and build settings.

**Key fields**:
- `expo.name`: App name (Marker Detection App)
- `expo.version`: Version number (1.0.0)
- `expo.android.permissions`: Camera and storage access
- `expo.android.package`: com.alemeno.markerdetection

### eas.json
EAS Build configuration for cloud builds.

**Profiles**:
- `production`: For App Store/Play Store release
- `preview`: For testing builds
- `development`: For dev testing

## Troubleshooting

### Build Fails with "Metro Bundler Error"
```bash
# Clear Metro cache
expo start --clear
```

### APK Installation Fails
```bash
# Verify device compatibility
adb devices
adb shell getprop ro.build.version.release
```

### Size Issues
**APK too large?**
- Default APK: 50-60MB
- Install split APKs: `expo build:android --type apk --release-channel`

### Signing Issues
```bash
# Create keystore
keytool -genkey -v -keystore my-release-key.keystore -keyalg RSC -keysize 2048 -validity 10000 -alias my-key-alias

# Use in build
expo build:android -t apk --keystore-path ./my-release-key.keystore
```

## Post-Build Verification

### Check APK Details
```bash
aapt dump badging apk/app-release.apk
```

### Verify Permissions
```bash
aapt dump permissions apk/app-release.apk
```

### Install and Test
```bash
adb install -r apk/app-release.apk
adb logcat | grep MarkerDetection
```

## Deployment Options

### 1. Direct Install (for testing)
```bash
adb install apk/app-release.apk
```

### 2. Google Play Store
- Create Play Console account
- Upload AAB file
- Configure store listing
- Submit for review

### 3. Direct Distribution
- Share APK file via link
- Users install via ADB or file manager

## Performance Optimization for APK

### Reduce Size
```json
// app.json
{
  "expo": {
    "plugins": ["expo-camera"],
    "android": {
      "enableProguard": true
    }
  }
}
```

### Faster Installation
- Use split APKs for different architectures
- Compress with `aapt`

## Build Commands Reference

```bash
# Quick test build
expo build:android -t apk

# Production build with signing
expo build:android -t apk --release-channel production

# Build AAB (for Play Store)
expo build:android -t app-bundle

# Preview build
expo build:android -t apk --release-channel preview

# Build with custom environment
EAS_BUILD_PROFILE=production eas build --platform android
```

## Environment Variables

For production builds, set in `app.json`:

```json
{
  "expo": {
    "android": {
      "env": {
        "REACT_APP_ENV": "production",
        "API_URL": "https://api.example.com"
      }
    }
  }
}
```

## Testing Built APK

### On Emulator
```bash
# Start emulator first
emulator -avd Pixel_4_API_30

# Install APK
adb install -r apk/app-release.apk

# Launch app
adb shell am start -n com.alemeno.markerdetection/.MainActivity
```

### On Physical Device
1. Enable USB Debugging: Settings → Developer Options → USB Debugging
2. Connect device via USB
3. Run: `adb install -r apk/app-release.apk`
4. Check installation: `adb shell pm list packages | grep markerdetection`

## Continuous Deployment

### GitHub Actions Example
```yaml
name: Build APK
on: [push, pull_request]

jobs:
  build:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v2
      - uses: expo/expo-github-action@v8
      - run: npm install
      - run: eas build --platform android --type apk
```

## Signing APK

### For Play Store Release
```bash
# Generate key
keytool -genkey -v -keystore release.keystore -keyalg RSA -keysize 2048 -validity 10000

# Sign APK
jarsigner -verbose -sigalg SHA256withRSA -digestalg SHA-256 \
  -keystore release.keystore app-release-unsigned.apk my-key-alias

# Align APK
zipalign -v 4 app-release-unsigned.apk app-release-signed.apk
```

## Final Checklist

- [ ] All dependencies installed (`npm install`)
- [ ] App runs on web (`npm run web`)
- [ ] Camera permissions configured in app.json
- [ ] TypeScript compiles without errors
- [ ] APK builds successfully
- [ ] APK installs on test device
- [ ] Camera works on device
- [ ] Marker detection functions
- [ ] 20-marker collection works
- [ ] Results display properly

---

**Build Time**: ~15-20 minutes (Expo)  
**APK Size**: ~50-60MB  
**Minimum Android**: API 26 (Android 8.0)  
**Status**: Ready for Production

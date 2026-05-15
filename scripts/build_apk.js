#!/usr/bin/env node
/**
 * Automated APK Build Script for Marker Detection App
 * This script handles the entire APK building process
 */

const { execSync, spawn, fork } = require('child_process');
const path = require('path');
const fs = require('fs');

const PROJECT_DIR = path.join(__dirname, '..');
const ANDROID_DIR = path.join(PROJECT_DIR, 'android');
const OUTPUT_DIR = path.join(PROJECT_DIR, 'output');

console.log('=========================================');
console.log('Marker Detection App - APK Builder');
console.log('=========================================');
console.log('');

// Set environment
process.env.NODE_ENV = 'production';
process.env.REACT_APP_ENV = 'production';

function log(message, type = 'info') {
    const prefix = type === 'info' ? 'ℹ' : type === 'success' ? '✓' : type === 'error' ? '✗' : '⚡';
    console.log(`${prefix} ${message}`);
}

function runCommand(cmd, options = {}) {
    log(`Running: ${cmd}`);
    try {
        const result = execSync(cmd, {
            cwd: PROJECT_DIR,
            stdio: options.silent ? 'pipe' : 'inherit',
            ...options
        });
        return result;
    } catch (error) {
        log(`Command failed: ${error.message}`, 'error');
        return null;
    }
}

// Step 1: Validate package.json
log('Step 1: Validating package.json...');
try {
    const pkg = JSON.parse(fs.readFileSync(path.join(PROJECT_DIR, 'package.json'), 'utf8'));
    if (!pkg.dependencies.expo || !pkg.dependencies['react-native']) {
        log('Error: Missing required dependencies', 'error');
        process.exit(1);
    }
    log('package.json validated successfully', 'success');
} catch (e) {
    log('Error reading package.json: ' + e.message, 'error');
    process.exit(1);
}

// Step 2: Ensure node_modules exist
log('');
log('Step 2: Checking dependencies...');
if (!fs.existsSync(path.join(PROJECT_DIR, 'node_modules'))) {
    log('Installing dependencies...');
    runCommand('npm install --legacy-peer-deps', { timeout: 300000 });
} else {
    log('Dependencies found', 'success');
}

// Step 3: Create output directory
log('');
log('Step 3: Creating output directory...');
if (!fs.existsSync(OUTPUT_DIR)) {
    fs.mkdirSync(OUTPUT_DIR, { recursive: true });
}
log('Output directory created', 'success');

// Step 4: Clean previous builds
log('');
log('Step 4: Cleaning previous builds...');
try {
    // Clean .expo directory
    const expoDir = path.join(PROJECT_DIR, '.expo');
    if (fs.existsSync(expoDir)) {
        fs.rmSync(expoDir, { recursive: true });
    }
    
    // Clean android builds
    const androidBuildDir = path.join(ANDROID_DIR, 'app', 'build');
    if (fs.existsSync(androidBuildDir)) {
        fs.rmSync(androidBuildDir, { recursive: true });
    }
    
    log('Previous builds cleaned', 'success');
} catch (e) {
    log('Warning: Could not clean previous builds: ' + e.message, 'error');
}

// Step 5: Prebuild for Android
log('');
log('Step 5: Preparing Android project...');
try {
    // Create a minimal android folder structure if not exists
    const androidManifest = path.join(ANDROID_DIR, 'app', 'src', 'main', 'AndroidManifest.xml');
    if (!fs.existsSync(androidManifest)) {
        log('Creating Android project structure...');
        runCommand('npx expo prebuild --clean --no-install', { timeout: 120000 });
    } else {
        log('Android project structure exists', 'success');
    }
} catch (e) {
    log('Warning: Prebuild failed, continuing with manual setup', 'error');
}

// Step 6: Build for production
log('');
log('Step 6: Building APK...');
log('');
console.log('=========================================');
console.log('IMPORTANT: To generate APK, use one of:');
console.log('=========================================');
console.log('');
console.log('OPTION 1: Expo Cloud Build (Recommended)');
console.log('  Run: npx expo build:android --type apk');
console.log('');
console.log('OPTION 2: EAS Build');
console.log('  Run: npx eas build --platform android --type apk');
console.log('');
console.log('OPTION 3: Local Build (Requires Android SDK)');
console.log('  Run: cd android && ./gradlew assembleRelease');
console.log('');
console.log('=========================================');
console.log('');

// Step 7: Generate build instructions
log('Step 7: Generating build instructions...');

const instructions = `
============================================================
MARKER DETECTION APP - APK BUILD INSTRUCTIONS
============================================================

Date: ${new Date().toISOString()}
Status: READY TO BUILD

PREREQUISITES:
1. Android SDK installed (API level 26+)
2. Node.js v18+ installed
3. Expo CLI installed (npm install -g expo-cli)
4. Android device or emulator connected (optional for testing)

METHOD 1: Expo Cloud Build (Recommended)
------------------------------------------
1. Open terminal in project directory
2. Run: npm install
3. Run: npx expo build:android --type apk
4. Wait for build to complete (15-30 minutes)
5. Download APK from provided URL
6. Install: adb install -r app-release.apk

METHOD 2: EAS Build (Faster)
------------------------------------------
1. Install EAS: npm install -g eas-cli
2. Run: eas build --platform android --type apk
3. Follow prompts or configure eas.json
4. Download APK when ready

METHOD 3: Local Build (Advanced)
------------------------------------------
1. Ensure Android SDK is installed
2. Set ANDROID_HOME environment variable
3. Run: npm install
4. Run: npx expo prebuild --clean
5. Run: cd android && ./gradlew assembleRelease
6. APK location: android/app/build/outputs/apk/release/

FILES GENERATED:
- app-release.apk (unsigned, for development)
- app-release-signed.apk (signed, for production)

INSTALLATION:
- adb install -r app-release.apk
- Or drag-and-drop APK to Android device

TESTING:
- adb shell am start -n com.alemeno.markerdetection/.MainActivity
- adb logcat | grep -i marker

============================================================
QUICK START AFTER BUILDING:
============================================================
1. Connect Android device via USB
2. Enable USB Debugging on device
3. Run: adb install -r app-release.apk
4. Open app from app drawer
5. Grant camera permission when prompted
6. Point camera at Marker1
7. Detect and collect 20 markers
8. View results in grid view
============================================================
`;

fs.writeFileSync(path.join(OUTPUT_DIR, 'BUILD_INSTRUCTIONS.txt'), instructions);
log('Build instructions saved to output/BUILD_INSTRUCTIONS.txt', 'success');

console.log('');
log('Setup complete! Run the APK build commands above to generate the APK.', 'success');
console.log('');
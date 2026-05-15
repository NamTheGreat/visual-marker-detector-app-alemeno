#!/bin/bash

# Marker Detection App - Build & Setup Script
# This script automates the setup and APK generation process

set -e

echo "=================================="
echo "Marker Detection App - Build Script"
echo "=================================="
echo ""

# Colors for output
GREEN='\033[0;32m'
BLUE='\033[0;34m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# Function to print colored output
print_step() {
    echo -e "${BLUE}=>${NC} $1"
}

print_success() {
    echo -e "${GREEN}✓${NC} $1"
}

print_warning() {
    echo -e "${YELLOW}⚠${NC} $1"
}

# Check prerequisites
print_step "Checking prerequisites..."

if ! command -v node &> /dev/null; then
    print_warning "Node.js not found. Please install Node.js from https://nodejs.org/"
    exit 1
fi
print_success "Node.js $(node --version) found"

if ! command -v npm &> /dev/null; then
    print_warning "npm not found. Please install npm"
    exit 1
fi
print_success "npm $(npm --version) found"

if ! command -v expo &> /dev/null; then
    print_step "Installing Expo CLI..."
    npm install -g expo-cli
fi
print_success "Expo CLI installed"

# Navigate to project directory
PROJECT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
cd "$PROJECT_DIR"
print_success "Working directory: $PROJECT_DIR"
echo ""

# Install dependencies
print_step "Installing project dependencies..."
if [ ! -d "node_modules" ]; then
    npm install --legacy-peer-deps
else
    print_success "Dependencies already installed"
fi
echo ""

# Clean and rebuild
print_step "Cleaning project..."
rm -rf .expo/ || true
print_success "Project cleaned"
echo ""

# Start build process
print_step "Starting APK build process..."
print_warning "Note: This may take 15-20 minutes on first build"
echo ""

# Choose build method
echo "Select build method:"
echo "1) Expo Build (Recommended for beginners - builds on cloud)"
echo "2) Local Build (Requires Android SDK)"
echo "3) EAS Build (Recommended for production)"
echo ""
read -p "Enter choice (1-3): " BUILD_CHOICE

case $BUILD_CHOICE in
    1)
        print_step "Starting Expo Cloud Build..."
        expo build:android --type apk
        ;;
    2)
        print_step "Starting Local Build..."
        print_warning "Make sure ANDROID_HOME is set correctly"
        expo prebuild --clean
        cd android
        ./gradlew assembleRelease
        cd ..
        print_success "APK built at: android/app/build/outputs/apk/release/app-release.apk"
        ;;
    3)
        print_step "Starting EAS Build..."
        if ! command -v eas &> /dev/null; then
            npm install -g eas-cli
        fi
        eas build --platform android --type apk
        ;;
    *)
        print_warning "Invalid choice"
        exit 1
        ;;
esac

echo ""
print_success "Build process started!"
echo ""
echo "Next steps:"
echo "1. Wait for build to complete"
echo "2. Download the APK file when ready"
echo "3. Install on Android device: adb install -r app-release.apk"
echo "4. Or install via Android Studio emulator"
echo ""
print_success "Build script completed!"

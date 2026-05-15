# Marker Detection App - Windows Build Script
# PowerShell script for building APK on Windows

param(
    [string]$BuildType = "expo"
)

$ErrorActionPreference = "Stop"

Write-Host "=================================="
Write-Host "Marker Detection App - Build Script (Windows)"
Write-Host "=================================="
Write-Host ""

function Print-Step {
    param([string]$Message)
    Write-Host "=> $Message" -ForegroundColor Blue
}

function Print-Success {
    param([string]$Message)
    Write-Host "✓ $Message" -ForegroundColor Green
}

function Print-Warning {
    param([string]$Message)
    Write-Host "⚠ $Message" -ForegroundColor Yellow
}

# Check prerequisites
Print-Step "Checking prerequisites..."

if (-not (Get-Command node -ErrorAction SilentlyContinue)) {
    Print-Warning "Node.js not found. Please install from https://nodejs.org/"
    exit 1
}
Print-Success "Node.js $(node --version) found"

if (-not (Get-Command npm -ErrorAction SilentlyContinue)) {
    Print-Warning "npm not found. Please install npm"
    exit 1
}
Print-Success "npm $(npm --version) found"

if (-not (Get-Command expo -ErrorAction SilentlyContinue)) {
    Print-Step "Installing Expo CLI..."
    npm install -g expo-cli
}
Print-Success "Expo CLI installed"

# Navigate to project
$ProjectDir = Split-Path -Parent $MyInvocation.MyCommand.Path
Set-Location $ProjectDir
Print-Success "Working directory: $ProjectDir"
Write-Host ""

# Install dependencies
Print-Step "Installing project dependencies..."
if (-not (Test-Path "node_modules" -PathType Container)) {
    npm install --legacy-peer-deps
}
else {
    Print-Success "Dependencies already installed"
}
Write-Host ""

# Clean project
Print-Step "Cleaning project..."
if (Test-Path ".expo" -PathType Container) {
    Remove-Item ".expo" -Recurse -Force
}
Print-Success "Project cleaned"
Write-Host ""

# Build options
Print-Step "Available build methods:"
Write-Host "1) Expo Build (Cloud - Recommended)" -ForegroundColor Cyan
Write-Host "2) Local Build (Requires Android SDK)" -ForegroundColor Cyan
Write-Host "3) EAS Build (Production - Recommended)" -ForegroundColor Cyan
Write-Host ""

if ([string]::IsNullOrEmpty($BuildType)) {
    $BuildChoice = Read-Host "Enter choice (1-3)"
}
else {
    $BuildChoice = $BuildType
}

Write-Host ""

switch ($BuildChoice) {
    "1" {
        Print-Step "Starting Expo Cloud Build for Android APK..."
        Print-Warning "First time build may take 15-20 minutes"
        Write-Host "Launching browser for authentication..."
        Write-Host ""
        
        & expo build:android --type apk
        
        Print-Success "Build started! Check your email for download link"
        Write-Host ""
        Write-Host "APK will be available at the URL provided"
        break
    }
    "2" {
        Print-Step "Starting Local Build..."
        Print-Warning "Requires Android SDK properly configured"
        Write-Host ""
        
        if (-not (Test-Path "android" -PathType Container)) {
            Print-Step "Prebuild: Preparing Android project..."
            & expo prebuild --clean
        }
        
        Print-Step "Building APK..."
        Set-Location "android"
        & .\gradlew.bat assembleRelease
        Set-Location ".."
        
        $ApkPath = "android/app/build/outputs/apk/release/app-release.apk"
        if (Test-Path $ApkPath) {
            Print-Success "APK built successfully!"
            Print-Success "Location: $ApkPath"
        }
        else {
            Print-Warning "APK not found. Build may have failed."
        }
        break
    }
    "3" {
        Print-Step "Starting EAS Cloud Build..."
        
        if (-not (Get-Command eas -ErrorAction SilentlyContinue)) {
            Print-Step "Installing EAS CLI..."
            npm install -g eas-cli
        }
        
        & eas build --platform android --type apk
        
        Print-Success "Build started!"
        break
    }
    default {
        Print-Warning "Invalid choice. Please enter 1, 2, or 3"
        exit 1
    }
}

Write-Host ""
Print-Success "Build process initiated!"
Write-Host ""
Write-Host "Next Steps:" -ForegroundColor Yellow
Write-Host "1. Wait for build to complete"
Write-Host "2. Download the APK file when ready"
Write-Host "3. Install on device: adb install -r app-release.apk"
Write-Host ""
Print-Success "Build script completed!"

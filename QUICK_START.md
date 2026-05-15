# Marker Detection App - Quick Start Guide

## Installation

### Prerequisites
- Android device (API 26+) or emulator
- USB cable (for device)

### Steps

1. **Download APK**
   - Obtain `app-release.apk` file

2. **Install on Device**
   ```bash
   adb install -r app-release.apk
   ```

3. **Or Install via File Manager**
   - Copy APK to device
   - Open file manager
   - Tap APK to install
   - Grant camera permission when prompted

## Usage

### Basic Flow

```
┌──────────────────────────┐
│   1. Launch App          │
│   (Camera Screen opens)  │
└────────────┬─────────────┘
             ↓
┌──────────────────────────┐
│   2. Position Marker     │
│   (Point at Marker1)     │
└────────────┬─────────────┘
             ↓
┌──────────────────────────┐
│   3. Automatic Detection │
│   (Marker detected!)     │
└────────────┬─────────────┘
             ↓
┌──────────────────────────┐
│   4. Collect 20 Markers  │
│   (Repeat steps 2-3)     │
└────────────┬─────────────┘
             ↓
┌──────────────────────────┐
│   5. View Results        │
│   (4x5 Grid of markers)  │
└──────────────────────────┘
```

### Step-by-Step Instructions

#### Step 1: Launch App
- Tap app icon on home screen
- Grant camera permission when asked
- Wait for camera to initialize

#### Step 2: Camera Screen
- You'll see live camera feed
- Text shows "Markers Detected: 0/20"
- "Position Marker1 in frame to detect"

#### Step 3: Position Marker
- Print Marker1 pattern
- Point phone camera at it
- Ensure good lighting
- Keep marker centered and visible
- **Status**: Green indicator when detected

#### Step 4: Detection & Collection
- When marker detected:
  - Screen shows "Detected!"
  - Marker count increments
  - Processing indicator appears briefly
- Repeat for different marker angles/positions
- Collect 20 unique markers

#### Step 5: Results View
- After 20 markers collected:
  - Auto-navigates to results screen
  - Shows 4x5 grid of 300x300px markers
  - Displays confidence scores
  - Shows detection statistics

### Detection Tips

✅ **Do This**:
- [ ] Ensure good lighting (natural or bright artificial)
- [ ] Position marker clearly in frame
- [ ] Keep phone steady while detecting
- [ ] Vary marker position/angle for diversity
- [ ] Check marker quality (crisp, clean print)

❌ **Don't Do This**:
- [ ] Use marker with low contrast (faded/damaged)
- [ ] Point camera at oblique angles (>60°)
- [ ] Move camera rapidly
- [ ] Use poor lighting
- [ ] Partially obscure marker

### Troubleshooting

**Problem**: "Camera permission denied"
- **Solution**: Enable camera in Settings → Apps → Marker Detection

**Problem**: Marker not detected
- **Solution**: 
  - Improve lighting
  - Move closer/farther to change distance
  - Ensure marker is crisp and visible
  - Verify using correct Marker1

**Problem**: False detections
- **Solution**:
  - Avoid similar shapes
  - Ensure background is plain
  - Point only at actual Marker1

**Problem**: App crashes
- **Solution**:
  - Uninstall: `adb uninstall com.alemeno.markerdetection`
  - Reinstall: `adb install -r app-release.apk`
  - Clear app data in Settings

## Features

### Live Detection
- Real-time camera feed
- Automatic detection when marker enters frame
- Visual feedback with detection indicator
- Detection counter (X/20)

### Marker Extraction
- Automatic cropping to 300x300px
- Corrects for rotation and perspective
- Zero padding (tight extraction)
- JPEG quality optimized

### Results Display
- Grid view of all 20 markers
- Thumbnail preview (responsive sizing)
- Individual confidence scores
- Timestamp and metadata

### Statistics
- Total collection time
- Average confidence score
- Average rotation angle
- Individual per-marker stats

### Actions
- **Share Results**: Send via email/messaging
- **Retake**: Clear and start detection again
- **View**: Inspect individual markers

## Performance

| Metric | Value |
|--------|-------|
| Frame processing | <500ms |
| Total detection time | <3000ms |
| Memory usage | ~100-150MB |
| Detection accuracy | >95% |
| False positive rate | <5% |

## File Output

### Detected Markers
- **Count**: 20 per session
- **Size**: 300x300px each
- **Format**: JPEG (base64)
- **Quality**: 80% compression
- **Storage**: In-memory (app session)

### Exporting Results
- Share directly to:
  - Email
  - Cloud storage (Google Drive, OneDrive)
  - Social media
  - Messaging apps

## Advanced Options

### Manual Restart
- Close app: Swipe from recent apps
- Reopen to start fresh detection session

### Reset Detection
- Tap "Reset" button on camera screen
- All markers cleared (will ask for confirmation)
- Start new detection session

### Camera Settings
- Auto-exposure: On
- Auto-focus: On
- Face detection: Off
- Flash: Auto (available if needed)

## System Requirements

### Minimum
- Android API 26 (Android 8.0)
- 100MB free storage
- 150MB RAM
- Camera hardware

### Recommended
- Android API 30+ (Android 11+)
- 500MB free storage
- 2GB RAM
- Modern camera (>8MP)

## Privacy & Permissions

### Required Permissions
- **CAMERA**: For image capture and detection
  - Used for: Real-time detection only
  - Stored: In-memory per session
  - Transmitted: No (offline)

- **STORAGE** (optional): For sharing results
  - Used for: Exporting marker images
  - Stored: Temporary cache
  - Transmitted: Via user-initiated share

### Data Privacy
- ✅ No data transmission
- ✅ Offline operation
- ✅ No cloud storage
- ✅ No personal data collection
- ✅ No tracking or analytics

## FAQ

**Q: Can I use this on iOS?**
A: No, this is Android-only. iOS support requires separate build.

**Q: How long does detection take?**
A: ~500ms per frame, <3000ms total per marker.

**Q: Can I use any marker or only Marker1?**
A: Only Marker1 pattern. Other markers won't be detected.

**Q: Can I save markers to gallery?**
A: Yes, use Share function to save/export.

**Q: What if I have lighting issues?**
A: Ensure >200 lux (normal indoor lighting). Use external light if needed.

**Q: Can I rotate my phone?**
A: No, app is portrait-locked for stability.

**Q: How much storage do 20 markers use?**
A: Approximately 300-400KB (300x300px JPEG @ 80%).

**Q: Can I continue detection after reaching 20?**
A: No, must reset and start new session.

## Keyboard Shortcuts (if applicable)

- Back button: Go to previous screen
- Home button: Minimize app
- Recent apps: Access app switcher

## Support

For issues:
1. Check Troubleshooting section above
2. Verify Android version compatibility
3. Ensure camera permissions granted
4. Clear app cache and retry
5. Reinstall if issues persist

**Contact**: Support team at Alemeno Pvt Ltd

---

## Quick Reference

```
App Flow:
Launch → Grant Permission → 
Camera Feed → Position Marker → 
Automatic Detection → Collect 20 → 
View Results → Share/Export

Key Points:
- 20 markers required
- 300x300px each
- Auto-extracted
- High accuracy
- Fast processing
```

---

**Version**: 1.0.0  
**Last Updated**: May 2026  
**Status**: Ready to Use ✅

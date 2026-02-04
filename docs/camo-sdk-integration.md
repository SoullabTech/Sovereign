# Camo Studio Integration

Soullab Studio integrates with [Camo Studio](https://camo.com/studio) to use your iPhone as a high-quality camera source for recordings and video calls.

## Overview

Camo Studio transforms your iPhone into a professional webcam, providing:
- Superior video quality compared to built-in webcams
- Advanced color and exposure controls
- Portrait mode and background blur
- USB or WiFi connectivity

## Device Configuration

**Camo Device ID:** `3CF6E9DF41838044F459`

This device ID is used to automatically detect and select the Camo virtual camera when available.

## Setup Requirements

### Mac Setup
1. Download and install [Camo Studio](https://camo.com/studio) on your Mac
2. Open Camo Studio application

### iPhone Setup
1. Download Camo app from App Store
2. Connect iPhone to Mac via USB or WiFi
3. Open Camo app on iPhone

### Verification
1. In Camo Studio (Mac), verify your iPhone appears in the device list
2. Navigate to **Soullab Studio > Live Camera**
3. Click **Refresh** to detect available cameras
4. Select the Camo camera from the source list

## Features in Soullab Studio

### Live Camera Page (`/studio/camera`)

The Live Camera integration provides:

| Feature | Description |
|---------|-------------|
| Camera Selection | Choose between Camo and other connected cameras |
| Live Preview | Real-time video preview with adjustable quality |
| Recording | Record sessions directly to webm format |
| Quality Settings | 720p, 1080p, or 4K resolution at 30/60fps |
| Auto-Detection | Automatically detects when Camo connects/disconnects |

### Supported Workflows

1. **Client Sessions** - Use Camo for high-quality video during client calls
2. **Content Recording** - Record professional videos for Soullab content
3. **Presentations** - Present with superior video quality
4. **Documentation** - Record walkthroughs and demonstrations

## Technical Integration

### WebRTC Implementation

The integration uses standard WebRTC APIs to access the Camo virtual camera:

```typescript
// Camera detection
const devices = await navigator.mediaDevices.enumerateDevices();
const camoDevice = devices.find(d =>
  d.deviceId.includes(CAMO_DEVICE_ID) ||
  d.label.toLowerCase().includes('camo')
);

// Stream acquisition
const stream = await navigator.mediaDevices.getUserMedia({
  video: {
    deviceId: { exact: camoDevice.deviceId },
    width: { ideal: 1920 },
    height: { ideal: 1080 },
    frameRate: { ideal: 30 }
  }
});
```

### Device Change Detection

The system listens for device changes to automatically update when Camo is connected or disconnected:

```typescript
navigator.mediaDevices.addEventListener('devicechange', enumerateCameras);
```

## Camo SDK (Native iOS Integration)

For potential future native iOS integration, Camo provides an SDK that allows streaming from iOS apps directly to Camo Studio.

**SDK Documentation:** [Camo SDK Overview](https://camo.com/support/camo-sdk/overview-camo-sdk)

**Key Features:**
- Stream real-time audio/video from iOS app to Camo Studio
- USB optimized for low-latency
- WiFi support for cable-free operation
- iOS 12+ support

**Contact for SDK Access:** sdk@reincubate.com

## Troubleshooting

### Camera Not Detected
1. Ensure Camo Studio is running on Mac
2. Verify iPhone is connected and showing in Camo Studio
3. Click **Refresh** in Soullab Studio Live Camera
4. Check browser permissions for camera access

### Poor Video Quality
1. Ensure good lighting conditions
2. Check quality settings in Soullab (1080p recommended)
3. Adjust settings in Camo Studio (exposure, white balance)
4. Use USB connection for best quality (vs WiFi)

### Recording Issues
- Recording uses webm format with VP9 codec
- Ensure sufficient disk space
- Browser must support MediaRecorder API

## Sources

- [Camo Studio](https://camo.com/studio)
- [Camo SDK Overview](https://camo.com/support/camo-sdk/overview-camo-sdk)
- [Camo Camera App](https://camo.com/camera)
- [Using Camo in Other Apps](https://camo.com/support/camo/camo-virtual-camera-in-apps)

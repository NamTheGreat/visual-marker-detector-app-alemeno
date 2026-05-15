import React, { useEffect, useRef, useState, useCallback } from 'react';
import {
  View,
  StyleSheet,
  Text,
  Dimensions,
  ActivityIndicator,
  Alert,
} from 'react-native';
import { CameraView, useCameraPermissions } from 'expo-camera';
import { getOptimalCameraResolution } from '../utils/imageProcessing';

interface LiveCameraFeedProps {
  onMarkerDetected: (markerData: string) => void;
  detectedCount: number;
  isProcessing: boolean;
}

const CAPTURE_INTERVAL = 1500;

export const LiveCameraFeed: React.FC<LiveCameraFeedProps> = ({
  onMarkerDetected,
  detectedCount,
  isProcessing,
}) => {
  const [permission, requestPermission] = useCameraPermissions();
  const cameraRef = useRef<CameraView>(null);
  const [cameraReady, setCameraReady] = useState(false);
  const frameProcessingRef = useRef(false);
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);

  const { width, height } = getOptimalCameraResolution();
  const screenDimensions = Dimensions.get('window');

  const captureFrame = useCallback(async () => {
    if (!cameraRef.current || frameProcessingRef.current || isProcessing) {
      return;
    }

    if (detectedCount >= 20) {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
        intervalRef.current = null;
      }
      return;
    }

    try {
      frameProcessingRef.current = true;
      
      const photo = await cameraRef.current.takePictureAsync({
        quality: 0.6,
        base64: true,
        skipProcessing: false,
      });

      if (photo?.base64) {
        onMarkerDetected(photo.base64);
      }
    } catch (error) {
      console.error('Error capturing frame:', error);
    } finally {
      frameProcessingRef.current = false;
    }
  }, [onMarkerDetected, isProcessing, detectedCount]);

  useEffect(() => {
    if (!permission) {
      requestPermission();
    }
  }, [permission]);

  useEffect(() => {
    if (cameraReady && detectedCount < 20 && !isProcessing) {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
      }
      intervalRef.current = setInterval(captureFrame, CAPTURE_INTERVAL);
    }

    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
        intervalRef.current = null;
      }
    };
  }, [cameraReady, detectedCount, isProcessing, captureFrame]);

  if (!permission) {
    return (
      <View style={styles.container}>
        <ActivityIndicator size="large" color="#007AFF" />
        <Text style={styles.permissionText}>Requesting camera permission...</Text>
      </View>
    );
  }

  if (!permission.granted) {
    return (
      <View style={styles.container}>
        <Text style={styles.errorText}>Camera permission not granted</Text>
        <Text style={styles.permissionText}>
          Please enable camera access in settings
        </Text>
      </View>
    );
  }

  const handleCameraReady = () => {
    setCameraReady(true);
  };

  const handleTakePicture = async () => {
    if (!cameraRef.current || frameProcessingRef.current || isProcessing) {
      return;
    }

    try {
      frameProcessingRef.current = true;
      
      const photo = await cameraRef.current.takePictureAsync({
        quality: 0.8,
        base64: true,
        skipProcessing: false,
      });

      if (photo?.base64) {
        onMarkerDetected(photo.base64);
      }
    } catch (error) {
      console.error('Error taking picture:', error);
      Alert.alert('Error', 'Failed to capture frame');
    } finally {
      frameProcessingRef.current = false;
    }
  };

  return (
    <View style={styles.container}>
      {cameraReady && (
        <View style={styles.statsContainer}>
          <Text style={styles.statsText}>
            Markers Detected: {detectedCount}/20
          </Text>
          {isProcessing && (
            <View style={styles.processingIndicator}>
              <ActivityIndicator size="small" color="#FF9500" />
              <Text style={styles.processingText}>Processing...</Text>
            </View>
          )}
        </View>
      )}

      <CameraView
        ref={cameraRef}
        style={[styles.camera, {
          width: Math.min(screenDimensions.width, height),
          height: Math.min(screenDimensions.height - 100, width),
        }]}
        facing="back"
        onCameraReady={handleCameraReady}
      />

      {!cameraReady && (
        <View style={styles.loadingOverlay}>
          <ActivityIndicator size="large" color="#007AFF" />
          <Text style={styles.loadingText}>Initializing camera...</Text>
        </View>
      )}

      <View style={styles.instructionsContainer}>
        <Text style={styles.instructionsText}>
          {detectedCount < 20
            ? 'Position Marker1 in frame to detect'
            : '✓ All 20 markers collected!'}
        </Text>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#000',
    justifyContent: 'center',
    alignItems: 'center',
  },
  camera: {
    borderRadius: 12,
    overflow: 'hidden',
  },
  statsContainer: {
    position: 'absolute',
    top: 40,
    left: 0,
    right: 0,
    backgroundColor: 'rgba(0, 0, 0, 0.7)',
    paddingVertical: 12,
    paddingHorizontal: 16,
    zIndex: 10,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(255, 255, 255, 0.2)',
  },
  statsText: {
    color: '#FFF',
    fontSize: 16,
    fontWeight: '600',
    textAlign: 'center',
  },
  processingIndicator: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 8,
  },
  processingText: {
    color: '#FF9500',
    fontSize: 12,
    marginLeft: 8,
    fontWeight: '500',
  },
  instructionsContainer: {
    position: 'absolute',
    bottom: 20,
    left: 0,
    right: 0,
    backgroundColor: 'rgba(0, 0, 0, 0.7)',
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderTopWidth: 1,
    borderTopColor: 'rgba(255, 255, 255, 0.2)',
  },
  instructionsText: {
    color: '#FFF',
    fontSize: 14,
    textAlign: 'center',
    fontWeight: '500',
  },
  loadingOverlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
    alignItems: 'center',
    zIndex: 20,
  },
  loadingText: {
    color: '#FFF',
    fontSize: 14,
    marginTop: 12,
  },
  permissionText: {
    color: '#999',
    fontSize: 14,
    marginTop: 16,
    textAlign: 'center',
  },
  errorText: {
    color: '#FF3B30',
    fontSize: 16,
    fontWeight: '600',
  },
});

export default LiveCameraFeed;

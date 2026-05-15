import React, { useState, useCallback, useRef } from 'react';
import { View, StyleSheet, Alert, Button } from 'react-native';
import LiveCameraFeed from '../components/LiveCameraFeed';
import MarkerDetectionService from '../services/MarkerDetectionService';
import { validateMarker1, isDuplicateMarker } from '../utils/markerValidation';
import { DetectedMarker } from '../types/index';

interface CameraScreenProps {
  onMarkersComplete?: (markers: DetectedMarker[]) => void;
}

export const CameraScreen: React.FC<CameraScreenProps> = ({ onMarkersComplete }) => {
  const [detectedMarkers, setDetectedMarkers] = useState<DetectedMarker[]>([]);
  const [isProcessing, setIsProcessing] = useState(false);
  const processingQueueRef = useRef<boolean>(false);
  const lastDetectionTimeRef = useRef<number>(0);

  const handleMarkerDetected = useCallback(
    async (base64Image: string) => {
      // Prevent duplicate processing
      if (processingQueueRef.current || isProcessing) {
        return;
      }

      // Rate limiting: process at most every 100ms
      const now = Date.now();
      if (now - lastDetectionTimeRef.current < 100) {
        return;
      }
      lastDetectionTimeRef.current = now;

      if (detectedMarkers.length >= 20) {
        return;
      }

      processingQueueRef.current = true;
      setIsProcessing(true);

      try {
        const startTime = performance.now();

        // Step 1: Convert base64 to processable format
        // This would normally be done with native module
        const imageBuffer = base64ToBuffer(base64Image);

        // Step 2: Detect marker using MarkerDetectionService
        const detectionResult = await MarkerDetectionService.detectMarkerInFrame({
          width: 2500,
          height: 2500,
          data: imageBuffer,
        });

        if (!detectionResult.found) {
          console.log('No marker detected in frame');
          processingQueueRef.current = false;
          setIsProcessing(false);
          return;
        }

        // Step 3: Validate marker characteristics
        const validationResult = validateMarker1(base64Image, {
          width: detectionResult.marker!.width,
          height: detectionResult.marker!.height,
          confidence: detectionResult.confidence,
        });

        if (!validationResult.isValid) {
          console.log('Marker validation failed:', validationResult.issues);
          processingQueueRef.current = false;
          setIsProcessing(false);
          return;
        }

        // Step 4: Check for duplicate
        const markerBase64Array = detectedMarkers.map((m) => m.imageBase64);
        if (isDuplicateMarker(base64Image, markerBase64Array, 0.85)) {
          console.log('Duplicate marker detected, skipping');
          processingQueueRef.current = false;
          setIsProcessing(false);
          return;
        }

        // Step 5: Create marker object
        const newMarker: DetectedMarker = {
          id: `marker_${Date.now()}_${Math.random()}`,
          imageBase64: base64Image,
          timestamp: Date.now(),
          confidence: validationResult.confidence,
          rotationAngle: detectionResult.marker?.angle || 0,
        };

        const processingTime = performance.now() - startTime;
        console.log(
          `Marker detected and processed in ${processingTime.toFixed(2)}ms`
        );

        // Step 6: Add to collection
        setDetectedMarkers((prev) => {
          const updated = [...prev, newMarker];

          // Check if we've collected all 20 markers
          if (updated.length === 20) {
            onMarkersComplete?.(updated);
            Alert.alert(
              'Success',
              'All 20 markers have been detected and extracted!'
            );
          } else {
            // Show progress notification
            console.log(`Markers collected: ${updated.length}/20`);
          }

          return updated;
        });
      } catch (error) {
        console.error('Error processing marker:', error);
        Alert.alert('Error', 'Failed to process marker. Please try again.');
      } finally {
        processingQueueRef.current = false;
        setIsProcessing(false);
      }
    },
    [detectedMarkers, isProcessing, onMarkersComplete]
  );

  const handleReset = useCallback(() => {
    Alert.alert(
      'Reset Detection',
      'Are you sure you want to clear all detected markers?',
      [
        { text: 'Cancel', onPress: () => {} },
        {
          text: 'Clear',
          onPress: () => {
            setDetectedMarkers([]);
            lastDetectionTimeRef.current = 0;
          },
          style: 'destructive',
        },
      ]
    );
  }, []);

  return (
    <View style={styles.container}>
      <LiveCameraFeed
        onMarkerDetected={handleMarkerDetected}
        detectedCount={detectedMarkers.length}
        isProcessing={isProcessing}
      />

      {detectedMarkers.length > 0 && (
        <View style={styles.buttonContainer}>
          <Button
            title={`Reset (${detectedMarkers.length}/20 detected)`}
            onPress={handleReset}
            color="#FF3B30"
          />
        </View>
      )}
    </View>
  );
};

/**
 * Convert base64 string to Uint8Array buffer
 */
function base64ToBuffer(base64: string): Uint8Array {
  const binaryString = atob(base64);
  const bytes = new Uint8Array(binaryString.length);
  for (let i = 0; i < binaryString.length; i++) {
    bytes[i] = binaryString.charCodeAt(i);
  }
  return bytes;
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#000',
  },
  buttonContainer: {
    position: 'absolute',
    bottom: 20,
    left: 16,
    right: 16,
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    borderRadius: 8,
    overflow: 'hidden',
  },
});

export default CameraScreen;

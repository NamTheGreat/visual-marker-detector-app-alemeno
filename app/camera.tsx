import React, { useState } from 'react';
import { useRouter } from 'expo-router';
import CameraScreen from '../src/screens/CameraScreen';
import { DetectedMarker } from '../src/types/index';

export default function CameraRoute() {
  const router = useRouter();
  const [detectedMarkers, setDetectedMarkers] = useState<DetectedMarker[]>([]);

  const handleMarkersComplete = (markers: DetectedMarker[]) => {
    setDetectedMarkers(markers);
    router.push({
      pathname: '/results',
      params: {
        markersJson: JSON.stringify(markers),
      },
    });
  };

  return (
    <CameraScreen onMarkersComplete={handleMarkersComplete} />
  );
}

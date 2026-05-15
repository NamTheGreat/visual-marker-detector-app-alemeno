import React, { useState, useEffect } from 'react';
import { useRouter, useLocalSearchParams } from 'expo-router';
import ResultsScreen from '../src/screens/ResultsScreen';
import { DetectedMarker } from '../src/types/index';
import { View, ActivityIndicator } from 'react-native';

export default function ResultsRoute() {
  const router = useRouter();
  const params = useLocalSearchParams();
  const [markers, setMarkers] = useState<DetectedMarker[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    try {
      if (params.markersJson) {
        const parsed = JSON.parse(params.markersJson as string);
        setMarkers(parsed);
      }
    } catch (error) {
      console.error('Error parsing markers:', error);
    } finally {
      setLoading(false);
    }
  }, [params]);

  const handleRetake = () => {
    router.replace('/camera');
  };

  if (loading) {
    return (
      <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
        <ActivityIndicator size="large" color="#007AFF" />
      </View>
    );
  }

  return (
    <ResultsScreen
      markers={markers}
      onRetake={handleRetake}
    />
  );
}

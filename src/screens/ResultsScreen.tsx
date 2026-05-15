import React from 'react';
import {
  View,
  StyleSheet,
  ScrollView,
  Text,
  Button,
  Share,
  Alert,
} from 'react-native';
import { DetectedMarker } from '../types/index';
import MarkerGrid from '../components/MarkerGrid';

interface ResultsScreenProps {
  markers: DetectedMarker[];
  onRetake?: () => void;
}

export const ResultsScreen: React.FC<ResultsScreenProps> = ({
  markers,
  onRetake,
}) => {
  const handleShare = async () => {
    try {
      const timestamp = new Date().toLocaleString();
      const message = `Marker Detection Results\n\nSuccessfully detected ${markers.length} markers\nTimestamp: ${timestamp}`;

      await Share.share({
        message,
        title: 'Marker Detection Results',
      });
    } catch (error) {
      console.error('Error sharing:', error);
      Alert.alert('Error', 'Failed to share results');
    }
  };

  const handleRetake = () => {
    if (onRetake) {
      onRetake();
    }
  };

  const calculateStats = () => {
    const avgConfidence =
      markers.reduce((sum, m) => sum + m.confidence, 0) / markers.length;
    const avgRotation =
      markers.reduce((sum, m) => sum + Math.abs(m.rotationAngle), 0) /
      markers.length;

    return {
      avgConfidence: (avgConfidence * 100).toFixed(1),
      avgRotation: avgRotation.toFixed(1),
      totalTime: markers.length > 0
        ? (markers[markers.length - 1].timestamp - markers[0].timestamp) / 1000
        : 0,
    };
  };

  const stats = calculateStats();

  return (
    <ScrollView style={styles.container}>
      <View style={styles.summaryContainer}>
        <Text style={styles.summaryTitle}>Detection Summary</Text>

        <View style={styles.statsRow}>
          <View style={styles.statBox}>
            <Text style={styles.statLabel}>Total Markers</Text>
            <Text style={styles.statValue}>{markers.length}</Text>
          </View>
          <View style={styles.statBox}>
            <Text style={styles.statLabel}>Avg Confidence</Text>
            <Text style={styles.statValue}>{stats.avgConfidence}%</Text>
          </View>
          <View style={styles.statBox}>
            <Text style={styles.statLabel}>Avg Rotation</Text>
            <Text style={styles.statValue}>{stats.avgRotation}°</Text>
          </View>
        </View>

        <View style={styles.statsRow}>
          <View style={[styles.statBox, styles.fullWidth]}>
            <Text style={styles.statLabel}>Total Collection Time</Text>
            <Text style={styles.statValue}>{stats.totalTime.toFixed(1)}s</Text>
          </View>
        </View>
      </View>

      <MarkerGrid markers={markers} />

      <View style={styles.buttonContainer}>
        <Button
          title="Share Results"
          onPress={handleShare}
          color="#007AFF"
        />
      </View>

      <View style={styles.buttonContainer}>
        <Button
          title="Detect More Markers"
          onPress={handleRetake}
          color="#34C759"
        />
      </View>

      <View style={styles.footerContainer}>
        <Text style={styles.footerText}>
          Marker Detection App v1.0
        </Text>
        <Text style={styles.footerText}>
          Powered by OpenCV
        </Text>
      </View>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F5F5F5',
  },
  summaryContainer: {
    backgroundColor: '#FFF',
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#E5E5E5',
  },
  summaryTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: '#000',
    marginBottom: 12,
  },
  statsRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 12,
  },
  statBox: {
    flex: 1,
    backgroundColor: '#F9F9F9',
    borderRadius: 8,
    padding: 12,
    marginHorizontal: 4,
    borderWidth: 1,
    borderColor: '#E5E5E5',
  },
  fullWidth: {
    marginHorizontal: 0,
  },
  statLabel: {
    fontSize: 12,
    color: '#999',
    fontWeight: '500',
    marginBottom: 6,
  },
  statValue: {
    fontSize: 16,
    fontWeight: '700',
    color: '#007AFF',
  },
  buttonContainer: {
    margin: 16,
    borderRadius: 8,
    overflow: 'hidden',
    backgroundColor: '#FFF',
    borderWidth: 1,
    borderColor: '#E5E5E5',
  },
  footerContainer: {
    alignItems: 'center',
    paddingVertical: 24,
    borderTopWidth: 1,
    borderTopColor: '#E5E5E5',
  },
  footerText: {
    fontSize: 12,
    color: '#999',
    marginVertical: 2,
  },
});

export default ResultsScreen;

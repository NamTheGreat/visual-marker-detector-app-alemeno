import React from 'react';
import {
  View,
  StyleSheet,
  Image,
  FlatList,
  Dimensions,
  Text,
  ScrollView,
} from 'react-native';
import { DetectedMarker } from '../types/index';

interface MarkerGridProps {
  markers: DetectedMarker[];
  onRetake?: () => void;
}

const MARKER_SIZE = 300;
const COLUMNS = 4;

export const MarkerGrid: React.FC<MarkerGridProps> = ({ markers, onRetake }) => {
  const screenWidth = Dimensions.get('window').width;
  const markerDisplaySize = Math.floor((screenWidth - 48) / COLUMNS);

  const renderMarkerItem = ({ item, index }: { item: DetectedMarker; index: number }) => (
    <View key={item.id} style={styles.markerContainer}>
      <Image
        source={{ uri: `data:image/jpeg;base64,${item.imageBase64}` }}
        style={[
          styles.markerImage,
          {
            width: markerDisplaySize,
            height: markerDisplaySize,
          },
        ]}
      />
      <Text style={styles.markerIndex}>#{index + 1}</Text>
      <Text style={styles.markerConfidence}>
        {(item.confidence * 100).toFixed(1)}%
      </Text>
    </View>
  );

  return (
    <ScrollView style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Detected Markers</Text>
        <Text style={styles.headerSubtitle}>
          {markers.length}/20 markers extracted
        </Text>
      </View>

      <View style={styles.gridContainer}>
        <FlatList
          data={markers}
          renderItem={renderMarkerItem}
          keyExtractor={(item) => item.id}
          numColumns={COLUMNS}
          scrollEnabled={false}
          contentContainerStyle={styles.gridContent}
        />
      </View>

      {markers.length === 20 && (
        <View style={styles.completeContainer}>
          <Text style={styles.completeText}>✓ All 20 markers successfully detected!</Text>
        </View>
      )}
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F5F5F5',
  },
  header: {
    backgroundColor: '#FFF',
    paddingVertical: 16,
    paddingHorizontal: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#E5E5E5',
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: '700',
    color: '#000',
  },
  headerSubtitle: {
    fontSize: 14,
    color: '#999',
    marginTop: 4,
  },
  gridContainer: {
    padding: 16,
  },
  gridContent: {
    justifyContent: 'space-between',
  },
  markerContainer: {
    margin: 4,
    alignItems: 'center',
  },
  markerImage: {
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#E5E5E5',
    backgroundColor: '#FFF',
  },
  markerIndex: {
    marginTop: 6,
    fontSize: 12,
    fontWeight: '600',
    color: '#333',
  },
  markerConfidence: {
    fontSize: 11,
    color: '#999',
    marginTop: 2,
  },
  completeContainer: {
    backgroundColor: '#D4EDDA',
    borderRadius: 8,
    padding: 16,
    margin: 16,
    borderLeftWidth: 4,
    borderLeftColor: '#28A745',
  },
  completeText: {
    color: '#28A745',
    fontSize: 14,
    fontWeight: '600',
    textAlign: 'center',
  },
});

export default MarkerGrid;

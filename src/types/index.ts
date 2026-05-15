export interface DetectedMarker {
  id: string;
  imageBase64: string;
  timestamp: number;
  confidence: number;
  rotationAngle: number;
}

export interface MarkerDetectionResult {
  found: boolean;
  marker?: {
    x: number;
    y: number;
    width: number;
    height: number;
    angle: number;
  };
  confidence: number;
  processTime: number;
}

export interface CameraFrameData {
  uri: string;
  width: number;
  height: number;
  base64?: string;
}

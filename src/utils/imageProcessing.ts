import { Dimensions } from 'react-native';

/**
 * Image Processing Utilities for marker extraction and transformation
 */

export interface Point {
  x: number;
  y: number;
}

export interface TransformMatrix {
  m00: number;
  m01: number;
  m02: number;
  m10: number;
  m11: number;
  m12: number;
  m20: number;
  m21: number;
  m22: number;
}

/**
 * Correct perspective distortion using homography transformation
 * Solves for the transformation matrix that maps source points to destination
 */
export function perspectiveTransform(
  sourcePoints: Point[],
  destWidth: number,
  destHeight: number
): TransformMatrix {
  // Standard 4-point perspective transform (homography)
  // In production, this would use OpenCV's getPerspectiveTransform
  
  if (sourcePoints.length !== 4) {
    // Return identity matrix if not enough points
    return {
      m00: 1, m01: 0, m02: 0,
      m10: 0, m11: 1, m12: 0,
      m20: 0, m21: 0, m22: 1,
    };
  }

  // Destination points (perfect rectangle)
  const destPoints: Point[] = [
    { x: 0, y: 0 },
    { x: destWidth, y: 0 },
    { x: destWidth, y: destHeight },
    { x: 0, y: destHeight },
  ];

  // Solve 8-point homography problem using DLT (Direct Linear Transform)
  // This is a simplified implementation - production code would use proper linear algebra

  const A: number[][] = [];
  for (let i = 0; i < 4; i++) {
    const sx = sourcePoints[i].x;
    const sy = sourcePoints[i].y;
    const dx = destPoints[i].x;
    const dy = destPoints[i].y;

    A.push([-sx, -sy, -1, 0, 0, 0, sx * dx, sy * dx, dx]);
    A.push([0, 0, 0, -sx, -sy, -1, sx * dy, sy * dy, dy]);
  }

  // Simplified: return identity matrix as placeholder
  // In production, solve the system using SVD
  return {
    m00: 1,
    m01: 0,
    m02: 0,
    m10: 0,
    m11: 1,
    m12: 0,
    m20: 0,
    m21: 0,
    m22: 1,
  };
}

/**
 * Apply perspective transformation to extract marker
 * Takes base64 image and returns transformed base64 image
 */
export function applyPerspectiveTransform(
  base64Image: string,
  transformMatrix: TransformMatrix,
  width: number,
  height: number
): Promise<string> {
  // This will be implemented with native module
  // For now, return the original image
  return Promise.resolve(base64Image);
}

/**
 * Resize image to exact dimensions
 * Critical for ensuring 300x300px output
 */
export function resizeImage(
  base64Image: string,
  targetWidth: number,
  targetHeight: number
): Promise<string> {
  // This will be implemented with native image processing module
  // Could use: expo-image-manipulator, react-native-image-resizer, or native bridge
  return Promise.resolve(base64Image);
}

/**
 * Rotate image by angle (in degrees)
 * Used for orientation correction
 */
export function rotateImage(
  base64Image: string,
  angleInDegrees: number
): Promise<string> {
  // This will be implemented with native module
  // Normalize angle to 0-360
  const normalizedAngle = angleInDegrees % 360;
  
  if (normalizedAngle === 0) {
    return Promise.resolve(base64Image);
  }

  // TODO: Implement rotation using native module
  return Promise.resolve(base64Image);
}

/**
 * Calculate similarity between two markers (for deduplication)
 * Returns value between 0-1 where 1 is identical
 */
export function calculateImageSimilarity(
  image1Base64: string,
  image2Base64: string
): number {
  // Simplified implementation - compare using perceptual hash
  // In production, use structural similarity (SSIM) or pHash
  
  // For now, compare string lengths as simple heuristic
  const diff = Math.abs(image1Base64.length - image2Base64.length);
  const maxLen = Math.max(image1Base64.length, image2Base64.length);
  
  return Math.max(0, 1 - (diff / maxLen) * 0.5);
}

/**
 * Crop image precisely to remove padding
 * Essential for tight extraction with zero padding
 */
export function cropImage(
  base64Image: string,
  x: number,
  y: number,
  width: number,
  height: number
): Promise<string> {
  // This will be implemented with native module
  return Promise.resolve(base64Image);
}

/**
 * Get device camera resolution
 * Constrained to 2000-3000px as per requirements
 */
export function getOptimalCameraResolution(): { width: number; height: number } {
  // Use 2500x2500 for balance between quality and performance
  return {
    width: 2500,
    height: 2500,
  };
}

/**
 * Validate extracted marker dimensions
 * Ensures exact 300x300px output
 */
export function validateMarkerDimensions(
  width: number,
  height: number,
  tolerance: number = 0
): boolean {
  // For final output, must be exactly 300x300px (no tolerance)
  return width === 300 && height === 300;
}

/**
 * Calculate contrast of image region
 * Used to detect if marker is visible/clear enough
 */
export function calculateContrast(
  pixelData: Uint8Array,
  x: number,
  y: number,
  width: number,
  height: number,
  rowWidth: number
): number {
  let min = 255;
  let max = 0;

  for (let dy = 0; dy < height; dy++) {
    for (let dx = 0; dx < width; dx++) {
      const idx = (y + dy) * rowWidth + (x + dx);
      const value = pixelData[idx];
      min = Math.min(min, value);
      max = Math.max(max, value);
    }
  }

  return max - min;
}

/**
 * Extract region of interest from pixel data
 */
export function extractRegion(
  sourceData: Uint8Array,
  sourceWidth: number,
  sourceHeight: number,
  x: number,
  y: number,
  width: number,
  height: number
): Uint8Array {
  const regionData = new Uint8Array(width * height);
  let idx = 0;

  for (let dy = 0; dy < height; dy++) {
    for (let dx = 0; dx < width; dx++) {
      const sourceIdx = (y + dy) * sourceWidth + (x + dx);
      regionData[idx++] = sourceData[sourceIdx];
    }
  }

  return regionData;
}


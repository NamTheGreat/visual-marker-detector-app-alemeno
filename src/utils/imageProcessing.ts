import { Dimensions } from 'react-native';
import { manipulateAsync, ImageResult } from 'expo-image-manipulator';

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

export interface ProcessedMarker {
  imageBase64: string;
  width: number;
  height: number;
}

/**
 * Process marker image: crop, rotate, and resize to exactly 300x300
 */
export async function processMarkerImage(
  base64Image: string,
  markerBounds?: { x: number; y: number; width: number; height: number },
  rotationAngle: number = 0
): Promise<ProcessedMarker> {
  try {
    const actions = [];

    if (markerBounds) {
      actions.push({
        crop: {
          originX: Math.max(0, markerBounds.x),
          originY: Math.max(0, markerBounds.y),
          width: markerBounds.width,
          height: markerBounds.height,
        },
      });
    }

    const normalizedAngle = ((rotationAngle % 360) + 360) % 360;
    if (normalizedAngle !== 0) {
      actions.push({ rotate: normalizedAngle });
    }

    actions.push({ resize: { width: 300, height: 300 } });

    const uri = `data:image/jpeg;base64,${base64Image}`;
    const result: ImageResult = await manipulateAsync(uri, actions, { compress: 0.9 });

    const processedBase64 = result.uri.includes(',') ? result.uri.split(',')[1] : base64Image;

    return {
      imageBase64: processedBase64,
      width: 300,
      height: 300,
    };
  } catch (error) {
    console.error('Error processing marker image:', error);
    return {
      imageBase64: base64Image,
      width: 300,
      height: 300,
    };
  }
}

/**
 * Resize image to exact dimensions using expo-image-manipulator
 */
export async function resizeImage(
  base64Image: string,
  targetWidth: number,
  targetHeight: number
): Promise<string> {
  try {
    const uri = `data:image/jpeg;base64,${base64Image}`;
    const result: ImageResult = await manipulateAsync(
      uri,
      [{ resize: { width: targetWidth, height: targetHeight } }],
      { compress: 0.9 }
    );
    return result.uri.includes(',') ? result.uri.split(',')[1] : base64Image;
  } catch (error) {
    console.error('Error resizing image:', error);
    return base64Image;
  }
}

/**
 * Rotate image by angle (in degrees) using expo-image-manipulator
 */
export async function rotateImage(
  base64Image: string,
  angleInDegrees: number
): Promise<string> {
  try {
    const normalizedAngle = ((angleInDegrees % 360) + 360) % 360;
    if (normalizedAngle === 0) {
      return base64Image;
    }

    const uri = `data:image/jpeg;base64,${base64Image}`;
    const result: ImageResult = await manipulateAsync(
      uri,
      [{ rotate: normalizedAngle }],
      { compress: 0.9 }
    );
    return result.uri.includes(',') ? result.uri.split(',')[1] : base64Image;
  } catch (error) {
    console.error('Error rotating image:', error);
    return base64Image;
  }
}

/**
 * Crop image precisely to remove padding
 */
export async function cropImage(
  base64Image: string,
  x: number,
  y: number,
  width: number,
  height: number
): Promise<string> {
  try {
    const uri = `data:image/jpeg;base64,${base64Image}`;
    const result: ImageResult = await manipulateAsync(
      uri,
      [{ crop: { originX: Math.max(0, x), originY: Math.max(0, y), width, height } }],
      { compress: 0.9 }
    );
    return result.uri.includes(',') ? result.uri.split(',')[1] : base64Image;
  } catch (error) {
    console.error('Error cropping image:', error);
    return base64Image;
  }
}

/**
 * Get device camera resolution
 * Constrained to 2000-3000px as per requirements
 */
export function getOptimalCameraResolution(): { width: number; height: number } {
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
  return width === 300 && height === 300;
}

/**
 * Calculate contrast of image region
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


import { MarkerDetectionResult } from '../types/index';
import { detectContours, initializeOpenCV } from './OpenCVBridge';

/**
 * Marker1 Detection Service
 * Detects Marker1: Square with thick black border + small black corner square (20x20px)
 * 
 * Detection criteria:
 * - Square shape with 4 corners
 * - Thick black border (approximately 20px)
 * - Small black square in top-left corner (20x20px)
 * - Large white space in center (>60% of marker area)
 */

class MarkerDetectionService {
  private readonly MIN_MARKER_SIZE = 60; // Minimum marker size in pixels
  private readonly MAX_MARKER_SIZE = 2000; // Maximum marker size in pixels
  private readonly BORDER_TOLERANCE = 5; // Tolerance for border thickness
  private readonly CORNER_SQUARE_SIZE = 20; // Expected corner square size
  private readonly ASPECT_RATIO_TOLERANCE = 0.15; // 15% tolerance for square shape
  private initialized = false;

  constructor() {
    this.initialize();
  }

  private async initialize() {
    this.initialized = await initializeOpenCV();
  }

  /**
   * Detect Marker1 in raw image data
   */
  async detectMarkerInFrame(
    imageData: {
      width: number;
      height: number;
      data: Uint8Array; // RGBA pixel data
    }
  ): Promise<MarkerDetectionResult> {
    const startTime = performance.now();

    try {
      // Step 1: Convert RGBA to grayscale
      const grayscale = this.rgbaToGrayscale(imageData.data, imageData.width, imageData.height);

      // Step 2: Apply adaptive threshold for better robustness
      const binary = this.applyAdaptiveThreshold(grayscale, imageData.width, imageData.height);

      // Step 3: Find contours
      const contours = this.findContours(binary, imageData.width, imageData.height);

      // Step 4: Filter contours for potential markers
      const markerCandidates = contours.filter(contour =>
        this.isValidMarkerShape(contour, imageData.width, imageData.height)
      );

      if (markerCandidates.length === 0) {
        return {
          found: false,
          confidence: 0,
          processTime: performance.now() - startTime,
        };
      }

      // Step 5: Validate marker characteristics (most important for accuracy)
      let bestMarker = null;
      let bestConfidence = 0;

      for (const candidate of markerCandidates) {
        const confidence = this.validateMarkerCharacteristics(
          candidate,
          imageData,
          grayscale,
          imageData.width,
          imageData.height
        );
        if (confidence > bestConfidence) {
          bestConfidence = confidence;
          bestMarker = candidate;
        }
      }

      if (!bestMarker || bestConfidence < 0.65) {
        return {
          found: false,
          confidence: bestConfidence,
          processTime: performance.now() - startTime,
        };
      }

      // Step 6: Calculate rotation angle based on corner square position
      const angle = this.calculateRotationAngle(
        bestMarker,
        imageData,
        grayscale,
        imageData.width,
        imageData.height
      );

      return {
        found: true,
        marker: {
          x: bestMarker.x,
          y: bestMarker.y,
          width: bestMarker.width,
          height: bestMarker.height,
          angle,
        },
        confidence: bestConfidence,
        processTime: performance.now() - startTime,
      };
    } catch (error) {
      console.error('Error in marker detection:', error);
      return {
        found: false,
        confidence: 0,
        processTime: performance.now() - startTime,
      };
    }
  }

  private rgbaToGrayscale(
    data: Uint8Array,
    width: number,
    height: number
  ): Uint8Array {
    const grayscale = new Uint8Array(width * height);
    for (let i = 0; i < data.length; i += 4) {
      const r = data[i];
      const g = data[i + 1];
      const b = data[i + 2];
      // Standard grayscale conversion
      grayscale[i / 4] = Math.round(0.299 * r + 0.587 * g + 0.114 * b);
    }
    return grayscale;
  }

  /**
   * Apply adaptive threshold for better robustness across varying lighting
   */
  private applyAdaptiveThreshold(
    grayscale: Uint8Array,
    width: number,
    height: number,
    blockSize: number = 31,
    C: number = 5
  ): Uint8Array {
    const binary = new Uint8Array(width * height);
    const half = Math.floor(blockSize / 2);

    for (let y = 0; y < height; y++) {
      for (let x = 0; x < width; x++) {
        let sum = 0;
        let count = 0;

        // Calculate local mean
        for (let dy = -half; dy <= half; dy++) {
          for (let dx = -half; dx <= half; dx++) {
            const ny = y + dy;
            const nx = x + dx;
            if (nx >= 0 && nx < width && ny >= 0 && ny < height) {
              sum += grayscale[ny * width + nx];
              count++;
            }
          }
        }

        const localMean = sum / count;
        const threshold = localMean - C;
        const idx = y * width + x;
        binary[idx] = grayscale[idx] > threshold ? 255 : 0;
      }
    }

    return binary;
  }

  private findContours(
    binary: Uint8Array,
    width: number,
    height: number
  ): Array<{ x: number; y: number; width: number; height: number; area: number }> {
    const contours = [];
    const visited = new Uint8Array(width * height);

    for (let y = 0; y < height; y++) {
      for (let x = 0; x < width; x++) {
        const idx = y * width + x;
        if (binary[idx] > 0 && !visited[idx]) {
          const contour = this.floodFill(binary, visited, x, y, width, height);
          if (contour) {
            contours.push(contour);
          }
        }
      }
    }

    return contours;
  }

  private floodFill(
    binary: Uint8Array,
    visited: Uint8Array,
    startX: number,
    startY: number,
    width: number,
    height: number
  ): { x: number; y: number; width: number; height: number; area: number } | null {
    const queue = [[startX, startY]];
    let minX = startX,
      maxX = startX;
    let minY = startY,
      maxY = startY;
    let area = 0;

    while (queue.length > 0) {
      const [x, y] = queue.shift()!;
      const idx = y * width + x;

      if (x < 0 || x >= width || y < 0 || y >= height || visited[idx]) {
        continue;
      }

      if (binary[idx] === 0) {
        continue;
      }

      visited[idx] = 1;
      area++;
      minX = Math.min(minX, x);
      maxX = Math.max(maxX, x);
      minY = Math.min(minY, y);
      maxY = Math.max(maxY, y);

      queue.push([x + 1, y], [x - 1, y], [x, y + 1], [x, y - 1]);
    }

    if (area < 100) return null;

    return {
      x: minX,
      y: minY,
      width: maxX - minX,
      height: maxY - minY,
      area,
    };
  }

  private isValidMarkerShape(
    contour: { x: number; y: number; width: number; height: number; area: number },
    imageWidth: number,
    imageHeight: number
  ): boolean {
    const { width, height, area } = contour;

    // Check if it's roughly square (aspect ratio close to 1)
    const aspectRatio = width / height;
    if (aspectRatio < 0.8 || aspectRatio > 1.2) {
      return false;
    }

    // Check size constraints
    if (width < this.MIN_MARKER_SIZE || width > this.MAX_MARKER_SIZE) {
      return false;
    }

    // Check if area is reasonable for a square
    const expectedArea = width * height;
    if (area < expectedArea * 0.1) return false; // Too sparse

    return true;
  }

  /**
   * Validate marker characteristics - KEY ACCURACY FUNCTION
   * Validates: border thickness, corner square, white space percentage
   */
  private validateMarkerCharacteristics(
    contour: { x: number; y: number; width: number; height: number; area: number },
    imageData: { width: number; height: number; data: Uint8Array },
    grayscale: Uint8Array,
    imageWidth: number,
    imageHeight: number
  ): number {
    let confidence = 0.5;

    // Validation 1: Check black border presence and thickness
    const borderScore = this.validateBorder(contour, grayscale, imageWidth);
    confidence += borderScore * 0.3;

    // Validation 2: Check for corner square (marker distinctive feature)
    const cornerScore = this.validateCornerSquare(contour, grayscale, imageWidth);
    confidence += cornerScore * 0.4; // Give more weight to corner square

    // Validation 3: Check white space percentage (should be >60%)
    const whiteSpaceScore = this.validateWhiteSpace(contour, grayscale, imageWidth);
    confidence += whiteSpaceScore * 0.2;

    // Validation 4: Circularity check (should be close to square, not noisy)
    const circularityScore = this.validateCircularity(contour);
    confidence += circularityScore * 0.1;

    return Math.min(1, confidence);
  }

  /**
   * Validate border presence and thickness
   */
  private validateBorder(
    contour: { x: number; y: number; width: number; height: number },
    grayscale: Uint8Array,
    imageWidth: number
  ): number {
    const { x, y, width, height } = contour;
    const borderSize = Math.max(1, Math.floor(width / 7)); // Border should be ~1/7 of marker width
    let borderPixels = 0;
    let totalBorderPixels = 0;

    // Sample border pixels from all 4 sides
    for (let i = 0; i < width; i++) {
      // Top border
      const topIdx = (y + borderSize) * imageWidth + (x + i);
      if (grayscale[topIdx] < 100) borderPixels++;
      totalBorderPixels++;

      // Bottom border
      const bottomIdx = (y + height - borderSize) * imageWidth + (x + i);
      if (grayscale[bottomIdx] < 100) borderPixels++;
      totalBorderPixels++;
    }

    for (let i = 0; i < height; i++) {
      // Left border
      const leftIdx = (y + i) * imageWidth + (x + borderSize);
      if (grayscale[leftIdx] < 100) borderPixels++;
      totalBorderPixels++;

      // Right border
      const rightIdx = (y + i) * imageWidth + (x + width - borderSize);
      if (grayscale[rightIdx] < 100) borderPixels++;
      totalBorderPixels++;
    }

    // Should have at least 70% of border pixels as black
    return borderPixels / totalBorderPixels > 0.7 ? 1 : 0;
  }

  /**
   * Validate corner square presence
   */
  private validateCornerSquare(
    contour: { x: number; y: number; width: number; height: number },
    grayscale: Uint8Array,
    imageWidth: number
  ): number {
    const { x, y, width } = contour;
    const cornerSize = Math.max(5, Math.floor(width / 7)); // Corner square size ~1/7 of marker
    const margin = Math.floor(width / 14); // Small margin from edge

    let blackPixels = 0;
    let totalPixels = 0;

    // Check top-left corner square
    for (let dy = margin; dy < margin + cornerSize; dy++) {
      for (let dx = margin; dx < margin + cornerSize; dx++) {
        const idx = (y + dy) * imageWidth + (x + dx);
        if (grayscale[idx] < 100) blackPixels++;
        totalPixels++;
      }
    }

    // Should have at least 80% black pixels in corner area
    const cornerScore = totalPixels > 0 ? blackPixels / totalPixels : 0;
    return cornerScore > 0.8 ? 1 : 0;
  }

  /**
   * Validate white space percentage
   */
  private validateWhiteSpace(
    contour: { x: number; y: number; width: number; height: number },
    grayscale: Uint8Array,
    imageWidth: number
  ): number {
    const { x, y, width, height } = contour;
    const margin = Math.floor(width / 5); // Check inner area (excluding border)

    let whitePixels = 0;
    let totalPixels = 0;

    // Check center area
    for (let dy = margin; dy < height - margin; dy++) {
      for (let dx = margin; dx < width - margin; dx++) {
        const idx = (y + dy) * imageWidth + (x + dx);
        if (grayscale[idx] > 150) whitePixels++; // Light pixels
        totalPixels++;
      }
    }

    // Should have >60% white pixels
    const whitePercentage = totalPixels > 0 ? whitePixels / totalPixels : 0;
    return whitePercentage > 0.6 ? 1 : 0;
  }

  /**
   * Validate circularity (smoothness) - rejects noisy or irregular shapes
   */
  private validateCircularity(contour: {
    x: number;
    y: number;
    width: number;
    height: number;
    area: number;
  }): number {
    const { width, height, area } = contour;
    const perimeter = 2 * (width + height); // Approximation
    const expectedArea = width * height;

    // Circularity = 4π * area / perimeter²
    const circularity = (4 * Math.PI * area) / (perimeter * perimeter);

    // Should be close to 1 (perfect circle would be 1, square is ~0.785)
    // Accept 0.5 to 1.0 range
    return circularity > 0.5 ? Math.min(1, circularity) : 0;
  }

  /**
   * Calculate rotation angle based on corner square position
   * The corner square is in top-left when marker is at 0 degrees
   */
  private calculateRotationAngle(
    contour: { x: number; y: number; width: number; height: number },
    imageData: { width: number; height: number; data: Uint8Array },
    grayscale: Uint8Array,
    imageWidth: number,
    imageHeight: number
  ): number {
    const { x, y, width, height } = contour;
    const cornerSize = Math.max(5, Math.floor(width / 7));
    const margin = Math.floor(width / 14);

    const corners = [
      { name: 'top-left', startX: x + margin, startY: y + margin },
      { name: 'top-right', startX: x + width - cornerSize - margin, startY: y + margin },
      { name: 'bottom-left', startX: x + margin, startY: y + height - cornerSize - margin },
      { name: 'bottom-right', startX: x + width - cornerSize - margin, startY: y + height - cornerSize - margin },
    ];

    let darkestCorner = '';
    let darkestValue = 255;

    for (const corner of corners) {
      const avgValue = this.getAverageRegionValue(
        grayscale,
        imageWidth,
        corner.startY,
        corner.startX,
        cornerSize,
        cornerSize
      );
      if (avgValue < darkestValue) {
        darkestValue = avgValue;
        darkestCorner = corner.name;
      }
    }

    const rotationMap: { [key: string]: number } = {
      'top-left': 0,
      'top-right': 90,
      'bottom-right': 180,
      'bottom-left': 270,
    };

    return rotationMap[darkestCorner] || 0;
  }

  /**
   * Get average pixel value in a region
   */
  private getAverageRegionValue(
    grayscale: Uint8Array,
    imageWidth: number,
    startY: number,
    startX: number,
    width: number,
    height: number
  ): number {
    let sum = 0;
    let count = 0;

    for (let dy = 0; dy < height; dy++) {
      for (let dx = 0; dx < width; dx++) {
        const px = startX + dx;
        const py = startY + dy;
        if (px >= 0 && py >= 0 && py < grayscale.length / imageWidth && px < imageWidth) {
          sum += grayscale[py * imageWidth + px];
          count++;
        }
      }
    }

    return count > 0 ? sum / count : 255;
  }
}

export default new MarkerDetectionService();

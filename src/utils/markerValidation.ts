/**
 * Marker Validation Utilities for Marker1
 * 
 * Marker1 Characteristics:
 * - Square shape (140x140px base)
 * - Thick black border (20px)
 * - Small black square in top-left corner (20x20px)
 * - Large white space in center
 * - Printable and machine-readable
 */

export interface MarkerValidationResult {
  isValid: boolean;
  confidence: number;
  issues: string[];
}

/**
 * Validate if detected contour matches Marker1 characteristics
 */
export function validateMarker1(
  markerImage: string, // Base64 encoded image
  metadata: {
    width: number;
    height: number;
    confidence: number;
  }
): MarkerValidationResult {
  const issues: string[] = [];
  let confidence = 0.5;

  // Validation 1: Square shape
  if (Math.abs(metadata.width - metadata.height) > 5) {
    issues.push('Not square: aspect ratio too skewed');
    confidence -= 0.2;
  } else {
    confidence += 0.1;
  }

  // Validation 2: Minimum size
  if (metadata.width < 60 || metadata.height < 60) {
    issues.push('Too small: minimum 60x60px required');
    confidence -= 0.3;
  } else {
    confidence += 0.05;
  }

  // Validation 3: Maximum size
  if (metadata.width > 2000 || metadata.height > 2000) {
    issues.push('Too large: maximum 2000x2000px');
    confidence -= 0.3;
  } else {
    confidence += 0.05;
  }

  // TODO: Add more validations
  // - Border thickness validation
  // - Corner square detection
  // - White space percentage
  // - Black to white ratio

  const isValid = confidence > 0.6 && issues.length === 0;

  return {
    isValid,
    confidence: Math.max(0, Math.min(1, confidence)),
    issues,
  };
}

/**
 * Check if marker is not from incorrect marker images
 * Rejects markers with additional elements (like X mark, emoji, etc.)
 */
export function rejectIncorrectMarkerPatterns(
  markerImage: string
): boolean {
  // TODO: Use image comparison or template matching
  // to reject images that don't match Marker1 exactly
  // This will be enhanced with native image processing

  // For now, assume all are valid - will be improved
  return true;
}

/**
 * Calculate confidence score for marker
 */
export function calculateMarkerConfidence(
  detectionConfidence: number,
  validationResult: MarkerValidationResult
): number {
  // Combine detection confidence with validation confidence
  return (detectionConfidence + validationResult.confidence) / 2;
}

/**
 * Check if detected marker is duplicate/similar to already detected ones
 * Uses perceptual hashing or structural similarity
 */
export function isDuplicateMarker(
  newMarkerBase64: string,
  existingMarkers: string[],
  threshold: number = 0.9
): boolean {
  for (const existingMarker of existingMarkers) {
    const similarity = calculatePerceptualSimilarity(newMarkerBase64, existingMarker);
    if (similarity > threshold) {
      return true;
    }
  }
  return false;
}

/**
 * Calculate perceptual similarity between two marker images
 * Returns value between 0-1 where 1 is identical
 */
function calculatePerceptualSimilarity(image1: string, image2: string): number {
  // TODO: Implement perceptual hashing (pHash)
  // or structural similarity index (SSIM)
  // For now, return 0 (no similarity)
  return 0;
}

/**
 * Verify marker has sufficient white space (>60% as per requirement)
 */
export function verifyWhiteSpacePercentage(
  markerImage: string,
  minimumPercentage: number = 60
): boolean {
  // TODO: Calculate white pixel percentage
  // Return true if white space >= minimumPercentage
  return true;
}

/**
 * Verify marker has proper black border
 */
export function verifyBlackBorder(
  markerImage: string,
  borderThickness: number = 20,
  tolerance: number = 2
): boolean {
  // TODO: Verify border thickness is within tolerance
  return true;
}

/**
 * Verify corner square detection (top-left 20x20px black square)
 */
export function verifyCornerSquare(markerImage: string): boolean {
  // TODO: Verify corner square exists and is properly positioned
  return true;
}

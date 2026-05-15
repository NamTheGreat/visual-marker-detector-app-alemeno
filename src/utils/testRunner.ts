/**
 * Test Utilities for Marker Detection
 * Tests the marker detection against provided test images
 */

import * as FileSystem from 'expo-file-system';
import MarkerDetectionService from '../services/MarkerDetectionService';

export interface TestResult {
  testName: string;
  imagePath: string;
  passed: boolean;
  detected: boolean;
  confidence: number;
  processingTime: number;
  message: string;
}

/**
 * Load image from file system and convert to pixel data
 */
export async function loadImageAsPixelData(
  imagePath: string
): Promise<{ width: number; height: number; data: Uint8Array } | null> {
  try {
    const base64 = await FileSystem.readAsStringAsync(imagePath, {
      encoding: FileSystem.EncodingType.Base64,
    });

    // TODO: Decode base64 to pixel data
    // This requires image decoding which would be implemented with native module

    return null;
  } catch (error) {
    console.error('Error loading image:', error);
    return null;
  }
}

/**
 * Test marker detection against correct marker images
 * Should detect and return high confidence
 */
export async function testCorrectMarkerImages(
  imagePaths: string[]
): Promise<TestResult[]> {
  const results: TestResult[] = [];

  for (const imagePath of imagePaths) {
    const pixelData = await loadImageAsPixelData(imagePath);
    if (!pixelData) {
      results.push({
        testName: 'Load Correct Image',
        imagePath,
        passed: false,
        detected: false,
        confidence: 0,
        processingTime: 0,
        message: 'Failed to load image',
      });
      continue;
    }

    const result = await MarkerDetectionService.detectMarkerInFrame(pixelData);

    results.push({
      testName: 'Detect Correct Marker',
      imagePath,
      passed: result.found && result.confidence > 0.7,
      detected: result.found,
      confidence: result.confidence,
      processingTime: result.processTime,
      message: result.found
        ? `✓ Detected with ${(result.confidence * 100).toFixed(1)}% confidence in ${result.processTime.toFixed(2)}ms`
        : `✗ Not detected (confidence: ${(result.confidence * 100).toFixed(1)}%)`,
    });
  }

  return results;
}

/**
 * Test marker detection against incorrect marker images
 * Should NOT detect
 */
export async function testIncorrectMarkerImages(
  imagePaths: string[]
): Promise<TestResult[]> {
  const results: TestResult[] = [];

  for (const imagePath of imagePaths) {
    const pixelData = await loadImageAsPixelData(imagePath);
    if (!pixelData) {
      results.push({
        testName: 'Load Incorrect Image',
        imagePath,
        passed: false,
        detected: false,
        confidence: 0,
        processingTime: 0,
        message: 'Failed to load image',
      });
      continue;
    }

    const result = await MarkerDetectionService.detectMarkerInFrame(pixelData);

    // For incorrect images, we want them to NOT be detected or have low confidence
    const passed = !result.found || result.confidence < 0.65;

    results.push({
      testName: 'Reject Incorrect Marker',
      imagePath,
      passed,
      detected: result.found,
      confidence: result.confidence,
      processingTime: result.processTime,
      message: !result.found
        ? `✓ Correctly rejected (confidence: ${(result.confidence * 100).toFixed(1)}%)`
        : `✗ False positive detected with ${(result.confidence * 100).toFixed(1)}% confidence`,
    });
  }

  return results;
}

/**
 * Run comprehensive test suite
 */
export async function runComprehensiveTests(
  correctImagePaths: string[],
  incorrectImagePaths: string[]
): Promise<{ correctResults: TestResult[]; incorrectResults: TestResult[]; summary: TestSummary }> {
  const correctResults = await testCorrectMarkerImages(correctImagePaths);
  const incorrectResults = await testIncorrectMarkerImages(incorrectImagePaths);

  const totalTests = correctResults.length + incorrectResults.length;
  const passedTests = correctResults.filter((r) => r.passed).length +
    incorrectResults.filter((r) => r.passed).length;

  const correctDetectionRate = correctResults.filter((r) => r.detected).length / correctResults.length;
  const incorrectRejectionRate = incorrectResults.filter((r) => !r.detected).length / incorrectResults.length;

  const avgProcessingTime =
    (correctResults.reduce((sum, r) => sum + r.processingTime, 0) +
      incorrectResults.reduce((sum, r) => sum + r.processingTime, 0)) /
    totalTests;

  const summary = {
    totalTests,
    passedTests,
    failedTests: totalTests - passedTests,
    passRate: (passedTests / totalTests) * 100,
    correctDetectionRate: (correctDetectionRate * 100).toFixed(1),
    incorrectRejectionRate: (incorrectRejectionRate * 100).toFixed(1),
    avgProcessingTime: avgProcessingTime.toFixed(2),
  };

  return {
    correctResults,
    incorrectResults,
    summary,
  };
}

export interface TestSummary {
  totalTests: number;
  passedTests: number;
  failedTests: number;
  passRate: number;
  correctDetectionRate: string;
  incorrectRejectionRate: string;
  avgProcessingTime: string;
}

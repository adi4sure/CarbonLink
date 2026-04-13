import { calculateCo2Offset } from '../utils/co2Calculator.js';

/**
 * Mock AI Verification Service
 * Simulates the verification pipeline:
 *   Photo Analysis → GPS Validation → EXIF Check → Score Generation
 *
 * In production, this would use Google Vision API, satellite imagery APIs, etc.
 */

/**
 * Run full verification on an eco-action
 * @param {Object} ecoAction - The eco-action document
 * @returns {Object} - Verification result
 */
export async function verifyEcoAction(ecoAction) {
  // Simulate processing delay (300-800ms)
  await new Promise(resolve => setTimeout(resolve, 300 + Math.random() * 500));

  // Step 1: Photo analysis score (mock — random 0.65–0.98)
  const photoScore = 0.65 + Math.random() * 0.33;

  // Step 2: GPS validation
  const gpsValid = !!(ecoAction.proof?.gps?.lat && ecoAction.proof?.gps?.lng);
  const gpsScore = gpsValid ? 0.85 + Math.random() * 0.15 : 0.5;

  // Step 3: Timestamp freshness
  const proofTime = ecoAction.proof?.timestamp
    ? new Date(ecoAction.proof.timestamp)
    : new Date(ecoAction.createdAt || Date.now());
  const hoursSinceProof = (Date.now() - proofTime.getTime()) / (1000 * 60 * 60);
  const freshnessScore = hoursSinceProof < 24 ? 0.95 : hoursSinceProof < 168 ? 0.80 : 0.60;

  // Step 4: Quantity reasonableness
  const quantityScore = ecoAction.quantity > 0 && ecoAction.quantity < 10000 ? 0.90 : 0.50;

  // Weighted final score
  const finalScore = Math.round((
    photoScore * 0.35 +
    gpsScore * 0.25 +
    freshnessScore * 0.20 +
    quantityScore * 0.20
  ) * 100) / 100;

  // Determine status
  const approved = finalScore >= 0.75;

  // Calculate CO₂ offset
  const co2Estimate = calculateCo2Offset(ecoAction.type, ecoAction.quantity);

  return {
    status: approved ? 'approved' : 'rejected',
    score: finalScore,
    co2Estimate,
    notes: approved
      ? `Verification passed with confidence ${(finalScore * 100).toFixed(0)}%. ` +
        `Estimated CO₂ offset: ${co2Estimate} kg. ` +
        `Photo analysis: ${(photoScore * 100).toFixed(0)}%, ` +
        `GPS validation: ${gpsValid ? 'confirmed' : 'not provided'}, ` +
        `Proof freshness: ${hoursSinceProof < 24 ? 'excellent' : 'acceptable'}.`
      : `Verification failed (score: ${(finalScore * 100).toFixed(0)}%). ` +
        `Please submit clearer proof photos with GPS data.`,
    breakdown: {
      photoAnalysis: Math.round(photoScore * 100),
      gpsValidation: Math.round(gpsScore * 100),
      proofFreshness: Math.round(freshnessScore * 100),
      quantityCheck: Math.round(quantityScore * 100),
    },
    verifiedAt: new Date(),
    verifiedBy: 'CarbonLink AI Verification Engine v1.0',
  };
}

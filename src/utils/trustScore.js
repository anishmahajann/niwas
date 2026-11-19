// Niwas — Trust Score Calculation
// Every point is traceable. No magic. No AI score.

/**
 * Trust Score Breakdown (100 points max):
 * - Property Existence: 25 points (verified = 25, else 0)
 * - Location: 20 points (GPS verified = 20, else 0)
 * - Availability: 20 points (time-decayed based on last confirmation)
 * - Lister Identity: 15 points (verified = 15, else 0)
 * - Documents: 15 points (proportional to checked/total)
 * - Listing Freshness: 5 points (time-decayed based on listing age)
 */

export function calculateTrustScore(verification, createdAt) {
  const breakdown = {
    propertyExistence: 0,
    location: 0,
    availability: 0,
    listerIdentity: 0,
    documents: 0,
    listingFreshness: 0,
  };

  // Property Existence (25 pts)
  if (verification.propertyExists?.status === 'verified') {
    breakdown.propertyExistence = 25;
  }

  // Location (20 pts)
  if (verification.locationVerified?.status === 'verified') {
    breakdown.location = 20;
  }

  // Availability (20 pts — decays over time)
  if (verification.availabilityVerified?.status === 'verified' && verification.availabilityVerified?.date) {
    const hoursSince = getHoursSince(verification.availabilityVerified.date);
    if (hoursSince < 24) breakdown.availability = 20;
    else if (hoursSince < 72) breakdown.availability = 15;
    else if (hoursSince < 168) breakdown.availability = 10;
    else if (hoursSince < 336) breakdown.availability = 5;
    else breakdown.availability = 0;
  }

  // Lister Identity (15 pts)
  if (verification.ownerVerified?.status === 'verified') {
    breakdown.listerIdentity = 15;
  }

  // Documents (15 pts — proportional)
  if (verification.documentsReviewed) {
    const { checked, total } = verification.documentsReviewed;
    if (total > 0) {
      breakdown.documents = Math.round((checked / total) * 15);
    }
  }

  // Listing Freshness (5 pts)
  if (createdAt) {
    const daysSinceCreation = getDaysSince(createdAt);
    if (daysSinceCreation < 7) breakdown.listingFreshness = 5;
    else if (daysSinceCreation < 14) breakdown.listingFreshness = 3;
    else if (daysSinceCreation < 30) breakdown.listingFreshness = 1;
    else breakdown.listingFreshness = 0;
  }

  const total = Object.values(breakdown).reduce((sum, v) => sum + Math.max(0, v), 0);

  return { total: Math.min(100, total), breakdown };
}

export function getTrustScoreColor(score) {
  if (score >= 80) return 'text-verified';
  if (score >= 60) return 'text-accent';
  if (score >= 40) return 'text-pending';
  return 'text-failed';
}

export function getTrustScoreBgColor(score) {
  if (score >= 80) return 'bg-verified-light';
  if (score >= 60) return 'bg-teal-50';
  if (score >= 40) return 'bg-pending-light';
  return 'bg-failed-light';
}

export function getTrustScoreLabel(score) {
  if (score >= 90) return 'Excellent';
  if (score >= 75) return 'Good';
  if (score >= 50) return 'Fair';
  if (score >= 25) return 'Low';
  return 'Very Low';
}

export const trustScoreCategories = [
  { key: 'propertyExistence', label: 'Property Existence', maxPoints: 25, description: 'Physical verification confirms property exists' },
  { key: 'location', label: 'Location', maxPoints: 20, description: 'GPS coordinates match listed address' },
  { key: 'availability', label: 'Availability', maxPoints: 20, description: 'Recent confirmation that property is available' },
  { key: 'listerIdentity', label: 'Lister Identity', maxPoints: 15, description: 'Owner/broker identity has been verified' },
  { key: 'documents', label: 'Documents', maxPoints: 15, description: 'Proportion of submitted documents reviewed' },
  { key: 'listingFreshness', label: 'Listing Freshness', maxPoints: 5, description: 'How recently the listing was created' },
];

function getHoursSince(dateStr) {
  const diff = new Date() - new Date(dateStr);
  return diff / (1000 * 60 * 60);
}

function getDaysSince(dateStr) {
  const diff = new Date() - new Date(dateStr);
  return diff / (1000 * 60 * 60 * 24);
}

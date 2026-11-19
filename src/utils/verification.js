// Niwas — Verification Helpers
import { formatDistanceToNow, format } from 'date-fns';

/**
 * Get freshness status based on how old a verification is.
 * Fresh: < 3 days
 * Aging: 3-14 days
 * Expired: > 14 days
 */
export function getFreshnessStatus(dateStr) {
  if (!dateStr) return { status: 'unknown', label: 'Not verified', color: 'text-text-muted', bgColor: 'bg-gray-100' };

  const hours = (new Date() - new Date(dateStr)) / (1000 * 60 * 60);

  if (hours < 72) {
    return { status: 'fresh', label: 'Fresh', color: 'text-verified', bgColor: 'bg-verified-light' };
  }
  if (hours < 336) { // 14 days
    return { status: 'aging', label: 'Aging', color: 'text-pending', bgColor: 'bg-pending-light' };
  }
  return { status: 'expired', label: 'Expired', color: 'text-failed', bgColor: 'bg-failed-light' };
}

/**
 * Get human-readable time since a date.
 */
export function getTimeSince(dateStr) {
  if (!dateStr) return 'Never';
  try {
    return formatDistanceToNow(new Date(dateStr), { addSuffix: true });
  } catch {
    return 'Unknown';
  }
}

/**
 * Format a date for display.
 */
export function formatDate(dateStr) {
  if (!dateStr) return 'N/A';
  try {
    return format(new Date(dateStr), 'dd MMM yyyy');
  } catch {
    return 'Invalid date';
  }
}

export function formatDateTime(dateStr) {
  if (!dateStr) return 'N/A';
  try {
    return format(new Date(dateStr), 'dd MMM yyyy, HH:mm');
  } catch {
    return 'Invalid date';
  }
}

/**
 * Get verification status display properties.
 */
export function getVerificationStatus(status) {
  switch (status) {
    case 'verified':
      return {
        label: 'Verified',
        icon: 'CheckCircle',
        color: 'text-verified',
        bgColor: 'bg-verified-light',
        borderColor: 'border-verified',
      };
    case 'reviewed':
      return {
        label: 'Reviewed',
        icon: 'CheckCircle',
        color: 'text-verified',
        bgColor: 'bg-verified-light',
        borderColor: 'border-verified',
      };
    case 'pending':
      return {
        label: 'Pending',
        icon: 'Clock',
        color: 'text-pending',
        bgColor: 'bg-pending-light',
        borderColor: 'border-pending',
      };
    case 'failed':
      return {
        label: 'Failed',
        icon: 'XCircle',
        color: 'text-failed',
        bgColor: 'bg-failed-light',
        borderColor: 'border-failed',
      };
    case 'expired':
      return {
        label: 'Expired',
        icon: 'AlertTriangle',
        color: 'text-pending',
        bgColor: 'bg-pending-light',
        borderColor: 'border-pending',
      };
    case 'not_provided':
      return {
        label: 'Not Provided',
        icon: 'Minus',
        color: 'text-text-muted',
        bgColor: 'bg-gray-50',
        borderColor: 'border-gray-200',
      };
    default:
      return {
        label: 'Unknown',
        icon: 'HelpCircle',
        color: 'text-text-muted',
        bgColor: 'bg-gray-50',
        borderColor: 'border-gray-200',
      };
  }
}

/**
 * Get availability status display properties.
 */
export function getAvailabilityStatus(status) {
  switch (status) {
    case 'available':
      return { label: 'Available', color: 'text-verified', bgColor: 'bg-verified-light', dot: 'bg-verified' };
    case 'pending':
      return { label: 'Pending Verification', color: 'text-pending', bgColor: 'bg-pending-light', dot: 'bg-pending' };
    case 'reported':
      return { label: 'Under Review', color: 'text-failed', bgColor: 'bg-failed-light', dot: 'bg-failed' };
    case 'unknown':
      return { label: 'Availability Unknown', color: 'text-text-muted', bgColor: 'bg-gray-100', dot: 'bg-gray-400' };
    case 'unavailable':
      return { label: 'Unavailable', color: 'text-failed', bgColor: 'bg-failed-light', dot: 'bg-failed' };
    default:
      return { label: 'Unknown', color: 'text-text-muted', bgColor: 'bg-gray-100', dot: 'bg-gray-400' };
  }
}

/**
 * Count verified checks for a property.
 */
export function countVerifiedChecks(verification) {
  let verified = 0;
  let total = 0;

  const checks = ['propertyExists', 'locationVerified', 'availabilityVerified', 'ownerVerified', 'photosVerified'];
  for (const check of checks) {
    total++;
    if (verification[check]?.status === 'verified') verified++;
  }

  return { verified, total };
}

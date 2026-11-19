// Niwas — Formatting Utilities

/**
 * Format price in Indian currency notation.
 * Examples: ₹72 Lakh, ₹1.85 Cr, ₹22,000/mo
 */
export function formatPrice(price, listingType = 'buy') {
  if (listingType === 'rent') {
    return `₹${price.toLocaleString('en-IN')}/mo`;
  }

  if (price >= 10000000) {
    const crore = price / 10000000;
    return `₹${crore % 1 === 0 ? crore : crore.toFixed(2)} Cr`;
  }

  if (price >= 100000) {
    const lakh = price / 100000;
    return `₹${lakh % 1 === 0 ? lakh : lakh.toFixed(1)} Lakh`;
  }

  return `₹${price.toLocaleString('en-IN')}`;
}

/**
 * Format full price for detail views.
 */
export function formatFullPrice(price, listingType = 'buy') {
  if (listingType === 'rent') {
    return `₹${price.toLocaleString('en-IN')} per month`;
  }
  return `₹${price.toLocaleString('en-IN')}`;
}

/**
 * Format area with unit.
 */
export function formatArea(area, propertyType) {
  if (propertyType === 'Plot') {
    return `${area} sq yd`;
  }
  return `${area.toLocaleString('en-IN')} sq ft`;
}

/**
 * Get BHK label.
 */
export function getBHKLabel(bedrooms) {
  if (bedrooms === null || bedrooms === undefined) return '';
  if (bedrooms === 1) return '1 BHK';
  return `${bedrooms} BHK`;
}

/**
 * Get short property description for cards.
 */
export function getShortDescription(title, bedrooms, area, propertyType) {
  const parts = [];
  if (bedrooms) parts.push(`${bedrooms} BHK`);
  parts.push(propertyType);
  return parts.join(' ');
}

/**
 * Generate price per sq ft.
 */
export function getPricePerSqFt(price, area, listingType) {
  if (listingType === 'rent' || !area || area === 0) return null;
  return Math.round(price / area);
}

/**
 * Truncate text to a max length.
 */
export function truncateText(text, maxLength = 150) {
  if (!text || text.length <= maxLength) return text;
  return text.substring(0, maxLength).trim() + '...';
}

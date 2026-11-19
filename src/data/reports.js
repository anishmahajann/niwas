// Niwas — Mock Reports Data

const now = new Date();
function daysAgo(d) {
  return new Date(now.getTime() - d * 24 * 60 * 60 * 1000).toISOString();
}

const reports = [
  {
    id: 'rpt-001',
    propertyId: 'prop-009',
    propertyTitle: '3 BHK Flat in Panchkula',
    userId: 'user-005',
    userName: 'Anonymous User',
    reason: 'Incorrect price',
    detail: 'Listed at ₹75L but owner demands ₹95L on phone call. Major price discrepancy.',
    date: daysAgo(1),
    status: 'investigating',
  },
  {
    id: 'rpt-002',
    propertyId: 'prop-005',
    propertyTitle: '3 BHK Luxury Flat in Zirakpur',
    userId: 'user-003',
    userName: 'Rohit M.',
    reason: 'Property unavailable',
    detail: 'Visited the property. The flat has already been sold. Broker confirmed this is no longer available.',
    date: daysAgo(3),
    status: 'confirmed',
  },
  {
    id: 'rpt-003',
    propertyId: 'prop-009',
    propertyTitle: '3 BHK Flat in Panchkula',
    userId: 'user-006',
    userName: 'Neha S.',
    reason: 'Misleading photos',
    detail: 'Photos show a completely different apartment. The actual property is in poor condition.',
    date: daysAgo(5),
    status: 'investigating',
  },
  {
    id: 'rpt-004',
    propertyId: 'prop-004',
    propertyTitle: '2 BHK Flat for Rent in Sector 17',
    userId: 'user-008',
    userName: 'Karan P.',
    reason: 'Wrong location',
    detail: 'Property is actually in Sector 19, not Sector 17 as listed.',
    date: daysAgo(7),
    status: 'dismissed',
  },
  {
    id: 'rpt-005',
    propertyId: 'prop-005',
    propertyTitle: '3 BHK Luxury Flat in Zirakpur',
    userId: 'user-007',
    userName: 'Simran K.',
    reason: 'Suspicious lister',
    detail: 'Broker asked for advance payment before showing the property. Seems fraudulent.',
    date: daysAgo(2),
    status: 'investigating',
  },
];

export { reports };
export default reports;

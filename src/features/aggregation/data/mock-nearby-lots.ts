import { NearbyFarmerLot } from '@/types/marketplace';

// These are NOT official government market records.
// This is simulated prototype network data representing nearby farmers available for FPO aggregation.

export const MOCK_NEARBY_LOTS: NearbyFarmerLot[] = [
  {
    id: 'LOT-NBY-001',
    farmerName: 'Farmer A (Ramesh)',
    village: 'North Sector',
    commodity: 'Tomato',
    variety: 'Hybrid',
    quantity: 180,
    unit: 'Quintal',
    qualityGrade: 'A',
    distanceKm: 2.4,
  },
  {
    id: 'LOT-NBY-002',
    farmerName: 'Farmer B (Suresh)',
    village: 'East Sector',
    commodity: 'Tomato',
    variety: 'Desi',
    quantity: 250,
    unit: 'Quintal',
    qualityGrade: 'B',
    distanceKm: 4.1,
  },
  {
    id: 'LOT-NBY-003',
    farmerName: 'Farmer C (Anita)',
    village: 'South Sector',
    commodity: 'Tomato',
    variety: 'Hybrid',
    quantity: 150,
    unit: 'Quintal',
    qualityGrade: 'A',
    distanceKm: 1.5,
  },
  {
    id: 'LOT-NBY-004',
    farmerName: 'Farmer D (Vikram)',
    village: 'West Sector',
    commodity: 'Potato',
    variety: 'Kufri',
    quantity: 400,
    unit: 'Quintal',
    qualityGrade: 'A',
    distanceKm: 3.0,
  },
  {
    id: 'LOT-NBY-005',
    farmerName: 'Farmer E (Pooja)',
    village: 'North Sector',
    commodity: 'Onion',
    variety: 'Red',
    quantity: 120,
    unit: 'Quintal',
    qualityGrade: 'B',
    distanceKm: 5.2,
  },
  {
    id: 'LOT-NBY-006',
    farmerName: 'Farmer F (Rajesh)',
    village: 'Central',
    commodity: 'Onion',
    variety: 'White',
    quantity: 300,
    unit: 'Quintal',
    qualityGrade: 'A',
    distanceKm: 1.2,
  }
];

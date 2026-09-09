import { Buyer } from '@/types/marketplace';

export const PROTOTYPE_BUYERS: Buyer[] = [
  {
    id: 'B-1001',
    name: 'AgriCorp Processing Ltd. (Demo Network)',
    type: 'Processor',
    location: 'Pune, Maharashtra',
    rating: 4.8,
    reliabilityScore: 94,
    isVerified: true,
    requirements: {
      commodities: ['Tomato', 'Onion', 'Potato'],
      minQuantity: 50,
      maxQuantity: 1000,
      preferredGrades: ['A', 'B'],
      indicativePriceRange: [1800, 2500],
      paymentTerms: '100% On Delivery',
      delivery: 'Buyer Arranges Transport'
    }
  },
  {
    id: 'B-1002',
    name: 'Metro Retail Grocers (Demo Network)',
    type: 'Retailer',
    location: 'Bangalore, Karnataka',
    rating: 4.5,
    reliabilityScore: 91,
    isVerified: true,
    requirements: {
      commodities: ['Banana', 'Apple', 'Tomato', 'Onion', 'Banana - Green'],
      minQuantity: 10,
      maxQuantity: 200,
      preferredGrades: ['A'],
      indicativePriceRange: [2200, 4000],
      paymentTerms: 'T+3 Days',
      delivery: 'Seller Arranges Delivery'
    }
  },
  {
    id: 'B-1003',
    name: 'Global Spice Exports (Demo Network)',
    type: 'Exporter',
    location: 'Kochi, Kerala',
    rating: 4.9,
    reliabilityScore: 96,
    isVerified: true,
    requirements: {
      commodities: ['Cardamom', 'Pepper', 'Clove', 'Ginger'],
      minQuantity: 5,
      maxQuantity: 50,
      preferredGrades: ['A'],
      indicativePriceRange: [40000, 70000],
      paymentTerms: '50% Advance, 50% On Shipment',
      delivery: 'Seller Delivers to Port'
    }
  },
  {
    id: 'B-1004',
    name: 'National Food Corp (Demo Network)',
    type: 'Institutional',
    location: 'Delhi, NCR',
    rating: 4.2,
    reliabilityScore: 84,
    isVerified: true,
    requirements: {
      commodities: ['Wheat', 'Rice', 'Maize', 'Paddy'],
      minQuantity: 100,
      maxQuantity: 5000,
      preferredGrades: ['A', 'B', 'C', 'Unsorted'],
      indicativePriceRange: [2000, 3500],
      paymentTerms: 'Government Standard (T+15)',
      delivery: 'Seller Delivers to FCI Godown'
    }
  },
  {
    id: 'B-1005',
    name: 'FreshMandi Wholesalers (Demo Network)',
    type: 'Wholesaler',
    location: 'Nashik, Maharashtra',
    rating: 4.0,
    reliabilityScore: 85,
    isVerified: true,
    requirements: {
      commodities: ['Onion', 'Tomato', 'Grapes', 'Pomegranate'],
      minQuantity: 20,
      maxQuantity: 300,
      preferredGrades: ['A', 'B', 'Mixed'],
      indicativePriceRange: [1500, 2800],
      paymentTerms: 'Cash on Weighment',
      delivery: 'Ex-Farm (Buyer Arranges Transport)'
    }
  },
  {
    id: 'B-1006',
    name: 'MegaFoods Bulk Processing (Demo Network)',
    type: 'Processor',
    location: 'Surat, Gujarat',
    rating: 4.9,
    reliabilityScore: 96,
    isVerified: true,
    requirements: {
      commodities: ['Tomato', 'Onion', 'Potato'],
      minQuantity: 600, // Requires bulk!
      maxQuantity: 10000,
      preferredGrades: ['A', 'B', 'C', 'Mixed'],
      indicativePriceRange: [2300, 2900], // High price
      paymentTerms: 'Immediate Bank Transfer',
      delivery: 'FPO Collect / Buyer Arranges Transport'
    }
  }
];





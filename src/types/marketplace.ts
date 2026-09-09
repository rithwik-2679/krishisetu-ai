export interface QualityAssessment {
  grade: 'A' | 'B' | 'C' | 'Unsorted';
  moisturePercent: number;
  damagePercent: number;
  visualQuality: 'Excellent' | 'Good' | 'Average' | 'Poor';
  size: 'Large' | 'Medium' | 'Small' | 'Mixed';
  qualityScore: number;
  observations: string[];
}

export interface OfferDetails {
  buyerPrice: number;
  status: 'Pending' | 'Countered' | 'Accepted' | 'Rejected';
  history: {
    role: 'Buyer' | 'Farmer';
    price: number;
    timestamp: string;
    note?: string;
  }[];
}

export interface TrackingEvent {
  status: string;
  timestamp: string;
}

export interface LogisticsDetails {
  vehicle: string;
  distance: number;
  estimatedCost: number;
  status: string;
  timeline: TrackingEvent[];
}

export interface PaymentDetails {
  transactionId: string;
  grossValue: number;
  logisticsDeduction: number;
  netPayable: number;
  expectedDate: string;
  actualDate?: string;
  status: string;
  timeline: TrackingEvent[];
}

export interface GrievanceDetails {
  id: string;
  category: string;
  description: string;
  priority: string;
  status: string;
  timeline: TrackingEvent[];
}

export interface NearbyFarmerLot {
  id: string;
  farmerName: string;
  village: string;
  commodity: string;
  variety: string;
  quantity: number;
  unit: string;
  qualityGrade: string;
  distanceKm: number;
}

export interface FpoAggregationDetails {
  isAggregated: boolean;
  fpoName: string;
  participatingFarmers: number;
  contributingLots: NearbyFarmerLot[];
  originalQuantity: number;
  aggregatedQuantity: number;
  averageCompatibilityScore: number;
  estimatedIndividualCost: number;
  estimatedAggregatedCost: number;
  estimatedSavings: number;
  status: string;
}

export interface Lot {
  id: string;
  commodity: string;
  variety: string;
  quantity: number;
  unit: string;
  district: string;
  state: string;
  expectedPrice: number;
  referenceGovPrice: number;
  harvestDate: string;
  preferredSellingDate: string;
  storageAvailable: boolean;
  notes: string;
  quality: QualityAssessment;
  proofOfLot?: {
    challengeId: string;
    confidenceScore: number;
    locationConsistency: 'High' | 'Medium' | 'Low';
    imagesCaptured: number;
    timestamp: string;
  };
  status: string;
  createdAt: string;
  
  fpoDetails?: FpoAggregationDetails;
  selectedBuyerId?: string;
  offerDetails?: OfferDetails;
  logisticsDetails?: LogisticsDetails;
  paymentDetails?: PaymentDetails;
  grievanceDetails?: GrievanceDetails;
}

export interface BuyerRequirement {
  commodities: string[];
  minQuantity: number;
  maxQuantity: number;
  preferredGrades: string[];
  indicativePriceRange: [number, number];
  paymentTerms: string;
  delivery: string;
}

export interface Buyer {
  id: string;
  name: string;
  type: 'Processor' | 'Wholesaler' | 'Retailer' | 'Institutional' | 'Exporter';
  location: string;
  rating: number; // 0-5
  reliabilityScore: number; // 0-100
  isVerified: boolean;
  requirements: BuyerRequirement;
}

export interface BuyerMatch {
  buyer: Buyer;
  overallScore: number;
  expectedRealization: number;
  factors: {
    crop: number;
    quantity: number;
    quality: number;
    price: number;
    distance: number;
  };
  reasons: string[];
}




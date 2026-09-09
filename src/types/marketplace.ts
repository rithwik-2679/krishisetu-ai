export interface QualityAssessment {
  grade: 'A' | 'B' | 'C' | 'Unsorted';
  moisturePercent: number;
  damagePercent: number;
  visualQuality: 'Excellent' | 'Good' | 'Average' | 'Poor';
  size: 'Large' | 'Medium' | 'Small' | 'Mixed';
  qualityScore: number;
  observations: string[];
  evidenceUrl?: string;
  evidenceScore?: number;
}

export interface OfferDetails {
  buyerPrice: number;
  farmerCounter?: number;
  status: 'Pending' | 'Countered' | 'Accepted' | 'Rejected' | 'pending_farmer' | 'accepted' | 'rejected';
  history: {
    role: 'Buyer' | 'Farmer';
    party?: 'Buyer' | 'Farmer' | 'buyer' | 'farmer';
    price: number;
    timestamp: string;
    note?: string;
  }[];
}

export interface TrackingEvent {
  status: string;
  timestamp: string;
  location?: string;
  description?: string;
}

export interface LogisticsDetails {
  vehicle: string;
  vehicleType?: string;
  distance: number;
  estimatedCost: number;
  status: string;
  timeline: TrackingEvent[];
  events?: TrackingEvent[];
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
  filedAt?: string;
  events?: TrackingEvent[];
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
  fpoName?: string;
  participatingFarmers?: number;
  contributingLots?: NearbyFarmerLot[];
  originalQuantity?: number;
  aggregatedQuantity: number;
  averageCompatibilityScore?: number;
  estimatedIndividualCost?: number;
  estimatedAggregatedCost?: number;
  estimatedSavings: number;
  status: string;
  farmerShareRatio?: number;
  matchedFarmerCount?: number;
}

export interface Lot {
  id: string;
  commodity: string;
  variety?: string;
  quantity: number;
  unit: string;
  district: string;
  state: string;
  expectedPrice: number;
  referenceGovPrice?: number;
  harvestDate?: string;
  preferredSellingDate?: string;
  storageAvailable?: boolean;
  notes?: string;
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
  
  dealConfirmed?: boolean;
  deliveryConfirmed?: boolean;
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
  type: 'Processor' | 'Wholesaler' | 'Retailer' | 'Institutional' | 'Exporter' | string;
  location: string;
  distance?: number;
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

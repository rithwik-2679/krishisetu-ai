import { calculateLogistics } from '@/utils/economics';
import { NearbyFarmerLot } from '@/types/marketplace';
import { MOCK_NEARBY_LOTS } from '../data/mock-nearby-lots';

export interface ScoredNearbyLot extends NearbyFarmerLot {
  compatibilityScore: number;
}

export function findCompatibleLots(myLot: { commodity?: string; variety?: string; qualityGrade?: string }): ScoredNearbyLot[] {
  return MOCK_NEARBY_LOTS.map(lot => {
    let score = 100;
    
    // Hard penalty for different commodity
    if (myLot.commodity && lot.commodity !== myLot.commodity) {
      score -= 80;
    }

    // Penalty for distance
    score -= (lot.distanceKm * 0.5);
    
    // Penalty for mismatched variety
    if (myLot.variety && lot.variety !== myLot.variety) {
      score -= 30;
    }
    
    // Penalty for mismatched quality
    if (myLot.qualityGrade && lot.qualityGrade !== myLot.qualityGrade) {
      score -= 15;
    }
    
    score = Math.max(0, Math.round(score));
    
    return {
      ...lot,
      compatibilityScore: score
    };
  }).sort((a, b) => b.compatibilityScore - a.compatibilityScore);
}

export function calculateLogisticsEconomics(
  myQuantity: number, 
  distanceKm: number, 
  aggregatedTotalQty: number
) {
  const individualCalc = calculateLogistics(distanceKm, myQuantity, { capacityTonnes: 6, ratePerKm: 25 });
  const aggCalc = calculateLogistics(distanceKm, aggregatedTotalQty, { capacityTonnes: 15, ratePerKm: 40 });
  
  const myShareFraction = myQuantity / aggregatedTotalQty;
  const myShareOfTransport = aggCalc.totalTransportCost * myShareFraction;
  const savings = individualCalc.totalTransportCost - myShareOfTransport;

  return {
    estimatedIndividualCost: individualCalc.totalTransportCost,
    estimatedAggregatedCost: myShareOfTransport,
    estimatedSavings: savings > 0 ? savings : 0,
    totalAggregatedCost: aggCalc.totalTransportCost,
    vehiclesRequired: aggCalc.vehiclesRequired,
    vehicleCapacityTonnes: aggCalc.vehicleCapacityTonnes
  };
}

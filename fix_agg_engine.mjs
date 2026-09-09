import fs from 'fs';

let content = fs.readFileSync('src/features/aggregation/utils/aggregation-engine.ts', 'utf8');

if (!content.includes('calculateLogistics')) {
   content = "import { calculateLogistics } from '@/utils/economics';\n" + content;
}

const newCalc = `export function calculateLogisticsEconomics(
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
}`;

content = content.replace(/export function calculateLogisticsEconomics\([\s\S]*?\}\n\s*return \{[\s\S]*?\};\n\}/, newCalc);

fs.writeFileSync('src/features/aggregation/utils/aggregation-engine.ts', content, 'utf8');
console.log("Aggregation Engine updated");

import fs from 'fs';
let content = fs.readFileSync('src/features/aggregation/components/fpo-aggregation.tsx', 'utf8');

if (!content.includes('calculateLogistics')) {
  content = content.replace(
    /import \{ Users, TrendingUp, CheckCircle2, Factory, Truck, MapPin \} from 'lucide-react';/,
    "import { Users, TrendingUp, CheckCircle2, Factory, Truck, MapPin } from 'lucide-react';\nimport { calculateLogistics, formatINR } from '@/utils/economics';"
  );
}

// Modify calculations
content = content.replace(
  /const calculateEconomics = \(\) => \{[\s\S]*?return \{[\s\S]*?\};/,
  `const calculateEconomics = () => {
    const individualDistance = 120;
    const individualCalc = calculateLogistics(individualDistance, currentLot.quantity, { capacityTonnes: 6, ratePerKm: 25 });
    
    const aggregatedDistance = 140;
    const aggCalc = calculateLogistics(aggregatedDistance, aggregatedQuantity, { capacityTonnes: 15, ratePerKm: 40 });
    
    const myShareFraction = currentLot.quantity / aggregatedQuantity;
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
  `
);

content = content.replace(/,1\{economics.estimatedIndividualCost.toLocaleString\('en-IN'\)\}/g, "{formatINR(economics.estimatedIndividualCost)}");
content = content.replace(/,1\{economics.estimatedAggregatedCost.toLocaleString\('en-IN'\)\}/g, "{formatINR(economics.estimatedAggregatedCost)}");
content = content.replace(/,1\{economics.estimatedSavings.toLocaleString\('en-IN'\)\}/g, "{formatINR(economics.estimatedSavings)}");

content = content.replace(
  /<p className="text-xs text-blue-500">Based on your share of \{aggregatedQuantity\} \{currentLot\.unit\} bulk vehicle<\/p>/,
  `<p className="text-xs text-blue-500 mt-1">
    Based on your share of {aggregatedQuantity} {currentLot.unit}. 
    Requires {economics.vehiclesRequired} Heavy Truck(s) (15 Tonnes each).
   </p>`
);

fs.writeFileSync('src/features/aggregation/components/fpo-aggregation.tsx', content, 'utf8');
console.log("FPO updated");

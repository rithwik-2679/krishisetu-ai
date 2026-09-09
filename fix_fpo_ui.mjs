import fs from 'fs';
let content = fs.readFileSync('src/features/aggregation/components/fpo-aggregation.tsx', 'utf8');

content = content.replace(
  /<p className="text-xs text-blue-500">Based on your share of \{aggregatedQuantity\} \{currentLot.unit\} bulk vehicle<\/p>/,
  `<p className="text-xs text-blue-500 mt-1">Based on your share of {aggregatedQuantity} {currentLot.unit}. Requires {economics.vehiclesRequired} Heavy Truck(s) (15 Tonnes each).</p>`
);

fs.writeFileSync('src/features/aggregation/components/fpo-aggregation.tsx', content, 'utf8');
console.log("FPO aggregation UI updated");

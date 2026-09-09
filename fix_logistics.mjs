const fs = require('fs');
let content = fs.readFileSync('src/features/logistics/components/logistics-dashboard.tsx', 'utf8');

// Add economics import
if (!content.includes('getDeterministicDistance')) {
  content = content.replace(
    /import { TrackingEvent } from '@\/types\/marketplace';/,
    "import { TrackingEvent } from '@/types/marketplace';\nimport { calculateLogistics, getDeterministicDistance, formatINR } from '@/utils/economics';"
  );
}

// Replace the hardcoded calculations
content = content.replace(
  /const distanceKm = 120;\s*const estimatedCost = \(distanceKm \* selectedVehicle\.rate\) \+ 500;/,
  `
  const destination = buyer?.location || 'Processing Facility';
  const origin = currentLot.district || 'Farmer Location';
  const distanceKm = getDeterministicDistance(origin, destination);
  
  const transportCalc = calculateLogistics(distanceKm, effectiveQuantity, { capacityTonnes: parseInt(selectedVehicle.capacity.replace(/[^0-9]/g, '')), ratePerKm: selectedVehicle.rate });
  const estimatedCost = transportCalc.totalTransportCost;
  const vehiclesRequired = transportCalc.vehiclesRequired;
  `
);

// Replace the UI where distance is hardcoded or cost is rendered manually
content = content.replace(
  /Distance<\/p>\s*<p className="font-bold text-gray-900">120 km<\/p>/g,
  'Estimated Route Distance</p>\n                        <p className="font-bold text-gray-900">{distanceKm} km</p>'
);

content = content.replace(
  /?\{estimatedCost\.toLocaleString\('en-IN'\)\}/g,
  '{formatINR(estimatedCost)}'
);

content = content.replace(
  /\?\{estimatedCost\.toLocaleString\('en-IN'\)\}/g,
  '{formatINR(estimatedCost)}'
);

// Replace hardcoded "Pune" origin
content = content.replace(
  /<p className="font-bold text-gray-900">Pune<\/p>/g,
  '<p className="font-bold text-gray-900">{origin}</p>'
);

// Replace destination
content = content.replace(
  /Destination<\/p>\s*<p className="font-bold text-gray-900">.*?<\/p>/g,
  'Destination</p>\n                        <p className="font-bold text-gray-900">{destination}</p>'
);

fs.writeFileSync('src/features/logistics/components/logistics-dashboard.tsx', content, 'utf8');
console.log("Logistics updated");

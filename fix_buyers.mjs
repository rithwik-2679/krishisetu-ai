const fs = require('fs');

let content = fs.readFileSync('src/features/marketplace/data/mock-buyers.ts', 'utf8');

// Adjust reliability scores
content = content.replace(/reliabilityScore: 98,/g, 'reliabilityScore: 94,');
content = content.replace(/reliabilityScore: 92,/g, 'reliabilityScore: 91,');
content = content.replace(/reliabilityScore: 88,/g, 'reliabilityScore: 84,');
content = content.replace(/reliabilityScore: 99,/g, 'reliabilityScore: 96,');

// Adjust terminology
content = content.replace(/Seller Delivers to Warehouse/g, 'Seller Arranges Delivery');

fs.writeFileSync('src/features/marketplace/data/mock-buyers.ts', content, 'utf8');
console.log("Mock buyers updated");

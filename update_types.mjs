import fs from 'fs';
let content = fs.readFileSync('src/types/marketplace.ts', 'utf8');

if (!content.includes('proofOfLot')) {
  content = content.replace(
    /quality: QualityAssessment;/,
    "quality: QualityAssessment;\n  proofOfLot?: {\n    challengeId: string;\n    confidenceScore: number;\n    locationConsistency: 'High' | 'Medium' | 'Low';\n    imagesCaptured: number;\n    timestamp: string;\n  };"
  );
  fs.writeFileSync('src/types/marketplace.ts', content, 'utf8');
  console.log("Updated marketplace.ts");
}

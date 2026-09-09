import fs from 'fs';
let content = fs.readFileSync('src/features/marketplace/components/smart-matching.tsx', 'utf8');

const newScore = `
      let priceScore = 50;
      if (avgIndicative >= currentLot.expectedPrice) priceScore = 100;
      else priceScore = (avgIndicative / currentLot.expectedPrice) * 100;

      const reliabilityScore = buyer.reliabilityScore || 90;

      const rawScore = (cropScore * 0.35) + (qtyScore * 0.15) + (qualityScore * 0.15) + (priceScore * 0.15) + (distanceScore * 0.1) + (reliabilityScore * 0.1);
      
      // Ensure no 100/100 by capping at 98 for realism, and scale slightly based on reliability
      const overallScore = Math.min(98, Math.round(rawScore));

      // Generate reasons
      const reasons = [];
      if (cropScore === 100) reasons.push(\`Crop: Excellent - Buyer actively procuring \${currentLot.commodity}\`);
      if (qtyScore === 100) {
        if (currentLot.fpoDetails?.isAggregated) {
          reasons.push(\`Quantity: Excellent - Your FPO-aggregated volume (\${effectiveQuantity} \${currentLot.unit}) meets this bulk requirement\`);
        } else {
          reasons.push('Quantity: Excellent - Volume matches their capacity exactly');
        }
      } else if (qtyScore >= 50) {
        reasons.push('Quantity: Acceptable - Within negotiable bounds');
      }
      if (qualityScore === 100) reasons.push(\`Quality: Excellent - Perfectly matches their Grade \${currentLot.quality.grade} requirement\`);
      else if (qualityScore > 0) reasons.push(\`Quality: Acceptable - Negotiable for Grade \${currentLot.quality.grade}\`);
      
      reasons.push(\`Reliability: \${reliabilityScore}/100 Demo Network Score (Fast Payments)\`);
`;

content = content.replace(/let priceScore = 50;\s*if \(avgIndicative >= currentLot.expectedPrice\) priceScore = 100;\s*else priceScore = \(avgIndicative \/ currentLot\.expectedPrice\) \* 100;[\s\S]*?else if \(qualityScore > 0\) reasons\.push\(`Quality: Acceptable - Negotiable for Grade \$\{currentLot\.quality\.grade\}`\);\s*if \(distanceScore > 80\) reasons\.push\('Location: Excellent - Logistically favorable proximity'\);/, newScore);

fs.writeFileSync('src/features/marketplace/components/smart-matching.tsx', content, 'utf8');
console.log("Updated matching scores");

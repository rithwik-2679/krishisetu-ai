import fs from 'fs';
let content = fs.readFileSync('src/features/copilot/components/farmer-copilot.tsx', 'utf8');

// Advanced Copilot Logic Injection
content = content.replace(/let reply = "I understand\. Let me check the market data for you\.";[\s\S]*?setMessages\(prev => \[\.\.\.prev, \{ role: 'bot', text: reply \}\]\);/, `
      let reply = "I understand. Let me check the market data for you.";
      const lower = userMsg.toLowerCase();
      
      if (lower.includes('price') || lower.includes('rate') || lower.includes('bhav') || lower.includes('daam')) {
         if (currentLot?.commodity) {
            reply = \`The current reference market price for \${currentLot.commodity} is roughly \${formatINR(currentLot.referenceGovPrice || 2000)}/quintal. Would you like me to help you find a buyer?\`;
            if (language === 'hi') reply = \`\${currentLot.commodity} ?? ??????? ?????? ??? ???? \${formatINR(currentLot.referenceGovPrice || 2000)}/??????? ???\`;
            if (language === 'te') reply = \`\${currentLot.commodity} ????? ???????? ???????? ?? ?????? \${formatINR(currentLot.referenceGovPrice || 2000)}/?????????.\`;
         } else {
            reply = "You can check the latest government prices in the Market Intelligence tab, or tell me your crop.";
         }
      } else if (lower.includes('weather') || lower.includes('rain') || lower.includes('mausam')) {
         reply = "Based on IMD data for your region, there is a moderate risk of rain. I recommend harvesting and arranging covered transport soon.";
      } else if (lower.includes('transport') || lower.includes('truck')) {
         reply = "You can aggregate your produce with nearby farmers through an FPO to reduce transport costs by up to 40%. Check the FPO Aggregation step.";
      } else if (lower.includes('store') || lower.includes('wait') || lower.includes('hold')) {
         if (currentLot?.commodity) {
           reply = \`Storing your \${currentLot.commodity} for 5 days in a nearby warehouse would cost roughly \${formatINR(100)}/qtl. Based on current trends, it could increase your net realization slightly, but weather risk is moderate.\`;
         } else {
           reply = "I need to know your crop first. Please select one in Sell Advisor.";
         }
      } else if (lower.includes('negotiate') || lower.includes('bargain') || lower.includes('offer')) {
         if (currentLot?.offerDetails && currentLot?.selectedBuyerId) {
            reply = \`The buyer's current offer is \${formatINR(currentLot.offerDetails.buyerPrice)}/qtl. Based on their historical negotiation patterns and your crop's A-grade quality, I recommend countering at \${formatINR(currentLot.offerDetails.buyerPrice + 50)}/qtl.\`;
         } else {
            reply = "You aren't in an active negotiation yet. Find a match in the Buyer Directory to start one.";
         }
      } else if (language === 'hi') {
         reply = "??? ??? ???? ????? ???? ?? ????? ????";
      } else if (language === 'te') {
         reply = "???? ????? ????????????. ?????? ???? ??????? ??????? ???????.";
      }
      
      setMessages(prev => [...prev, { role: 'bot', text: reply }]);
`);

if (!content.includes('formatINR')) {
   content = "import { formatINR } from '@/utils/economics';\n" + content.replace(/import \{ formatINR \} from '@\/utils\/economics';\n/g, "");
}

fs.writeFileSync('src/features/copilot/components/farmer-copilot.tsx', content, 'utf8');

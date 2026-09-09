import fs from 'fs';
let content = fs.readFileSync('src/features/copilot/components/farmer-copilot.tsx', 'utf8');

if (!content.includes('actions?: {label: string, route: string}[]')) {
  // Update message type
  content = content.replace(
    "messages, setMessages] = useState<{role: 'user' | 'bot', text: string}[]>([]);",
    "messages, setMessages] = useState<{role: 'user' | 'bot', text: string, actions?: {label: string, route: string}[]}[]>([]);"
  );
  
  // Also import useRouter
  content = content.replace("import { Bot, X, Send, Minimize2, Maximize2 } from 'lucide-react';", "import { Bot, X, Send, Minimize2, Maximize2 } from 'lucide-react';\nimport { useRouter } from 'next/navigation';");
  
  content = content.replace("export function FarmerCopilot() {", "export function FarmerCopilot() {\n  const router = useRouter();");

  // Modify the parsing logic to add actions
  const replacementLogic = `
      let reply = "I can currently help with market prices, selling strategy, weather, storage, quality, buyers, negotiation, logistics and payment tracking.";
      let actions = [{label: 'View Features', route: '/'}];
      const lower = userMsg.toLowerCase();
      
      if (lower.includes('price') || lower.includes('rate') || lower.includes('bhav') || lower.includes('daam')) {
         if (currentLot?.commodity) {
            reply = \`The current reference market price for \${currentLot.commodity} is roughly \${formatINR(currentLot.referenceGovPrice || 2000)}/quintal. Would you like me to help you find a buyer?\`;
            actions = [{label: 'Compare Markets', route: '/market-intelligence'}, {label: 'Find Buyers', route: '/matching'}];
         } else {
            reply = "You can check the latest government prices in the Market Intelligence tab, or tell me your crop.";
            actions = [{label: 'Compare Markets', route: '/market-intelligence'}];
         }
      } else if (lower.includes('weather') || lower.includes('rain') || lower.includes('mausam')) {
         reply = "Based on IMD data for your region, there is a moderate risk of rain. I recommend harvesting and arranging covered transport soon.";
         actions = [{label: 'Open Sell Strategy', route: '/sell-advisor'}];
      } else if (lower.includes('transport') || lower.includes('truck') || lower.includes('logistics')) {
         reply = "You can aggregate your produce with nearby farmers through an FPO to reduce transport costs by up to 40%. Check the FPO Aggregation step.";
         actions = [{label: 'Arrange Transport', route: '/logistics'}, {label: 'View Aggregation', route: '/aggregation'}];
      } else if (lower.includes('store') || lower.includes('wait') || lower.includes('hold')) {
         if (currentLot?.commodity) {
           reply = \`Storing your \${currentLot.commodity} for 5 days in a nearby warehouse would cost roughly \${formatINR(100)}/qtl. Based on current trends, it could increase your net realization slightly, but weather risk is moderate.\`;
           actions = [{label: 'Check Storage', route: '/sell-advisor'}];
         } else {
           reply = "I need to know your crop first. Please select one in Sell Advisor.";
           actions = [{label: 'Open Sell Strategy', route: '/sell-advisor'}];
         }
      } else if (lower.includes('negotiate') || lower.includes('bargain') || lower.includes('offer')) {
         if (currentLot?.offerDetails && currentLot?.selectedBuyerId) {
            reply = \`The buyer's current offer is \${formatINR(currentLot.offerDetails.buyerPrice)}/qtl. Based on their historical negotiation patterns and your crop's A-grade quality, I recommend countering at \${formatINR(currentLot.offerDetails.buyerPrice + 50)}/qtl.\`;
            actions = [{label: 'View Offer', route: '/offers'}];
         } else {
            reply = "You aren't in an active negotiation yet. Find a match in the Buyer Directory to start one.";
            actions = [{label: 'Find Buyers', route: '/matching'}];
         }
      }
      
      setMessages(prev => [...prev, { role: 'bot', text: reply, actions }]);
  `;

  content = content.replace(/let reply = "I understand\. Let me check the market data for you\.";[\s\S]*?setMessages\(prev => \[\.\.\.prev, \{ role: 'bot', text: reply \}\]\);/, replacementLogic);

  // Update rendering logic to display buttons
  const renderLogic = `
                  <div className={"max-w-[85%] p-3 rounded-2xl text-sm " + (msg.role === 'user' ? "bg-green-600 text-white rounded-tr-sm" : "bg-gray-100 text-gray-800 rounded-tl-sm border border-gray-200")}>
                    {msg.text}
                    {msg.actions && msg.actions.length > 0 && (
                      <div className="flex flex-wrap gap-2 mt-3 pt-2 border-t border-gray-300/30">
                        {msg.actions.map((act, i) => (
                          <button key={i} onClick={() => router.push(act.route)} className="bg-white text-green-700 border border-green-200 hover:bg-green-50 px-3 py-1.5 rounded-lg text-xs font-bold transition-colors">
                            {act.label}
                          </button>
                        ))}
                      </div>
                    )}
                  </div>
  `;

  content = content.replace(/<div className=\{"max-w-\[85%\] p-3 rounded-2xl text-sm " \+ \(msg\.role === 'user' \? "bg-green-600 text-white rounded-tr-sm" : "bg-gray-100 text-gray-800 rounded-tl-sm border border-gray-200"\)\}>\s*\{msg\.text\}\s*<\/div>/, renderLogic);

  fs.writeFileSync('src/features/copilot/components/farmer-copilot.tsx', content, 'utf8');
}

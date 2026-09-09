import fs from 'fs';

let content = fs.readFileSync('src/app/page.tsx', 'utf8');

const newTimeline = `
    const isComplete = isSettled && isDelivered && isDealConfirmed;

    const fpoDecisionMade = currentLot.fpoDetails !== undefined;
    const isFpoSkipped = fpoDecisionMade && !isAggregated;
    const fpoDone = isAggregated || isFpoSkipped;

    return [
      { id: 'created', label: 'Lot Created', done: true, current: false },
      { id: 'fpo', label: isFpoSkipped ? 'FPO (Skipped)' : 'FPO Aggregation', done: fpoDone, current: !fpoDone && !hasBuyer && !isComplete },
      { id: 'match', label: 'Buyer Matched', done: hasBuyer, current: fpoDone && !hasBuyer && !isComplete },
      { id: 'negotiation', label: 'Negotiation', done: isDealConfirmed, current: hasBuyer && !isDealConfirmed && !isComplete },
      { id: 'deal', label: 'Deal Confirmed', done: isDealConfirmed, current: false },
      { id: 'logistics', label: 'Transport', done: hasLogistics, current: isDealConfirmed && !hasLogistics && !isComplete },
      { id: 'delivery', label: 'Delivered', done: isDelivered, current: hasLogistics && !isDelivered && !isComplete },
      { id: 'payment', label: 'Payment', done: isSettled, current: isDelivered && !isSettled && !isComplete },
    ];
  };

  const steps = getTimelineSteps();
  const isComplete = steps.every(s => s.done) || (currentLot?.status === 'Payment Settled');
`;

content = content.replace(/const isComplete = isSettled && isDelivered;[\s\S]*?const steps = getTimelineSteps\(\);/, newTimeline);

// Replace "Next Action Required" rendering to only show if NOT complete
content = content.replace(
  /<div className="ml-auto">\s*<span className="text-\[10px\] uppercase font-bold text-blue-600 bg-blue-50 px-2 py-0\.5 rounded border border-blue-100">Next Action Required<\/span>\s*<\/div>/g,
  `{!isComplete && <div className="ml-auto">
                              <span className="text-[10px] uppercase font-bold text-blue-600 bg-blue-50 px-2 py-0.5 rounded border border-blue-100">Next Action Required</span>
                            </div>}`
);

// If complete, show "Transaction Complete" at the top of the metrics section
content = content.replace(
  /<div className="p-6 grid grid-cols-2 md:grid-cols-4 gap-4 bg-white border-b border-gray-100">/,
  `{isComplete && (
                <div className="p-4 bg-green-50 border-b border-green-100 flex items-center gap-3">
                  <div className="bg-green-500 rounded-full p-1"><CheckCircle2 className="w-5 h-5 text-white" /></div>
                  <div>
                    <h3 className="font-bold text-green-900">Transaction Complete</h3>
                    <p className="text-sm text-green-800">Payment settled successfully. You can view this in My Lots or start a new transaction.</p>
                  </div>
                </div>
              )}
              <div className="p-6 grid grid-cols-2 md:grid-cols-4 gap-4 bg-white border-b border-gray-100">`
);

fs.writeFileSync('src/app/page.tsx', content, 'utf8');
console.log("Command Center updated");

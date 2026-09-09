import fs from 'fs';
let content = fs.readFileSync('src/features/offers/components/offers-dashboard.tsx', 'utf8');

const newEvidence = `              <div className="grid grid-cols-2 md:grid-cols-4 gap-4 bg-gray-50 rounded-lg p-4 mb-4 border border-gray-100">
                <div>
                  <p className="text-xs text-gray-500 mb-1">Commodity</p>
                  <p className="font-bold text-gray-900">{currentLot.commodity}</p>
                </div>
                <div>
                  <p className="text-xs text-gray-500 mb-1">Volume {currentLot.fpoDetails?.isAggregated && '(FPO)'}</p>
                  <p className="font-bold text-gray-900">{effectiveQuantity} {currentLot.unit}</p>
                </div>
                <div>
                  <p className="text-xs text-gray-500 mb-1">Payment</p>
                  <p className="font-bold text-gray-900">{buyer?.requirements.paymentTerms}</p>
                </div>
                <div>
                  <p className="text-xs text-gray-500 mb-1">Logistics</p>
                  <p className="font-bold text-gray-900">Farmer Arranges</p>
                </div>
              </div>

              <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-6">
                <div className="flex items-center justify-between mb-3">
                  <h4 className="font-bold text-blue-900 text-sm flex items-center gap-1"><ShieldCheck className="w-4 h-4"/> Lot Quality Evidence & Agreement</h4>
                  <span className="text-[10px] font-bold uppercase tracking-wider bg-blue-200 text-blue-800 px-2 py-0.5 rounded">Buyer Accepted</span>
                </div>
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 text-sm">
                  <div>
                    <span className="block text-xs text-blue-700">Farmer Declared</span>
                    <strong className="text-blue-900">Grade {currentLot.quality.grade}</strong>
                  </div>
                  <div>
                    <span className="block text-xs text-blue-700">AI Visual Assessment</span>
                    <strong className="text-blue-900">Grade A (91%)</strong>
                  </div>
                  <div>
                    <span className="block text-xs text-blue-700">Proof-of-Lot</span>
                    <strong className="text-blue-900">{currentLot.proofOfLot?.confidenceScore || 94}% Confidence</strong>
                  </div>
                  <div>
                    <span className="block text-xs text-blue-700">Evidence</span>
                    <strong className="text-blue-900">{currentLot.proofOfLot?.imagesCaptured || 4} Images + Challenge</strong>
                  </div>
                </div>
              </div>
`;

content = content.replace(/<div className="grid grid-cols-2 md:grid-cols-4 gap-4 bg-gray-50 rounded-lg p-4 mb-6 border border-gray-100">[\s\S]*?<\/div>\s*<\/div>/, newEvidence);

fs.writeFileSync('src/features/offers/components/offers-dashboard.tsx', content, 'utf8');

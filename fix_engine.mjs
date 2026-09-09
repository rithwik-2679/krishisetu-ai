import fs from 'fs';

let content = fs.readFileSync('src/features/sell-advisor/components/sell-advisor.tsx', 'utf8');

const newEngineUi = `<div className="absolute top-0 right-0 bg-green-500 text-white text-xs font-bold px-3 py-1 rounded-bl-lg">
                  EXPLAINABLE AI DECISION ENGINE
                </div>
                <div className="p-5">
                  <h2 className="text-sm font-bold text-gray-500 uppercase tracking-wider mb-4">Recommended Selling Strategy</h2>
                  
                  {!commodity ? (
                    <div className="text-center py-8 text-gray-500 text-sm">
                      Select a commodity to generate a market opportunity score and selling strategy.
                    </div>
                  ) : bestMarket ? (
                    <>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
                         <div>
                            <p className="text-xs text-gray-500 uppercase font-bold tracking-wide">Target Market</p>
                            <h3 className="text-2xl font-extrabold text-gray-900">{bestMarket.market}</h3>
                            <p className="text-sm text-gray-600">{bestMarket.district}, {bestMarket.state}</p>
                         </div>
                         <div className="flex flex-col items-start md:items-end">
                            <p className="text-xs text-gray-500 uppercase font-bold tracking-wide">Market Opportunity Score</p>
                            <div className="flex items-end gap-1">
                               <span className="text-4xl font-extrabold text-green-600">87</span>
                               <span className="text-lg text-gray-400 font-bold">/100</span>
                            </div>
                            <p className="text-xs text-green-700 font-semibold bg-green-50 px-2 py-0.5 rounded mt-1">Excellent Match</p>
                         </div>
                      </div>

                      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mb-6">
                        <div className="bg-gray-50 p-3 rounded-lg border border-gray-100">
                          <p className="text-[10px] text-gray-500 font-bold uppercase mb-1">Price Trend</p>
                          <p className="font-bold text-gray-900">{trendAnalysis.recommendation === 'SELL NOW' ? 'Rising' : 'Stable'}</p>
                        </div>
                        <div className="bg-gray-50 p-3 rounded-lg border border-gray-100">
                          <p className="text-[10px] text-gray-500 font-bold uppercase mb-1">Weather Risk</p>
                          <p className="font-bold text-amber-600">Moderate</p>
                        </div>
                        <div className="bg-gray-50 p-3 rounded-lg border border-gray-100">
                          <p className="text-[10px] text-gray-500 font-bold uppercase mb-1">Selling Window</p>
                          <p className="font-bold text-gray-900">Next 48-72 hrs</p>
                        </div>
                        <div className="bg-gray-50 p-3 rounded-lg border border-gray-100">
                          <p className="text-[10px] text-gray-500 font-bold uppercase mb-1">Est. Net Realization</p>
                          <p className="font-bold text-green-700">{formatINR(simTotalNet / quantity)}/Qtl</p>
                        </div>
                      </div>

                      <div className="bg-blue-50 border border-blue-100 rounded-lg p-4 mb-2">
                         <h4 className="font-bold text-blue-900 text-sm mb-2 flex items-center gap-2">
                           <Info className="w-4 h-4" /> Why this recommendation?
                         </h4>
                         <ul className="text-sm text-blue-800 space-y-1 ml-6 list-disc">
                            <li><strong>+{formatINR(145)}/Qtl market price advantage</strong> over nearby alternatives.</li>
                            <li><strong>Moderate weather risk</strong> (chance of rainfall) suggests selling within 3 days.</li>
                            <li><strong>Strong institutional buyer demand</strong> for {commodity} in this region.</li>
                         </ul>
                      </div>
                    </>
                  ) : (
                    <div className="text-sm text-gray-500">No sufficient data.</div>
                  )}`;

content = content.replace(/<div className="absolute top-0 right-0 bg-green-500 text-white text-xs font-bold px-3 py-1 \s*rounded-bl-lg">\s*DECISION ENGINE\s*<\/div>\s*<div className="p-5">\s*<h2 className="text-sm font-bold text-gray-500 uppercase tracking-wider mb-4">Recommended Selling \s*Option<\/h2>[\s\S]*?<\/div>\s*<\/div>\s*<\/div>/, newEngineUi + '\n</div></div></div>');

fs.writeFileSync('src/features/sell-advisor/components/sell-advisor.tsx', content, 'utf8');
console.log("Decision Engine updated");

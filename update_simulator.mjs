import fs from 'fs';
let content = fs.readFileSync('src/features/sell-advisor/components/sell-advisor.tsx', 'utf8');

const newSimulator = `
                <div className="bg-white border border-gray-200 rounded-xl shadow-sm p-6 mb-6">
                  <h3 className="font-bold text-gray-900 mb-4 flex items-center gap-2">
                    <TrendingUp className="w-5 h-5 text-purple-600" />
                    Storage & Holding Intelligence
                  </h3>
                  {!commodity ? (
                    <div className="text-center py-6 text-gray-500 text-sm bg-gray-50 rounded-lg border border-dashed border-gray-200">
                      Select a commodity to generate a storage strategy.
                    </div>
                  ) : (
                    <div className="overflow-x-auto">
                      <table className="w-full text-sm text-left">
                        <thead className="bg-gray-50 border-b border-gray-100 text-gray-600 text-xs uppercase">
                          <tr>
                            <th className="px-4 py-3">Scenario</th>
                            <th className="px-4 py-3">Proj. Price</th>
                            <th className="px-4 py-3">Storage Cost</th>
                            <th className="px-4 py-3">Est. Net Realization</th>
                            <th className="px-4 py-3">Weather Risk</th>
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-100">
                          <tr>
                            <td className="px-4 py-3 font-bold text-gray-900">Sell Today</td>
                            <td className="px-4 py-3">{formatINR(opportunityAnalysis.realization)}</td>
                            <td className="px-4 py-3 text-gray-400">?0</td>
                            <td className="px-4 py-3 font-bold text-green-700">{formatINR(opportunityAnalysis.realization)}</td>
                            <td className="px-4 py-3"><span className={"px-2 py-0.5 rounded text-[10px] font-bold " + (opportunityAnalysis.risk === 'High' ? 'bg-red-50 text-red-700' : 'bg-green-50 text-green-700')}>{opportunityAnalysis.risk}</span></td>
                          </tr>
                          <tr className={opportunityAnalysis.risk === 'Low' ? 'bg-green-50' : ''}>
                            <td className="px-4 py-3 font-bold text-gray-900">Store 2 Days <span className="text-[10px] font-normal text-gray-500 block">Warehouse</span></td>
                            <td className="px-4 py-3">{formatINR(opportunityAnalysis.realization * 1.02)} <TrendingUp className="inline w-3 h-3 text-green-500"/></td>
                            <td className="px-4 py-3 text-red-600">-?40/qtl</td>
                            <td className="px-4 py-3 font-bold text-green-700">{formatINR((opportunityAnalysis.realization * 1.02) - 40)}</td>
                            <td className="px-4 py-3"><span className="px-2 py-0.5 rounded text-[10px] font-bold bg-amber-50 text-amber-700">Moderate</span></td>
                          </tr>
                          <tr className={opportunityAnalysis.risk === 'High' ? 'bg-amber-50' : ''}>
                            <td className="px-4 py-3 font-bold text-gray-900">Store 5 Days <span className="text-[10px] font-normal text-gray-500 block">FPO Facility</span></td>
                            <td className="px-4 py-3">{formatINR(opportunityAnalysis.realization * 1.05)} <TrendingUp className="inline w-3 h-3 text-green-500"/></td>
                            <td className="px-4 py-3 text-red-600">-?100/qtl</td>
                            <td className="px-4 py-3 font-bold text-green-700">{formatINR((opportunityAnalysis.realization * 1.05) - 100)}</td>
                            <td className="px-4 py-3"><span className="px-2 py-0.5 rounded text-[10px] font-bold bg-green-50 text-green-700">Low</span></td>
                          </tr>
                        </tbody>
                      </table>
                      <div className="mt-3 text-xs text-gray-500 flex justify-between bg-gray-50 p-2 rounded">
                        <span><Info className="inline w-3 h-3 mr-1" /> Recommendation: <b>{opportunityAnalysis.risk === 'High' ? 'Sell Today' : 'Store 2 Days'}</b></span>
                        <span className="italic">Demo Storage Network</span>
                      </div>
                    </div>
                  )}
                </div>
`;

content = content.replace(/<div className="text-xs text-gray-500 bg-gray-50 p-2 rounded">\s*<AlertCircle className="inline-block w-3 h-3 mr-1" \/>\s*Aggregating with nearby farmers can reduce per-quintal transport costs by up to 40%\.\s*<\/div>\s*<\/div>\s*<\/div>/, `<div className="text-xs text-gray-500 bg-gray-50 p-2 rounded">\n<AlertCircle className="inline-block w-3 h-3 mr-1" />\nAggregating with nearby farmers can reduce per-quintal transport costs by up to 40%.\n</div>\n</div>\n${newSimulator}\n</div>`);

fs.writeFileSync('src/features/sell-advisor/components/sell-advisor.tsx', content, 'utf8');

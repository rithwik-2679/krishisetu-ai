import fs from 'fs';
let content = fs.readFileSync('src/features/sell-advisor/components/sell-advisor.tsx', 'utf8');

// Fix empty state in Simulator
const newSimulator = `<h3 className="font-bold text-gray-900 mb-4 flex items-center gap-2">
                    <TrendingUp className="w-5 h-5 text-purple-600" />
                    Value Simulator
                  </h3>
                  {!commodity ? (
                    <div className="text-center py-6 text-gray-500 text-sm bg-gray-50 rounded-lg border border-dashed border-gray-200">
                      Select a commodity to generate a selling strategy and view simulated returns.
                    </div>
                  ) : (
                    <>
                      <div className="flex flex-col gap-3 mb-4">
                        <div className="flex justify-between text-sm">
                          <span className="text-gray-600">Simulated Volume</span>
                          <span className="font-bold text-gray-900">{quantity} {unit}</span>
                        </div>
                        <div className="flex justify-between text-sm">
                          <span className="text-gray-600">Gross Value</span>
                          <span className="font-bold text-gray-900">{formatINR(simGrossValue)}</span>
                        </div>
                        <div className="flex justify-between text-sm">
                          <span className="text-gray-600">Total Transport</span>
                          <span className="font-bold text-red-600">-{formatINR(simTotalTransport)}</span>
                        </div>
                        <div className="pt-2 border-t border-gray-100 flex justify-between">
                          <span className="font-bold text-gray-900">Est. Total Return</span>
                          <span className="font-bold text-green-700 text-lg">{formatINR(simTotalNet)}</span>
                        </div>
                      </div>
                      <div className="text-xs text-gray-500 bg-gray-50 p-2 rounded">
                        <AlertCircle className="inline-block w-3 h-3 mr-1" />
                        Aggregating with nearby farmers can reduce per-quintal transport costs by up to 40%.
                      </div>
                    </>
                  )}`;

content = content.replace(/<h3 className="font-bold text-gray-900 mb-4 flex items-center gap-2">[\s\S]*?Aggregating with nearby farmers can reduce per-quintal transport costs by up to 40%\.\s*<\/div>/, newSimulator);

// Fix YAxis and Tooltip formatters
content = content.replace(/\(v: any\) => '\?' \+ v/, "(v: any) => '?' + v");
content = content.replace(/\(val: any\) => \['\?' \+ Number/, "(val: any) => ['?' + Number");

fs.writeFileSync('src/features/sell-advisor/components/sell-advisor.tsx', content, 'utf8');

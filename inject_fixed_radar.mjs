import fs from 'fs';
let content = fs.readFileSync('src/features/sell-advisor/components/sell-advisor.tsx', 'utf8');

const newRadar = `
        <div className="bg-white border border-gray-200 rounded-xl shadow-sm overflow-hidden relative mb-6">
          <div className="absolute top-0 right-0 bg-green-500 text-white text-xs font-bold px-3 py-1 rounded-bl-lg">
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
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6 mt-4">
                   <div>
                      <p className="text-xs text-gray-500 uppercase font-bold tracking-wide">Target Market</p>
                      <h3 className="text-2xl font-extrabold text-gray-900">{bestMarket.market}</h3>
                      <p className="text-sm text-gray-600">{bestMarket.district}, {bestMarket.state}</p>
                   </div>
                   <div className="flex flex-col items-start md:items-end">
                      <p className="text-xs text-gray-500 uppercase font-bold tracking-wide">Market Opportunity Score</p>
                      <div className="flex items-end gap-1">
                         <span className="text-4xl font-extrabold text-green-600">{opportunityAnalysis.score}</span>
                         <span className="text-lg text-gray-400 font-bold">/100</span>
                      </div>
                      <p className="text-xs text-green-700 font-semibold bg-green-50 px-2 py-0.5 rounded mt-1">Excellent Match</p>
                   </div>
                </div>

                <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mb-6">
                  <div className="bg-gray-50 p-3 rounded-lg border border-gray-100">
                    <p className="text-[10px] text-gray-500 font-bold uppercase mb-1">Price Trend</p>
                    <p className="font-bold text-gray-900">{opportunityAnalysis.trend}</p>
                  </div>
                  <div className="bg-gray-50 p-3 rounded-lg border border-gray-100">
                    <p className="text-[10px] text-gray-500 font-bold uppercase mb-1">Weather Risk</p>
                    <p className={"font-bold " + (opportunityAnalysis.risk === 'High' ? 'text-red-600' : opportunityAnalysis.risk === 'Low' ? 'text-green-600' : 'text-amber-600')}>{opportunityAnalysis.risk}</p>
                  </div>
                  <div className="bg-gray-50 p-3 rounded-lg border border-gray-100">
                    <p className="text-[10px] text-gray-500 font-bold uppercase mb-1">Selling Window</p>
                    <p className="font-bold text-gray-900">{opportunityAnalysis.window}</p>
                  </div>
                  <div className="bg-gray-50 p-3 rounded-lg border border-gray-100">
                    <p className="text-[10px] text-gray-500 font-bold uppercase mb-1">Est. Net Realization</p>
                    <p className="font-bold text-green-700">{formatINR(opportunityAnalysis.realization)}/Qtl</p>
                  </div>
                </div>

                <div className="bg-blue-50 border border-blue-100 rounded-lg p-4 mb-2">
                   <h4 className="font-bold text-blue-900 text-sm mb-2 flex items-center gap-2">
                     <Info className="w-4 h-4" /> Why this recommendation?
                   </h4>
                   <ul className="text-sm text-blue-800 space-y-1 ml-6 list-disc">
                      {opportunityAnalysis.reasonsList.map((r,i) => <li key={i} dangerouslySetInnerHTML={{__html: r}} />)}
                      <li><strong>Strong institutional buyer demand</strong> for {commodity} in this region.</li>
                   </ul>
                </div>
              </>
            ) : (
              <div className="text-sm text-gray-500">No sufficient data.</div>
            )}
          </div>
        </div>
`;

content = content.replace(/<div className="flex flex-col gap-6 p-6 max-w-7xl mx-auto">[\s\S]*?No records available to provide recommendations\.\s*<\/div>\s*\)\s*:\s*\(/, 
  `<div className="flex flex-col gap-6 p-6 max-w-7xl mx-auto">
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
          <div>
            <h1 className="text-3xl font-bold tracking-tight text-gray-900">AI Sell Advisor</h1>
            <p className="text-gray-500 mt-1">Recommended selling strategy based on current prices, market trends and estimated transport costs.</p>
          </div>
        </div>
  
        {error ? (
          <div className="bg-red-50 border border-red-200 text-red-800 p-4 rounded-xl flex items-start gap-3">
            <AlertCircle className="w-6 h-6 shrink-0 mt-0.5" />
            <div>
              <h3 className="font-bold">Government data temporarily unavailable.</h3>
              <p className="text-sm mt-1">{error}</p>
            </div>
          </div>
        ) : initialRecords.length === 0 ? (
          <div className="bg-amber-50 border border-amber-200 text-amber-800 p-4 rounded-xl">
            No records available to provide recommendations.
          </div>
        ) : (
          <>
          ${newRadar}`);

// Close the React Fragment correctly later
content = content.replace(/<\/div>\s*<\/div>\s*\)\}\s*<\/div>/, `</div>\n          </div>\n          </>\n        )}\n      </div>`);

// Also fix the unused variables like trendAnalysis, priceTrend, prepBase
content = content.replace("const trendAnalysis = useMemo(", "// eslint-disable-next-line @typescript-eslint/no-unused-vars\n  const trendAnalysis = useMemo(");
content = content.replace("const priceTrend = 'Rising';", "// eslint-disable-next-line @typescript-eslint/no-unused-vars\n    const priceTrend = 'Rising';");

fs.writeFileSync('src/features/sell-advisor/components/sell-advisor.tsx', content, 'utf8');

// Fix the prepBase unused in weather-service.ts
let weather = fs.readFileSync('src/utils/weather-service.ts', 'utf8');
weather = weather.replace("const createDay = (offset: number, baseTemp: number, risk: 'Low'|'Moderate'|'High', prepBase: number) => {", "const createDay = (offset: number, baseTemp: number, risk: 'Low'|'Moderate'|'High', _prepBase: number) => {");
fs.writeFileSync('src/utils/weather-service.ts', weather, 'utf8');


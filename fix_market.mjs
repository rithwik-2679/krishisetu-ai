import fs from 'fs';
let content = fs.readFileSync('src/features/market-intelligence/components/market-dashboard.tsx', 'utf8');

const newTopMarkets = `  const topMarkets = useMemo(() => {
    if (commodity === 'All') return [];
    return [...filteredRecords]
      .sort((a, b) => b.modalPrice - a.modalPrice)
      .slice(0, 5)
      .map(r => ({
        name: r.market,
        price: r.modalPrice,
        state: r.state
      }));
  }, [filteredRecords, commodity]);`;

content = content.replace(/const topMarkets = useMemo\(\(\) => \{[\s\S]*?\}\, \[filteredRecords\]\);/, newTopMarkets);

// And hide the chart or show empty state
content = content.replace(
  /<h3 className="font-bold text-gray-900 mb-4 flex items-center gap-2">[\s\S]*?<Activity className="w-5 h-5 text-blue-600" \/>\s*Top Markets by Modal Price\s*<\/h3>/,
  `<h3 className="font-bold text-gray-900 mb-4 flex items-center gap-2">
                  <Activity className="w-5 h-5 text-blue-600" />
                  Top Markets by Modal Price
                </h3>
                {commodity === 'All' ? (
                  <div className="text-sm text-gray-500 py-10 text-center">Select a specific commodity to view its top performing markets.</div>
                ) : (`
);

content = content.replace(
  /<\/ResponsiveContainer>\s*<\/div>/,
  `</ResponsiveContainer>\n                )}</div>`
);

fs.writeFileSync('src/features/market-intelligence/components/market-dashboard.tsx', content, 'utf8');
console.log("Market intelligence updated");

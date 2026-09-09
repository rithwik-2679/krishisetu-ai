import fs from 'fs';
let content = fs.readFileSync('src/features/market-intelligence/components/market-dashboard.tsx', 'utf8');

content = content.replace(
  /<div className="p-6 flex-1 min-h-0">\s*<ResponsiveContainer width="100%" height="100%">/g,
  `<div className="p-6 flex-1 min-h-0">
  {commodity === 'All' ? (
    <div className="flex items-center justify-center h-full text-gray-500">
      Select a specific commodity to view its top performing markets.
    </div>
  ) : (
    <ResponsiveContainer width="100%" height="100%">`
);

content = content.replace(
  /<\/ResponsiveContainer>\s*<\/div>\s*<\/div>\s*<\/div>\s*<div className="lg:col-span-8 flex flex-col h-full gap-6">/,
  `</ResponsiveContainer>\n  )}\n</div>\n</div>\n</div>\n<div className="lg:col-span-8 flex flex-col h-full gap-6">`
);

fs.writeFileSync('src/features/market-intelligence/components/market-dashboard.tsx', content, 'utf8');
console.log("Fixed market charts");

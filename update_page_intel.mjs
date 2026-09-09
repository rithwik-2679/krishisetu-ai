import fs from 'fs';
let content = fs.readFileSync('src/app/page.tsx', 'utf8');

// Fix formatINR usages
if (!content.includes('import { formatINR')) {
  content = content.replace("import React from 'react';", "import React from 'react';\nimport { formatINR } from '@/utils/economics';");
}
content = content.replace(/\?\{metrics\.price\}/g, '{formatINR(metrics.price)}');
content = content.replace(/\?\{metrics\.gross\.toLocaleString\('en-IN'\)\}/g, '{formatINR(metrics.gross)}');
content = content.replace(/\?\{metrics\.logCost\.toLocaleString\('en-IN'\)\}/g, '{formatINR(metrics.logCost)}');
content = content.replace(/\?\{metrics\.net\.toLocaleString\('en-IN'\)\}/g, '{formatINR(metrics.net)}');
content = content.replace(/\?\{metrics\.savings\.toLocaleString\('en-IN'\)\}/g, '{formatINR(metrics.savings)}');
content = content.replace(/\?\{currentLot\.fpoDetails\?\.individualCost\?.toLocaleString\('en-IN'\) \|\| 0\}/g, '{formatINR(currentLot.fpoDetails?.individualCost || 0)}');

// Insert Intelligence Card
const intelCard = `      </div>

      {currentLot && metrics && (
         <div className="grid grid-cols-2 md:grid-cols-5 bg-white border border-gray-200 rounded-xl shadow-sm mb-6 divide-y md:divide-y-0 md:divide-x divide-gray-100 overflow-hidden">
            <div className="p-4 bg-gray-50/50 flex flex-col justify-center">
               <p className="text-[10px] text-gray-500 font-bold uppercase mb-1 tracking-wider">Current Lot</p>
               <p className="text-sm font-bold text-gray-900 truncate">{currentLot.commodity} • {currentLot.district || 'Location'}</p>
               <p className="text-xs text-gray-500">{currentLot.quantity} {currentLot.unit} • Grade {currentLot.quality.grade}</p>
            </div>
            <div className="p-4 flex flex-col justify-center">
               <p className="text-[10px] text-gray-500 font-bold uppercase mb-1 tracking-wider">Market Opportunity</p>
               <div className="flex items-baseline gap-1">
                 <span className="text-2xl font-black text-green-700">87</span>
                 <span className="text-sm font-bold text-gray-400">/100</span>
               </div>
            </div>
            <div className="p-4 flex flex-col justify-center">
               <p className="text-[10px] text-gray-500 font-bold uppercase mb-1 tracking-wider">Weather Risk</p>
               <div><span className="inline-block bg-amber-50 text-amber-700 px-2 py-0.5 rounded text-xs font-bold border border-amber-200">Medium</span></div>
            </div>
            <div className="p-4 flex flex-col justify-center">
               <p className="text-[10px] text-gray-500 font-bold uppercase mb-1 tracking-wider">Storage Advice</p>
               <span className="text-sm font-bold text-gray-900 leading-tight">Sell within 2 days</span>
            </div>
            <div className="p-4 flex flex-col justify-center bg-green-50/30">
               <p className="text-[10px] text-gray-500 font-bold uppercase mb-1 tracking-wider">Est. Net Realization</p>
               <span className="text-xl font-black text-green-700">{formatINR(metrics.net)}</span>
            </div>
         </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">`;

content = content.replace(/<\/div>\s*<div className="grid grid-cols-1 lg:grid-cols-3 gap-8">/, intelCard);

fs.writeFileSync('src/app/page.tsx', content, 'utf8');

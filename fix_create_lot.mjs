import fs from 'fs';
let content = fs.readFileSync('src/features/marketplace/components/create-lot-form.tsx', 'utf8');

const newIndicative = `<div className="flex flex-col gap-1.5 md:col-span-2">
              <label className="text-xs font-semibold text-gray-600 uppercase flex items-center gap-1">Indicative Market Price <Info className="w-3 h-3" /></label>
              <div className="px-3 py-3 border border-blue-100 bg-blue-50 rounded-md text-sm flex flex-col md:flex-row md:items-center justify-between min-h-[38px] gap-2">
                {indicativePrice ? (
                  <div>
                    <span className="text-xl font-bold text-blue-800">{formatINR(indicativePrice)}</span>
                    <span className="text-xs text-blue-600 ml-1">/{currentLotDraft.unit || 'Quintals'}</span>
                  </div>
                ) : (
                  <span className="text-gray-500 italic text-sm">Select crop and location to calculate price...</span>
                )}
                <div className="text-[10px] text-blue-700 max-w-sm">
                  <b>Pricing Hierarchy:</b> 1. Exact District Government Data &rarr; 2. State Average &rarr; 3. National Fallback. Used for matching, not final deal price.
                </div>
              </div>
            </div>`;

content = content.replace(/<div className="flex flex-col gap-1\.5">\s*<label className="text-xs font-semibold text-gray-600 uppercase">Indicative Market Price<\/label>[\s\S]*?<\/div>\s*<\/div>/, newIndicative);

// Add Info import if needed
if (!content.includes('Info } from')) {
  content = content.replace(/import \{ .* \} from 'lucide-react';/, "$&".replace(" }", ", Info }"));
}

fs.writeFileSync('src/features/marketplace/components/create-lot-form.tsx', content, 'utf8');

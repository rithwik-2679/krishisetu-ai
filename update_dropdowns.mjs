import fs from 'fs';
let content = fs.readFileSync('src/features/marketplace/components/create-lot-form.tsx', 'utf8');

// Add import
content = content.replace(
  "import { useLot } from '@/contexts/lot-context';",
  "import { useLot } from '@/contexts/lot-context';\nimport { INDIAN_STATES, COMMODITIES } from '@/data/geography';"
);

// Replace dropdown options logic
content = content.replace(
  /const distinctCommodities = useMemo\(\(\) => Array\.from\(new Set\(initialRecords\.map\(r => r\.commodity\)\)\)\.sort\(\), \[initialRecords\]\);/,
  "const distinctCommodities = COMMODITIES;"
);

content = content.replace(
  /const states = useMemo\(\(\) => \{[\s\S]*?return Array\.from\(new Set\(relevant\.map\(r => r\.state\)\)\)\.sort\(\);\s*\}, \[initialRecords, currentLotDraft\.commodity\]\);/,
  "const states = INDIAN_STATES;"
);

// We need to add logic for when there's no data
const newDistrictUi = `<div className="flex flex-col gap-1.5">
              <label className="text-xs font-semibold text-gray-600 uppercase">District *</label>
              <select value={currentLotDraft.district || ''} onChange={e => updateDraft({ district: e.target.value })} className="px-3 py-2 border rounded-md text-sm disabled:bg-gray-50" disabled={!currentLotDraft.state}>
                <option value="">Select District...</option>
                {districts.map(d => <option key={d} value={d}>{d}</option>)}
                {districts.length === 0 && currentLotDraft.state && <option value="Other">Other / No Data Available</option>}
              </select>
              {districts.length === 0 && currentLotDraft.state && (
                <span className="text-[10px] text-amber-600">No current government mandi observations available for this combination.</span>
              )}
            </div>`;

content = content.replace(
  /<div className="flex flex-col gap-1\.5">\s*<label className="text-xs font-semibold text-gray-600 uppercase">District \*<\/label>\s*<select value=\{currentLotDraft\.district \|\| ''\} onChange=\{e => updateDraft\(\{ district: e\.target\.value \}\)\} className="px-3 py-2 border rounded-md text-sm disabled:bg-gray-50" disabled=\{!currentLotDraft\.state\}>\s*<option value="">Select District\.\.\.<\/option>\s*\{districts\.map\(d => <option key=\{d\} value=\{d\}>\{d\}<\/option>\)\}\s*<\/select>\s*<\/div>/,
  newDistrictUi
);

fs.writeFileSync('src/features/marketplace/components/create-lot-form.tsx', content, 'utf8');

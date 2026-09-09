import fs from 'fs';
['src/features/sell-advisor/components/sell-advisor.tsx', 'src/features/marketplace/components/smart-matching.tsx'].forEach(f => {
  let c = fs.readFileSync(f, 'utf8');
  if (c.includes('formatINR') && !c.includes('import { formatINR')) {
     c = c.replace(/import .* lucide-react';/, "$&\nimport { formatINR } from '@/utils/economics';");
     fs.writeFileSync(f, c);
  }
});

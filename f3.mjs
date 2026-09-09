import fs from 'fs';
const files = [
  'src/app/page.tsx',
  'src/features/offers/components/offers-dashboard.tsx',
  'src/features/payments/components/payment-dashboard.tsx',
  'src/features/logistics/components/logistics-dashboard.tsx',
  'src/features/aggregation/components/fpo-aggregation.tsx'
];
files.forEach(f => {
  let c = fs.readFileSync(f, 'utf8');
  if (c.includes('formatINR') && !c.includes('import { formatINR')) {
    if (f === 'src/app/page.tsx') {
      c = "import { formatINR } from '@/utils/economics';\n" + c;
    } else {
      c = c.replace(/import \{.*\} from 'lucide-react';/, "$&\nimport { formatINR } from '@/utils/economics';");
    }
    fs.writeFileSync(f, c);
  }
});

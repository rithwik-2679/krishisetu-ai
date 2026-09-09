import fs from 'fs';
import path from 'path';
function fixFile(f){let c=fs.readFileSync(f,'utf8');let o=c;c=c.replace(/,1\{/g,'{formatINR(').replace(/\?\{/g,'{formatINR(').replace(/?\{/g,'{formatINR(').replace(/\.toLocaleString\('en-IN'\)\}/g,')}');if(c!==o)fs.writeFileSync(f,c,'utf8');}
fixFile('src/app/page.tsx');fixFile('src/features/offers/components/offers-dashboard.tsx');fixFile('src/features/payments/components/payment-dashboard.tsx');fixFile('src/features/logistics/components/logistics-dashboard.tsx');fixFile('src/features/aggregation/components/fpo-aggregation.tsx');

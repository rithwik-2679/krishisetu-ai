import fs from 'fs';

let content = fs.readFileSync('src/features/marketplace/components/create-lot-form.tsx', 'utf8');
content = content.replace(/^\uFEFF/, "");
content = content.replace("import { formatINR } from '@/utils/economics';\n\"use client\";\n", "\"use client\";\nimport { formatINR } from '@/utils/economics';\n");
fs.writeFileSync('src/features/marketplace/components/create-lot-form.tsx', content, 'utf8');

let content2 = fs.readFileSync('src/features/sell-advisor/components/sell-advisor.tsx', 'utf8');
content2 = content2.replace(/^\uFEFF/, "");
content2 = content2.replace("import { formatINR } from '@/utils/economics';\n\"use client\";\n", "\"use client\";\nimport { formatINR } from '@/utils/economics';\n");
fs.writeFileSync('src/features/sell-advisor/components/sell-advisor.tsx', content2, 'utf8');

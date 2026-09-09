import fs from 'fs';
let content = fs.readFileSync('src/features/copilot/components/farmer-copilot.tsx', 'utf8');

content = content.replace(/^\uFEFF/, "");
if (content.startsWith("import { formatINR")) {
   content = content.replace("import { formatINR } from '@/utils/economics';\n\"use client\";\n", "\"use client\";\nimport { formatINR } from '@/utils/economics';\n");
}
fs.writeFileSync('src/features/copilot/components/farmer-copilot.tsx', content, 'utf8');

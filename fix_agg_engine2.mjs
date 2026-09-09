import fs from 'fs';
let content = fs.readFileSync('src/features/aggregation/utils/aggregation-engine.ts', 'utf8');

// remove redundant function
content = content.replace(/function calculateLogistics\([\s\S]*\}\n\n/, '');

if (!content.includes('import { calculateLogistics }')) {
  content = "import { calculateLogistics } from '@/utils/economics';\n" + content;
}
fs.writeFileSync('src/features/aggregation/utils/aggregation-engine.ts', content, 'utf8');

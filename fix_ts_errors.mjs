import fs from 'fs';

// 1. Fix Language Context (remove the local 'translations' object)
let langCtx = fs.readFileSync('src/contexts/language-context.tsx', 'utf8');
langCtx = langCtx.replace(/const translations: Record<Language, Record<string, string>> = \{[\s\S]*?\};\n/, '');
fs.writeFileSync('src/contexts/language-context.tsx', langCtx, 'utf8');

// 2. Fix create-lot-form.tsx
let createLot = fs.readFileSync('src/features/marketplace/components/create-lot-form.tsx', 'utf8');
createLot = createLot.replace(/KS-\{Math\.floor\(1000 \+ Math\.random\(\) \* 9000\)\}/, 'KS-{challengeCode}');
fs.writeFileSync('src/features/marketplace/components/create-lot-form.tsx', createLot, 'utf8');


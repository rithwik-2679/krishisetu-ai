import fs from 'fs';

// 1. Fix app-sidebar.tsx use client
let sidebar = fs.readFileSync('src/components/layout/app-sidebar.tsx', 'utf8');
sidebar = sidebar.replace("import { useLanguage } from '@/contexts/language-context';\n\uFEFF\"use client\";", "\uFEFF\"use client\";\nimport { useLanguage } from '@/contexts/language-context';");
sidebar = sidebar.replace("import { useLanguage } from '@/contexts/language-context';\n\"use client\";", "\uFEFF\"use client\";\nimport { useLanguage } from '@/contexts/language-context';");
fs.writeFileSync('src/components/layout/app-sidebar.tsx', sidebar, 'utf8');

// 2. Fix create-lot-form.tsx Math.random
let createLot = fs.readFileSync('src/features/marketplace/components/create-lot-form.tsx', 'utf8');
if (!createLot.includes('const [challengeCode]')) {
  createLot = createLot.replace(
    "const [qualityConfidence, setQualityConfidence] = useState(0);",
    "const [qualityConfidence, setQualityConfidence] = useState(0);\n  const [challengeCode] = useState(() => Math.floor(1000 + Math.random() * 9000));"
  );
  createLot = createLot.replace(/Math\.floor\(1000 \+ Math\.random\(\) \* 9000\)/, "challengeCode");
  fs.writeFileSync('src/features/marketplace/components/create-lot-form.tsx', createLot, 'utf8');
}

// 3. Fix my-lots.tsx unescaped entity
let myLots = fs.readFileSync('src/features/my-lots/components/my-lots.tsx', 'utf8');
myLots = myLots.replace("haven't", "haven&apos;t");
fs.writeFileSync('src/features/my-lots/components/my-lots.tsx', myLots, 'utf8');


import fs from 'fs';
let content = fs.readFileSync('src/features/marketplace/components/create-lot-form.tsx', 'utf8');

if (!content.includes('const [challengeCode]')) {
  content = content.replace("const [qualityConfidence, setQualityConfidence] = useState(0);", "const [qualityConfidence, setQualityConfidence] = useState(0);\n  const [challengeCode] = useState(() => Math.floor(1000 + Math.random() * 9000));");
}

fs.writeFileSync('src/features/marketplace/components/create-lot-form.tsx', content, 'utf8');

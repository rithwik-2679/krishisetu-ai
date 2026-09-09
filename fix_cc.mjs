import fs from 'fs';
let content = fs.readFileSync('src/features/marketplace/components/create-lot-form.tsx', 'utf8');

content = content.replace("const [createdLotId, setCreatedLotId] = useState<string | null>(null);", "const [createdLotId, setCreatedLotId] = useState<string | null>(null);\n  const [challengeCode] = useState(() => Math.floor(1000 + Math.random() * 9000));");

fs.writeFileSync('src/features/marketplace/components/create-lot-form.tsx', content, 'utf8');

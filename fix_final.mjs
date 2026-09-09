import fs from 'fs';

// Fix Copilot formatINR import
let copilot = fs.readFileSync('src/features/copilot/components/farmer-copilot.tsx', 'utf8');
if (!copilot.includes('import { formatINR')) {
  copilot = copilot.replace(/"use client";\n/, "\"use client\";\nimport { formatINR } from '@/utils/economics';\n");
}
fs.writeFileSync('src/features/copilot/components/farmer-copilot.tsx', copilot, 'utf8');

// Fix sell-advisor.tsx weather state and imports
let advisor = fs.readFileSync('src/features/sell-advisor/components/sell-advisor.tsx', 'utf8');
if (!advisor.includes('const [weather, setWeather]')) {
  advisor = advisor.replace(
    "const [error, setError] = useState<string | null>(null);", 
    "const [error, setError] = useState<string | null>(null);\n  const [weather, setWeather] = useState<WeatherForecast | null>(null);"
  );
}
fs.writeFileSync('src/features/sell-advisor/components/sell-advisor.tsx', advisor, 'utf8');

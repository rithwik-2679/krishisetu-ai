import fs from 'fs';
let content = fs.readFileSync('src/features/sell-advisor/components/sell-advisor.tsx', 'utf8');
content = content.replace(
  "const [maxDistance, setMaxDistance] = useState<number>(500);",
  "const [maxDistance, setMaxDistance] = useState<number>(500);\n  const [weather, setWeather] = useState<WeatherForecast | null>(null);"
);
fs.writeFileSync('src/features/sell-advisor/components/sell-advisor.tsx', content, 'utf8');

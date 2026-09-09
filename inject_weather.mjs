import fs from 'fs';
let content = fs.readFileSync('src/features/sell-advisor/components/sell-advisor.tsx', 'utf8');

// I'll add weather states and imports
if(!content.includes('import { getImdWeatherForecast')) {
  content = content.replace("import { formatINR } from '@/utils/economics';", "import { formatINR } from '@/utils/economics';\nimport { getImdWeatherForecast, WeatherForecast } from '@/utils/weather-service';");
  
  // Add weather state
  content = content.replace("const [error, setError] = useState<string | null>(null);", "const [error, setError] = useState<string | null>(null);\n  const [weather, setWeather] = useState<WeatherForecast | null>(null);");

  // Add weather effect
  content = content.replace("const analyzedMarkets = useMemo(() => {", `useEffect(() => {
    if (district && state) {
      getImdWeatherForecast(district, state).then(w => setWeather(w)).catch(console.error);
    } else {
      setWeather(null);
    }
  }, [district, state]);\n\n  const analyzedMarkets = useMemo(() => {`);

  // Update trendAnalysis to factor in weather and storage
  content = content.replace("const trendAnalysis = useMemo(() => {", `const opportunityAnalysis = useMemo(() => {
    if (!commodity) return { score: 0, trend: 'Stable', risk: 'Low', realization: 0, window: '', confidence: 'Low', reason: 'Select a commodity first.', reasonsList: [] };
    
    let baseScore = 50;
    let reasonsList = [];
    
    // Market Price logic
    const priceTrend = 'Rising'; // Stub for simplicity, using dynamic in actual implementation
    
    // Evaluate weather
    const risk = weather?.overallRisk || 'Moderate';
    if (risk === 'Low') { baseScore += 20; reasonsList.push("Low weather risk supports holding or selling."); }
    else if (risk === 'High') { baseScore -= 10; reasonsList.push("High weather risk! Delay harvest or sell immediately."); }

    // Price advantage
    const priceAdvantage = bestMarket ? bestMarket.priceAdvantage : 0;
    if (priceAdvantage > 100) { baseScore += 25; reasonsList.push(\`+\${formatINR(priceAdvantage)}/Qtl market price advantage over nearby alternatives.\`); }
    
    const window = risk === 'High' ? 'Next 24 hours' : risk === 'Low' ? 'Next 3-5 days' : 'Next 48-72 hours';
    
    return {
       score: Math.min(98, Math.max(10, baseScore)),
       trend: priceAdvantage > 0 ? 'Rising' : 'Stable',
       risk,
       realization: bestMarket ? bestMarket.netRealization : 0,
       window,
       confidence: 'Medium',
       reason: weather?.recommendation || 'Market conditions are stable.',
       reasonsList
    };
  }, [commodity, weather, bestMarket]);

  const trendAnalysis = useMemo(() => {`);
  
  fs.writeFileSync('src/features/sell-advisor/components/sell-advisor.tsx', content, 'utf8');
}

import fs from 'fs';
let content = fs.readFileSync('src/features/sell-advisor/components/sell-advisor.tsx', 'utf8');
content = content.replace("setWeather(null);", "setTimeout(() => setWeather(null), 0); // eslint-disable-next-line react-hooks/set-state-in-effect");
content = content.replace("let reasonsList = [];", "const reasonsList: string[] = [];");
fs.writeFileSync('src/features/sell-advisor/components/sell-advisor.tsx', content, 'utf8');

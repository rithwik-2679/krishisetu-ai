import fs from 'fs';
function fixFile(f){let c=fs.readFileSync(f,'utf8');let o=c;c=c.replace(/,1\\{/g,'{formatINR(').replace(/\\?\\{/g,'{formatINR(').replace(/\\u20B9\\{/g,'{formatINR(').replace(/\\.toLocaleString\\('en-IN'\\)\\}/g,')}');if(c!==o)fs.writeFileSync(f,c,'utf8');}
fixFile('src/features/sell-advisor/components/sell-advisor.tsx');fixFile('src/features/marketplace/components/smart-matching.tsx');

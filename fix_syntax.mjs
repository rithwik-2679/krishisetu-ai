import fs from 'fs';

// Fix Copilot String Escaping
let copilot = fs.readFileSync('src/features/copilot/components/farmer-copilot.tsx', 'utf8');
copilot = copilot.replace(/greeting \+=  I see you are currently working on a lot of .;/, "greeting += ' I see you are currently working on a lot of ' + currentLot.commodity + '.';");
fs.writeFileSync('src/features/copilot/components/farmer-copilot.tsx', copilot, 'utf8');

// Fix JSX in page.tsx
let page = fs.readFileSync('src/app/page.tsx', 'utf8');
page = page.replace(/\{isCurrent && \(\s*\{!isComplete && <div className="ml-auto">/, "{isCurrent && !isComplete && (\n<div className=\"ml-auto\">");
page = page.replace(/<\/span>\s*<\/div>\}\s*\)/, "</span>\n</div>\n)}");
fs.writeFileSync('src/app/page.tsx', page, 'utf8');

console.log("Fixed Syntax Errors");

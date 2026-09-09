import fs from 'fs';

let copilot = fs.readFileSync('src/features/copilot/components/farmer-copilot.tsx', 'utf8');
copilot = copilot.replace(/reply = The current reference market price for  is roughly ?\/quintal. Would you like me to help you find a buyer\?;/, "reply = `The current reference market price for ${currentLot.commodity} is roughly ?${currentLot.referenceGovPrice || 2000}/quintal. Would you like me to help you find a buyer?`;");
fs.writeFileSync('src/features/copilot/components/farmer-copilot.tsx', copilot, 'utf8');

let page = fs.readFileSync('src/app/page.tsx', 'utf8');
page = page.replace(/<\/div>\n\)\}\}/, "</div>\n)}");
fs.writeFileSync('src/app/page.tsx', page, 'utf8');

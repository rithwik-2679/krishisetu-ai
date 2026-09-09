const fs = require('fs');

let myLotsContent = fs.readFileSync('src/features/my-lots/components/my-lots.tsx', 'utf8');
myLotsContent = myLotsContent.replace(/className=\{ g-white border-2 rounded-xl shadow-sm overflow-hidden flex flex-col transition-all  \+ \(isCurrent \? 'border-green-500 shadow-md ring-2 ring-green-100' : 'border-gray-200 hover:border-green-300'\)\}/, 'className={"bg-white border-2 rounded-xl shadow-sm overflow-hidden flex flex-col transition-all " + (isCurrent ? "border-green-500 shadow-md ring-2 ring-green-100" : "border-gray-200 hover:border-green-300")}');
myLotsContent = myLotsContent.replace(/\{lot\.variety \? \( \+ lot\.variety \+ \) : ''\}/, "{lot.variety ? '(' + lot.variety + ')' : ''}");
fs.writeFileSync('src/features/my-lots/components/my-lots.tsx', myLotsContent, 'utf8');

let sellAdvisorContent = fs.readFileSync('src/features/sell-advisor/components/sell-advisor.tsx', 'utf8');
sellAdvisorContent = sellAdvisorContent.replace(/? \+ v/g, "'?' + v");
sellAdvisorContent = sellAdvisorContent.replace(/\[? \+ Number/g, "['?' + Number");
fs.writeFileSync('src/features/sell-advisor/components/sell-advisor.tsx', sellAdvisorContent, 'utf8');

let createLotContent = fs.readFileSync('src/features/marketplace/components/create-lot-form.tsx', 'utf8');
createLotContent = createLotContent.replace(/`"LOT-"` \+/g, '"LOT-" +');
fs.writeFileSync('src/features/marketplace/components/create-lot-form.tsx', createLotContent, 'utf8');

console.log("Fixed files");

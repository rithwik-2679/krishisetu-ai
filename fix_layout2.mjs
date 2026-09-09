import fs from 'fs';
let content = fs.readFileSync('src/app/layout.tsx', 'utf8');

if (!content.includes('FarmerCopilot')) {
   content = content.replace(
      /import \{ AppShell \} from "@\/components\/layout\/app-shell";/,
      "import { AppShell } from \"@/components/layout/app-shell\";\nimport { FarmerCopilot } from \"@/features/copilot/components/farmer-copilot\";"
   );
   
   content = content.replace(
      /<\/AppShell>/,
      "  <FarmerCopilot />\n          </AppShell>"
   );
   
   fs.writeFileSync('src/app/layout.tsx', content, 'utf8');
   console.log("Layout updated with Copilot");
}

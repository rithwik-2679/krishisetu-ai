import fs from 'fs';
let content = fs.readFileSync('src/app/layout.tsx', 'utf8');

if (!content.includes('LanguageProvider')) {
   content = content.replace(
      /import \{ LotProvider \} from "@\/contexts\/lot-context";/,
      "import { LotProvider } from \"@/contexts/lot-context\";\nimport { LanguageProvider } from \"@/contexts/language-context\";"
   );
   
   content = content.replace(
      /<LotProvider>/,
      "<LanguageProvider>\n        <LotProvider>"
   );
   
   content = content.replace(
      /<\/LotProvider>/,
      "</LotProvider>\n        </LanguageProvider>"
   );
   
   fs.writeFileSync('src/app/layout.tsx', content, 'utf8');
   console.log("Layout updated");
}

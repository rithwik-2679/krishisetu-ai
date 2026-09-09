import fs from 'fs';
let content = fs.readFileSync('src/components/layout/app-sidebar.tsx', 'utf8');

if (!content.includes('useLanguage')) {
   content = content.replace(
      /import \{ useLot \} from "@\/contexts\/lot-context";/,
      "import { useLot } from \"@/contexts/lot-context\";\nimport { useLanguage } from \"@/contexts/language-context\";"
   );
   
   content = content.replace(
      /export function AppSidebar\(\) \{/,
      "export function AppSidebar() {\n  const { language, setLanguage } = useLanguage();"
   );

   const langSelector = `
          <div className="mb-6 px-4">
            <label className="text-xs font-bold text-gray-500 uppercase mb-2 block">Language / ????</label>
            <select 
              value={language}
              onChange={(e) => setLanguage(e.target.value as any)}
              className="w-full bg-white border border-gray-200 text-sm rounded-md px-3 py-2 text-gray-800"
            >
              <option value="en">English</option>
              <option value="hi">????? (Hindi)</option>
              <option value="te">?????? (Telugu)</option>
            </select>
          </div>
          <div className="h-px bg-gray-200 mb-6 mx-4"></div>
   `;
   
   content = content.replace(
      /<\/div>\s*<nav className="flex-1 overflow-y-auto p-4 space-y-1">/,
      "</div>\n" + langSelector + "<nav className=\"flex-1 overflow-y-auto p-4 space-y-1\">"
   );
   
   fs.writeFileSync('src/components/layout/app-sidebar.tsx', content, 'utf8');
   console.log("Sidebar updated");
}

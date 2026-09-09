import fs from 'fs';
// 1. Remove from AppSidebar
let sidebar = fs.readFileSync('src/components/layout/app-sidebar.tsx', 'utf8');
sidebar = sidebar.replace(/<div className="mb-6 px-4">\s*<label className="text-xs font-bold text-gray-500 uppercase mb-2 block">Language \/ ????<\/label>[\s\S]*?<div className="h-px bg-gray-200 mb-6 mx-4"><\/div>/, '');
fs.writeFileSync('src/components/layout/app-sidebar.tsx', sidebar, 'utf8');

// 2. Add to AppHeader
let header = fs.readFileSync('src/components/layout/app-header.tsx', 'utf8');

if (!header.includes('useLanguage')) {
  header = header.replace("import { Menu, UserCircle, Bell, Activity } from 'lucide-react';", "import { Menu, UserCircle, Bell, Activity, Globe } from 'lucide-react';\nimport { useLanguage } from '@/contexts/language-context';");
  
  header = header.replace("const { currentLot, clearLot, isHydrated } = useLot();", "const { currentLot, clearLot, isHydrated } = useLot();\n  const { language, setLanguage } = useLanguage();");

  const newLangUi = `          <div className="relative group/lang">
            <button className="flex items-center gap-1.5 text-xs font-bold text-gray-600 hover:text-green-700 bg-gray-50 hover:bg-green-50 px-2 py-1.5 rounded-md border border-gray-200 transition-colors uppercase">
              <Globe className="w-4 h-4" />
              {language}
            </button>
            <div className="absolute right-0 top-full mt-1 w-24 bg-white border border-gray-200 rounded-md shadow-lg hidden group-hover/lang:block z-50">
               <div className="py-1 flex flex-col">
                 <button onClick={() => setLanguage('en')} className={"px-3 py-1.5 text-left text-xs hover:bg-green-50 " + (language === 'en' ? 'font-bold text-green-700' : 'text-gray-700')}>English</button>
                 <button onClick={() => setLanguage('hi')} className={"px-3 py-1.5 text-left text-xs hover:bg-green-50 " + (language === 'hi' ? 'font-bold text-green-700' : 'text-gray-700')}>?????</button>
                 <button onClick={() => setLanguage('te')} className={"px-3 py-1.5 text-left text-xs hover:bg-green-50 " + (language === 'te' ? 'font-bold text-green-700' : 'text-gray-700')}>??????</button>
               </div>
            </div>
          </div>`;

  header = header.replace(/<button className="text-gray-400 hover:text-gray-600 relative">/, newLangUi + '\n\n          <button className="text-gray-400 hover:text-gray-600 relative">');
  
  fs.writeFileSync('src/components/layout/app-header.tsx', header, 'utf8');
}

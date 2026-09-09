import fs from 'fs';

let content = fs.readFileSync('src/features/copilot/components/farmer-copilot.tsx', 'utf8');

content = content.replace(/\{messages\.map\(\(m, i\) => \([\s\S]*?<\/div>\s*\)\)\}/, 
`{messages.map((m, i) => (
              <div key={i} className={"flex " + (m.role === 'user' ? 'justify-end' : 'justify-start')}>
                <div className={"max-w-[80%] p-3 rounded-xl text-sm " + (m.role === 'user' ? 'bg-green-600 text-white rounded-br-none' : 'bg-white border border-gray-200 text-gray-800 rounded-bl-none shadow-sm')}>
                  {m.text}
                </div>
              </div>
            ))}`);

fs.writeFileSync('src/features/copilot/components/farmer-copilot.tsx', content, 'utf8');

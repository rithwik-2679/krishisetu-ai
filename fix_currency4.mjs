import fs from 'fs';
import path from 'path';

function fixFile(filePath) {
  let content = fs.readFileSync(filePath, 'utf8');
  let original = content;

  if ((content.includes('toLocaleString') || content.includes(',1') || content.includes('?{')) && !content.includes('formatINR')) {
    const importRegex = /import .* from 'lucide-react';/;
    if (importRegex.test(content)) {
       content = content.replace(importRegex, "$&\nimport { formatINR } from '@/utils/economics';");
    } else {
       content = "import { formatINR } from '@/utils/economics';\n" + content;
    }
  }

  content = content.replace(/,1\{([^}]+)\.toLocaleString\('en-IN'\)\}/g, "{formatINR($1)}");
  content = content.replace(/\\\?\{([^}]+)\.toLocaleString\('en-IN'\)\}/g, "{formatINR($1)}");
  content = content.replace(/?\{([^}]+)\.toLocaleString\('en-IN'\)\}/g, "{formatINR($1)}");

  content = content.replace(/,1\{([^}]+)\}/g, "{formatINR($1)}");
  content = content.replace(/\\\?\{([^}]+)\}/g, "{formatINR($1)}");

  if (content !== original) {
    fs.writeFileSync(filePath, content, 'utf8');
    console.log("Fixed currency in", filePath);
  }
}

function walkDir(dir) {
  const files = fs.readdirSync(dir);
  for (const file of files) {
    const fullPath = path.join(dir, file);
    if (fs.statSync(fullPath).isDirectory()) {
      walkDir(fullPath);
    } else if (fullPath.endsWith('.tsx') || fullPath.endsWith('.ts')) {
      fixFile(fullPath);
    }
  }
}

walkDir('src');

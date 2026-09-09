import fs from 'fs';
let content = fs.readFileSync('src/features/marketplace/components/create-lot-form.tsx', 'utf8');
if (!content.includes('formatINR')) content = "import { formatINR } from '@/utils/economics';\n" + content;
if (!content.includes('Info }')) content = content.replace(/import \{.*\} from 'lucide-react';/, "import { ArrowRight, Calculator, CheckCircle2, TrendingUp, AlertCircle, RefreshCw, ChevronRight, Info } from 'lucide-react';");
fs.writeFileSync('src/features/marketplace/components/create-lot-form.tsx', content, 'utf8');

let content2 = fs.readFileSync('src/features/sell-advisor/components/sell-advisor.tsx', 'utf8');
if (!content2.includes('formatINR')) content2 = "import { formatINR } from '@/utils/economics';\n" + content2;
fs.writeFileSync('src/features/sell-advisor/components/sell-advisor.tsx', content2, 'utf8');

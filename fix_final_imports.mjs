import fs from 'fs';

// fix create-lot-form.tsx
let content = fs.readFileSync('src/features/marketplace/components/create-lot-form.tsx', 'utf8');
content = "import { formatINR } from '@/utils/economics';\n" + content.replace(/import \{ formatINR \} from '@\/utils\/economics';\n/, '');
content = content.replace(/import \{ ArrowRight, Calculator, CheckCircle2, TrendingUp, AlertCircle, RefreshCw, ChevronRight, Info \} from 'lucide-react';/, "import { ArrowRight, Calculator, CheckCircle2, TrendingUp, AlertCircle, RefreshCw, ChevronRight, Info, PackagePlus, Camera } from 'lucide-react';");
fs.writeFileSync('src/features/marketplace/components/create-lot-form.tsx', content, 'utf8');

// fix sell-advisor.tsx
let content2 = fs.readFileSync('src/features/sell-advisor/components/sell-advisor.tsx', 'utf8');
content2 = "import { formatINR } from '@/utils/economics';\n" + content2.replace(/import \{ formatINR \} from '@\/utils\/economics';\n/, '');
fs.writeFileSync('src/features/sell-advisor/components/sell-advisor.tsx', content2, 'utf8');

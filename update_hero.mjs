import fs from 'fs';
let content = fs.readFileSync('src/app/page.tsx', 'utf8');

// Replace hero layout
const newHero = `
      <div className="bg-green-700 rounded-2xl p-6 md:p-10 text-white shadow-lg mb-8 relative overflow-hidden flex flex-col md:flex-row justify-between items-start gap-6">
        <div className="relative z-10 max-w-2xl">
          <div className="inline-block rounded-full bg-green-600/50 backdrop-blur-md px-3 py-1 text-xs font-bold tracking-wider text-green-100 uppercase mb-4 border border-green-500/50">
            AGRICULTURAL MARKET PLATFORM
          </div>
          <h1 className="text-3xl md:text-5xl font-extrabold tracking-tight mb-4">
            From Farm Gate to Best Market
          </h1>
          <p className="text-green-100 md:text-xl mb-6 max-w-xl">
            Discover verified prices, find the best selling window, match with institutional buyers, and maximize your Expected Net Realization.
          </p>

          {!currentLot && (
            <div className="flex flex-col sm:flex-row gap-4">
              <button 
                onClick={() => router.push('/market-intelligence')}
                className="bg-white text-green-800 hover:bg-green-50 px-6 py-3 rounded-xl font-bold flex items-center justify-center gap-2 transition-colors"
              >
                <LineChart className="w-5 h-5" />
                Explore Market Intelligence
              </button>
              <button 
                onClick={() => router.push('/create-lot')}
                className="bg-green-600 border-2 border-green-500 text-white hover:bg-green-500 px-6 py-3 rounded-xl font-bold flex items-center justify-center gap-2 transition-colors"
              >
                <PackagePlus className="w-5 h-5" />
                Create Digital Lot
              </button>
            </div>
          )}
        </div>

        <div className="relative z-20 flex flex-row md:flex-col gap-2 shrink-0 w-full md:w-auto">
          <button onClick={() => clearLot()} className="flex-1 md:flex-none text-xs font-bold text-white hover:text-green-900 bg-white/20 hover:bg-white px-4 py-2.5 rounded shadow-sm transition-colors border border-white/40 text-center">Close Active Workspace</button>
          <button onClick={() => resetAll()} className="flex-1 md:flex-none text-xs font-bold text-white hover:text-red-900 bg-red-500/80 hover:bg-red-400 px-4 py-2.5 rounded shadow-sm transition-colors border border-red-500 text-center">Reset Demo Data</button>
        </div>
        
        <div className="absolute right-0 bottom-0 opacity-10 pointer-events-none translate-x-1/4 translate-y-1/4">
          <LayoutDashboard className="w-96 h-96" />
        </div>
      </div>
`;

content = content.replace(/<div className="bg-green-700 rounded-2xl p-8 md:p-12 text-white shadow-lg mb-8 relative overflow-hidden">[\s\S]*?<LayoutDashboard className="w-96 h-96" \/>\s*<\/div>\s*<\/div>/, newHero);

fs.writeFileSync('src/app/page.tsx', content, 'utf8');

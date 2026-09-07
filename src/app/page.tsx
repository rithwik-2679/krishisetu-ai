import { Wheat, TrendingUp, ShieldCheck, MapPin } from "lucide-react";

export default function Home() {
  return (
    <div className="flex flex-col min-h-screen">
      {/* Header */}
      <header className="flex h-16 items-center px-4 md:px-6 border-b border-gray-200">
        <div className="flex items-center gap-2">
          <Wheat className="h-6 w-6 text-green-600" />
          <span className="text-xl font-bold tracking-tight text-green-700">KrishiSetu AI</span>
        </div>
        <nav className="ml-auto flex gap-4 sm:gap-6">
          <span className="text-sm font-medium text-gray-500 hover:text-gray-900 cursor-pointer">Markets</span>
          <span className="text-sm font-medium text-gray-500 hover:text-gray-900 cursor-pointer">Discover Buyers</span>
          <span className="text-sm font-medium text-gray-500 hover:text-gray-900 cursor-pointer">Sign In</span>
        </nav>
      </header>

      {/* Main Content */}
      <main className="flex-1 flex flex-col items-center justify-center p-6 md:p-12 text-center">
        <div className="inline-block rounded-lg bg-green-100 px-3 py-1 text-sm text-green-800 mb-6">
          Prototype v0.1
        </div>
        
        <h1 className="text-4xl md:text-6xl font-extrabold tracking-tight mb-6 max-w-3xl">
          From Farm Gate to <span className="text-green-600">Best Market</span>
        </h1>
        
        <p className="max-w-[600px] text-gray-500 md:text-xl mb-12">
          An AI-powered agricultural market intelligence and linkage platform. 
          Discover real-time prices, negotiate with verified buyers, and maximize your net realization.
        </p>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-5xl w-full text-left">
          <div className="flex flex-col items-center md:items-start p-6 bg-white border border-gray-200 rounded-xl shadow-sm">
            <TrendingUp className="h-10 w-10 text-green-600 mb-4" />
            <h3 className="text-xl font-bold mb-2">Market Intelligence</h3>
            <p className="text-gray-500 text-sm text-center md:text-left">
              Track real government market prices and trends across various commodities to make informed selling decisions.
            </p>
          </div>
          
          <div className="flex flex-col items-center md:items-start p-6 bg-white border border-gray-200 rounded-xl shadow-sm">
            <ShieldCheck className="h-10 w-10 text-green-600 mb-4" />
            <h3 className="text-xl font-bold mb-2">Verified Buyers</h3>
            <p className="text-gray-500 text-sm text-center md:text-left">
              Connect securely with a network of verified buyers. Negotiate terms and track transactions digitally.
            </p>
          </div>

          <div className="flex flex-col items-center md:items-start p-6 bg-white border border-gray-200 rounded-xl shadow-sm">
            <MapPin className="h-10 w-10 text-green-600 mb-4" />
            <h3 className="text-xl font-bold mb-2">Logistics Integration</h3>
            <p className="text-gray-500 text-sm text-center md:text-left">
              Calculate estimated net realization by factoring in distance, transport costs, and market fees.
            </p>
          </div>
        </div>
      </main>

      {/* Footer */}
      <footer className="py-6 w-full shrink-0 border-t border-gray-200 flex flex-col items-center justify-center">
        <p className="text-xs text-gray-500">
          © {new Date().getFullYear()} KrishiSetu AI. Building for Problem Statement 26132.
        </p>
      </footer>
    </div>
  );
}

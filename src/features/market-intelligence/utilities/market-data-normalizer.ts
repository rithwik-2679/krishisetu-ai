import { MarketPriceRecord } from "@/types/market-data";

export function normalizeGovernmentRecord(rawRecord: Record<string, unknown>, fetchedAt: string): MarketPriceRecord | null {
  if (!rawRecord || !rawRecord.commodity || !rawRecord.modal_price) {
     return null; 
  }
  
  // Format date if it's DD/MM/YYYY -> YYYY-MM-DD
  let normalizedDate = String(rawRecord.arrival_date || new Date().toISOString().split('T')[0]);
  if (normalizedDate.includes('/')) {
    const parts = normalizedDate.split('/');
    if (parts.length === 3) {
       // Assuming DD/MM/YYYY
       normalizedDate = `${parts[2]}-${parts[1]}-${parts[0]}`;
    }
  }

  const minPrice = rawRecord.min_price ? parseFloat(String(rawRecord.min_price)) : null;
  const maxPrice = rawRecord.max_price ? parseFloat(String(rawRecord.max_price)) : null;
  const modalPrice = parseFloat(String(rawRecord.modal_price));
  
  if (isNaN(modalPrice)) {
    return null;
  }

  const id = `${rawRecord.state}-${rawRecord.market}-${rawRecord.commodity}-${normalizedDate}`.replace(/\s+/g, '-').toLowerCase();

  return {
    id,
    commodity: String(rawRecord.commodity),
    variety: String(rawRecord.variety || "Other"),
    state: String(rawRecord.state || "Unknown"),
    district: String(rawRecord.district || "Unknown"),
    market: String(rawRecord.market || "Unknown"),
    date: normalizedDate,
    minPrice,
    maxPrice,
    modalPrice,
    arrivals: rawRecord.arrivals ? parseFloat(String(rawRecord.arrivals)) : null,
    unit: "Rs/Quintal",
    source: "Government of India - AGMARKNET",
    sourceUrl: "https://data.gov.in",
    fetchedAt,
    isOfficial: true,
    isDemo: false
  };
}

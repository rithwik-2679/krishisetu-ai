import { MarketDataProvider } from "@/types/market-data";
import { GovernmentMarketDataProvider } from "./government-market-data-provider";
import { DemoMarketDataProvider } from "./demo-market-data-provider";

export function getMarketDataProvider(): MarketDataProvider {
  const mode = process.env.NEXT_PUBLIC_DATA_MODE || "government";
  
  if (mode === "demo") {
    return new DemoMarketDataProvider();
  }
  
  return new GovernmentMarketDataProvider();
}

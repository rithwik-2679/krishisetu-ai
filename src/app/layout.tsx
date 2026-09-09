import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import { LotProvider } from "@/contexts/lot-context";
import { LanguageProvider } from "@/contexts/language-context";
import { AppShell } from "@/components/layout/app-shell";
import { FarmerCopilot } from "@/features/copilot/components/farmer-copilot";

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "KrishiSetu AI",
  description: "From Farm Gate to Best Market.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className={`${inter.className} min-h-screen bg-gray-50 antialiased`}>
        <LanguageProvider>
        <LotProvider>
          <AppShell>
            {children}
            <FarmerCopilot />
          </AppShell>
        </LotProvider>
        </LanguageProvider>
      </body>
    </html>
  );
}

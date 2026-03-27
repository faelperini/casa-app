import type { Metadata } from "next";
import { Fraunces, Plus_Jakarta_Sans } from "next/font/google";
import { Providers } from "@/components/Providers";
import { UserMenu } from "@/components/ui/UserMenu";
import { Footer } from "@/components/ui/Footer";
import "./globals.css";

const fraunces = Fraunces({
  subsets: ["latin"],
  variable: "--font-fraunces",
  display: "swap",
});

const plusJakarta = Plus_Jakarta_Sans({
  subsets: ["latin"],
  variable: "--font-plus-jakarta",
  display: "swap",
});

export const metadata: Metadata = {
  title: "Casa",
  description: "Organize sua casa com quem você mora",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="pt-BR" className={`${fraunces.variable} ${plusJakarta.variable}`}>
      <body className="font-body bg-cream-100 text-forest-800 antialiased">
        <Providers>
          <UserMenu />
          <div className="flex flex-col min-h-dvh">
            <main className="flex-1 flex flex-col">{children}</main>
            <Footer />
          </div>
        </Providers>
      </body>
    </html>
  );
}

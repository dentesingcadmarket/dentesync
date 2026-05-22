import type { Metadata, Viewport } from "next";
import { Inter, Outfit } from "next/font/google";
import { Toaster } from "@/components/ui/sonner";
import "./globals.css";

const inter = Inter({
  subsets: ["latin"],
  variable: "--font-inter",
  display: "swap",
});

const outfit = Outfit({
  subsets: ["latin"],
  variable: "--font-geist",
  display: "swap",
});

export const metadata: Metadata = {
  title: "DenteSync — D-Console",
  description: "Diş teknisyenleri için yapay zeka destekli iş yönetim platformu",
  manifest: "/manifest.json",
  appleWebApp: {
    capable: true,
    statusBarStyle: "black-translucent",
    title: "DenteSync",
  },
  icons: {
    icon: "/logo.png",
    apple: "/logo.png",
  },
};

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  maximumScale: 1,
  userScalable: false,
  themeColor: "#000000",
  viewportFit: "cover",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="tr" className="dark">
      <body className={`${outfit.variable} ${inter.variable} font-[family-name:var(--font-inter)] antialiased bg-ebony-canvas text-cloud-white`}>
        {children}
        <Toaster theme="dark" position="bottom-center" />
      </body>
    </html>
  );
}

import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import { Header } from "@/components/layout/Header";
import { ThemeProvider } from "next-themes";
import ClientLayout from "@/components/ClientLayout";

const inter = Inter({
  subsets: ["latin"],
  variable: "--font-inter",
});

export const metadata: Metadata = {
  title: "ElevateCRM Management Tools by TECHGURU",
  description: "Modern CRM + Inventory Platform - Unified customer management and inventory tracking for small-to-medium businesses",
  keywords: "CRM, inventory management, TECHGURU, business management, sales pipeline",
  authors: [{ name: "TECHGURU" }],
  icons: {
    icon: "/techguru-logo.png",
    apple: "/techguru-logo.png",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <head>
        <link rel="icon" href="/techguru-logo.png" />
        <meta name="theme-color" content="#00c2ff" />
      </head>
      <body className={`${inter.variable} font-sans antialiased bg-background text-foreground`}>
        <ThemeProvider attribute="class" defaultTheme="system" enableSystem>
          <ClientLayout>
            <a 
              href="#main-content" 
              className="sr-only focus:not-sr-only focus:absolute focus:top-4 focus:left-4 bg-primary text-primary-foreground px-4 py-2 rounded-md z-50 focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2"
            >
              Skip to content
            </a>
            <Header />
            <div className="min-h-screen" id="main-content">
              {children}
            </div>
          </ClientLayout>
        </ThemeProvider>
      </body>
    </html>
  );
}

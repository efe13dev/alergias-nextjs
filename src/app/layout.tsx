import type { Metadata } from "next";

import Script from "next/script";
import { Geist, Geist_Mono } from "next/font/google";

import "./globals.css";

import ThemeProvider from "@/components/theme-provider";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "Alergia Control",
  description: "Control de alergias",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <head>
        <Script id="theme-init" strategy="beforeInteractive">
          {`
            (function(){
              try {
                var stored = localStorage.getItem('theme');
                var systemDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
                var theme = stored || (systemDark ? 'dark' : 'light');
                var root = document.documentElement;
                if (theme === 'dark') root.classList.add('dark'); else root.classList.remove('dark');
              } catch(e) {}
            })();
          `}
        </Script>
      </head>
      <body className={`${geistSans.variable} ${geistMono.variable} antialiased`}>
        <ThemeProvider>{children}</ThemeProvider>
      </body>
    </html>
  );
}

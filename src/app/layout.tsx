import type { Metadata } from "next";

import Script from "next/script";
import { DM_Sans, DM_Serif_Display } from "next/font/google";
import { cookies } from "next/headers";

import "./globals.css";

import ThemeProvider from "@/components/theme-provider";

const dmSans = DM_Sans({
  variable: "--font-dm-sans",
  subsets: ["latin"],
  weight: ["300", "400", "500", "600", "700"],
});

const dmSerif = DM_Serif_Display({
  variable: "--font-dm-serif",
  subsets: ["latin"],
  weight: "400",
});

export const metadata: Metadata = {
  title: "Alergia Control",
  description: "Control de alergias",
};

export default async function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  // Lee cookie del tema en SSR para poner la clase correcta en <html>
  // y evitar flash. Si no hay cookie, asumimos dark (default de la app).
  const cookieStore = await cookies();
  const themeCookie = cookieStore.get("theme")?.value;
  const htmlClass = themeCookie === "light" ? "" : "dark";

  return (
    <html lang="en" className={htmlClass} suppressHydrationWarning>
      <head>
        {/* Avisa al navegador de los esquemas soportados para controles nativos */}
        <meta name="color-scheme" content="dark light" />
        {/*
          El <style> de pre-paint se inyecta via JS (beforeInteractive) para que
          React nunca gestione ese nodo y no haya hydration mismatch.
          El script detecta el tema real (cookie → localStorage → sistema) y
          aplica clase + color de fondo antes del primer paint.
        */}
        <Script id="theme-init" strategy="beforeInteractive">{`
          (function(){
            try {
              var m = document.cookie.match(/(?:^|; )theme=([^;]+)/);
              var theme = (m ? decodeURIComponent(m[1]) : null)
                || localStorage.getItem('theme')
                || (window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light');
              var root = document.documentElement;
              var dark = theme === 'dark';
              root.classList.toggle('dark', dark);
              var s = document.createElement('style');
              s.id = 'theme-prestyle';
              s.textContent = dark
                ? 'html,body{background-color:oklch(0.145 0 0);color:oklch(0.985 0 0)}'
                : 'html,body{background-color:oklch(0.978 0.005 75);color:oklch(0.20 0.018 45)}';
              document.head.appendChild(s);
            } catch(e) {}
          })();
        `}</Script>
      </head>
      <body className={`${dmSans.variable} ${dmSerif.variable} antialiased`}>
        <ThemeProvider>{children}</ThemeProvider>
      </body>
    </html>
  );
}

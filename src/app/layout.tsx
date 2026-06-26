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
          Pre-estilo fijo (dark) para evitar flash blanco en el primer paint.
          El script inline lo ajusta inmediatamente si el tema real es claro.
          El contenido nunca varía entre SSR y cliente → sin mismatch de hidratación.
        */}
        <style id="theme-prestyle">{`html,body{background-color:oklch(0.145 0 0);color:oklch(0.985 0 0)}`}</style>
        <Script id="theme-init" strategy="beforeInteractive">
          {`
            (function(){
              try {
                var m = document.cookie.match(/(?:^|; )theme=([^;]+)/);
                var cookieTheme = m ? decodeURIComponent(m[1]) : null;
                var stored = localStorage.getItem('theme');
                var systemDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
                var theme = cookieTheme || stored || (systemDark ? 'dark' : 'light');
                var root = document.documentElement;
                if (theme === 'dark') {
                  root.classList.add('dark');
                } else {
                  root.classList.remove('dark');
                  // Tema claro: ajusta el pre-estilo para evitar flash oscuro
                  var pre = document.getElementById('theme-prestyle');
                  if (pre) pre.textContent = 'html,body{background-color:oklch(1 0 0);color:oklch(0.145 0 0)}';
                }
              } catch(e) {}
            })();
          `}
        </Script>
      </head>
      <body className={`${dmSans.variable} ${dmSerif.variable} antialiased`}>
        <ThemeProvider>{children}</ThemeProvider>
      </body>
    </html>
  );
}

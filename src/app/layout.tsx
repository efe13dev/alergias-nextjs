import type { Metadata } from "next";

import Script from "next/script";
import { Geist, Geist_Mono } from "next/font/google";
import { cookies } from "next/headers";

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

export default async function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  // Lee cookie del tema en SSR (Next 15: cookies() es async)
  const cookieStore = await cookies();
  const themeCookie = cookieStore.get("theme")?.value;
  const isDark = themeCookie ? themeCookie === "dark" : null; // null => desconocido
  const htmlClass = isDark === true ? "dark" : isDark === false ? "" : "dark"; // por defecto dark para evitar flash claro
  const preBg = isDark === false ? "oklch(1 0 0)" : "oklch(0.145 0 0)";
  const preFg = isDark === false ? "oklch(0.145 0 0)" : "oklch(0.985 0 0)";
  return (
    <html lang="en" className={htmlClass} suppressHydrationWarning>
      <head>
        {/* Avisa al navegador de los esquemas soportados para controles nativos */}
        <meta name="color-scheme" content="dark light" />
        {/* Pre-estilo mínimo para evitar flash antes de cargar CSS, acorde al tema detectado */}
        <style id="theme-prestyle">{`
          html, body { background-color: ${preBg}; color: ${preFg}; }
        `}</style>
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
                  // Quita el pre-estilo si el tema real es claro
                  var pre = document.getElementById('theme-prestyle');
                  if (pre && pre.parentNode) pre.parentNode.removeChild(pre);
                }
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

// src/app/layout.tsx
import type { Metadata } from 'next';
import { IBM_Plex_Sans_Arabic } from 'next/font/google';
import './globals.css';

const ibmPlex = IBM_Plex_Sans_Arabic({  // حذف export
  subsets: ['arabic', 'latin'],
  weight: ['300', '400', '500', '600', '700'],
  variable: '--font-ibm-plex',
  display: 'swap',
});

export const metadata: Metadata = {
  title: 'الراهن الذكي | Smart Bettor',
  description: 'منصة تحليل الأنماط الذكية',
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="ar" dir="rtl" className={ibmPlex.variable}>
      <body className="antialiased">
        {children}
      </body>
    </html>
  );
}
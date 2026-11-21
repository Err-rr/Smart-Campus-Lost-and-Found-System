import type { Metadata, Viewport } from 'next';
import { Inter, JetBrains_Mono } from 'next/font/google';
import type { ReactNode } from 'react';
import './globals.css';

const inter = Inter({ subsets: ['latin'], variable: '--font-inter', display: 'swap' });
const mono = JetBrains_Mono({ subsets: ['latin'], variable: '--font-mono', display: 'swap' });

export const metadata: Metadata = {
  title: {
    default: 'Lost and Found | Delhi Technological University',
    template: '%s | DTU Lost and Found',
  },
  description: 'Report, search and recover items lost on the Delhi Technological University campus.',
  icons: { icon: '/dtu-logo.png', apple: '/dtu-logo.png' },
};

export const viewport: Viewport = {
  themeColor: '#F4F3EF',
};

export default function RootLayout({ children }: { children: ReactNode }) {
  return (
    <html lang="en-IN" className={`${inter.variable} ${mono.variable}`}>
      <body>{children}</body>
    </html>
  );
}

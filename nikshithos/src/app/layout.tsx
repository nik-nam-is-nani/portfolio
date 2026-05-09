import React from 'react';
import type { Metadata, Viewport } from 'next';
import { Orbitron, JetBrains_Mono, Outfit } from 'next/font/google';
import '../styles/tailwind.css';

const orbitron = Orbitron({
  subsets: ['latin'],
  weight: ['400', '500', '600', '700', '800', '900'],
  variable: '--font-orbitron',
  display: 'swap',
});

const jetbrainsMono = JetBrains_Mono({
  subsets: ['latin'],
  weight: ['300', '400', '500', '600', '700'],
  variable: '--font-jetbrains',
  display: 'swap',
});

const outfit = Outfit({
  subsets: ['latin'],
  weight: ['300', '400', '500', '600', '700'],
  variable: '--font-outfit',
  display: 'swap',
});

export const viewport: Viewport = {
  width: 'device-width',
  initialScale: 1,
};

export const metadata: Metadata = {
  metadataBase: new URL(process.env.NEXT_PUBLIC_SITE_URL || 'http://localhost:3000'),
  title: 'NikshithOS — AI/ML Engineer & Multi-Agent RL Builder',
  description: 'Nikshith Kyatherigi\'s interactive OS-themed portfolio — AI/ML engineer, Meta PyTorch × Scaler Grand Finale Finalist, multi-agent RL builder based in Kurnool, AP.',
  icons: {
    icon: [{ url: '/favicon.ico', type: 'image/x-icon' }],
  },
};

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="en" className={`${orbitron.variable} ${jetbrainsMono.variable} ${outfit.variable}`}>
      <body className={outfit.className}>
        {children}
</body>
    </html>
  );
}
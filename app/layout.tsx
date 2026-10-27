import type {Metadata} from 'next';
import {Cinzel, Plus_Jakarta_Sans} from 'next/font/google';
import './globals.css';

const cinzel = Cinzel({
  weight: ['400', '600', '700', '800', '900'],
  subsets: ['latin'],
  variable: '--font-cinzel',
  display: 'swap',
});

const plusJakarta = Plus_Jakarta_Sans({
  subsets: ['latin'],
  variable: '--font-sans',
  display: 'swap',
});

export const metadata: Metadata = {
  title: 'Teseu Burger // Templo dos Deuses do Smash | Greco-Romano',
  description: 'Hambúrgueres artesanais forjados como oferendas no Olimpo. Carnes frescas prensadas na chapa viva a 230°C, queijos fundidos e néctar autoral.',
  openGraph: {
    title: 'Teseu Burger // Templo dos Deuses do Smash | Greco-Romano',
    description: 'Hambúrgueres artesanais dignos do Olimpo. Cardápio dos deuses e pedidos diretos sem taxas.',
    type: 'website',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Teseu Burger // Templo dos Deuses do Smash',
    description: 'Hambúrgueres artesanais forjados no Olimpo.',
  },
};

import { CartProvider } from '@/context/CartContext';
import { GlobalCartModals } from '@/components/GlobalCartModals';
import { NavigationLoadingOverlay } from '@/components/NavigationLoadingOverlay';

export default function RootLayout({children}: {children: React.ReactNode}) {
  return (
    <html lang="pt-BR" className={`${cinzel.variable} ${plusJakarta.variable} scroll-smooth`}>
      <body className="font-sans bg-[#f5f5f5] text-[#1c1c1c] antialiased selection:bg-[#F5CB5C] selection:text-[#0B0B0B]" suppressHydrationWarning>
        <CartProvider>
          {children}
          <GlobalCartModals />
          <NavigationLoadingOverlay />
        </CartProvider>
      </body>
    </html>
  );
}

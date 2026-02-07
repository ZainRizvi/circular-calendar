import type { Metadata } from 'next';
import { Amiri, Outfit } from 'next/font/google';
import './globals.css';

const amiri = Amiri({
  weight: ['400', '700'],
  style: ['normal', 'italic'],
  subsets: ['latin'],
  variable: '--font-amiri',
  display: 'swap',
});

const outfit = Outfit({
  weight: ['300', '400', '500', '600', '700'],
  subsets: ['latin'],
  variable: '--font-outfit',
  display: 'swap',
});

export const metadata: Metadata = {
  title: 'Intuitive Islamic Circle Calendar | Teach Your Children Both Calendars',
  description:
    'A beautiful circular calendar that helps Muslim children understand how the Gregorian and Islamic Hijri calendars work together. Perfect for homeschooling families.',
  openGraph: {
    title: 'Intuitive Islamic Circle Calendar',
    description:
      'A beautiful circular calendar that helps Muslim children understand how the Gregorian and Islamic Hijri calendars work together.',
    type: 'website',
  },
  twitter: {
    card: 'summary_large_image',
  },
  icons: {
    icon: '/favicon.svg',
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" className={`${amiri.variable} ${outfit.variable}`}>
      <body>{children}</body>
    </html>
  );
}

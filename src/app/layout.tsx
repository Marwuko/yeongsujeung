import type { Metadata, Viewport } from 'next';

import '@/app/globals.css';

export const viewport: Viewport = {
  width: 'device-width',
  initialScale: 1,
  maximumScale: 5,
  themeColor: '#ed6f1f',
};

export const metadata: Metadata = {
  title: {
    default: 'Yeongsujeung — AI Expense Tracker',
    template: '%s | Yeongsujeung',
  },
  description:
    'Snap any receipt in any language or currency. AI extracts vendor, total, and line items instantly. Track spending, set budgets, and export to CSV.',
  keywords: ['expense tracker', 'receipt scanner', 'AI finance', 'budget tracker', 'receipt OCR'],
  manifest: '/manifest.json',
  appleWebApp: {
    capable: true,
    statusBarStyle: 'default',
    title: 'Yeongsujeung',
  },
  formatDetection: {
    telephone: false,
  },
  openGraph: {
    type: 'website',
    siteName: 'Yeongsujeung',
    title: 'Yeongsujeung — AI Expense Tracker',
    description:
      'Snap any receipt in any language or currency. AI extracts vendor, total, and line items instantly.',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Yeongsujeung — AI Expense Tracker',
    description: 'Snap any receipt. AI extracts everything. Track your spending effortlessly.',
  },
  icons: {
    icon: '/icon.svg',
    apple: '/apple-touch-icon.png',
  },
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body className="min-h-screen">{children}</body>
    </html>
  );
}

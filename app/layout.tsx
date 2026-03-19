import type { Metadata } from "next";
import { Plus_Jakarta_Sans } from "next/font/google";
import "./globals.css";

const plusJakartaSans = Plus_Jakarta_Sans({
  variable: "--font-plus-jakarta-sans",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: 'Spendly — Personal Finance Tracker',
  description: 'Track your income and expenses with Spendly. Beautiful dark finance dashboard built with Next.js.',
  keywords: 'finance, expense tracker, budget, income, personal finance',
  openGraph: {
    title: 'Spendly',
    description: 'Personal Finance Tracker',
    type: 'website'
  },
  appleWebApp: {
    capable: true,
    statusBarStyle: 'black'
  }
};

export const viewport = {
  themeColor: '#091428',
  width: 'device-width',
  initialScale: 1,
  viewportFit: 'cover'
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className={`${plusJakartaSans.variable} antialiased`}>
        {children}
      </body>
    </html>
  );
}

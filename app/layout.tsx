import type { Metadata } from 'next';
import { Inter } from 'next/font/google';
import { SideNav } from '@/components/side-nav';
import { TopNav } from '@/components/top-nav';
import { Providers } from './providers';
import { SettingsProvider } from "@/contexts/settings-context";
import './globals.css';

const inter = Inter({ subsets: ['latin'] });

export const metadata: Metadata = {
  title: 'Ecom Gestion Business',
  description: 'Business management system for entrepreneurs',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body className={inter.className}>
        <SettingsProvider>
          <Providers>
            <div className="flex min-h-screen">
              <SideNav />
              <div className="flex-1">
                <TopNav />
                <main className="flex-1 p-6">{children}</main>
              </div>
            </div>
          </Providers>
        </SettingsProvider>
      </body>
    </html>
  );
}
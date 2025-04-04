'use client';

import { ThemeProviderClient } from '@/components/theme-provider-client';
import { ToasterProvider } from '@/components/toaster-provider';

export function Providers({ children }: { children: React.ReactNode }) {
  return (
    <ThemeProviderClient>
      {children}
      <ToasterProvider />
    </ThemeProviderClient>
  );
}

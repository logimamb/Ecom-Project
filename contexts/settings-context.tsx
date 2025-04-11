'use client';

import { createContext, useContext, useEffect, useState, useCallback, ReactNode } from 'react';
import { useToast } from '@/components/ui/use-toast';
import { useCurrencyConverter } from "@/hooks/use-currency-converter";

interface BusinessInfo {
  name: string;
  email: string;
  phone: string;
  address: string;
  currency: string;
  language: string;
}

interface NotificationSettings {
  email: boolean;
  browser: boolean;
  lowStock: boolean;
  newOrders: boolean;
  paymentReminders: boolean;
}

interface AppearanceSettings {
  theme: 'light' | 'dark' | 'system';
  density: 'comfortable' | 'compact';
  sidebarCollapsed: boolean;
}

export interface Settings {
  businessInfo: BusinessInfo;
  notifications: NotificationSettings;
  appearance: AppearanceSettings;
}

export const defaultSettings: Settings = {
  businessInfo: {
    name: '',
    email: '',
    phone: '',
    address: '',
    currency: 'XAF',
    language: 'fr'
  },
  notifications: {
    email: false,
    browser: true,
    lowStock: true,
    newOrders: true,
    paymentReminders: true
  },
  appearance: {
    theme: 'system',
    density: 'comfortable',
    sidebarCollapsed: false
  }
};

interface SettingsContextType {
  settings: Settings;
  isLoading: boolean;
  updateSettings: (newSettings: Settings, shouldConvertValues?: boolean) => Promise<boolean>;
  formatCurrency: (amount: number) => string;
  convertCurrency: (amount: number, from: string, to: string) => Promise<number>;
  convertAndFormatCurrency: (amount: number, fromCurrency: string) => Promise<string>;
}

const SettingsContext = createContext<SettingsContextType>({
  settings: defaultSettings,
  isLoading: true,
  updateSettings: async () => { return true; },
  formatCurrency: (amount: number) => `${amount.toFixed(0)} XAF`,
  convertCurrency: async (amount: number) => amount,
  convertAndFormatCurrency: async (amount: number) => `${amount.toFixed(0)} XAF`,
});

export function SettingsProvider({ children }: { children: ReactNode }) {
  const [settings, setSettings] = useState<Settings>(defaultSettings);
  const [isLoading, setIsLoading] = useState(true);
  const { toast } = useToast();
  const { convertCurrency: convert, formatCurrency: format } = useCurrencyConverter();

  const updateSettings = async (newSettings: Settings, shouldConvertValues: boolean = false) => {
    try {
      const oldCurrency = settings.businessInfo.currency;
      const newCurrency = newSettings.businessInfo.currency;

      // If currency is changing and conversion is requested
      if (shouldConvertValues && oldCurrency !== newCurrency) {
        // Convert all monetary values in the database
        const response = await fetch('/api/settings/convert-currency', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            fromCurrency: oldCurrency,
            toCurrency: newCurrency,
          }),
        });

        if (!response.ok) {
          throw new Error('Failed to convert currency values');
        }
      }

      // Save settings
      const saveResponse = await fetch('/api/settings', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(newSettings),
      });

      if (!saveResponse.ok) {
        throw new Error('Failed to update settings');
      }

      // Update state
      setSettings(newSettings);

      // Save to localStorage for persistence
      localStorage.setItem('settings', JSON.stringify(newSettings));

      // Broadcast the change to other tabs/windows
      window.dispatchEvent(new StorageEvent('storage', {
        key: 'settings',
        newValue: JSON.stringify(newSettings)
      }));

      return true;
    } catch (error) {
      console.error('Error updating settings:', error);
      toast({
        title: 'Error',
        description: 'Failed to update settings. Please try again.',
        variant: 'destructive',
      });
      throw error;
    }
  };

  // Format currency using the current business currency
  const formatCurrency = useCallback((amount: number): string => {
    if (typeof amount !== 'number' || isNaN(amount)) {
      return format(0, settings.businessInfo.currency);
    }
    return format(amount, settings.businessInfo.currency);
  }, [format, settings.businessInfo.currency]);

  // Convert and format currency
  const convertAndFormatCurrency = useCallback(async (amount: number, fromCurrency: string): Promise<string> => {
    try {
      const convertedAmount = await convert(amount, fromCurrency, settings.businessInfo.currency);
      return format(convertedAmount, settings.businessInfo.currency);
    } catch (error) {
      console.error('Error converting currency:', error);
      return format(amount, settings.businessInfo.currency);
    }
  }, [convert, format, settings.businessInfo.currency]);

  useEffect(() => {
    const fetchSettings = async () => {
      try {
        const response = await fetch('/data/settings.json');
        if (!response.ok) throw new Error('Failed to fetch settings');
        const data = await response.json();
        
        // Merge with defaults to ensure all fields exist
        setSettings({
          ...defaultSettings,
          ...data,
          businessInfo: {
            ...defaultSettings.businessInfo,
            ...data.businessInfo
          },
          notifications: {
            ...defaultSettings.notifications,
            ...data.notifications
          },
          appearance: {
            ...defaultSettings.appearance,
            ...data.appearance
          }
        });
      } catch (error) {
        console.error('Error fetching settings:', error);
        toast({
          title: 'Error',
          description: 'Failed to load settings. Using default settings.',
          variant: 'destructive',
        });
      } finally {
        setIsLoading(false);
      }
    };

    fetchSettings();
  }, [toast]);

  useEffect(() => {
    const loadSettings = () => {
      const storedSettings = localStorage.getItem('settings');
      if (storedSettings) {
        try {
          const parsedSettings = JSON.parse(storedSettings);
          setSettings(prevSettings => ({
            ...prevSettings,
            ...parsedSettings,
            businessInfo: {
              ...prevSettings.businessInfo,
              ...parsedSettings.businessInfo,
            },
          }));
        } catch (error) {
          console.error('Error parsing stored settings:', error);
        }
      }
    };

    // Load initial settings
    loadSettings();

    // Listen for changes in other tabs/windows
    const handleStorageChange = (event: StorageEvent) => {
      if (event.key === 'settings' && event.newValue) {
        loadSettings();
      }
    };

    window.addEventListener('storage', handleStorageChange);
    return () => window.removeEventListener('storage', handleStorageChange);
  }, []);

  return (
    <SettingsContext.Provider
      value={{
        settings,
        isLoading,
        updateSettings,
        formatCurrency,
        convertCurrency: convert,
        convertAndFormatCurrency,
      }}
    >
      {children}
    </SettingsContext.Provider>
  );
}

export const useSettings = () => useContext(SettingsContext);

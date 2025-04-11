import { useState, useCallback } from 'react';

interface ExchangeRates {
  [key: string]: number;
}

export function useCurrencyConverter() {
  // Hardcoded exchange rates since we're using local storage
  const defaultRates: ExchangeRates = {
    USD: 1,
    EUR: 0.92,
    XAF: 655.96,
    GBP: 0.79,
  };

  const [rates] = useState<ExchangeRates>(defaultRates);
  const [loading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const convertCurrency = useCallback((amount: number, from: string, to: string): number => {
    try {
      if (from === to) return amount;
      
      const fromRate = rates[from];
      const toRate = rates[to];
      
      if (!fromRate || !toRate) {
        throw new Error('Invalid currency');
      }
      
      // Convert to USD first (base currency), then to target currency
      const amountInUSD = amount / fromRate;
      const convertedAmount = amountInUSD * toRate;
      
      return Number(convertedAmount.toFixed(2));
    } catch (err) {
      setError('Currency conversion failed');
      return amount; // Return original amount on error
    }
  }, [rates]);

  const formatCurrency = useCallback((amount: number, currency: string): string => {
    const formatter = new Intl.NumberFormat(undefined, {
      style: 'currency',
      currency: currency,
      minimumFractionDigits: 0,
      maximumFractionDigits: 2,
    });
    
    try {
      return formatter.format(amount);
    } catch (err) {
      return `${amount} ${currency}`;
    }
  }, []);

  return {
    rates,
    loading,
    error,
    convertCurrency,
    formatCurrency,
  };
}

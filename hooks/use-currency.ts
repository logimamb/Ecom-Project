import { useSettings } from '@/contexts/settings-context';
import { useCurrencyConverter } from './use-currency-converter';

export function useCurrency() {
  const { settings } = useSettings();
  const { convertCurrency, formatCurrency } = useCurrencyConverter();

  const format = (amount: number, sourceCurrency?: string) => {
    try {
      // If no source currency provided, assume amount is already in target currency
      if (!sourceCurrency) {
        return formatCurrency(amount, settings.businessInfo.currency);
      }

      // If source currency is different from target, convert first
      if (sourceCurrency !== settings.businessInfo.currency) {
        const convertedAmount = convertCurrency(amount, sourceCurrency, settings.businessInfo.currency);
        return formatCurrency(convertedAmount, settings.businessInfo.currency);
      }

      // If same currency, just format
      return formatCurrency(amount, settings.businessInfo.currency);
    } catch (error) {
      console.error('Error formatting currency:', error);
      return `${amount} ${settings.businessInfo.currency}`;
    }
  };

  return {
    format,
    currency: settings.businessInfo.currency,
    convertCurrency,
  };
}

import { useSettings } from '@/contexts/settings-context';

export function useCurrency() {
  const { settings, formatCurrency } = useSettings();

  return {
    currency: settings.businessInfo.currency,
    format: formatCurrency,
  };
}

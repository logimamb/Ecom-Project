import { NextResponse } from 'next/server';

type CurrencyCode = 'XAF' | 'USD' | 'EUR' | 'GBP';

// Hardcoded exchange rates for testing (replace with real API in production)
const exchangeRates: Record<CurrencyCode, number> = {
  XAF: 1,
  USD: 0.00164,
  EUR: 0.00152,
  GBP: 0.00130
};

interface ConversionRequest {
  from: CurrencyCode;
  to: CurrencyCode;
  amount: number;
}

export async function POST(request: Request) {
  try {
    const { from, to, amount } = await request.json() as ConversionRequest;

    // Validate input
    if (!from || !to || amount === undefined) {
      return NextResponse.json(
        { error: 'Missing required parameters' },
        { status: 400 }
      );
    }

    // Validate currencies
    if (!exchangeRates[from] || !exchangeRates[to]) {
      return NextResponse.json(
        { error: 'Invalid currency code' },
        { status: 400 }
      );
    }

    // Convert to USD first (as base currency), then to target currency
    const amountInUSD = amount * exchangeRates[from];
    const convertedAmount = amountInUSD / exchangeRates[to];

    // Round to whole numbers for XAF
    const finalAmount = to === 'XAF' ? Math.round(convertedAmount) : Number(convertedAmount.toFixed(2));

    return NextResponse.json({
      from,
      to,
      amount: Number(amount),
      convertedAmount: finalAmount
    });
  } catch (error) {
    console.error('Currency conversion error:', error);
    return NextResponse.json(
      { error: 'Currency conversion failed' },
      { status: 500 }
    );
  }
}

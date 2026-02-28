
export const CONVERSION_RATES: Record<string, number> = {
  'INR': 1,
  'USD': 83.2,
  'EUR': 90.5,
  'AED': 22.65,
  'THB': 2.35,
  'JPY': 0.56,
  'GBP': 105.2,
  'SGD': 61.8
};

export const CURRENCY_SYMBOLS: Record<string, string> = {
  'INR': '₹',
  'USD': '$',
  'EUR': '€',
  'AED': 'AED ',
  'THB': '฿',
  'JPY': '¥',
  'GBP': '£',
  'SGD': 'S$'
};

export const formatCurrency = (amount: number, currency: string, showInrApprox: boolean = false) => {
  const symbol = CURRENCY_SYMBOLS[currency] || '$';
  
  // For AED, we might want to show it as "AED 5,000"
  const formatted = currency === 'AED' 
    ? `${symbol}${amount.toLocaleString()}`
    : `${symbol}${amount.toLocaleString()}`;
  
  if (showInrApprox && currency !== 'INR') {
    const inrAmount = Math.round(amount * CONVERSION_RATES[currency]);
    return `${formatted} (₹${inrAmount.toLocaleString()} approx.)`;
  }
  
  return formatted;
};

export const calculateInr = (amount: number, currency: string) => {
  return Math.round(amount * (CONVERSION_RATES[currency] || 1));
};

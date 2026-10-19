import type { PaymentMethod } from './types';

// Change this one line to show another currency (for example 'USD').
export const CURRENCY = 'RWF';

export function formatMoney(value: number): string {
  return new Intl.NumberFormat(undefined, {
    style: 'currency',
    currency: CURRENCY,
    maximumFractionDigits: CURRENCY === 'RWF' ? 0 : 2,
  }).format(value);
}

export function formatDate(iso: string): string {
  return new Date(iso).toLocaleDateString(undefined, {
    day: 'numeric',
    month: 'short',
    year: 'numeric',
    timeZone: 'UTC', // dates are stored as UTC days, so show them as UTC days
  });
}

export function todayISO(): string {
  return new Date().toISOString().slice(0, 10);
}

export function currentMonth(): string {
  return new Date().toISOString().slice(0, 7);
}

export function monthLabel(month: string): string {
  const [y, m] = month.split('-').map(Number);
  return new Date(Date.UTC(y, m - 1, 1)).toLocaleDateString(undefined, {
    month: 'long',
    year: 'numeric',
    timeZone: 'UTC',
  });
}

export const PAYMENT_METHODS: { value: PaymentMethod; label: string }[] = [
  { value: 'cash', label: 'Cash' },
  { value: 'card', label: 'Card' },
  { value: 'mobile_money', label: 'Mobile money' },
  { value: 'bank_transfer', label: 'Bank transfer' },
  { value: 'other', label: 'Other' },
];

export function paymentLabel(value: PaymentMethod): string {
  return PAYMENT_METHODS.find((p) => p.value === value)?.label ?? value;
}

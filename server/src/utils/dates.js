import { HttpError } from './httpError.js';

const MONTH_RE = /^\d{4}-(0[1-9]|1[0-2])$/;

export function currentMonth() {
  return new Date().toISOString().slice(0, 7); // "2026-10"
}

export function assertMonth(month) {
  if (!MONTH_RE.test(month || '')) {
    throw new HttpError(400, 'Month must look like YYYY-MM, for example 2026-10.');
  }
  return month;
}

// Start of the month (included) and start of the next month (excluded), in UTC.
export function monthRange(month) {
  assertMonth(month);
  const [y, m] = month.split('-').map(Number);
  return {
    start: new Date(Date.UTC(y, m - 1, 1)),
    end: new Date(Date.UTC(y, m, 1)),
  };
}

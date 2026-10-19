import { useState, type FormEvent } from 'react';
import { errorMessage } from '../api';
import { formatMoney, monthLabel } from '../config';
import type { BudgetStatus } from '../types';

interface Props {
  month: string;
  spent: number;
  budget: number | null;
  remaining: number | null;
  status: BudgetStatus;
  onSave: (amount: number) => Promise<void>;
}

const STATUS_TEXT: Record<BudgetStatus, string> = {
  none: 'No budget set',
  within: 'Within budget',
  approaching: 'Approaching your budget',
  over: 'Over budget',
};

const RADIUS = 70;
const CIRCUMFERENCE = 2 * Math.PI * RADIUS;

export default function BudgetCard({ month, spent, budget, remaining, status, onSave }: Props) {
  const [amount, setAmount] = useState('');
  const [error, setError] = useState('');
  const [saving, setSaving] = useState(false);

  const used = budget ? Math.min(spent / budget, 1) : 0;

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    setError('');
    const value = Number(amount);
    if (!Number.isFinite(value) || value <= 0) return setError('Budget must be more than 0.');
    setSaving(true);
    try {
      await onSave(value);
      setAmount('');
    } catch (err) {
      setError(errorMessage(err));
    } finally {
      setSaving(false);
    }
  }

  return (
    <section className={`budget budget-${status}`} aria-label={`Budget for ${monthLabel(month)}`}>
      <div className="gauge">
        <svg viewBox="0 0 180 180" role="img" aria-label={budget ? `${Math.round((spent / budget) * 100)}% of budget used` : 'No budget set'}>
          <circle className="gauge-track" cx="90" cy="90" r={RADIUS} />
          <circle
            className="gauge-fill"
            cx="90"
            cy="90"
            r={RADIUS}
            strokeDasharray={CIRCUMFERENCE}
            strokeDashoffset={CIRCUMFERENCE * (1 - used)}
            transform="rotate(-90 90 90)"
          />
        </svg>
        <div className="gauge-label">
          {remaining === null ? (
            <strong>No budget</strong>
          ) : remaining >= 0 ? (
            <>
              <strong>{formatMoney(remaining)}</strong>
              <span>left</span>
            </>
          ) : (
            <>
              <strong>{formatMoney(-remaining)}</strong>
              <span>over</span>
            </>
          )}
        </div>
      </div>

      <div className="budget-body">
        <p className="status-chip">{STATUS_TEXT[status]}</p>
        <dl className="figures">
          <div><dt>Spent</dt><dd>{formatMoney(spent)}</dd></div>
          <div><dt>Budget</dt><dd>{budget === null ? 'Not set' : formatMoney(budget)}</dd></div>
        </dl>

        <form className="inline-form" onSubmit={handleSubmit}>
          <label>
            {budget === null ? 'Set a budget for this month' : 'Update this month’s budget'}
            <input type="number" min="1" step="any" value={amount} onChange={(e) => setAmount(e.target.value)} placeholder={budget ? String(budget) : 'Amount'} />
          </label>
          <button className="btn btn-primary" disabled={saving}>{saving ? 'Saving…' : budget === null ? 'Set budget' : 'Update budget'}</button>
        </form>
        {error && <p className="notice notice-error" role="alert">{error}</p>}
      </div>
    </section>
  );
}

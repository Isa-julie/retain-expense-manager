import { useState, type FormEvent } from 'react';
import { api, errorMessage } from '../api';
import { PAYMENT_METHODS, todayISO } from '../config';
import type { Category, Expense, ExpensePayload, PaymentMethod } from '../types';

interface Props {
  expense?: Expense; // present = editing, missing = creating
  categories: Category[];
  onSaved: (expense: Expense) => void;
  onCancel: () => void;
}

export default function ExpenseForm({ expense, categories, onSaved, onCancel }: Props) {
  const [title, setTitle] = useState(expense?.title ?? '');
  const [amount, setAmount] = useState(expense ? String(expense.amount) : '');
  const [category, setCategory] = useState(expense?.category._id ?? categories.find((c) => c.isDefault)?._id ?? '');
  const [date, setDate] = useState(expense ? expense.date.slice(0, 10) : todayISO());
  const [paymentMethod, setPaymentMethod] = useState<PaymentMethod>(expense?.paymentMethod ?? 'cash');
  const [notes, setNotes] = useState(expense?.notes ?? '');
  const [error, setError] = useState('');
  const [saving, setSaving] = useState(false);

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    setError('');

    const value = Number(amount);
    if (!title.trim()) return setError('Please enter a title.');
    if (!Number.isFinite(value) || value <= 0) return setError('Amount must be more than 0.');
    if (!date) return setError('Please choose a date.');

    const payload: ExpensePayload = { title: title.trim(), amount: value, category, date, paymentMethod, notes: notes.trim() };
    setSaving(true);
    try {
      const saved = expense
        ? await api<Expense>(`/expenses/${expense._id}`, { method: 'PUT', body: payload })
        : await api<Expense>('/expenses', { method: 'POST', body: payload });
      onSaved(saved);
    } catch (err) {
      setError(errorMessage(err));
      setSaving(false);
    }
  }

  return (
    <form className="form" onSubmit={handleSubmit} noValidate>
      {error && <p className="notice notice-error" role="alert">{error}</p>}

      <label>
        Title
        <input value={title} onChange={(e) => setTitle(e.target.value)} maxLength={120} placeholder="Lunch at the market" required />
      </label>

      <div className="form-row">
        <label>
          Amount
          <input type="number" inputMode="decimal" min="0.01" step="any" value={amount} onChange={(e) => setAmount(e.target.value)} required />
        </label>
        <label>
          Date
          <input type="date" value={date} onChange={(e) => setDate(e.target.value)} required />
        </label>
      </div>

      <div className="form-row">
        <label>
          Category
          <select value={category} onChange={(e) => setCategory(e.target.value)}>
            {categories.map((c) => (
              <option key={c._id} value={c._id}>{c.name}</option>
            ))}
          </select>
        </label>
        <label>
          Payment method
          <select value={paymentMethod} onChange={(e) => setPaymentMethod(e.target.value as PaymentMethod)}>
            {PAYMENT_METHODS.map((p) => (
              <option key={p.value} value={p.value}>{p.label}</option>
            ))}
          </select>
        </label>
      </div>

      <label>
        Notes (optional)
        <textarea value={notes} onChange={(e) => setNotes(e.target.value)} maxLength={500} rows={3} />
      </label>

      <div className="form-actions">
        <button type="button" className="btn btn-quiet" onClick={onCancel}>Cancel</button>
        <button type="submit" className="btn btn-primary" disabled={saving}>
          {saving ? 'Saving…' : expense ? 'Save changes' : 'Add expense'}
        </button>
      </div>
    </form>
  );
}

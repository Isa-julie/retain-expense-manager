import { useEffect, useState } from 'react';
import { Link, useNavigate, useParams } from 'react-router-dom';
import { api, errorMessage } from '../api';
import ExpenseForm from '../components/ExpenseForm';
import Modal from '../components/Modal';
import { formatDate, formatMoney, paymentLabel } from '../config';
import type { Category, Expense } from '../types';

export default function ExpenseDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [expense, setExpense] = useState<Expense | null>(null);
  const [categories, setCategories] = useState<Category[]>([]);
  const [error, setError] = useState('');
  const [editing, setEditing] = useState(false);

  useEffect(() => {
    Promise.all([api<Expense>(`/expenses/${id}`), api<Category[]>('/categories')])
      .then(([e, c]) => {
        setExpense(e);
        setCategories(c);
      })
      .catch((err) => setError(errorMessage(err)));
  }, [id]);

  async function handleDelete() {
    if (!expense || !window.confirm(`Delete "${expense.title}"? This cannot be undone.`)) return;
    try {
      await api(`/expenses/${expense._id}`, { method: 'DELETE' });
      navigate('/expenses');
    } catch (err) {
      setError(errorMessage(err));
    }
  }

  if (error) {
    return (
      <>
        <p className="notice notice-error" role="alert">{error}</p>
        <Link to="/expenses">Back to expenses</Link>
      </>
    );
  }
  if (!expense) return <p className="page-note">Loading…</p>;

  return (
    <>
      <p><Link to="/expenses">Back to expenses</Link></p>
      <section className="panel detail">
        <h1>{expense.title}</h1>
        <p className="big-figure">{formatMoney(expense.amount)}</p>
        <dl className="facts">
          <div><dt>Category</dt><dd>{expense.category.name}</dd></div>
          <div><dt>Date</dt><dd>{formatDate(expense.date)}</dd></div>
          <div><dt>Paid with</dt><dd>{paymentLabel(expense.paymentMethod)}</dd></div>
          <div><dt>Notes</dt><dd>{expense.notes || 'No notes'}</dd></div>
        </dl>
        <div className="form-actions">
          <button className="btn btn-danger-quiet" onClick={handleDelete}>Delete</button>
          <button className="btn btn-primary" onClick={() => setEditing(true)}>Edit</button>
        </div>
      </section>

      {editing && (
        <Modal title="Edit expense" onClose={() => setEditing(false)}>
          <ExpenseForm
            expense={expense}
            categories={categories}
            onCancel={() => setEditing(false)}
            onSaved={(saved) => {
              setExpense(saved);
              setEditing(false);
            }}
          />
        </Modal>
      )}
    </>
  );
}

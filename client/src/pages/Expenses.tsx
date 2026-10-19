import { useCallback, useEffect, useState } from 'react';
import { api, errorMessage, toQuery } from '../api';
import ExpenseFilters from '../components/ExpenseFilters';
import ExpenseForm from '../components/ExpenseForm';
import ExpenseList from '../components/ExpenseList';
import Modal from '../components/Modal';
import Pagination from '../components/Pagination';
import { useAppDispatch, useAppSelector } from '../store';
import { setPage } from '../store/filtersSlice';
import type { Category, Expense, Paginated } from '../types';

export default function Expenses() {
  const filters = useAppSelector((s) => s.filters); // search, filters, sorting, page: all from Redux
  const dispatch = useAppDispatch();

  const [data, setData] = useState<Paginated<Expense> | null>(null);
  const [categories, setCategories] = useState<Category[]>([]);
  const [error, setError] = useState('');
  const [reloadKey, setReloadKey] = useState(0);
  const [editing, setEditing] = useState<Expense | 'new' | null>(null);

  useEffect(() => {
    api<Category[]>('/categories').then(setCategories).catch((err) => setError(errorMessage(err)));
  }, []);

  // Fetch whenever a filter changes. The 300 ms wait stops us calling the API on every keystroke.
  useEffect(() => {
    let cancelled = false;
    const timer = setTimeout(async () => {
      try {
        const result = await api<Paginated<Expense>>(`/expenses${toQuery({ ...filters })}`);
        if (cancelled) return;
        setData(result);
        setError('');
        // If the last item on a page was deleted, step back one page.
        if (result.page > result.pages) dispatch(setPage(result.pages));
      } catch (err) {
        if (!cancelled) setError(errorMessage(err));
      }
    }, 300);
    return () => {
      cancelled = true;
      clearTimeout(timer);
    };
  }, [filters, reloadKey, dispatch]);

  const refresh = useCallback(() => setReloadKey((k) => k + 1), []);

  async function handleDelete(expense: Expense) {
    if (!window.confirm(`Delete "${expense.title}"? This cannot be undone.`)) return;
    try {
      await api(`/expenses/${expense._id}`, { method: 'DELETE' });
      refresh();
    } catch (err) {
      setError(errorMessage(err));
    }
  }

  return (
    <>
      <div className="page-head">
        <h1>Expenses</h1>
        <button className="btn btn-primary" onClick={() => setEditing('new')} disabled={categories.length === 0}>
          Add expense
        </button>
      </div>

      <ExpenseFilters categories={categories} />

      {error && <p className="notice notice-error" role="alert">{error}</p>}
      {!data && !error && <p className="page-note">Loading…</p>}

      {data && data.items.length === 0 && (
        <p className="empty">No expenses match. Clear the filters or add a new expense.</p>
      )}

      {data && data.items.length > 0 && (
        <>
          <ExpenseList items={data.items} onEdit={setEditing} onDelete={handleDelete} />
          <Pagination page={data.page} pages={data.pages} total={data.total} onChange={(p) => dispatch(setPage(p))} />
        </>
      )}

      {editing && (
        <Modal title={editing === 'new' ? 'Add expense' : 'Edit expense'} onClose={() => setEditing(null)}>
          <ExpenseForm
            expense={editing === 'new' ? undefined : editing}
            categories={categories}
            onCancel={() => setEditing(null)}
            onSaved={() => {
              setEditing(null);
              refresh();
            }}
          />
        </Modal>
      )}
    </>
  );
}

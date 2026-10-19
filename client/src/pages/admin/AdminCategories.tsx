import { useCallback, useEffect, useState, type FormEvent } from 'react';
import { api, errorMessage } from '../../api';
import type { Category } from '../../types';

export default function AdminCategories() {
  const [categories, setCategories] = useState<Category[]>([]);
  const [name, setName] = useState('');
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editName, setEditName] = useState('');
  const [error, setError] = useState('');
  const [message, setMessage] = useState('');

  const load = useCallback(async () => {
    try {
      setCategories(await api<Category[]>('/categories'));
    } catch (err) {
      setError(errorMessage(err));
    }
  }, []);

  useEffect(() => {
    load();
  }, [load]);

  async function run(action: () => Promise<string>) {
    setError('');
    setMessage('');
    try {
      setMessage(await action());
      await load();
    } catch (err) {
      setError(errorMessage(err));
    }
  }

  function handleAdd(e: FormEvent) {
    e.preventDefault();
    if (!name.trim()) return setError('Please enter a category name.');
    run(async () => {
      await api('/categories', { method: 'POST', body: { name: name.trim() } });
      setName('');
      return 'Category added.';
    });
  }

  function handleRename(category: Category) {
    if (!editName.trim()) return setError('Category name cannot be empty.');
    run(async () => {
      await api(`/categories/${category._id}`, { method: 'PUT', body: { name: editName.trim() } });
      setEditingId(null);
      return 'Category renamed.';
    });
  }

  function handleDelete(category: Category) {
    const ok = window.confirm(
      `Delete "${category.name}"? Expenses in this category will be moved to "Uncategorized".`
    );
    if (!ok) return;
    run(async () => {
      const res = await api<{ movedExpenses: number }>(`/categories/${category._id}`, { method: 'DELETE' });
      return `Category deleted. ${res.movedExpenses} expense${res.movedExpenses === 1 ? '' : 's'} moved to Uncategorized.`;
    });
  }

  return (
    <>
      <div className="page-head"><h1>Categories</h1></div>

      <form className="inline-form panel" onSubmit={handleAdd}>
        <label className="grow">
          New category
          <input value={name} onChange={(e) => setName(e.target.value)} maxLength={40} placeholder="Groceries" />
        </label>
        <button className="btn btn-primary">Add category</button>
      </form>

      {error && <p className="notice notice-error" role="alert">{error}</p>}
      {message && <p className="notice notice-ok" role="status">{message}</p>}

      <ul className="expense-list">
        {categories.map((c) => (
          <li key={c._id} className="expense-row">
            {editingId === c._id ? (
              <>
                <input className="grow" value={editName} onChange={(e) => setEditName(e.target.value)} maxLength={40} aria-label={`New name for ${c.name}`} />
                <div className="expense-actions">
                  <button className="btn btn-quiet" onClick={() => setEditingId(null)}>Cancel</button>
                  <button className="btn btn-primary" onClick={() => handleRename(c)}>Save</button>
                </div>
              </>
            ) : (
              <>
                <div className="expense-main">
                  <span className="expense-title">{c.name}</span>
                  {c.isDefault && <span className="expense-meta">Default. Receives expenses from deleted categories.</span>}
                </div>
                {!c.isDefault && (
                  <div className="expense-actions">
                    <button className="btn btn-quiet" onClick={() => { setEditingId(c._id); setEditName(c.name); }}>Rename</button>
                    <button className="btn btn-danger-quiet" onClick={() => handleDelete(c)}>Delete</button>
                  </div>
                )}
              </>
            )}
          </li>
        ))}
      </ul>
    </>
  );
}

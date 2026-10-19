import { useEffect, useState } from 'react';
import { api, errorMessage } from '../../api';
import { formatDate, formatMoney } from '../../config';
import type { AdminInsights as Insights, CategoryTotal } from '../../types';

function CategoryTable({ title, rows, showTotal }: { title: string; rows: (CategoryTotal & { id: string })[]; showTotal?: boolean }) {
  return (
    <section className="panel">
      <h2>{title}</h2>
      {rows.length === 0 ? (
        <p className="muted">No categories yet.</p>
      ) : (
        <table className="table">
          <thead>
            <tr><th>Category</th><th className="num">Expenses</th>{showTotal && <th className="num">Total</th>}</tr>
          </thead>
          <tbody>
            {rows.map((r) => (
              <tr key={r.id}>
                <td>{r.name}</td>
                <td className="num">{r.count}</td>
                {showTotal && <td className="num">{formatMoney(r.total)}</td>}
              </tr>
            ))}
          </tbody>
        </table>
      )}
    </section>
  );
}

export default function AdminInsights() {
  const [data, setData] = useState<Insights | null>(null);
  const [error, setError] = useState('');

  useEffect(() => {
    api<Insights>('/admin/insights').then(setData).catch((err) => setError(errorMessage(err)));
  }, []);

  if (error) return <p className="notice notice-error" role="alert">{error}</p>;
  if (!data) return <p className="page-note">Loading…</p>;

  return (
    <>
      <div className="page-head"><h1>Platform insights</h1></div>

      <dl className="stat-row">
        <div><dt>Registered users</dt><dd>{data.totalUsers}</dd></div>
        <div><dt>Expenses recorded</dt><dd>{data.totalExpenses}</dd></div>
        <div><dt>Total value</dt><dd>{formatMoney(data.totalValue)}</dd></div>
        <div><dt>Expenses this month</dt><dd>{data.expensesThisMonth}</dd></div>
      </dl>

      <CategoryTable title="Spending per category" rows={data.spendingPerCategory} showTotal />

      <div className="two-col">
        <CategoryTable title="Top 5 most-used categories" rows={data.topCategories} />
        <CategoryTable title="Bottom 5 least-used categories" rows={data.bottomCategories} />
      </div>

      <div className="two-col">
        <section className="panel">
          <h2>Recently added expenses</h2>
          {data.recentExpenses.length === 0 ? (
            <p className="muted">No expenses yet.</p>
          ) : (
            <table className="table">
              <thead><tr><th>Expense</th><th>By</th><th className="num">Amount</th></tr></thead>
              <tbody>
                {data.recentExpenses.map((e) => (
                  <tr key={e._id}>
                    <td>{e.title}<br /><span className="muted">{e.category?.name ?? 'Uncategorized'}, {formatDate(e.date)}</span></td>
                    <td>{e.user?.name ?? 'Deleted user'}</td>
                    <td className="num">{formatMoney(e.amount)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </section>

        <section className="panel">
          <h2>Recently registered users</h2>
          <table className="table">
            <thead><tr><th>Name</th><th>Joined</th></tr></thead>
            <tbody>
              {data.recentUsers.map((u) => (
                <tr key={u._id}>
                  <td>{u.name}<br /><span className="muted">{u.email}</span></td>
                  <td>{formatDate(u.createdAt)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </section>
      </div>
    </>
  );
}

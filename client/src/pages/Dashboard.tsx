import { useCallback, useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { api, errorMessage } from '../api';
import BudgetCard from '../components/BudgetCard';
import ExpenseList from '../components/ExpenseList';
import { currentMonth, formatDate, formatMoney, monthLabel } from '../config';
import type { DashboardData } from '../types';

export default function Dashboard() {
  const [month, setMonth] = useState(currentMonth());
  const [data, setData] = useState<DashboardData | null>(null);
  const [error, setError] = useState('');

  const load = useCallback(async () => {
    try {
      setData(await api<DashboardData>(`/dashboard?month=${month}`));
      setError('');
    } catch (err) {
      setError(errorMessage(err));
    }
  }, [month]);

  useEffect(() => {
    load();
  }, [load]);

  async function saveBudget(amount: number) {
    await api('/budgets', { method: 'PUT', body: { month, amount } });
    await load();
  }

  const biggest = data?.byCategory[0]?.total ?? 0;

  return (
    <>
      <div className="page-head">
        <h1>{monthLabel(month)}</h1>
        <label className="month-picker">
          Month
          <input type="month" value={month} onChange={(e) => e.target.value && setMonth(e.target.value)} />
        </label>
      </div>

      {error && <p className="notice notice-error" role="alert">{error}</p>}
      {!data && !error && <p className="page-note">Loading…</p>}

      {data && (
        <>
          <BudgetCard
            month={month}
            spent={data.totalSpent}
            budget={data.budget}
            remaining={data.remaining}
            status={data.status}
            onSave={saveBudget}
          />

          <div className="two-col">
            <section className="panel">
              <h2>Highest expense</h2>
              {data.highestExpense ? (
                <>
                  <p className="big-figure">{formatMoney(data.highestExpense.amount)}</p>
                  <p>
                    <Link to={`/expenses/${data.highestExpense._id}`}>{data.highestExpense.title}</Link>
                    <span className="muted">, {data.highestExpense.category.name}, {formatDate(data.highestExpense.date)}</span>
                  </p>
                </>
              ) : (
                <p className="muted">No expenses this month yet.</p>
              )}
              <p className="muted">{data.expenseCount} expense{data.expenseCount === 1 ? '' : 's'} recorded this month.</p>
            </section>

            <section className="panel">
              <h2>Spending by category</h2>
              {data.byCategory.length === 0 ? (
                <p className="muted">Add an expense to see where your money goes.</p>
              ) : (
                <ul className="bars">
                  {data.byCategory.map((c) => (
                    <li key={c.name}>
                      <div className="bar-label">
                        <span>{c.name}</span>
                        <span>{formatMoney(c.total)}</span>
                      </div>
                      <div className="bar-track"><div className="bar-fill" style={{ width: `${(c.total / biggest) * 100}%` }} /></div>
                    </li>
                  ))}
                </ul>
              )}
            </section>
          </div>

          <section className="panel">
            <div className="panel-head">
              <h2>Recent expenses</h2>
              <Link to="/expenses">See all expenses</Link>
            </div>
            {data.recent.length === 0 ? (
              <p className="muted">Nothing recorded in {monthLabel(month)}. <Link to="/expenses">Add your first expense</Link>.</p>
            ) : (
              <ExpenseList items={data.recent} />
            )}
          </section>
        </>
      )}
    </>
  );
}

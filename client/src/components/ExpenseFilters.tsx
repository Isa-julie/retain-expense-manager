import { PAYMENT_METHODS } from '../config';
import { useAppDispatch, useAppSelector } from '../store';
import { resetFilters, setFilter, type FiltersState } from '../store/filtersSlice';
import type { Category } from '../types';

// Every control here reads from and writes to the Redux store. Nothing is kept in local state.
export default function ExpenseFilters({ categories }: { categories: Category[] }) {
  const f = useAppSelector((s) => s.filters);
  const dispatch = useAppDispatch();
  const set = (patch: Partial<Omit<FiltersState, 'page'>>) => dispatch(setFilter(patch));

  return (
    <section className="filters" aria-label="Search and filter expenses">
      <label className="grow">
        Search
        <input type="search" placeholder="Title or notes" value={f.q} onChange={(e) => set({ q: e.target.value })} />
      </label>

      <label>
        Category
        <select value={f.category} onChange={(e) => set({ category: e.target.value })}>
          <option value="">All</option>
          {categories.map((c) => (
            <option key={c._id} value={c._id}>{c.name}</option>
          ))}
        </select>
      </label>

      <label>
        Payment method
        <select value={f.paymentMethod} onChange={(e) => set({ paymentMethod: e.target.value })}>
          <option value="">All</option>
          {PAYMENT_METHODS.map((p) => (
            <option key={p.value} value={p.value}>{p.label}</option>
          ))}
        </select>
      </label>

      <label>
        From
        <input type="date" value={f.from} max={f.to || undefined} onChange={(e) => set({ from: e.target.value })} />
      </label>
      <label>
        To
        <input type="date" value={f.to} min={f.from || undefined} onChange={(e) => set({ to: e.target.value })} />
      </label>

      <label>
        Min amount
        <input type="number" min="0" value={f.minAmount} onChange={(e) => set({ minAmount: e.target.value })} />
      </label>
      <label>
        Max amount
        <input type="number" min="0" value={f.maxAmount} onChange={(e) => set({ maxAmount: e.target.value })} />
      </label>

      <label>
        Sort by
        <select value={`${f.sortBy}-${f.order}`} onChange={(e) => {
          const [sortBy, order] = e.target.value.split('-') as [FiltersState['sortBy'], FiltersState['order']];
          set({ sortBy, order });
        }}>
          <option value="date-desc">Newest first</option>
          <option value="date-asc">Oldest first</option>
          <option value="amount-desc">Highest amount</option>
          <option value="amount-asc">Lowest amount</option>
        </select>
      </label>

      <button className="btn btn-quiet" onClick={() => dispatch(resetFilters())}>Clear filters</button>
    </section>
  );
}

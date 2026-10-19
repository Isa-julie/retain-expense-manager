import { Link } from 'react-router-dom';
import { formatDate, formatMoney, paymentLabel } from '../config';
import type { Expense } from '../types';

interface Props {
  items: Expense[];
  onEdit?: (expense: Expense) => void;
  onDelete?: (expense: Expense) => void;
}

export default function ExpenseList({ items, onEdit, onDelete }: Props) {
  return (
    <ul className="expense-list">
      {items.map((e) => (
        <li key={e._id} className="expense-row">
          <div className="expense-main">
            <Link to={`/expenses/${e._id}`} className="expense-title">{e.title}</Link>
            <span className="expense-meta">
              {e.category.name}, {formatDate(e.date)}, {paymentLabel(e.paymentMethod)}
            </span>
          </div>
          <strong className="expense-amount">{formatMoney(e.amount)}</strong>
          {(onEdit || onDelete) && (
            <div className="expense-actions">
              {onEdit && <button className="btn btn-quiet" onClick={() => onEdit(e)}>Edit</button>}
              {onDelete && <button className="btn btn-danger-quiet" onClick={() => onDelete(e)}>Delete</button>}
            </div>
          )}
        </li>
      ))}
    </ul>
  );
}

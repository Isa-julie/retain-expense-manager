export type Role = 'user' | 'admin';

export interface User {
  id: string;
  name: string;
  email: string;
  role: Role;
  createdAt: string;
}

export interface Category {
  _id: string;
  name: string;
  isDefault: boolean;
}

export type PaymentMethod = 'cash' | 'card' | 'mobile_money' | 'bank_transfer' | 'other';

export interface Expense {
  _id: string;
  title: string;
  amount: number;
  category: Category;
  date: string;
  paymentMethod: PaymentMethod;
  notes: string;
  createdAt: string;
}

// What the form sends to the API
export interface ExpensePayload {
  title: string;
  amount: number;
  category: string;
  date: string;
  paymentMethod: PaymentMethod;
  notes: string;
}

export interface Paginated<T> {
  items: T[];
  total: number;
  page: number;
  pages: number;
}

export type BudgetStatus = 'none' | 'within' | 'approaching' | 'over';

export interface CategoryTotal {
  name: string;
  total: number;
  count: number;
}

export interface DashboardData {
  month: string;
  totalSpent: number;
  expenseCount: number;
  budget: number | null;
  remaining: number | null;
  status: BudgetStatus;
  highestExpense: Expense | null;
  byCategory: CategoryTotal[];
  recent: Expense[];
}

export interface AdminInsights {
  totalUsers: number;
  totalExpenses: number;
  totalValue: number;
  expensesThisMonth: number;
  spendingPerCategory: (CategoryTotal & { id: string })[];
  topCategories: (CategoryTotal & { id: string })[];
  bottomCategories: (CategoryTotal & { id: string })[];
  recentExpenses: (Omit<Expense, 'category'> & { category: { name: string } | null; user: { name: string; email: string } | null })[];
  recentUsers: { _id: string; name: string; email: string; role: Role; createdAt: string }[];
}

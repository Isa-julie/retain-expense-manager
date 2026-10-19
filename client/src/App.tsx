import { Link, Outlet, Route, Routes } from 'react-router-dom';
import Layout from './components/Layout';
import ProtectedRoute from './components/ProtectedRoute';
import AuthPage from './pages/AuthPages';
import Dashboard from './pages/Dashboard';
import Expenses from './pages/Expenses';
import ExpenseDetail from './pages/ExpenseDetail';
import AdminCategories from './pages/admin/AdminCategories';
import AdminInsights from './pages/admin/AdminInsights';

function NotFound() {
  return (
    <div className="page-note">
      <h1>Page not found</h1>
      <p><Link to="/">Go to your dashboard</Link></p>
    </div>
  );
}

export default function App() {
  return (
    <Routes>
      <Route path="/login" element={<AuthPage mode="login" />} />
      <Route path="/signup" element={<AuthPage mode="signup" />} />

      {/* Everything inside needs a signed-in user */}
      <Route element={<ProtectedRoute><Layout /></ProtectedRoute>}>
        <Route index element={<Dashboard />} />
        <Route path="expenses" element={<Expenses />} />
        <Route path="expenses/:id" element={<ExpenseDetail />} />

        {/* Everything inside also needs the admin role */}
        <Route path="admin" element={<ProtectedRoute role="admin"><Outlet /></ProtectedRoute>}>
          <Route path="categories" element={<AdminCategories />} />
          <Route path="insights" element={<AdminInsights />} />
        </Route>

        <Route path="*" element={<NotFound />} />
      </Route>
    </Routes>
  );
}

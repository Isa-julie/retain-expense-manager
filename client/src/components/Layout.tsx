import { NavLink, Outlet, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useAppDispatch } from '../store';
import { resetFilters } from '../store/filtersSlice';

export default function Layout() {
  const { user, isAdmin, logout } = useAuth();
  const navigate = useNavigate();
  const dispatch = useAppDispatch();

  function handleLogout() {
    dispatch(resetFilters()); // the next person on this browser should not see my filters
    logout();
    navigate('/login');
  }

  return (
    <div className="shell">
      <header className="topbar">
        <NavLink to="/" className="brand" end>
          Retain
        </NavLink>
        <nav className="nav" aria-label="Main">
          <NavLink to="/" end>Dashboard</NavLink>
          <NavLink to="/expenses">Expenses</NavLink>
          {isAdmin && <NavLink to="/admin/categories">Categories</NavLink>}
          {isAdmin && <NavLink to="/admin/insights">Insights</NavLink>}
        </nav>
        <div className="who">
          <span>{user?.name}</span>
          <button className="btn btn-quiet" onClick={handleLogout}>
            Sign out
          </button>
        </div>
      </header>
      <main className="page">
        <Outlet />
      </main>
    </div>
  );
}

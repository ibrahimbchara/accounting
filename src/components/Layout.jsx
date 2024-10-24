import { Outlet, Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { useTheme } from '../contexts/ThemeContext';

export default function Layout() {
  const { logout, user } = useAuth();
  const { theme } = useTheme();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  return (
    <div className={`min-h-screen ${theme === 'dark' ? 'dark' : ''}`}>
      <div className="flex h-screen bg-gray-100 dark:bg-gray-900">
        {/* Sidebar */}
        <div className="w-64 bg-indigo-700 dark:bg-indigo-900 text-white">
          <div className="p-4">
            <h1 className="text-2xl font-bold">Accounting App</h1>
          </div>
          <nav className="mt-8">
            <Link to="/" className="block px-4 py-2 hover:bg-indigo-600 dark:hover:bg-indigo-800">Dashboard</Link>
            <Link to="/transactions" className="block px-4 py-2 hover:bg-indigo-600 dark:hover:bg-indigo-800">Transactions</Link>
            <Link to="/salary-print" className="block px-4 py-2 hover:bg-indigo-600 dark:hover:bg-indigo-800">Salary Print</Link>
            <Link to="/settings" className="block px-4 py-2 hover:bg-indigo-600 dark:hover:bg-indigo-800">Settings</Link>
            {user?.role === 'admin' && (
              <Link to="/users" className="block px-4 py-2 hover:bg-indigo-600 dark:hover:bg-indigo-800">Users</Link>
            )}
            <button
              onClick={handleLogout}
              className="block w-full text-left px-4 py-2 hover:bg-indigo-600 dark:hover:bg-indigo-800"
            >
              Logout
            </button>
          </nav>
        </div>

        {/* Main content */}
        <div className="flex-1 overflow-auto bg-gray-100 dark:bg-gray-900">
          <div className="p-8">
            <Outlet />
          </div>
        </div>
      </div>
    </div>
  );
}
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './contexts/AuthContext';
import { ThemeProvider } from './contexts/ThemeContext';
import Login from './components/Login';
import Dashboard from './components/Dashboard';
import Transactions from './components/Transactions';
import Settings from './components/Settings';
import UserManagement from './components/UserManagement';
import SalaryPrint from './components/SalaryPrint';
import Layout from './components/Layout';

function PrivateRoute({ children, requiredRole }) {
  const { isAuthenticated, user } = useAuth();
  
  if (!isAuthenticated) {
    return <Navigate to="/login" />;
  }

  if (requiredRole && user?.role !== requiredRole) {
    return <Navigate to="/" />;
  }

  return children;
}

function App() {
  return (
    <AuthProvider>
      <ThemeProvider>
        <div className="min-h-screen">
          <BrowserRouter>
            <Routes>
              <Route path="/login" element={<Login />} />
              <Route
                path="/"
                element={
                  <PrivateRoute>
                    <Layout />
                  </PrivateRoute>
                }
              >
                <Route index element={<Dashboard />} />
                <Route path="transactions" element={<Transactions />} />
                <Route path="settings" element={<Settings />} />
                <Route 
                  path="users" 
                  element={
                    <PrivateRoute requiredRole="admin">
                      <UserManagement />
                    </PrivateRoute>
                  } 
                />
                <Route path="salary-print" element={<SalaryPrint />} />
              </Route>
            </Routes>
          </BrowserRouter>
        </div>
      </ThemeProvider>
    </AuthProvider>
  );
}

export default App;
import { useState, useEffect } from 'react'
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom'
import HomePage from './components/HomePage.jsx'
import LoginPage from './components/LoginPage.jsx'
import Dashboard from './components/Dashboard.jsx'
import SupplierDashboard from './components/SupplierDashboard.jsx'
import ManufacturerDashboard from './components/ManufacturerDashboard.jsx'
import AdminDashboard from './components/AdminDashboard.jsx'
import DistributorDashboard from './components/DistributorDashboard.jsx'
import PharmacyDashboard from './components/PharmacyDashboard.jsx'
import './App.css'
import { authService } from './services/api'

const ProtectedRoute = ({ children, role }) => {
  const token = localStorage.getItem('token');
  const userStr = localStorage.getItem('user');
  
  try {
    const user = userStr ? JSON.parse(userStr) : null;
    if (!token || user?.role !== role) {
      return <Navigate to="/login" />;
    }
    return children;
  } catch (error) {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    return <Navigate to="/login" />;
  }
};

function App() {
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [userRole, setUserRole] = useState(null);

  useEffect(() => {
    const storedUser = localStorage.getItem('user');
    if (storedUser) {
      try {
        const userData = JSON.parse(storedUser);
        setUserRole(userData.role);
        setIsLoggedIn(true);
      } catch (error) {
        localStorage.removeItem('user');
        localStorage.removeItem('token');
        setIsLoggedIn(false);
        setUserRole(null);
      }
    }
  }, []);

  const handleLogin = (role) => {
    setIsLoggedIn(true);
    setUserRole(role);
  };

  const handleLogout = () => {
    localStorage.removeItem('user');
    localStorage.removeItem('token');
    setIsLoggedIn(false);
    setUserRole(null);
  };

  return (
    <Router
      future={{
        v7_startTransition: true,
        v7_relativeSplatPath: true
      }}
    >
      <div className="app">
        <Routes>
          <Route path="/" element={<HomePage />} />
          <Route 
            path="/login" 
            element={
              !isLoggedIn ? (
                <LoginPage onLogin={handleLogin} />
              ) : (
                <Navigate to={`/${userRole}-dashboard`} replace />
              )
            } 
          />
          <Route 
            path="/admin-dashboard/*" 
            element={
              <ProtectedRoute role="admin">
                <AdminDashboard onLogout={handleLogout} />
              </ProtectedRoute>
            }
          />
          <Route 
            path="/supplier-dashboard/*"
            element={
              <ProtectedRoute role="supplier">
                <SupplierDashboard onLogout={handleLogout} />
              </ProtectedRoute>
            }
          />
          <Route 
            path="/manufacturer-dashboard/*" 
            element={
              <ProtectedRoute role="manufacturer">
                <ManufacturerDashboard onLogout={handleLogout} />
              </ProtectedRoute>
            }
          />
          <Route 
            path="/distributor-dashboard/*" 
            element={
              <ProtectedRoute role="distributor">
                <DistributorDashboard onLogout={handleLogout} />
              </ProtectedRoute>
            }
          />
          <Route 
            path="/pharmacy-dashboard/*" 
            element={
              <ProtectedRoute role="pharmacy">
                <PharmacyDashboard onLogout={handleLogout} />
              </ProtectedRoute>
            }
          />
        </Routes>
      </div>
    </Router>
  );
}

export default App;

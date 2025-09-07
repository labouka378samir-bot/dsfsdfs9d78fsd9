import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider } from './contexts/AuthContext';
import { AppProvider } from './contexts/AppContext';
import { testSupabaseConnection } from './lib/supabase';
import { HomePage } from './pages/HomePage';
import { CartPage } from './pages/CartPage';
import { LoginPage } from './pages/LoginPage';
import { SignupPage } from './pages/SignupPage';
import { CheckoutPage } from './pages/CheckoutPage';
import { OrderSuccessPage } from './pages/OrderSuccessPage';
import { OrdersPage } from './pages/OrdersPage';
import { AdminDashboard } from './pages/AdminDashboard';
import { useAuth } from './contexts/AuthContext';
import { useApp } from './contexts/AppContext';
import { MaintenancePage } from './pages/MaintenancePage';

function ProtectedAdminRoute({ children }: { children: React.ReactNode }) {
  const { user } = useAuth();
  
  if (!user || user.id !== 'admin-user-id') {
    return <Navigate to="/login" replace />;
  }
  
  return <>{children}</>;
}

function App() {
  // Test Supabase connection on app start
  React.useEffect(() => {
    testSupabaseConnection().then(success => {
      if (success) {
        // Connection successful
      } else {
        // Connection failed - could show user notification if needed
      }
    });
  }, []);

  return (
    <Router>
      <AuthProvider>
        <AppProvider>
          {/* AppRoutes is responsible for rendering routes or maintenance page based on settings */}
          <AppRoutes />
        </AppProvider>
      </AuthProvider>
    </Router>
  );
}

/**
 * AppRoutes handles conditional routing. If maintenance mode is enabled and the user is not admin,
 * it shows a maintenance page for all routes except the admin dashboard, login and signup.
 */
function AppRoutes() {
  const { state } = useApp();
  const { user } = useAuth();

  // Determine if user is admin
  const isAdmin = user && user.id === 'admin-user-id';

  if (state.settings.maintenance_mode && !isAdmin) {
    // Allow access to login or signup pages even during maintenance
    return (
      <Routes>
        <Route path="/login" element={<LoginPage />} />
        <Route path="/signup" element={<SignupPage />} />
        {/* All other routes show maintenance page */}
        <Route path="*" element={<MaintenancePage />} />
      </Routes>
    );
  }

  // Default routing when not in maintenance or user is admin
  return (
    <Routes>
      <Route path="/" element={<HomePage />} />
      <Route path="/cart" element={<CartPage />} />
      <Route path="/checkout" element={<CheckoutPage />} />
      <Route path="/order-success" element={<OrderSuccessPage />} />
      <Route path="/orders" element={<OrdersPage />} />
      <Route path="/login" element={<LoginPage />} />
      <Route path="/signup" element={<SignupPage />} />
      <Route 
        path="/admin" 
        element={
          <ProtectedAdminRoute>
            <AdminDashboard />
          </ProtectedAdminRoute>
        } 
      />
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
}

export default App;
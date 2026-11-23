import React from 'react';
import { Routes, Route, Navigate, useLocation } from 'react-router-dom';
import { useAuth } from './context/AuthContext';
import { AppLayout } from './components/layout/AppLayout';
import { LoginPage } from './pages/LoginPage';
import { LandingPage } from './pages/LandingPage';
import { ResourceDiscoveryPage } from './pages/ResourceDiscoveryPage';
import { ResourceDetailPage } from './pages/ResourceDetailPage';
import { BookingRequestPage } from './pages/BookingRequestPage';
import { MyBookingsPage } from './pages/MyBookingsPage';
import { FacultyApprovalsPage } from './pages/FacultyApprovalsPage';
import { ConflictResolutionPage } from './pages/ConflictResolutionPage';
import { FacultyResourcesPage } from './pages/FacultyResourcesPage';
import { AnalyticsPage } from './pages/AnalyticsPage';
import { SuperAdminPage } from './pages/SuperAdminPage';

// Protected Route Guard
const ProtectedRoute: React.FC<{ children: React.ReactElement }> = ({ children }) => {
  const { currentUser } = useAuth();
  const location = useLocation();

  if (!currentUser) {
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  return children;
};

// Root Router: direct to Login if unauthenticated; direct to role dashboard if authenticated
const RootRedirect: React.FC = () => {
  const { currentUser, role } = useAuth();

  if (!currentUser) {
    return <LoginPage />;
  }

  if (role === 'faculty') {
    return <Navigate to="/faculty/approvals" replace />;
  } else if (role === 'admin') {
    return <Navigate to="/analytics" replace />;
  } else {
    return <Navigate to="/resources" replace />;
  }
};

export const App: React.FC = () => {
  const { currentUser, role } = useAuth();

  return (
    <Routes>
      {/* First screen: Root renders Login page when unauthenticated */}
      <Route path="/" element={<RootRedirect />} />

      {/* Explicit Login Route */}
      <Route 
        path="/login" 
        element={
          currentUser ? (
            <Navigate 
              to={role === 'faculty' ? '/faculty/approvals' : role === 'admin' ? '/analytics' : '/resources'} 
              replace 
            />
          ) : (
            <LoginPage />
          )
        } 
      />

      {/* Optional Platform Overview / Landing page */}
      <Route path="/overview" element={<LandingPage />} />

      {/* Authenticated Application Shell */}
      <Route 
        element={
          <ProtectedRoute>
            <AppLayout />
          </ProtectedRoute>
        }
      >
        <Route path="/resources" element={<ResourceDiscoveryPage />} />
        <Route path="/resources/:id" element={<ResourceDetailPage />} />
        <Route path="/bookings/new" element={<BookingRequestPage />} />
        <Route path="/my-bookings" element={<MyBookingsPage />} />

        {/* Faculty Routes */}
        <Route path="/faculty/approvals" element={<FacultyApprovalsPage />} />
        <Route path="/faculty/conflicts" element={<ConflictResolutionPage />} />
        <Route path="/faculty/resources" element={<FacultyResourcesPage />} />

        {/* Governance & Analytics */}
        <Route path="/analytics" element={<AnalyticsPage />} />
        <Route path="/admin" element={<SuperAdminPage />} />
        <Route path="/admin/departments" element={<SuperAdminPage />} />
      </Route>

      {/* Fallback */}
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
};

export default App;

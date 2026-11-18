import React from 'react';
import { BrowserRouter, Routes, Route, Navigate, useLocation } from 'react-router-dom';
import { AuthProvider, useAuth } from './context/AuthContext';
import Navbar from './components/Navbar';
import Login from './pages/Login';
import AdminLogin from './pages/AdminLogin';
import Register from './pages/Register';
import ForgotPassword from './pages/ForgotPassword';
import Dashboard from './pages/Dashboard';
import ResumeUpload from './pages/ResumeUpload';
import AnalysisResult from './pages/AnalysisResult';
import JDComparison from './pages/JDComparison';
import CareerRoadmap from './pages/CareerRoadmap';
import JobRecommendations from './pages/JobRecommendations';
import Profile from './pages/Profile';
import AdminDashboard from './pages/AdminDashboard';

// Route guards
function ProtectedRoute({ children }) {
  const { user, loading } = useAuth();
  if (loading) return null;
  if (!user) {
    return <Navigate to="/login" replace />;
  }
  return children;
}

function AdminRoute({ children }) {
  const { user, isAdmin, loading } = useAuth();
  if (loading) return null;
  if (!user) {
    return <Navigate to="/admin/login" replace />;
  }
  if (!isAdmin) {
    return <Navigate to="/dashboard" replace />;
  }
  return children;
}

function PublicOnlyRoute({ children }) {
  const { user, isAdmin, loading } = useAuth();
  if (loading) return null;
  if (user) {
    return <Navigate to={isAdmin ? '/admin' : '/dashboard'} replace />;
  }
  return children;
}

function AppRoutes() {
  const location = useLocation();
  const isAdminLayout = location.pathname.startsWith('/admin');

  return (
    <div className="min-h-screen flex flex-col bg-slate-50">
      {!isAdminLayout && <Navbar />}
      <main className={`flex-1 ${!isAdminLayout ? 'pb-16' : ''}`}>
        <Routes>
          {/* Public Auth Routes */}
          <Route path="/login" element={
            <PublicOnlyRoute>
              <Login />
            </PublicOnlyRoute>
          } />
          <Route path="/admin/login" element={
            <PublicOnlyRoute>
              <AdminLogin />
            </PublicOnlyRoute>
          } />
          <Route path="/register" element={
            <PublicOnlyRoute>
              <Register />
            </PublicOnlyRoute>
          } />
          <Route path="/forgot-password" element={<ForgotPassword />} />

          {/* Protected User Application Routes */}
          <Route path="/" element={<Navigate to="/dashboard" replace />} />
          <Route path="/dashboard" element={
            <ProtectedRoute>
              <Dashboard />
            </ProtectedRoute>
          } />
          <Route path="/upload" element={
            <ProtectedRoute>
              <ResumeUpload />
            </ProtectedRoute>
          } />
          <Route path="/analysis/:resumeId" element={
            <ProtectedRoute>
              <AnalysisResult />
            </ProtectedRoute>
          } />
          <Route path="/compare-jd" element={
            <ProtectedRoute>
              <JDComparison />
            </ProtectedRoute>
          } />
          <Route path="/roadmap" element={
            <ProtectedRoute>
              <CareerRoadmap />
            </ProtectedRoute>
          } />
          <Route path="/jobs" element={
            <ProtectedRoute>
              <JobRecommendations />
            </ProtectedRoute>
          } />
          <Route path="/profile" element={
            <ProtectedRoute>
              <Profile />
            </ProtectedRoute>
          } />

          {/* Dedicated Admin Panel Route */}
          <Route path="/admin" element={
            <AdminRoute>
              <AdminDashboard />
            </AdminRoute>
          } />

          {/* 404 Fallback */}
          <Route path="*" element={<Navigate to="/dashboard" replace />} />
        </Routes>
      </main>

      {/* Footer for non-admin pages */}
      {!isAdminLayout && (
        <footer className="bg-white border-t border-slate-200 py-6 text-center text-xs text-slate-500">
          <p className="font-semibold text-slate-700">
            AI Resume Analyzer & Career Roadmap Generator
          </p>
          <p className="mt-1 text-slate-400">
            Software Engineering Laboratory Academic Project | Built with FastAPI & React
          </p>
        </footer>
      )}
    </div>
  );
}

export default function App() {
  return (
    <BrowserRouter>
      <AuthProvider>
        <AppRoutes />
      </AuthProvider>
    </BrowserRouter>
  );
}

import React from 'react';
import '@/App.css';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './context/AuthContext';
import { Toaster } from './components/ui/sonner';
import Login from './pages/Login';
import Dashboard from './pages/Dashboard';
import Aircraft from './pages/Aircraft';
import Missions from './pages/Missions';
import Emergencies from './pages/Emergencies';
import Maintenance from './pages/Maintenance';
import Training from './pages/Training';
import Welfare from './pages/Welfare';
import Users from './pages/Users';
import DashboardLayout from './components/dashboard/DashboardLayout';

const PrivateRoute = ({ children }) => {
  const { user, loading } = useAuth();

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-950 flex items-center justify-center">
        <div className="text-slate-400 font-mono">Loading...</div>
      </div>
    );
  }

  return user ? children : <Navigate to="/login" />;
};

function AppContent() {
  return (
    <div className="App">
      <Routes>
        <Route path="/login" element={<Login />} />
        <Route
          path="/dashboard"
          element={
            <PrivateRoute>
              <DashboardLayout />
            </PrivateRoute>
          }
        >
          <Route index element={<Dashboard />} />
          <Route path="aircraft" element={<Aircraft />} />
          <Route path="missions" element={<Missions />} />
          <Route path="emergencies" element={<Emergencies />} />
          <Route path="maintenance" element={<Maintenance />} />
          <Route path="training" element={<Training />} />
          <Route path="welfare" element={<Welfare />} />
          <Route path="users" element={<Users />} />
        </Route>
        <Route path="/" element={<Navigate to="/login" />} />
      </Routes>
      <Toaster position="top-right" theme="dark" />
    </div>
  );
}

function App() {
  return (
    <BrowserRouter>
      <AuthProvider>
        <AppContent />
      </AuthProvider>
    </BrowserRouter>
  );
}

export default App;
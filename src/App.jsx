import React, { useEffect, useState } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import Login from './components/Login';
import Signup from './components/signup';
import supabase from '../SupabaseClient'; // Correctly imported supabase

function ProtectedRoute({ children, allowedRole, redirectTo = '/login' }) {
  const [isAuthorized, setIsAuthorized] = useState(null);

  useEffect(() => {
    const checkAuth = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) {
        setIsAuthorized(false);
        return;
      }

      const { data: profile, error } = await supabase
        .from('profiles')
        .select('role')
        .eq('id', session.user.id)
        .single();

      if (error) {
        console.error('Error fetching profile:', error);
        setIsAuthorized(false);
        return;
      }

      setIsAuthorized(profile?.role === allowedRole);
    };

    checkAuth();
  }, [allowedRole]);

  if (isAuthorized === null) {
    return <div>Loading...</div>;
  }

  return isAuthorized ? children : <Navigate to={redirectTo} />;
}

function App() {
  return (
    <Router>
      <Routes>
        <Route path="/login" element={<Login />} />
        <Route path="/signup" element={<Signup />} />
        
        <Route 
          path="/home" 
          element={
            <ProtectedRoute allowedRole="user">
              <div>User Dashboard</div>
            </ProtectedRoute>
          } 
        />
        
        <Route 
          path="/owner/dashboard" 
          element={
            <ProtectedRoute allowedRole="owner">
              <div>Station Owner Dashboard</div>
            </ProtectedRoute>
          } 
        />
        
        <Route path="/" element={<Navigate to="/login" />} />
      </Routes>
    </Router>
  );
}

export default App;

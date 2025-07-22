import React, { useEffect, useState } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import Login from './components/Login';
import Signup from './components/signup';
import UserHome from './components/UserHome';
import OwnerDashboard from './components/ownerHome';
import OwnerNavbar from './components/Ownernavbar'; 
import Profile from './components/Profile';
import Addstation from './components/Addstation';
import supabase from '../SupabaseClient';
import Bookings from './components/Bookings'; 
import UserProfile from './components/UserProfile';
import BookingHistory from './components/BookingHistory';
import StationDetails from './components/StationDetails';
import Usernavbar from './components/Usernavbar';



function ProtectedRoute({ children, allowedRole, redirectTo = '/login' }) {
  const [isAuthorized, setIsAuthorized] = useState(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const checkAuth = async () => {
      try {
        const { data: { session } } = await supabase.auth.getSession();
        
        if (!session) {
          setIsAuthorized(false);
          setIsLoading(false);
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
        } else {
          setIsAuthorized(profile?.role === allowedRole);
        }
      } catch (error) {
        console.error('Auth check error:', error);
        setIsAuthorized(false);
      } finally {
        setIsLoading(false);
      }
    };

    checkAuth();
  }, [allowedRole]);

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-100">
        <div className="text-xl font-semibold text-gray-700">Loading...</div>
      </div>
    );
  }

  return isAuthorized ? children : <Navigate to={redirectTo} replace />;
}

function App() {
  return (
    <Router>
      <Routes>
        {/* Public Routes */}
        <Route path="/login" element={<Login />} />
        <Route path="/signup" element={<Signup />} />
        
        {/* Protected User Route */}
        <Route 
          path="/user/*" 
          element={
            <ProtectedRoute allowedRole="user">
              <div className="min-h-screen bg-gray-50">
              <Usernavbar />
            <div className="max-w-7xl mx-auto py-6 px-4 sm:px-6 lg:px-8">
            <Routes>
              <Route path="home" element={<UserHome />} />
              <Route path="station-details/:stationId" element={<StationDetails />} />
              <Route path="booking-history" element={<BookingHistory />} />
              <Route path="profile" element={<UserProfile/>} />
          </Routes>
        </div>
      </div>
            </ProtectedRoute>
          } 
        />
        
        {/* Protected Owner Route with Navbar */}
        <Route 
          path="/owner/*" 
          element={
            <ProtectedRoute allowedRole="owner">
              <>
                <OwnerNavbar /> 
                <Routes>
                  <Route path="dashboard" element={<OwnerDashboard />} />
                  <Route path="add-station" element={<Addstation />} />
                  <Route path="Bookings" element={<Bookings /> } />
                  <Route path="profile" element={<Profile />} />
                </Routes>
              </>
            </ProtectedRoute>
          }
        />

        <Route path="/" element={<Navigate to="/login" replace />} />
        
        {/* Catch all route - redirects to login */}
        <Route path="*" element={<Navigate to="/login" replace />} />
      </Routes>
    </Router>
    
  );
}

export default App;

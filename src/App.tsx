import React, { useEffect } from 'react';
import { BrowserRouter, Routes, Route, useNavigate } from 'react-router-dom';
import { Toaster } from 'react-hot-toast';
import { AnimatePresence } from 'framer-motion';
import { supabase } from './lib/supabase';
import Login from './pages/Login';
import Register from './pages/Register';
import ResetPassword from './pages/ResetPassword';
import Feed from './pages/Feed';
import FeedV2 from './pages/FeedV2';
import Profile from './pages/Profile';
import Search from './pages/Search';
import Layout from './components/Layout';
import ProtectedRoute from './components/ProtectedRoute';
import Landing from './pages/Landing';
import LandingV2 from './pages/LandingV2';
import MUJMenus from './pages/MUJMenus';
import RestaurantMenu from './pages/RestaurantMenu';
import AdminPanel from './pages/AdminPanel';

// Session check wrapper component
const SessionCheck = () => {
  const navigate = useNavigate();

  useEffect(() => {
    checkSession();

    // Subscribe to auth state changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange((event, session) => {
      if (event === 'SIGNED_IN' && session) {
        navigate('/feed');
      }
    });

    return () => {
      subscription.unsubscribe();
    };
  }, [navigate]);

  const checkSession = async () => {
    const { data: { session } } = await supabase.auth.getSession();
    if (session) {
      navigate('/feed');
    }
  };

  return null;
};

function App() {
  return (
    <BrowserRouter>
      <AnimatePresence mode="wait">
        <Routes>
          <Route path="/v1" element={<><SessionCheck /><Landing /></>} />
          <Route path="/" element={<><SessionCheck /><LandingV2 /></>} />
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />
          <Route path="/reset-password" element={<ResetPassword />} />
          <Route element={<Layout />}>
            <Route path="/feed" element={<Feed />} />
            <Route path="/feed-v2" element={<FeedV2 />} />
            <Route element={<ProtectedRoute />}>
              <Route path="/profile/:id" element={<Profile />} />
              <Route path="/search" element={<Search />} />
              <Route path="/admin" element={<AdminPanel />} />
            </Route>
            <Route path="/muj-menus" element={<MUJMenus />} />
            <Route path="/menu/:id" element={<RestaurantMenu />} />
          </Route>
        </Routes>
      </AnimatePresence>
      <Toaster position="bottom-right" />
    </BrowserRouter>
  );
}

export default App;
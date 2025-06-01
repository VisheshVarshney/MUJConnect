import React, { useEffect, useState } from 'react';
import { BrowserRouter, Routes, Route, useNavigate, useSearchParams } from 'react-router-dom';
import { Toaster } from 'react-hot-toast';
import { AnimatePresence } from 'framer-motion';
import { supabase } from './lib/supabase';
import { logPageVisit } from './lib/ipLogger';
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
import SharedPostModal from './components/SharedPostModal';
import CarRental from './pages/CarRental';
import PostDetails from './pages/PostDetails';

// Session check wrapper component
const SessionCheck = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const [showSharedPost, setShowSharedPost] = useState(false);
  const [sharedPost, setSharedPost] = useState<any>(null);
  const [currentUser, setCurrentUser] = useState<any>(null);

  useEffect(() => {
    checkSession();
    checkSharedPost();

    // Log page visit
    logPageVisit(window.location.pathname);

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
      const { data: profile } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', session.user.id)
        .single();
      setCurrentUser(profile);
      navigate('/feed');
    }
  };

  const checkSharedPost = async () => {
    const postId = searchParams.get('post');
    if (postId) {
      try {
        const { data: post } = await supabase
          .from('posts')
          .select(`
            *,
            profiles (*),
            likes (*),
            comments (*),
            media_files (*)
          `)
          .eq('id', postId)
          .single();

        if (post) {
          setSharedPost(post);
          setShowSharedPost(true);
        }
      } catch (error) {
        console.error('Error fetching shared post:', error);
      }
    }
  };

  return (
    <>
      <AnimatePresence>
        {showSharedPost && sharedPost && (
          <SharedPostModal
            post={sharedPost}
            onClose={() => {
              setShowSharedPost(false);
              const newParams = new URLSearchParams(searchParams);
              newParams.delete('post');
              window.history.replaceState({}, '', `${window.location.pathname}${newParams.toString() ? `?${newParams.toString()}` : ''}`);
            }}
            currentUser={currentUser}
          />
        )}
      </AnimatePresence>
    </>
  );
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
            <Route path="/feed" element={<><SessionCheck /><Feed /></>} />
            <Route path="/feed-v2" element={<><SessionCheck /><FeedV2 /></>} />
            <Route element={<ProtectedRoute />}>
              <Route path="/profile/:id" element={<Profile />} />
              <Route path="/search" element={<Search />} />
              <Route path="/admin" element={<AdminPanel />} />
              <Route path="/post/:id" element={<PostDetails />} />
            </Route>
            <Route path="/muj-menus" element={<MUJMenus />} />
            <Route path="/menu/:id" element={<RestaurantMenu />} />
            <Route path="/car-rental" element={<CarRental />} />
          </Route>
        </Routes>
      </AnimatePresence>
      <Toaster position="bottom-right" />
    </BrowserRouter>
  );
}

export default App;
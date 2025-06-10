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
import { AuthProvider } from './contexts/AuthContext';
import { ThemeProvider } from './contexts/ThemeContext';
import AppRoutes from './routes';
import { setupGlobalErrorHandling } from './lib/errorLogger';
import RouteChangeTracker from './components/RouteChangeTracker';

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
      <RouteChangeTracker />
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
      <AppRoutes />
    </>
  );
};

function App() {
  useEffect(() => {
    // Disable right-click
    const handleContextMenu = (e: MouseEvent) => {
      e.preventDefault();
    };
    document.addEventListener('contextmenu', handleContextMenu);

    // Disable devtools shortcuts
    const handleKeyDown = (e: KeyboardEvent) => {
      // F12
      if (e.key === 'F12') {
        e.preventDefault();
        e.stopPropagation();
      }
      // Ctrl+Shift+I or Cmd+Opt+I
      if ((e.ctrlKey && e.shiftKey && e.key.toLowerCase() === 'i') ||
          (e.metaKey && e.altKey && e.key.toLowerCase() === 'i')) {
        e.preventDefault();
        e.stopPropagation();
      }
    };
    document.addEventListener('keydown', handleKeyDown);

    // Setup global error handling
    setupGlobalErrorHandling();

    return () => {
      document.removeEventListener('contextmenu', handleContextMenu);
      document.removeEventListener('keydown', handleKeyDown);
    };
  }, []);

  return (
    <BrowserRouter>
      <ThemeProvider>
        <AuthProvider>
          <Toaster position="top-center" />
          <SessionCheck />
        </AuthProvider>
      </ThemeProvider>
    </BrowserRouter>
  );
}

export default App;
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
import Profile from './pages/Profile';
import Search from './pages/Search';
import Layout from './components/Layout';
import ProtectedRoute from './components/ProtectedRoute';
import LandingV2 from './pages/LandingV2';
import MUJMenus from './pages/MUJMenus';
import RestaurantMenu from './pages/RestaurantMenu';
import AdminPanel from './pages/AdminPanel';
import SharedPostModal from './components/SharedPostModal';
import CarRental from './pages/CarRental';
import PostDetails from './pages/PostDetails';
import { AuthProvider, useAuth } from './contexts/AuthContext';
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

function BannedCheck({ children }: { children: React.ReactNode }) {
  const { profile, signOut } = useAuth();
  const navigate = useNavigate();
  if (profile?.is_banned) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-white dark:bg-amoled">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-red-600 mb-4">You have been banned</h1>
          <p className="text-gray-700 dark:text-gray-200 mb-2">
            You have been banned
            {profile.ban_expires_at ? (
              <> for <span className="font-semibold">{new Date(profile.ban_expires_at).toLocaleString()}</span></>
            ) : (
              <> forever</>
            )}
            {' '}from MUJ Connect
          </p>
          {profile.ban_issued_by && (
            <p className="text-gray-700 dark:text-gray-200 mb-2">
              by: <span className="font-semibold">{profile.ban_issued_by}</span>
            </p>
          )}
          {profile.ban_reason && (
            <p className="text-gray-700 dark:text-gray-200 mb-2">
              for <span className="font-semibold">{profile.ban_reason}</span>
            </p>
          )}
          <button
            className="mt-6 px-4 py-2 bg-red-500 text-white rounded-lg hover:bg-red-600"
            onClick={async () => {
              await signOut();
              navigate('/login');
            }}
          >
            Logout
          </button>
        </div>
      </div>
    );
  }
  return <>{children}</>;
}

function App() {
  useEffect(() => {
    // Disable right-click
    const handleContextMenu = (e: MouseEvent) => {
      e.preventDefault();
    };
    document.addEventListener('contextmenu', handleContextMenu);

    // Setup global error handling
    setupGlobalErrorHandling();

    return () => {
      document.removeEventListener('contextmenu', handleContextMenu);
    };
  }, []);

  return (
    <BrowserRouter>
      <ThemeProvider>
        <AuthProvider>
          <BannedCheck>
            <Toaster position="top-center" />
            <SessionCheck />
          </BannedCheck>
        </AuthProvider>
      </ThemeProvider>
    </BrowserRouter>
  );
}

export default App;
import React, { useState, useEffect, useRef } from 'react';
import { Outlet, Link, useNavigate, useLocation } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Home,
  User,
  Bell,
  LogOut,
  Search,
  MessageCircle,
  Moon,
  Sun,
  Shield,
  Utensils,
  Menu,
  X,
  Send,
  Car,
  ChevronDown,
  Settings,
  Hash,
  TrendingUp as TrendUp
} from 'lucide-react';
import { useThemeStore } from '../lib/store';
import { toast } from 'react-hot-toast';
import { supabase } from '../lib/supabase';
import ChatBot from './ChatBot';
import SearchBar from './SearchBar';
import { useTheme } from '../contexts/ThemeContext';
import { useAuth } from '../contexts/AuthContext';
import { fetchNotifications, getUnreadNotificationCount, markAllNotificationsAsRead, Notification } from '../lib/notifications';
import NotificationsDropdown from './NotificationsDropdown';

export default function Layout() {
  const navigate = useNavigate();
  const location = useLocation();
  const [showNotifications, setShowNotifications] = useState(false);
  const [showMobileMenu, setShowMobileMenu] = useState(false);
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [currentUser, setCurrentUser] = useState<any>(null);
  const [showUserMenu, setShowUserMenu] = useState(false);
  const [isOpen, setIsOpen] = useState(false);
  const { isDark, toggleDark } = useThemeStore();
  const userMenuRef = useRef<HTMLDivElement>(null);
  const isFeedPage = location.pathname === '/feed';
  const { theme, toggleTheme } = useTheme();
  const { user, signOut } = useAuth();
  const [unreadCount, setUnreadCount] = useState(0);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    fetchNotifications();
    fetchCurrentUser();

    // Handle click outside user menu
    const handleClickOutside = (event: MouseEvent) => {
      if (
        userMenuRef.current &&
        !userMenuRef.current.contains(event.target as Node)
      ) {
        setShowUserMenu(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  useEffect(() => {
    const fetchData = async () => {
      if (user) {
        try {
          const [notifs, count] = await Promise.all([
            fetchNotifications(),
            getUnreadNotificationCount()
          ]);
          setNotifications(notifs);
          setUnreadCount(count);
        } catch (error) {
          console.error('Error fetching notifications:', error);
        } finally {
          setIsLoading(false);
        }
      }
    };

    fetchData();
    // Set up real-time subscription for notifications
    const subscription = supabase
      .channel('notifications')
      .on('postgres_changes', {
        event: '*',
        schema: 'public',
        table: 'notifications',
        filter: `user_id=eq.${user?.id}`
      }, async () => {
        const [notifs, count] = await Promise.all([
          fetchNotifications(),
          getUnreadNotificationCount()
        ]);
        setNotifications(notifs);
        setUnreadCount(count);
      })
      .subscribe();

    return () => {
      subscription.unsubscribe();
    };
  }, [user]);

  const fetchCurrentUser = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (user) {
        const { data: profile } = await supabase
          .from('profiles')
          .select('*')
          .eq('id', user.id)
          .single();
        setCurrentUser(profile);
      }
    } catch (error) {
      console.error('Error fetching current user:', error);
    }
  };

  const handleLogout = async () => {
    try {
      await signOut();
      navigate('/login');
      toast.success('Logged out successfully');
    } catch (error) {
      console.error('Error signing out:', error);
      toast.error('Failed to log out');
    }
  };

  const handleMarkAllRead = async () => {
    try {
      await markAllNotificationsAsRead();
      setNotifications(prev => prev.map(n => ({ ...n, is_read: true })));
      setUnreadCount(0);
    } catch (error) {
      console.error('Error marking notifications as read:', error);
    }
  };

  return (
    <div className="relative min-h-screen bg-gray-50 dark:bg-amoled transition-colors duration-300">
      {/* Top Navigation */}
      <nav className="fixed top-0 left-0 right-0 bg-white dark:bg-amoled shadow-sm z-50 transition-colors duration-300">
        <div className="max-w-7xl mx-auto px-4">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center space-x-6">
              <Link to="/" className="text-2xl font-bold text-blue-500">
                MUJ Connect
              </Link>
            </div>

            {/* Desktop Search Bar - Hidden on Mobile */}
            <div className="hidden md:block flex-1 max-w-2xl mx-12">
              <SearchBar />
            </div>

            {/* Mobile Top Right Icons */}
            <div className="flex items-center space-x-3 md:hidden">
              <button
                onClick={() => toggleDark()}
                className="p-2 text-gray-600 dark:text-gray-300"
              >
                {isDark ? <Sun className="w-6 h-6" /> : <Moon className="w-6 h-6" />}
              </button>
              <button
                onClick={() => setShowNotifications(!showNotifications)}
                className="p-2 text-gray-600 dark:text-gray-300 relative"
              >
                <Bell className="w-6 h-6" />
                {unreadCount > 0 && (
                  <motion.div
                    initial={{ scale: 0 }}
                    animate={{ scale: 1 }}
                    className="absolute top-1 right-1 w-2 h-2 bg-red-500 rounded-full"
                  />
                )}
              </button>
            </div>

            {/* Desktop Right Menu - Hidden on Mobile */}
            <div className="hidden md:flex items-center">
              <button
                onClick={() => toggleDark()}
                className="p-2 text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-full transition-all duration-200 hover:scale-105"
              >
                {isDark ? (
                  <Sun className="w-5 h-5" />
                ) : (
                  <Moon className="w-5 h-5" />
                )}
              </button>
            </div>
          </div>
        </div>
      </nav>

      {/* Left Sidebar - Hidden on Mobile */}
      <motion.div
        initial={{ width: isFeedPage ? 220 : 64 }}
        animate={{ width: isFeedPage ? 220 : 64 }}
        transition={{ duration: 0.3, ease: 'easeInOut' }}
        className="fixed left-0 top-16 bottom-0 hidden md:flex flex-col bg-white dark:bg-amoled shadow-lg z-40 overflow-hidden"
      >
        <div className="flex-1 py-4 space-y-2">
          <Link
            to="/feed"
            className={`sidebar-item group ${!isFeedPage && 'justify-center'}`}
          >
            <Home className="icon" />
            <span
              className={`text transition-all duration-300 ${
                !isFeedPage
                  ? 'opacity-0 group-hover:opacity-100 absolute left-16'
                  : 'opacity-100'
              }`}
            >
              Home
            </span>
          </Link>

          <Link
            to="/muj-menus"
            className={`sidebar-item group ${!isFeedPage && 'justify-center'}`}
          >
            <Utensils className="icon" />
            <span
              className={`text transition-all duration-300 ${
                !isFeedPage
                  ? 'opacity-0 group-hover:opacity-100 absolute left-16'
                  : 'opacity-100'
              }`}
            >
              MUJ Menus
            </span>
          </Link>

          <Link
            to="/car-rental"
            className={`sidebar-item group ${!isFeedPage && 'justify-center'}`}
          >
            <Car className="icon" />
            <span
              className={`text transition-all duration-300 ${
                !isFeedPage
                  ? 'opacity-0 group-hover:opacity-100 absolute left-16'
                  : 'opacity-100'
              }`}
            >
              Car Rental
            </span>
          </Link>

          {currentUser?.is_superadmin && (
            <Link
              to="/admin"
              className={`sidebar-item group text-red-500 ${
                !isFeedPage && 'justify-center'
              }`}
            >
              <Shield className="icon" />
              <span
                className={`text transition-all duration-300 ${
                  !isFeedPage
                    ? 'opacity-0 group-hover:opacity-100 absolute left-16'
                    : 'opacity-100'
                }`}
              >
                Admin
              </span>
            </Link>
          )}

          {/* Quick Actions Section */}
          <div className={`px-3 py-2 ${!isFeedPage && 'hidden'}`}>
            <h3 className="text-xs font-semibold text-gray-500 dark:text-gray-400 mb-2">
              Quick Actions
            </h3>
            <div className="space-y-1">
              <motion.button
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                className="w-full flex items-center space-x-3 p-2 rounded-lg text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-amoled-light transition-colors"
                onClick={() => navigate('/search')}
              >
                <Search className="w-5 h-5" />
                <span>Search</span>
              </motion.button>
              <motion.button
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                className="w-full flex items-center space-x-3 p-2 rounded-lg text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-amoled-light transition-colors"
                onClick={() => setShowNotifications(true)}
              >
                <Bell className="w-5 h-5" />
                <span>Notifications</span>
                {unreadCount > 0 && (
                  <motion.div
                    initial={{ scale: 0 }}
                    animate={{ scale: 1 }}
                    className="ml-auto w-2 h-2 bg-red-500 rounded-full"
                  />
                )}
              </motion.button>
            </div>
          </div>

          {/* Trending Topics Section */}
          <div className={`px-3 py-2 ${!isFeedPage && 'hidden'}`}>
            <h3 className="text-xs font-semibold text-gray-500 dark:text-gray-400 mb-2">
              Trending Topics
            </h3>
            <div className="space-y-1">
              {['#MUJLife', '#CampusEvents', '#StudentLife'].map((tag) => (
                <motion.button
                  key={tag}
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  className="w-full flex items-center space-x-3 p-2 rounded-lg text-blue-500 dark:text-blue-400 hover:bg-blue-50 dark:hover:bg-blue-900/20 transition-colors"
                  onClick={() => navigate(`/search?q=${tag}`)}
                >
                  <Hash className="w-5 h-5" />
                  <span>{tag}</span>
                </motion.button>
              ))}
            </div>
          </div>
        </div>

        {/* User Profile Section */}
        <div ref={userMenuRef} className="relative px-2 pb-4">
          <motion.button
            onClick={() => setShowUserMenu(!showUserMenu)}
            className={`w-full p-3 flex items-center space-x-3 hover:bg-gray-100 dark:hover:bg-amoled-light transition-all duration-200 rounded-lg ${
              !isFeedPage ? 'justify-center' : ''
            }`}
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
          >
            <motion.div
              whileHover={{ scale: 1.1 }}
              className="relative"
            >
              <img
                src={
                  currentUser?.avatar_url ||
                  `https://api.dicebear.com/9.x/adventurer-neutral/svg?seed=${currentUser?.id}`
                }
                alt=""
                className="w-10 h-10 rounded-full"
              />
              <motion.div
                className="absolute -bottom-1 -right-1 w-3 h-3 bg-green-500 rounded-full border-2 border-white dark:border-amoled"
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                transition={{ delay: 0.2 }}
              />
            </motion.div>
            {isFeedPage && (
              <div className="flex-1 text-left">
                <div className="font-medium dark:text-white">
                  {currentUser?.full_name}
                </div>
                <div className="text-sm text-gray-500 dark:text-gray-400">
                  @{currentUser?.username}
                </div>
              </div>
            )}
          </motion.button>

          <AnimatePresence>
            {showUserMenu && (
              <motion.div
                initial={{ opacity: 0, scale: 0.95, y: 8 }}
                animate={{ opacity: 1, scale: 1, y: 0 }}
                exit={{ opacity: 0, scale: 0.95, y: 8 }}
                transition={{ duration: 0.2, ease: 'easeOut' }}
                className="absolute bottom-full left-0 w-full mb-2 bg-white dark:bg-amoled-light rounded-lg shadow-lg border dark:border-gray-800 overflow-hidden"
              >
                <Link
                  to={`/profile/${currentUser?.id}`}
                  className="flex items-center space-x-2 p-3 hover:bg-gray-100 dark:hover:bg-amoled-lighter transition-colors"
                  onClick={() => setShowUserMenu(false)}
                >
                  <User className="w-5 h-5" />
                  <span>View Profile</span>
                </Link>
                <motion.button
                  onClick={() => {
                    handleLogout();
                    setShowUserMenu(false);
                  }}
                  className="w-full flex items-center space-x-2 p-3 text-red-500 hover:bg-gray-100 dark:hover:bg-amoled-lighter transition-colors"
                  whileHover={{ x: 2 }}
                >
                  <LogOut className="w-5 h-5" />
                  <span>Logout</span>
                </motion.button>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </motion.div>

      {/* Main Content */}
      <div className="flex">
        <main
          className={`flex-1 pt-16 pb-20 md:pb-8 min-h-screen ${
            isFeedPage ? 'md:ml-56' : 'md:ml-16'
          }`}
        >
          <div className="max-w-7xl mx-auto px-4 md:px-8">
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
            >
              <Outlet />
            </motion.div>
          </div>
        </main>
      </div>

      {/* Mobile Bottom Navigation */}
      <motion.nav
        className="fixed bottom-0 left-0 right-0 bg-white dark:bg-amoled border-t dark:border-gray-800 md:hidden z-50"
        initial={{ y: 100 }}
        animate={{ y: 0 }}
        transition={{ type: 'spring', stiffness: 300, damping: 30 }}
      >
        <div className="flex justify-around items-center h-16">
          <Link
            to="/feed"
            className={`flex flex-col items-center justify-center flex-1 h-full space-y-1 ${
              location.pathname === '/feed'
                ? 'text-blue-500'
                : 'text-gray-500 dark:text-gray-400'
            }`}
          >
            <Home className="w-6 h-6" />
            {location.pathname === '/feed' && (
              <motion.span
                initial={{ opacity: 0, y: 5 }}
                animate={{ opacity: 1, y: 0 }}
                className="text-xs font-medium"
              >
                Home
              </motion.span>
            )}
          </Link>

          <Link
            to="/search"
            className={`flex flex-col items-center justify-center flex-1 h-full space-y-1 ${
              location.pathname === '/search'
                ? 'text-blue-500'
                : 'text-gray-500 dark:text-gray-400'
            }`}
          >
            <Search className="w-6 h-6" />
            {location.pathname === '/search' && (
              <motion.span
                initial={{ opacity: 0, y: 5 }}
                animate={{ opacity: 1, y: 0 }}
                className="text-xs font-medium"
              >
                Search
              </motion.span>
            )}
          </Link>

          <Link
            to="/muj-menus"
            className={`flex flex-col items-center justify-center flex-1 h-full space-y-1 ${
              location.pathname === '/muj-menus'
                ? 'text-blue-500'
                : 'text-gray-500 dark:text-gray-400'
            }`}
          >
            <Utensils className="w-6 h-6" />
            {location.pathname === '/muj-menus' && (
              <motion.span
                initial={{ opacity: 0, y: 5 }}
                animate={{ opacity: 1, y: 0 }}
                className="text-xs font-medium"
              >
                Menus
              </motion.span>
            )}
          </Link>

          <button
            onClick={() => setIsOpen(!isOpen)}
            className={`flex flex-col items-center justify-center flex-1 h-full space-y-1 ${
              isOpen ? 'text-blue-500' : 'text-gray-500 dark:text-gray-400'
            }`}
          >
            <MessageCircle className="w-6 h-6" />
            {isOpen && (
              <motion.span
                initial={{ opacity: 0, y: 5 }}
                animate={{ opacity: 1, y: 0 }}
                className="text-xs font-medium"
              >
                Chat
              </motion.span>
            )}
          </button>

          <Link
            to={`/profile/${currentUser?.id}`}
            className={`flex flex-col items-center justify-center flex-1 h-full space-y-1 ${
              location.pathname.startsWith('/profile')
                ? 'text-blue-500'
                : 'text-gray-500 dark:text-gray-400'
            }`}
          >
            <User className="w-6 h-6" />
            {location.pathname.startsWith('/profile') && (
              <motion.span
                initial={{ opacity: 0, y: 5 }}
                animate={{ opacity: 1, y: 0 }}
                className="text-xs font-medium"
              >
                Profile
              </motion.span>
            )}
          </Link>
        </div>
      </motion.nav>

      <ChatBot isOpen={isOpen} setIsOpen={setIsOpen} />

      {/* Notifications Dropdown */}
      <AnimatePresence>
        {showNotifications && (
          <NotificationsDropdown
            notifications={notifications}
            onClose={() => setShowNotifications(false)}
            onMarkAllRead={handleMarkAllRead}
          />
        )}
      </AnimatePresence>
    </div>
  );
}
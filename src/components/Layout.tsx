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

export default function Layout() {
  const navigate = useNavigate();
  const location = useLocation();
  const [showNotifications, setShowNotifications] = useState(false);
  const [showMobileMenu, setShowMobileMenu] = useState(false);
  const [notifications, setNotifications] = useState<any[]>([]);
  const [currentUser, setCurrentUser] = useState<any>(null);
  const [showUserMenu, setShowUserMenu] = useState(false);
  const [isOpen, setIsOpen] = useState(false);
  const { isDark, toggleDark } = useThemeStore();
  const userMenuRef = useRef<HTMLDivElement>(null);
  const isFeedPage = location.pathname === '/feed';

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

  const fetchNotifications = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      const { data } = await supabase
        .from('notifications')
        .select('*')
        .order('created_at', { ascending: false })
        .limit(10);
      if (data) setNotifications(data);
    } catch (error) {
      console.error('Error fetching notifications:', error);
    }
  };

  const handleLogout = async () => {
    try {
      await supabase.auth.signOut();
      navigate('/login');
      toast.success('Logged out successfully');
    } catch (error) {
      console.error('Error signing out:', error);
      toast.error('Error signing out');
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
                {notifications.some((n) => !n.is_read) && (
                  <span className="absolute top-1 right-1 w-2 h-2 bg-red-500 rounded-full" />
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
        initial={{ width: isFeedPage ? 192 : 64 }}
        animate={{ width: isFeedPage ? 192 : 64 }}
        transition={{ duration: 0.3, ease: 'easeInOut' }}
        className="fixed left-0 top-16 bottom-0 hidden md:flex flex-col bg-white dark:bg-amoled shadow-lg z-40 overflow-hidden"
      >
        <div className="flex-1 py-4">
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
        </div>

        {/* User Profile Section */}
        <div ref={userMenuRef} className="relative px-2">
          <motion.button
            onClick={() => setShowUserMenu(!showUserMenu)}
            className={`w-full p-3 flex items-center space-x-3 hover:bg-gray-100 dark:hover:bg-amoled-light transition-all duration-200 rounded-lg ${
              !isFeedPage ? 'justify-center' : ''
            }`}
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
          >
            <img
              src={
                currentUser?.avatar_url ||
                `https://api.dicebear.com/9.x/adventurer-neutral/svg?seed=${currentUser?.id}`
              }
              alt=""
              className="w-10 h-10 rounded-full"
            />
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
            isFeedPage ? 'md:ml-48' : 'md:ml-16'
          }`}
        >
          <div className="max-w-7xl mx-auto px-4">
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
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            className="fixed top-16 left-0 right-0 md:left-16 md:w-80 bg-white dark:bg-amoled rounded-lg shadow-xl z-50 mx-2 md:mx-0"
          >
            <div className="p-4">
              <h3 className="text-lg font-semibold mb-4 dark:text-white">
                Notifications
              </h3>
              <div className="space-y-4">
                {notifications.map((notification) => (
                  <div
                    key={notification.id}
                    className={`p-3 rounded-lg animate-fade-in ${
                      notification.is_read
                        ? 'bg-gray-50 dark:bg-amoled-light'
                        : 'bg-blue-50 dark:bg-blue-900'
                    }`}
                  >
                    <p className="text-sm dark:text-white">
                      {notification.content}
                    </p>
                    <span className="text-xs text-gray-500 dark:text-gray-400">
                      {new Date(notification.created_at).toLocaleDateString()}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
import React, { useState, useEffect, useRef } from 'react';
import { Outlet, Link, useNavigate, useLocation, NavLink } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Home,
  Search,
  Bell,
  User,
  Menu,
  X,
  LogOut,
  Settings,
  Hash,
  TrendingUp as TrendUp,
  PlusCircle,
  MessageSquare,
  Sun,
  Moon,
  Utensils,
  Car,
  Shield
} from 'lucide-react';
import { useThemeStore } from '../lib/store';
import { toast } from 'react-hot-toast';
import { supabase } from '../lib/supabase';
import ChatBot from './ChatBot';
import SearchBar from './SearchBar';
import { useAuth } from '../contexts/AuthContext';
import { fetchNotifications, getUnreadNotificationCount, markAllNotificationsAsRead, Notification } from '../lib/notifications';
import NotificationsDropdown from './NotificationsDropdown';

export default function Layout() {
  const navigate = useNavigate();
  const location = useLocation();
  const [showNotifications, setShowNotifications] = useState(false);
  const [showMobileMenu, setShowMobileMenu] = useState(false);
  const [showUserMenu, setShowUserMenu] = useState(false);
  const [isOpen, setIsOpen] = useState(false);
  const [isNotificationsOpen, setIsNotificationsOpen] = useState(false);
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const { isDark, toggleDark } = useThemeStore();
  const userMenuRef = useRef<HTMLDivElement>(null);
  const isFeedPage = location.pathname === '/feed';
  const { user, profile, isSuperAdmin, signOut } = useAuth();
  const [isMobile, setIsMobile] = useState(window.innerWidth <= 768);

  useEffect(() => {
    const handleResize = () => setIsMobile(window.innerWidth <= 768);
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  useEffect(() => {
    if (user) {
      fetchNotifications().then(setNotifications);
      getUnreadNotificationCount().then(setUnreadCount);
    }
  }, [user]);

  const handleSignOut = async () => {
    try {
      await signOut();
      navigate('/login');
    } catch (error) {
      console.error('Error signing out:', error);
    }
  };

  const handleMarkAllAsRead = async () => {
    if (user) {
      await markAllNotificationsAsRead();
      setUnreadCount(0);
      setNotifications(notifications.map(n => ({ ...n, read: true })));
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

          {isSuperAdmin && (
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
                  profile?.avatar_url ||
                  `https://api.dicebear.com/9.x/adventurer-neutral/svg?seed=${user?.id}`
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
                <div className="font-medium text-gray-900 dark:text-white">
                  {profile?.full_name}
                </div>
                <div className="text-sm text-gray-600 dark:text-gray-400">
                  @{profile?.username}
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
                  to={`/profile/${user?.id}`}
                  className="flex items-center space-x-2 p-3 hover:bg-gray-100 dark:hover:bg-amoled-lighter transition-colors"
                  onClick={() => setShowUserMenu(false)}
                >
                  <User className="w-5 h-5" />
                  <span>View Profile</span>
                </Link>
                <motion.button
                  onClick={() => {
                    handleSignOut();
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
          } overflow-hidden`}
        >
          <div className="w-full px-4 md:max-w-7xl md:mx-auto md:px-8">
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
      <div className="md:hidden fixed bottom-0 left-0 right-0 bg-white dark:bg-amoled border-t dark:border-gray-800 z-50">
        <div className="flex justify-around items-center h-16">
          <NavLink
            to="/feed"
            className={({ isActive }) =>
              `flex flex-col items-center justify-center w-full h-full ${
                isActive
                  ? 'text-blue-500'
                  : 'text-gray-700 dark:text-gray-300'
              }`
            }
          >
            <Home className="w-6 h-6" />
            <span className="text-xs mt-1">Home</span>
          </NavLink>
          <NavLink
            to="/search"
            className={({ isActive }) =>
              `flex flex-col items-center justify-center w-full h-full ${
                isActive
                  ? 'text-blue-500'
                  : 'text-gray-700 dark:text-gray-300'
              }`
            }
          >
            <Search className="w-6 h-6" />
            <span className="text-xs mt-1">Search</span>
          </NavLink>
          <NavLink
            to="/muj-menus"
            className={({ isActive }) =>
              `flex flex-col items-center justify-center w-full h-full ${
                isActive
                  ? 'text-blue-500'
                  : 'text-gray-700 dark:text-gray-300'
              }`
            }
          >
            <Utensils className="w-6 h-6" />
            <span className="text-xs mt-1">Menus</span>
          </NavLink>
          <button
            onClick={() => setIsOpen(true)}
            className="flex flex-col items-center justify-center w-full h-full text-gray-700 dark:text-gray-300"
          >
            <MessageSquare className="w-6 h-6" />
            <span className="text-xs mt-1">Assistant</span>
          </button>
          <NavLink
            to={`/profile/${user?.id}`}
            className={({ isActive }) =>
              `flex flex-col items-center justify-center w-full h-full ${
                isActive
                  ? 'text-blue-500'
                  : 'text-gray-700 dark:text-gray-300'
              }`
            }
          >
            <User className="w-6 h-6" />
            <span className="text-xs mt-1">Profile</span>
          </NavLink>
        </div>
      </div>

      <ChatBot isOpen={isOpen} setIsOpen={setIsOpen} />

      {/* Notifications Dropdown */}
      <AnimatePresence>
        {showNotifications && (
          <NotificationsDropdown
            notifications={notifications}
            onClose={() => setShowNotifications(false)}
            onMarkAllRead={handleMarkAllAsRead}
          />
        )}
      </AnimatePresence>
    </div>
  );
}
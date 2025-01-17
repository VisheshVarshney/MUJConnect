import React, { useState, useEffect } from 'react';
import { Outlet, Link, useNavigate, useLocation } from 'react-router-dom';
import { Home, User, Bell, LogOut, Search, MessageCircle, Menu, Moon, Sun, X, Users, ChevronLeft, ChevronRight } from 'lucide-react';
import { supabase } from '../lib/supabase';
import { motion, AnimatePresence } from 'framer-motion';
import { format } from 'date-fns';
import { useThemeStore } from '../lib/store';
import { toast } from 'react-hot-toast';

export default function Layout() {
  const navigate = useNavigate();
  const location = useLocation();
  const [showNotifications, setShowNotifications] = useState(false);
  const [showMobileMenu, setShowMobileMenu] = useState(false);
  const [showSidebar, setShowSidebar] = useState(true);
  const [notifications, setNotifications] = useState<any[]>([]);
  const [following, setFollowing] = useState<any[]>([]);
  const [message, setMessage] = useState('');
  const { isDark, toggleDark } = useThemeStore();
  const [searchQuery, setSearchQuery] = useState('');

  useEffect(() => {
    fetchNotifications();
    fetchFollowing();
  }, []);

  useEffect(() => {
    const isDark = useThemeStore.getState().isDark;
    if (isDark) {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
  }, []);
  
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

  const fetchFollowing = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      const { data } = await supabase
        .from('follows')
        .select('following_id, profiles!follows_following_id_fkey(*)')
        .eq('follower_id', user.id)
        .limit(5);
      
      if (data) setFollowing(data);
    } catch (error) {
      console.error('Error fetching following:', error);
    }
  };

  const handleLogout = async () => {
    try {
      await supabase.auth.signOut();
      navigate('/login');
    } catch (error) {
      console.error('Error signing out:', error);
      toast.error('Error signing out');
    }
  };

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      navigate(`/search?q=${encodeURIComponent(searchQuery)}`);
      setSearchQuery('');
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 transition-colors duration-300">
      {/* Navigation */}
      <nav className="fixed top-0 left-0 right-0 bg-white dark:bg-gray-800 shadow-sm z-50 transition-colors duration-300">
        <div className="max-w-7xl mx-auto px-4">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center space-x-4">
              <Link to="/" className="text-2xl font-bold text-blue-500">
                SocialApp
              </Link>

              <form onSubmit={handleSearch} className="hidden md:block">
                <div className="relative">
                  <input
                    type="text"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    placeholder="Search..."
                    className="w-64 pl-10 pr-4 py-2 bg-gray-100 dark:bg-gray-700 border-0 rounded-full focus:outline-none focus:ring-2 focus:ring-blue-500 dark:text-white"
                  />
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                </div>
              </form>
            </div>

            {/* Desktop Navigation */}
            <div className="hidden md:flex items-center space-x-4">
              <Link
                to="/feed"
                className="p-2 text-gray-600 dark:text-gray-300 hover:text-blue-500 dark:hover:text-blue-400"
              >
                <Home className="w-6 h-6" />
              </Link>
              
              <Link
                to="/profile/me"
                className="p-2 text-gray-600 dark:text-gray-300 hover:text-blue-500 dark:hover:text-blue-400"
              >
                <User className="w-6 h-6" />
              </Link>

              <button
                onClick={() => setShowNotifications(!showNotifications)}
                className="p-2 text-gray-600 dark:text-gray-300 hover:text-blue-500 dark:hover:text-blue-400 relative"
              >
                <Bell className="w-6 h-6" />
                {notifications.some(n => !n.is_read) && (
                  <span className="absolute top-0 right-0 w-3 h-3 bg-red-500 rounded-full" />
                )}
              </button>

              <button
                onClick={() => toggleDark()}
                className="p-2 text-gray-600 dark:text-gray-300 hover:text-blue-500 dark:hover:text-blue-400"
              >
                {isDark ? <Sun className="w-6 h-6" /> : <Moon className="w-6 h-6" />}
              </button>

              <button
                onClick={handleLogout}
                className="p-2 text-gray-600 dark:text-gray-300 hover:text-red-500"
              >
                <LogOut className="w-6 h-6" />
              </button>
            </div>

            {/* Mobile Menu Button */}
            <button
              onClick={() => setShowMobileMenu(!showMobileMenu)}
              className="md:hidden p-2 text-gray-600 dark:text-gray-300"
            >
              <Menu className="w-6 h-6" />
            </button>
          </div>
        </div>
      </nav>

      {/* Mobile Menu */}
      <AnimatePresence>
        {showMobileMenu && (
          <motion.div
            initial={{ x: '100%' }}
            animate={{ x: 0 }}
            exit={{ x: '100%' }}
            transition={{ type: 'tween' }}
            className="fixed inset-y-0 right-0 w-64 bg-white dark:bg-gray-800 shadow-lg z-50 md:hidden"
          >
            <div className="p-4">
              <div className="flex justify-between items-center mb-8">
                <h2 className="text-lg font-semibold dark:text-white">Menu</h2>
                <button
                  onClick={() => setShowMobileMenu(false)}
                  className="p-2 text-gray-600 dark:text-gray-300"
                >
                  <X className="w-6 h-6" />
                </button>
              </div>

              <div className="space-y-4">
                <Link
                  to="/feed"
                  className="flex items-center space-x-2 p-2 text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg"
                  onClick={() => setShowMobileMenu(false)}
                >
                  <Home className="w-6 h-6" />
                  <span>Home</span>
                </Link>

                <Link
                  to="/profile/me"
                  className="flex items-center space-x-2 p-2 text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg"
                  onClick={() => setShowMobileMenu(false)}
                >
                  <User className="w-6 h-6" />
                  <span>Profile</span>
                </Link>

                <Link
                  to="/search"
                  className="flex items-center space-x-2 p-2 text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg"
                  onClick={() => setShowMobileMenu(false)}
                >
                  <Search className="w-6 h-6" />
                  <span>Search</span>
                </Link>

                <button
                  onClick={() => {
                    setShowNotifications(!showNotifications);
                    setShowMobileMenu(false);
                  }}
                  className="flex items-center space-x-2 w-full p-2 text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg"
                >
                  <Bell className="w-6 h-6" />
                  <span>Notifications</span>
                  {notifications.some(n => !n.is_read) && (
                    <span className="ml-auto w-2 h-2 bg-red-500 rounded-full" />
                  )}
                </button>

                <button
                  onClick={() => {
                    toggleDark();
                    setShowMobileMenu(false);
                  }}
                  className="flex items-center space-x-2 w-full p-2 text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg"
                >
                  {isDark ? <Sun className="w-6 h-6" /> : <Moon className="w-6 h-6" />}
                  <span>{isDark ? 'Light Mode' : 'Dark Mode'}</span>
                </button>

                <button
                  onClick={handleLogout}
                  className="flex items-center space-x-2 w-full p-2 text-red-500 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg"
                >
                  <LogOut className="w-6 h-6" />
                  <span>Logout</span>
                </button>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Main Content */}
      <main className="pt-16 pb-8">
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

      {/* Right Sidebar - Following & Chat (Desktop only) */}
      <div 
        className="hidden md:block fixed right-0 top-16 bottom-0 transition-all duration-300"
        style={{ width: showSidebar ? '320px' : '48px' }}
      >
        <button 
          onClick={() => setShowSidebar(!showSidebar)}
          className="absolute -left-4 top-4 bg-white dark:bg-gray-800 rounded-full shadow-lg p-2 z-10"
        >
          {showSidebar ? (
            <ChevronRight className="w-4 h-4 text-gray-600 dark:text-gray-300" />
          ) : (
            <ChevronLeft className="w-4 h-4 text-gray-600 dark:text-gray-300" />
          )}
        </button>

        <div className={`h-full bg-white dark:bg-gray-800 shadow-lg overflow-hidden transition-all duration-300 ${
          showSidebar ? 'opacity-100' : 'opacity-0'
        }`}>
          {/* Following Section */}
          <div className="p-4 border-b dark:border-gray-700">
            <h2 className="text-lg font-semibold mb-4 dark:text-white flex items-center">
              <Users className="w-5 h-5 mr-2" />
              Following
            </h2>
            <div className="space-y-4">
              {following.map((follow) => (
                <Link
                  key={follow.following_id}
                  to={`/profile/${follow.following_id}`}
                  className="block p-3 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
                >
                  <div className="flex items-center space-x-3">
                    <img
                      src={follow.profiles.avatar_url || `https://api.dicebear.com/7.x/avatars/svg?seed=${follow.profiles.username}`}
                      alt=""
                      className="w-10 h-10 rounded-full"
                    />
                    <div>
                      <div className="font-medium dark:text-white">{follow.profiles.full_name}</div>
                      <div className="text-sm text-gray-500 dark:text-gray-400">@{follow.profiles.username}</div>
                    </div>
                  </div>
                </Link>
              ))}
            </div>
          </div>

          {/* AI Chat Section */}
          <div className="p-4">
            <h2 className="text-lg font-semibold mb-4 dark:text-white flex items-center">
              <MessageCircle className="w-5 h-5 mr-2" />
              AI Assistant
            </h2>
            <div className="space-y-4">
              <div className="bg-gray-50 dark:bg-gray-700 rounded-lg p-3">
                <p className="text-sm dark:text-white">How can I help you today?</p>
              </div>
              <div className="flex space-x-2">
                <input
                  type="text"
                  value={message}
                  onChange={(e) => setMessage(e.target.value)}
                  placeholder="Type a message..."
                  className="flex-1 px-3 py-2 border dark:border-gray-600 dark:bg-gray-700 dark:text-white rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
                <button
                  onClick={() => setMessage('')}
                  className="p-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600"
                >
                  <MessageCircle className="w-5 h-5" />
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Notifications Dropdown */}
      <AnimatePresence>
        {showNotifications && (
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            className="fixed top-16 right-4 w-80 bg-white dark:bg-gray-800 rounded-lg shadow-xl z-50"
          >
            <div className="p-4">
              <h3 className="text-lg font-semibold mb-4 dark:text-white">Notifications</h3>
              <div className="space-y-4">
                {notifications.map((notification) => (
                  <div
                    key={notification.id}
                    className={`p-3 rounded-lg ${
                      notification.is_read 
                        ? 'bg-gray-50 dark:bg-gray-700' 
                        : 'bg-blue-50 dark:bg-blue-900'
                    }`}
                  >
                    <p className="text-sm dark:text-white">{notification.content}</p>
                    <span className="text-xs text-gray-500 dark:text-gray-400">
                      {format(new Date(notification.created_at), 'MMM d, h:mm a')}
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
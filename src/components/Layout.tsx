import React, { useState, useEffect, useRef } from 'react';
import { Outlet, Link, useNavigate, useLocation } from 'react-router-dom';
import { 
  Home, User, Bell, LogOut, Search, MessageCircle, Moon, 
  Sun, Shield, Utensils, Menu, X, Send 
} from 'lucide-react';
import { supabase } from '../lib/supabase';
import { motion, AnimatePresence } from 'framer-motion';
import { useThemeStore } from '../lib/store';
import { toast } from 'react-hot-toast';

export default function Layout() {
  const navigate = useNavigate();
  const location = useLocation();
  const [showNotifications, setShowNotifications] = useState(false);
  const [showMobileMenu, setShowMobileMenu] = useState(false);
  const [notifications, setNotifications] = useState<any[]>([]);
  const [message, setMessage] = useState('');
  const [showAIChat, setShowAIChat] = useState(false);
  const { isDark, toggleDark } = useThemeStore();
  const [searchQuery, setSearchQuery] = useState('');
  const [currentUser, setCurrentUser] = useState<any>(null);
  const [messages, setMessages] = useState<Array<{ type: 'user' | 'bot', content: string }>>([]);
  const [isTyping, setIsTyping] = useState(false);
  const chatEndRef = useRef<HTMLDivElement>(null);

  const isFeedPage = location.pathname === '/feed';

  useEffect(() => {
    fetchNotifications();
    fetchCurrentUser();
  }, []);

  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

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

  const isAdmin = currentUser?.is_superadmin;

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

  const sendMessage = async () => {
    if (!message.trim()) return;

    const userMessage = message.trim();
    setMessage('');
    setMessages(prev => [...prev, { type: 'user', content: userMessage }]);
    setIsTyping(true);

    try {
      const response = await fetch('https://visheshvarshney.pythonanywhere.com/chat', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ message: userMessage }),
      });

      if (!response.ok) throw new Error('Failed to get response');

      const data = await response.json();
      setMessages(prev => [...prev, { type: 'bot', content: data.reply }]);
    } catch (error) {
      console.error('Chat error:', error);
      toast.error('Failed to get response from chatbot');
    } finally {
      setIsTyping(false);
    }
  };

  return (
    <div className="relative min-h-screen bg-gray-50 dark:bg-amoled transition-colors duration-300">
      {/* Top Navigation */}
      <nav className="fixed top-0 left-0 right-0 bg-white dark:bg-amoled shadow-sm z-50 transition-colors duration-300">
        <div className="max-w-7xl mx-auto px-4">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center space-x-4">
              <Link to="/" className="text-2xl font-bold text-blue-500">
                MUJ Connect
              </Link>

              <form onSubmit={handleSearch} className="hidden md:block">
                <div className="relative">
                  <input
                    type="text"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    placeholder="Search..."
                    className="w-64 pl-10 pr-4 py-2 bg-gray-100 dark:bg-amoled-light border-0 rounded-full focus:outline-none focus:ring-2 focus:ring-blue-500 dark:text-white"
                  />
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                </div>
              </form>
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

      {/* Left Sidebar - Modified for animation and retraction */}
      <motion.div 
        initial={{ width: isFeedPage ? 192 : 64 }}
        animate={{ width: isFeedPage ? 192 : 64 }}
        transition={{ duration: 0.3, ease: "easeInOut" }}
        className="fixed left-0 top-16 bottom-0 hidden md:block bg-white dark:bg-amoled shadow-lg z-40 overflow-hidden"
      >
        <div className="flex flex-col py-4 relative">
          <Link to="/feed" className={`sidebar-item group ${!isFeedPage && 'justify-center'}`}>
            <Home className="icon" />
            <span className={`text transition-all duration-300 ${!isFeedPage ? 'opacity-0 group-hover:opacity-100 absolute left-16' : 'opacity-100'}`}>
              Home
            </span>
          </Link>
          
          <Link to="/profile/me" className={`sidebar-item group ${!isFeedPage && 'justify-center'}`}>
            <User className="icon" />
            <span className={`text transition-all duration-300 ${!isFeedPage ? 'opacity-0 group-hover:opacity-100 absolute left-16' : 'opacity-100'}`}>
              Profile
            </span>
          </Link>

          <button onClick={() => setShowNotifications(!showNotifications)} className={`sidebar-item group ${!isFeedPage && 'justify-center'}`}>
            <Bell className="icon" />
            <span className={`text transition-all duration-300 ${!isFeedPage ? 'opacity-0 group-hover:opacity-100 absolute left-16' : 'opacity-100'}`}>
              Notifications
            </span>
            {notifications.some(n => !n.is_read) && (
              <span className="absolute top-2 right-2 w-2 h-2 bg-red-500 rounded-full" />
            )}
          </button>

          <Link to="/muj-menus" className={`sidebar-item group ${!isFeedPage && 'justify-center'}`}>
            <Utensils className="icon" />
            <span className={`text transition-all duration-300 ${!isFeedPage ? 'opacity-0 group-hover:opacity-100 absolute left-16' : 'opacity-100'}`}>
              MUJ Menus
            </span>
          </Link>

          <button onClick={() => toggleDark()} className={`sidebar-item group ${!isFeedPage && 'justify-center'}`}>
            {isDark ? <Sun className="icon" /> : <Moon className="icon" />}
            <span className={`text transition-all duration-300 ${!isFeedPage ? 'opacity-0 group-hover:opacity-100 absolute left-16' : 'opacity-100'}`}>
              {isDark ? 'Light Mode' : 'Dark Mode'}
            </span>
          </button>

          {isAdmin && (
            <Link to="/admin" className={`sidebar-item group text-red-500 ${!isFeedPage && 'justify-center'}`}>
              <Shield className="icon" />
              <span className={`text transition-all duration-300 ${!isFeedPage ? 'opacity-0 group-hover:opacity-100 absolute left-16' : 'opacity-100'}`}>
                Admin
              </span>
            </Link>
          )}

          <button onClick={handleLogout} className={`sidebar-item group text-red-500 ${!isFeedPage && 'justify-center'}`}>
            <LogOut className="icon" />
            <span className={`text transition-all duration-300 ${!isFeedPage ? 'opacity-0 group-hover:opacity-100 absolute left-16' : 'opacity-100'}`}>
              Logout
            </span>
          </button>
        </div>
      </motion.div>

      {/* Mobile Menu */}
      <AnimatePresence>
        {showMobileMenu && (
          <motion.div
            initial={{ x: '100%' }}
            animate={{ x: 0 }}
            exit={{ x: '100%' }}
            transition={{ type: 'tween' }}
            className="fixed inset-y-0 right-0 w-64 bg-white dark:bg-amoled shadow-lg z-50 md:hidden"
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
                  className="flex items-center space-x-2 p-2 text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-amoled-light rounded-lg"
                  onClick={() => setShowMobileMenu(false)}
                >
                  <Home className="w-6 h-6" />
                  <span>Home</span>
                </Link>

                <Link
                  to="/profile/me"
                  className="flex items-center space-x-2 p-2 text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-amoled-light rounded-lg"
                  onClick={() => setShowMobileMenu(false)}
                >
                  <User className="w-6 h-6" />
                  <span>Profile</span>
                </Link>

                <button
                  onClick={() => {
                    setShowNotifications(!showNotifications);
                    setShowMobileMenu(false);
                  }}
                  className="flex items-center space-x-2 w-full p-2 text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-amoled-light rounded-lg"
                >
                  <Bell className="w-6 h-6" />
                  <span>Notifications</span>
                  {notifications.some(n => !n.is_read) && (
                    <span className="ml-auto w-2 h-2 bg-red-500 rounded-full" />
                  )}
                </button>

                <Link
                  to="/muj-menus"
                  className="flex items-center space-x-2 p-2 text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-amoled-light rounded-lg"
                  onClick={() => setShowMobileMenu(false)}
                >
                  <Utensils className="w-6 h-6" />
                  <span>MUJ Menus</span>
                </Link>

                <button
                  onClick={() => {
                    toggleDark();
                    setShowMobileMenu(false);
                  }}
                  className="flex items-center space-x-2 w-full p-2 text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-amoled-light rounded-lg"
                >
                  {isDark ? <Sun className="w-6 h-6" /> : <Moon className="w-6 h-6" />}
                  <span>{isDark ? 'Light Mode' : 'Dark Mode'}</span>
                </button>

                {isAdmin && (
                  <Link
                    to="/admin"
                    className="flex items-center space-x-2 p-2 text-red-500 hover:bg-gray-100 dark:hover:bg-amoled-light rounded-lg"
                    onClick={() => setShowMobileMenu(false)}
                  >
                    <Shield className="w-6 h-6" />
                    <span>Admin</span>
                  </Link>
                )}

                <button
                  onClick={handleLogout}
                  className="flex items-center space-x-2 w-full p-2 text-red-500 hover:bg-gray-100 dark:hover:bg-amoled-light rounded-lg"
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
      <div className="flex">
        {/* Main Content Area */}
        <main className={`flex-1 pt-16 pb-8 min-h-screen ${isFeedPage ? 'md:ml-48' : 'md:ml-16'}`}>
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

      {/* AI Chat Button & Panel */}
      <AnimatePresence>
        <motion.div
          initial={{ scale: 0 }}
          animate={{ scale: 1 }}
          className="fixed bottom-6 right-6 z-50"
        >
          <button
            onClick={() => setShowAIChat(!showAIChat)}
            className="w-12 h-12 bg-blue-500 rounded-full flex items-center justify-center text-white shadow-lg hover:bg-blue-600 transition-colors"
          >
            <MessageCircle className="w-6 h-6" />
          </button>
        </motion.div>

        {showAIChat && (
          <motion.div
            initial={{ opacity: 0, y: 20, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 20, scale: 0.95 }}
            transition={{ duration: 0.2 }}
            className="fixed bottom-20 right-6 w-80 bg-white dark:bg-amoled rounded-lg shadow-xl z-50"
          >
            <div className="p-4">
              <div className="flex justify-between items-center mb-4">
                <h3 className="text-lg font-semibold dark:text-white">AI Assistant</h3>
                <button
                  onClick={() => setShowAIChat(false)}
                  className="text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>
              
              <div className="h-[300px] overflow-y-auto mb-4 space-y-4">
                {messages.map((msg, index) => (
                  <div
                    key={index}
                    className={`flex ${msg.type === 'user' ? 'justify-end' : 'justify-start'}`}
                  >
                    <div
                      className={`max-w-[80%] p-3 rounded-lg ${
                        msg.type === 'user'
                          ? 'bg-blue-500 text-white'
                          : 'bg-gray-100 dark:bg-amoled-light dark:text-white'
                      }`}
                    >
                      {msg.content}
                    </div>
                  </div>
                ))}
                {isTyping && (
                  <div className="flex justify-start">
                    <div className="bg-gray-100 dark:bg-amoled-light p-3 rounded-lg dark:text-white">
                      <div className="flex space-x-2">
                        <div className="w-2 h-2 bg-gray-500 rounded-full animate-bounce" />
                        <div className="w-2 h-2 bg-gray-500 rounded-full animate-bounce delay-100" />
                        <div className="w-2 h-2 bg-gray-500 rounded-full animate-bounce delay-200" />
                      </div>
                    </div>
                  </div>
                )}
                <div ref={chatEndRef} />
              </div>

              <form 
                onSubmit={(e) => {
                  e.preventDefault();
                  sendMessage();
                }}
                className="flex space-x-2"
              >
                <input
                  type="text"
                  value={message}
                  onChange={(e) => setMessage(e.target.value)}
                  placeholder="Type a message..."
                  className="flex-1 px-3 py-2 border dark:border-gray-600 dark:bg-amoled-light dark:text-white rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
                <button
                  type="submit"
                  disabled={!message.trim() || isTyping}
                  className="p-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  <Send className="w-5 h-5" />
                </button>
              </form>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Notifications Dropdown */}
      <AnimatePresence>
        {showNotifications && (
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            className="fixed top-16 left-16 w-80 bg-white dark:bg-amoled rounded-lg shadow-xl z-50"
          >
            <div className="p-4">
              <h3 className="text-lg font-semibold mb-4 dark:text-white">Notifications</h3>
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
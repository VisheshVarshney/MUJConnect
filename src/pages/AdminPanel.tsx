import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { supabase } from '../lib/supabase';
import { useNavigate } from 'react-router-dom';
import {
  Users,
  MessageSquare,
  Flag,
  Activity,
  Shield,
  UserX,
  Trash2,
  Eye,
  EyeOff,
  Ban,
  CheckCircle,
  AlertTriangle,
} from 'lucide-react';
import { toast } from 'react-hot-toast';

export default function AdminPanel() {
  const navigate = useNavigate();
  const [stats, setStats] = useState({
    totalUsers: 0,
    totalPosts: 0,
    anonymousPosts: 0,
    reportedContent: 0,
    activeUsers: 0,
  });
  const [recentPosts, setRecentPosts] = useState<any[]>([]);
  const [recentUsers, setRecentUsers] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    checkAdmin();
    fetchStats();
    fetchRecentActivity();
  }, []);

  const checkAdmin = async () => {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) {
      navigate('/login');
      return;
    }

    const { data: profile } = await supabase
      .from('profiles')
      .select('is_superadmin')
      .eq('id', user.id)
      .single();

    if (!profile?.is_superadmin) {
      navigate('/');
      toast.error('Unauthorized access');
    }
  };

  const fetchStats = async () => {
    try {
      const [
        { count: userCount },
        { count: postCount },
        { count: anonymousCount },
        { count: activeCount },
      ] = await Promise.all([
        supabase.from('profiles').select('*', { count: 'exact' }),
        supabase.from('posts').select('*', { count: 'exact' }),
        supabase.from('posts').select('*', { count: 'exact' }).eq('is_anonymous', true),
        supabase.from('profiles')
          .select('*', { count: 'exact' })
          .gte('updated_at', new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString()),
      ]);

      setStats({
        totalUsers: userCount || 0,
        totalPosts: postCount || 0,
        anonymousPosts: anonymousCount || 0,
        reportedContent: 0, // Implement when adding reporting system
        activeUsers: activeCount || 0,
      });
    } catch (error) {
      console.error('Error fetching stats:', error);
    }
  };

  const fetchRecentActivity = async () => {
    try {
      const { data: posts } = await supabase
        .from('posts')
        .select('*, profiles(*)')
        .order('created_at', { ascending: false })
        .limit(5);

      const { data: users } = await supabase
        .from('profiles')
        .select('*')
        .order('created_at', { ascending: false })
        .limit(5);

      if (posts) setRecentPosts(posts);
      if (users) setRecentUsers(users);
    } catch (error) {
      console.error('Error fetching recent activity:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleDeletePost = async (postId: string) => {
    try {
      const { error } = await supabase
        .from('posts')
        .delete()
        .eq('id', postId);

      if (error) throw error;
      
      setRecentPosts(prev => prev.filter(post => post.id !== postId));
      toast.success('Post deleted successfully');
    } catch (error) {
      toast.error('Error deleting post');
    }
  };

  const handleBanUser = async (userId: string) => {
    try {
      const { error } = await supabase
        .from('profiles')
        .update({ is_banned: true })
        .eq('id', userId);

      if (error) throw error;
      
      setRecentUsers(prev => 
        prev.map(user => 
          user.id === userId ? { ...user, is_banned: true } : user
        )
      );
      toast.success('User banned successfully');
    } catch (error) {
      toast.error('Error banning user');
    }
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500"></div>
      </div>
    );
  }

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className="max-w-7xl mx-auto px-4 py-8"
    >
      <div className="mb-8">
        <h1 className="text-3xl font-bold dark:text-white flex items-center">
          <Shield className="w-8 h-8 mr-2 text-red-500" />
          Admin Panel
        </h1>
        <p className="text-gray-600 dark:text-gray-400 mt-2">
          Manage users, content, and monitor platform activity
        </p>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-6 mb-8">
        {[
          { label: 'Total Users', value: stats.totalUsers, icon: Users, color: 'blue' },
          { label: 'Total Posts', value: stats.totalPosts, icon: MessageSquare, color: 'green' },
          { label: 'Anonymous Posts', value: stats.anonymousPosts, icon: Eye, color: 'purple' },
          { label: 'Reported Content', value: stats.reportedContent, icon: Flag, color: 'red' },
          { label: 'Active Users', value: stats.activeUsers, icon: Activity, color: 'yellow' },
        ].map(({ label, value, icon: Icon, color }) => (
          <div key={label} className="bg-white dark:bg-amoled rounded-lg shadow-md p-6">
            <div className={`text-${color}-500 mb-2`}>
              <Icon className="w-6 h-6" />
            </div>
            <div className="text-2xl font-bold dark:text-white">{value}</div>
            <div className="text-sm text-gray-600 dark:text-gray-400">{label}</div>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Recent Posts */}
        <div className="bg-white dark:bg-amoled rounded-lg shadow-md p-6">
          <h2 className="text-xl font-semibold mb-4 dark:text-white">Recent Posts</h2>
          <div className="space-y-4">
            {recentPosts.map((post) => (
              <div key={post.id} className="flex items-start justify-between p-4 bg-gray-50 dark:bg-amoled-light rounded-lg">
                <div className="flex-1">
                  <div className="flex items-center mb-2">
                    <img
                      src={post.profiles.avatar_url || `https://api.dicebear.com/7.x/avatars/svg?seed=${post.profiles.username}`}
                      alt=""
                      className="w-8 h-8 rounded-full mr-2"
                    />
                    <div>
                      <div className="font-medium dark:text-white">{post.profiles.full_name}</div>
                      <div className="text-sm text-gray-500">{post.is_anonymous ? 'Anonymous Post' : '@' + post.profiles.username}</div>
                    </div>
                  </div>
                  <p className="text-gray-600 dark:text-gray-300 line-clamp-2">{post.content}</p>
                </div>
                <button
                  onClick={() => handleDeletePost(post.id)}
                  className="ml-4 p-2 text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-lg"
                >
                  <Trash2 className="w-5 h-5" />
                </button>
              </div>
            ))}
          </div>
        </div>

        {/* Recent Users */}
        <div className="bg-white dark:bg-amoled rounded-lg shadow-md p-6">
          <h2 className="text-xl font-semibold mb-4 dark:text-white">Recent Users</h2>
          <div className="space-y-4">
            {recentUsers.map((user) => (
              <div key={user.id} className="flex items-center justify-between p-4 bg-gray-50 dark:bg-amoled-light rounded-lg">
                <div className="flex items-center">
                  <img
                    src={user.avatar_url || `https://api.dicebear.com/7.x/avatars/svg?seed=${user.username}`}
                    alt=""
                    className="w-10 h-10 rounded-full mr-3"
                  />
                  <div>
                    <div className="font-medium dark:text-white">{user.full_name}</div>
                    <div className="text-sm text-gray-500">@{user.username}</div>
                  </div>
                </div>
                <div className="flex items-center space-x-2">
                  {user.is_banned ? (
                    <span className="px-3 py-1 bg-red-100 text-red-600 dark:bg-red-900/20 dark:text-red-400 rounded-full text-sm">
                      Banned
                    </span>
                  ) : (
                    <button
                      onClick={() => handleBanUser(user.id)}
                      className="p-2 text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-lg"
                    >
                      <Ban className="w-5 h-5" />
                    </button>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Quick Actions */}
      <div className="mt-8 bg-white dark:bg-amoled rounded-lg shadow-md p-6">
        <h2 className="text-xl font-semibold mb-4 dark:text-white">Quick Actions</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          {[
            { label: 'View All Users', icon: Users, color: 'blue' },
            { label: 'Reported Content', icon: Flag, color: 'red' },
            { label: 'System Logs', icon: Activity, color: 'yellow' },
            { label: 'Security Settings', icon: Shield, color: 'green' },
          ].map(({ label, icon: Icon, color }) => (
            <button
              key={label}
              className={`p-4 bg-${color}-50 dark:bg-${color}-900/20 text-${color}-600 rounded-lg hover:bg-${color}-100 dark:hover:bg-${color}-900/30 transition-colors flex items-center justify-center space-x-2`}
            >
              <Icon className="w-5 h-5" />
              <span>{label}</span>
            </button>
          ))}
        </div>
      </div>
    </motion.div>
  );
}
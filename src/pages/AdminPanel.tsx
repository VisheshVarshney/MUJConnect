import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { supabase } from '../lib/supabase';
import { toast } from 'react-hot-toast';
import { useNavigate } from 'react-router-dom';
import { 
  Users, BarChart2, Shield, FileText, Utensils as UtensilsIcon, Activity,
  Flag, Server
} from 'lucide-react';
import RestaurantManager from '../components/admin/RestaurantManager';
import UserManager from '../components/admin/UserManager';
import PostManager from '../components/admin/PostManager';
import Analytics from '../components/admin/Analytics';
import IPLogger from '../components/admin/IPLogger';
import ContentModeration from '../components/admin/ContentModeration';
import EnhancedAnalytics from '../components/admin/EnhancedAnalytics';
import SystemHealth from '../components/admin/SystemHealth';

interface Stats {
  totalUsers: number;
  activeUsers: number;
  totalPosts: number;
  dailyPosts: number;
  monthlyPosts: number;
  totalLikes: number;
  totalComments: number;
}

export default function AdminPanel() {
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState<'restaurants' | 'users' | 'posts' | 'analytics' | 'logs' | 'moderation' | 'enhanced' | 'health'>('restaurants');
  const [stats, setStats] = useState<Stats | null>(null);
  const [currentUser, setCurrentUser] = useState<any>(null);

  useEffect(() => {
    fetchStats();
    checkAdmin();
  }, []);

  const checkAdmin = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        navigate('/login');
        return;
      }

      const { data: profile } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', user.id)
        .single();

      if (!profile?.is_superadmin) {
        navigate('/feed');
        toast.error('Unauthorized access');
        return;
      }

      setCurrentUser(profile);
    } catch (error) {
      console.error('Error checking admin status:', error);
      navigate('/feed');
    }
  };

  const fetchStats = async () => {
    try {
      const now = new Date();
      const startOfDay = new Date(now.setHours(0, 0, 0, 0)).toISOString();
      const startOfMonth = new Date(now.setDate(1)).toISOString();

      const { data: usersData } = await supabase
        .from('profiles')
        .select('count');

      const { data: postsData } = await supabase
        .from('posts')
        .select('count');

      const { data: dailyPostsData } = await supabase
        .from('posts')
        .select('count')
        .gte('created_at', startOfDay);

      const { data: monthlyPostsData } = await supabase
        .from('posts')
        .select('count')
        .gte('created_at', startOfMonth);

      const { data: likesData } = await supabase
        .from('likes')
        .select('count');

      const { data: commentsData } = await supabase
        .from('comments')
        .select('count');

      setStats({
        totalUsers: usersData?.[0]?.count || 0,
        activeUsers: 0,
        totalPosts: postsData?.[0]?.count || 0,
        dailyPosts: dailyPostsData?.[0]?.count || 0,
        monthlyPosts: monthlyPostsData?.[0]?.count || 0,
        totalLikes: likesData?.[0]?.count || 0,
        totalComments: commentsData?.[0]?.count || 0
      });
    } catch (error) {
      console.error('Error fetching stats:', error);
      toast.error('Error loading analytics');
    }
  };

  return (
    <div className="max-w-7xl mx-auto px-4 py-8">
      <div className="flex justify-between items-center mb-8">
        <h1 className="text-3xl font-bold dark:text-white">Admin Panel</h1>
      </div>

      {/* Tabs */}
      <div className="mb-8 border-b dark:border-gray-700">
        <nav className="flex space-x-8 overflow-x-auto pb-2">
          {[
            { id: 'restaurants', label: 'Restaurants', icon: UtensilsIcon },
            { id: 'users', label: 'Users', icon: Users },
            { id: 'posts', label: 'Posts', icon: FileText },
            { id: 'analytics', label: 'Analytics', icon: BarChart2 },
            { id: 'logs', label: 'IP Logs', icon: Activity },
            { id: 'moderation', label: 'Content Moderation', icon: Flag },
            { id: 'enhanced', label: 'Enhanced Analytics', icon: BarChart2 },
            { id: 'health', label: 'System Health', icon: Server }
          ].map(({ id, label, icon: Icon }) => (
            <button
              key={id}
              onClick={() => setActiveTab(id as any)}
              className={`flex items-center space-x-2 py-4 px-1 border-b-2 font-medium text-sm whitespace-nowrap ${
                activeTab === id
                  ? 'border-blue-500 text-blue-600 dark:text-blue-400'
                  : 'border-transparent text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-300'
              }`}
            >
              <Icon className="w-5 h-5" />
              <span>{label}</span>
            </button>
          ))}
        </nav>
      </div>

      {/* Content */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3 }}
      >
        {activeTab === 'restaurants' && <RestaurantManager />}
        {activeTab === 'users' && <UserManager />}
        {activeTab === 'posts' && <PostManager />}
        {activeTab === 'analytics' && <Analytics stats={stats} />}
        {activeTab === 'logs' && <IPLogger />}
        {activeTab === 'moderation' && <ContentModeration />}
        {activeTab === 'enhanced' && <EnhancedAnalytics />}
        {activeTab === 'health' && <SystemHealth />}
      </motion.div>
    </div>
  );
}
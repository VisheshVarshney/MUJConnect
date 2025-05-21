import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { supabase } from '../../lib/supabase';
import { toast } from 'react-hot-toast';
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell
} from 'recharts';
import { Users, TrendingUp, Globe, Clock } from 'lucide-react';

interface UserEngagement {
  user_id: string;
  page_views: number;
  time_spent: number;
  last_active: string;
}

interface TrafficSource {
  source: string;
  visits: number;
  unique_visitors: number;
  date: string;
}

const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042', '#8884D8'];

export default function EnhancedAnalytics() {
  const [userEngagement, setUserEngagement] = useState<UserEngagement[]>([]);
  const [trafficSources, setTrafficSources] = useState<TrafficSource[]>([]);
  const [timeRange, setTimeRange] = useState<'day' | 'week' | 'month'>('week');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchAnalytics();
  }, [timeRange]);

  const fetchAnalytics = async () => {
    try {
      const startDate = new Date();
      switch (timeRange) {
        case 'day':
          startDate.setDate(startDate.getDate() - 1);
          break;
        case 'week':
          startDate.setDate(startDate.getDate() - 7);
          break;
        case 'month':
          startDate.setMonth(startDate.getMonth() - 1);
          break;
      }

      const { data: engagementData, error: engagementError } = await supabase
        .from('user_engagement')
        .select('*')
        .gte('last_active', startDate.toISOString());

      const { data: trafficData, error: trafficError } = await supabase
        .from('traffic_sources')
        .select('*')
        .gte('date', startDate.toISOString());

      if (engagementError) throw engagementError;
      if (trafficError) throw trafficError;

      setUserEngagement(engagementData || []);
      setTrafficSources(trafficData || []);
    } catch (error) {
      console.error('Error fetching analytics:', error);
      toast.error('Failed to load analytics data');
    } finally {
      setLoading(false);
    }
  };

  const calculateMetrics = () => {
    const totalPageViews = userEngagement.reduce((sum, user) => sum + user.page_views, 0);
    const totalTimeSpent = userEngagement.reduce((sum, user) => sum + user.time_spent, 0);
    const uniqueVisitors = new Set(userEngagement.map(user => user.user_id)).size;
    const averageTimePerVisit = totalTimeSpent / totalPageViews;

    return {
      totalPageViews,
      totalTimeSpent,
      uniqueVisitors,
      averageTimePerVisit
    };
  };

  const metrics = calculateMetrics();

  const trafficSourceData = trafficSources.reduce((acc, source) => {
    const existing = acc.find(item => item.source === source.source);
    if (existing) {
      existing.visits += source.visits;
      existing.uniqueVisitors += source.unique_visitors;
    } else {
      acc.push({
        source: source.source,
        visits: source.visits,
        uniqueVisitors: source.unique_visitors
      });
    }
    return acc;
  }, [] as { source: string; visits: number; uniqueVisitors: number }[]);

  return (
    <div className="space-y-6">
      {/* Time Range Selector */}
      <div className="flex justify-end space-x-2">
        {(['day', 'week', 'month'] as const).map((range) => (
          <button
            key={range}
            onClick={() => setTimeRange(range)}
            className={`px-4 py-2 rounded-md text-sm font-medium ${
              timeRange === range
                ? 'bg-blue-500 text-white'
                : 'bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-700'
            }`}
          >
            {range.charAt(0).toUpperCase() + range.slice(1)}
          </button>
        ))}
      </div>

      {/* Metrics Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-white dark:bg-gray-800 rounded-lg shadow p-4"
        >
          <div className="flex items-center space-x-3">
            <Users className="w-6 h-6 text-blue-500" />
            <div>
              <p className="text-sm text-gray-500 dark:text-gray-400">Unique Visitors</p>
              <p className="text-2xl font-semibold dark:text-white">{metrics.uniqueVisitors}</p>
            </div>
          </div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="bg-white dark:bg-gray-800 rounded-lg shadow p-4"
        >
          <div className="flex items-center space-x-3">
            <TrendingUp className="w-6 h-6 text-green-500" />
            <div>
              <p className="text-sm text-gray-500 dark:text-gray-400">Page Views</p>
              <p className="text-2xl font-semibold dark:text-white">{metrics.totalPageViews}</p>
            </div>
          </div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="bg-white dark:bg-gray-800 rounded-lg shadow p-4"
        >
          <div className="flex items-center space-x-3">
            <Clock className="w-6 h-6 text-purple-500" />
            <div>
              <p className="text-sm text-gray-500 dark:text-gray-400">Avg. Time/Visit</p>
              <p className="text-2xl font-semibold dark:text-white">
                {Math.round(metrics.averageTimePerVisit / 60)}m
              </p>
            </div>
          </div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className="bg-white dark:bg-gray-800 rounded-lg shadow p-4"
        >
          <div className="flex items-center space-x-3">
            <Globe className="w-6 h-6 text-orange-500" />
            <div>
              <p className="text-sm text-gray-500 dark:text-gray-400">Traffic Sources</p>
              <p className="text-2xl font-semibold dark:text-white">{trafficSourceData.length}</p>
            </div>
          </div>
        </motion.div>
      </div>

      {/* Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Page Views Over Time */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-white dark:bg-gray-800 rounded-lg shadow p-4"
        >
          <h3 className="text-lg font-medium dark:text-white mb-4">Page Views Over Time</h3>
          <div className="h-80">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={userEngagement}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="last_active" />
                <YAxis />
                <Tooltip />
                <Line type="monotone" dataKey="page_views" stroke="#8884d8" />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </motion.div>

        {/* Traffic Sources Distribution */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-white dark:bg-gray-800 rounded-lg shadow p-4"
        >
          <h3 className="text-lg font-medium dark:text-white mb-4">Traffic Sources</h3>
          <div className="h-80">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={trafficSourceData}
                  dataKey="visits"
                  nameKey="source"
                  cx="50%"
                  cy="50%"
                  outerRadius={80}
                  label
                >
                  {trafficSourceData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip />
              </PieChart>
            </ResponsiveContainer>
          </div>
        </motion.div>
      </div>
    </div>
  );
} 
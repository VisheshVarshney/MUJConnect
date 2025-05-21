import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { supabase } from '../../lib/supabase';
import { toast } from 'react-hot-toast';
import { Flag, Filter, AlertTriangle, CheckCircle, XCircle } from 'lucide-react';

interface FlaggedContent {
  id: string;
  content_type: string;
  content_id: string;
  reason: string;
  status: string;
  created_at: string;
  reported_by: string;
}

interface ContentFilter {
  id: string;
  filter_type: string;
  pattern: string;
  action: string;
  is_active: boolean;
}

export default function ContentModeration() {
  const [flaggedContent, setFlaggedContent] = useState<FlaggedContent[]>([]);
  const [filters, setFilters] = useState<ContentFilter[]>([]);
  const [activeTab, setActiveTab] = useState<'flagged' | 'filters'>('flagged');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchFlaggedContent();
    fetchFilters();
  }, []);

  const fetchFlaggedContent = async () => {
    try {
      const { data, error } = await supabase
        .from('flagged_content')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) throw error;
      setFlaggedContent(data || []);
    } catch (error) {
      console.error('Error fetching flagged content:', error);
      toast.error('Failed to load flagged content');
    }
  };

  const fetchFilters = async () => {
    try {
      const { data, error } = await supabase
        .from('content_filters')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) throw error;
      setFilters(data || []);
    } catch (error) {
      console.error('Error fetching filters:', error);
      toast.error('Failed to load content filters');
    } finally {
      setLoading(false);
    }
  };

  const handleStatusUpdate = async (id: string, newStatus: string) => {
    try {
      const { error } = await supabase
        .from('flagged_content')
        .update({ 
          status: newStatus,
          resolved_at: new Date().toISOString(),
          resolved_by: (await supabase.auth.getUser()).data.user?.id
        })
        .eq('id', id);

      if (error) throw error;
      toast.success('Status updated successfully');
      fetchFlaggedContent();
    } catch (error) {
      console.error('Error updating status:', error);
      toast.error('Failed to update status');
    }
  };

  const handleFilterToggle = async (id: string, currentStatus: boolean) => {
    try {
      const { error } = await supabase
        .from('content_filters')
        .update({ is_active: !currentStatus })
        .eq('id', id);

      if (error) throw error;
      toast.success('Filter status updated');
      fetchFilters();
    } catch (error) {
      console.error('Error toggling filter:', error);
      toast.error('Failed to update filter status');
    }
  };

  return (
    <div className="space-y-6">
      {/* Tabs */}
      <div className="border-b dark:border-gray-700">
        <nav className="flex space-x-8">
          <button
            onClick={() => setActiveTab('flagged')}
            className={`flex items-center space-x-2 py-4 px-1 border-b-2 font-medium text-sm ${
              activeTab === 'flagged'
                ? 'border-blue-500 text-blue-600 dark:text-blue-400'
                : 'border-transparent text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-300'
            }`}
          >
            <Flag className="w-5 h-5" />
            <span>Flagged Content</span>
          </button>
          <button
            onClick={() => setActiveTab('filters')}
            className={`flex items-center space-x-2 py-4 px-1 border-b-2 font-medium text-sm ${
              activeTab === 'filters'
                ? 'border-blue-500 text-blue-600 dark:text-blue-400'
                : 'border-transparent text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-300'
            }`}
          >
            <Filter className="w-5 h-5" />
            <span>Content Filters</span>
          </button>
        </nav>
      </div>

      {/* Content */}
      <AnimatePresence mode="wait">
        {activeTab === 'flagged' ? (
          <motion.div
            key="flagged"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            className="space-y-4"
          >
            {flaggedContent.map((item) => (
              <motion.div
                key={item.id}
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="bg-white dark:bg-gray-800 rounded-lg shadow p-4"
              >
                <div className="flex justify-between items-start">
                  <div>
                    <h3 className="text-lg font-medium dark:text-white">
                      {item.content_type.charAt(0).toUpperCase() + item.content_type.slice(1)} Report
                    </h3>
                    <p className="text-gray-600 dark:text-gray-300 mt-1">{item.reason}</p>
                    <p className="text-sm text-gray-500 dark:text-gray-400 mt-2">
                      Reported {new Date(item.created_at).toLocaleDateString()}
                    </p>
                  </div>
                  <div className="flex space-x-2">
                    <button
                      onClick={() => handleStatusUpdate(item.id, 'resolved')}
                      className="p-2 text-green-600 hover:bg-green-50 dark:hover:bg-green-900/20 rounded-full"
                    >
                      <CheckCircle className="w-5 h-5" />
                    </button>
                    <button
                      onClick={() => handleStatusUpdate(item.id, 'dismissed')}
                      className="p-2 text-red-600 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-full"
                    >
                      <XCircle className="w-5 h-5" />
                    </button>
                  </div>
                </div>
                <div className="mt-4 flex items-center space-x-2">
                  <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                    item.status === 'pending' ? 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200' :
                    item.status === 'resolved' ? 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200' :
                    'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200'
                  }`}>
                    {item.status.charAt(0).toUpperCase() + item.status.slice(1)}
                  </span>
                </div>
              </motion.div>
            ))}
          </motion.div>
        ) : (
          <motion.div
            key="filters"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            className="space-y-4"
          >
            {filters.map((filter) => (
              <motion.div
                key={filter.id}
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="bg-white dark:bg-gray-800 rounded-lg shadow p-4"
              >
                <div className="flex justify-between items-start">
                  <div>
                    <h3 className="text-lg font-medium dark:text-white">{filter.filter_type}</h3>
                    <p className="text-gray-600 dark:text-gray-300 mt-1">{filter.pattern}</p>
                    <p className="text-sm text-gray-500 dark:text-gray-400 mt-2">
                      Action: {filter.action}
                    </p>
                  </div>
                  <button
                    onClick={() => handleFilterToggle(filter.id, filter.is_active)}
                    className={`p-2 rounded-full ${
                      filter.is_active
                        ? 'text-green-600 hover:bg-green-50 dark:hover:bg-green-900/20'
                        : 'text-gray-400 hover:bg-gray-50 dark:hover:bg-gray-700'
                    }`}
                  >
                    <AlertTriangle className="w-5 h-5" />
                  </button>
                </div>
              </motion.div>
            ))}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
} 
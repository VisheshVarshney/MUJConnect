import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { supabase } from '../../lib/supabase';
import { toast } from 'react-hot-toast';
import { format } from 'date-fns';

interface ContentFilterLog {
  id: string;
  created_at: string;
  content: string;
  user_id: string;
  is_acceptable: boolean;
  reason: string | null;
  category: 'PROFANITY' | 'SELF_ADVERTISEMENT' | 'HATE_SPEECH' | 'HARASSMENT' | 'ACCEPTABLE';
  profiles?: {
    username: string;
    full_name: string;
  };
}

export default function ContentFilters() {
  const [logs, setLogs] = useState<ContentFilterLog[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [filter, setFilter] = useState<'all' | 'rejected' | 'accepted'>('all');

  useEffect(() => {
    fetchLogs();
  }, [filter]);

  const fetchLogs = async () => {
    try {
      setIsLoading(true);
      let query = supabase
        .from('content_filter_logs')
        .select('*, profiles(username, full_name)')
        .order('created_at', { ascending: false });

      if (filter === 'rejected') {
        query = query.eq('is_acceptable', false);
      } else if (filter === 'accepted') {
        query = query.eq('is_acceptable', true);
      }

      const { data, error } = await query;

      if (error) throw error;
      setLogs(data || []);
    } catch (error) {
      console.error('Error fetching content filter logs:', error);
      toast.error('Error loading logs');
    } finally {
      setIsLoading(false);
    }
  };

  const getCategoryColor = (category: ContentFilterLog['category']) => {
    switch (category) {
      case 'PROFANITY':
        return 'text-red-500';
      case 'SELF_ADVERTISEMENT':
        return 'text-yellow-500';
      case 'HATE_SPEECH':
        return 'text-purple-500';
      case 'HARASSMENT':
        return 'text-orange-500';
      case 'ACCEPTABLE':
        return 'text-green-500';
      default:
        return 'text-gray-500';
    }
  };

  return (
    <div className="p-6">
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-2xl font-bold text-white">Content Filter Logs</h2>
        <div className="flex gap-2">
          <button
            onClick={() => setFilter('all')}
            className={`px-4 py-2 rounded-lg transition-colors ${
              filter === 'all'
                ? 'bg-blue-500 text-white'
                : 'bg-gray-700 text-gray-300 hover:bg-gray-600'
            }`}
          >
            All
          </button>
          <button
            onClick={() => setFilter('rejected')}
            className={`px-4 py-2 rounded-lg transition-colors ${
              filter === 'rejected'
                ? 'bg-red-500 text-white'
                : 'bg-gray-700 text-gray-300 hover:bg-gray-600'
            }`}
          >
            Rejected
          </button>
          <button
            onClick={() => setFilter('accepted')}
            className={`px-4 py-2 rounded-lg transition-colors ${
              filter === 'accepted'
                ? 'bg-green-500 text-white'
                : 'bg-gray-700 text-gray-300 hover:bg-gray-600'
            }`}
          >
            Accepted
          </button>
        </div>
      </div>

      {isLoading ? (
        <div className="flex justify-center items-center h-64">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500"></div>
        </div>
      ) : (
        <div className="space-y-4">
          {logs.map((log) => (
            <motion.div
              key={log.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="bg-gray-800 rounded-lg p-4"
            >
              <div className="flex justify-between items-start mb-2">
                <div>
                  <span className="text-gray-400">
                    {format(new Date(log.created_at), 'MMM d, yyyy HH:mm')}
                  </span>
                  <span className="mx-2">•</span>
                  <span className="text-gray-300">
                    {log.profiles?.username || 'Unknown User'}
                  </span>
                </div>
                <span
                  className={`px-3 py-1 rounded-full text-sm ${
                    log.is_acceptable
                      ? 'bg-green-500/20 text-green-400'
                      : 'bg-red-500/20 text-red-400'
                  }`}
                >
                  {log.is_acceptable ? 'Accepted' : 'Rejected'}
                </span>
              </div>
              <div className="mt-2">
                <p className="text-white">{log.content}</p>
              </div>
              <div className="mt-2 flex items-center gap-2">
                <span className="text-gray-400">Category:</span>
                <span className={getCategoryColor(log.category)}>
                  {log.category}
                </span>
              </div>
              {!log.is_acceptable && log.reason && (
                <div className="mt-2">
                  <span className="text-gray-400">Reason: </span>
                  <span className="text-red-400">{log.reason}</span>
                </div>
              )}
            </motion.div>
          ))}
        </div>
      )}
    </div>
  );
} 
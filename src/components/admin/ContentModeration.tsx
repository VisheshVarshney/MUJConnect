import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { supabase } from '../../lib/supabase';
import { toast } from 'react-hot-toast';
import { Flag, Filter, AlertTriangle } from 'lucide-react';

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
  const [flaggedContentDetails, setFlaggedContentDetails] = useState<any[]>([]);
  const [filters, setFilters] = useState<ContentFilter[]>([]);
  const [activeTab, setActiveTab] = useState<'flagged' | 'filters'>('flagged');
  const [loading, setLoading] = useState(true);
  const [selectedReport, setSelectedReport] = useState<any>(null);
  const [postDetails, setPostDetails] = useState<any>(null);
  const [reporter, setReporter] = useState<any>(null);
  const [showActionDialog, setShowActionDialog] = useState(false);

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
      // Fetch post details for each flagged post
      const details = await Promise.all(
        (data || []).map(async (item) => {
          if (item.content_type === 'post') {
            const { data: post } = await supabase
              .from('posts')
              .select('*, profiles(*), media_files(*)')
              .eq('id', item.content_id)
              .single();
            return { ...item, postDetails: post };
          }
          return { ...item };
        })
      );
      setFlaggedContentDetails(details);
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

  // Fetch post details and reporter info for a report
  const fetchReportDetails = async (report: any) => {
    if (report.content_type === 'post') {
      const { data: post } = await supabase
        .from('posts')
        .select('*, profiles(*), media_files(*)')
        .eq('id', report.content_id)
        .single();
      setPostDetails(post);
    }
    if (report.reported_by) {
      const { data: user } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', report.reported_by)
        .single();
      setReporter(user);
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
            {flaggedContentDetails.map((item) => (
              <motion.div
                key={item.id}
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="bg-white dark:bg-gray-800 rounded-lg shadow p-4"
              >
                <div className="flex flex-col md:flex-row md:justify-between md:items-start gap-4">
                  <div className="flex-1">
                    <h3 className="text-lg font-medium dark:text-white">
                      {item.content_type.charAt(0).toUpperCase() + item.content_type.slice(1)} Report
                    </h3>
                    <p className="text-gray-600 dark:text-gray-300 mt-1">Reason: {item.reason}</p>
                    <p className="text-sm text-gray-500 dark:text-gray-400 mt-2">
                      Reported: {new Date(item.created_at).toLocaleString()}<br/>
                      Reporter: <span className="font-medium">{item.reported_by}</span>
                    </p>
                    <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                      item.status === 'pending' ? 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200' :
                      item.status === 'resolved' ? 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200' :
                      'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200'
                    }`}>
                      {item.status.charAt(0).toUpperCase() + item.status.slice(1)}
                    </span>
                    {/* Show post details if available */}
                    {item.postDetails && (
                      <div className="mt-4 border-t pt-4 dark:border-gray-700">
                        <div className="font-medium mb-1">Post Details:</div>
                        <div className="text-sm text-gray-700 dark:text-gray-200 mb-1">
                          <span className="font-semibold">Author:</span> {item.postDetails?.profiles?.full_name} (@{item.postDetails?.profiles?.username})
                        </div>
                        <div className="text-xs text-gray-500 mb-1">Post ID: {item.postDetails?.id}</div>
                        <div className="text-xs text-gray-500 mb-1">Post Link: <a href={`/post/${item.postDetails?.id}`} className="text-blue-500 underline" target="_blank" rel="noopener noreferrer">View Post</a></div>
                        <div className="mb-1">Content: <span className="text-gray-900 dark:text-white">{item.postDetails?.content}</span></div>
                        {item.postDetails?.media_files && item.postDetails.media_files.length > 0 && (
                          <div className="mt-2">
                            <div className="font-medium">Media:</div>
                            <div className="flex flex-wrap gap-2 mt-1">
                              {item.postDetails.media_files.map((file: any) => (
                                <a key={file.id} href={file.url} target="_blank" rel="noopener noreferrer">
                                  <img src={file.url} alt="media" className="w-20 h-20 object-cover rounded" />
                                </a>
                              ))}
                            </div>
                          </div>
                        )}
                      </div>
                    )}
                  </div>
                  <div className="flex flex-col gap-2">
                    <button
                      onClick={async () => {
                        setSelectedReport(item);
                        await fetchReportDetails(item);
                        setShowActionDialog(true);
                      }}
                      className="px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600"
                    >
                      Take Action
                    </button>
                    <button
                      onClick={() => handleStatusUpdate(item.id, 'dismissed')}
                      className="px-4 py-2 bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-300 rounded-lg hover:bg-gray-300 dark:hover:bg-gray-600"
                    >
                      Dismiss
                    </button>
                  </div>
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

      {/* Action Dialog */}
      <AnimatePresence>
        {showActionDialog && selectedReport && postDetails && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50"
          >
            <motion.div
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              className="bg-white dark:bg-amoled rounded-xl shadow-lg max-w-lg w-full"
            >
              <div className="p-6 border-b dark:border-gray-700">
                <div className="flex justify-between items-center">
                  <h2 className="text-xl font-semibold dark:text-white">Post Details</h2>
                  <button
                    onClick={() => setShowActionDialog(false)}
                    className="text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200"
                  >
                    Close
                  </button>
                </div>
              </div>
              <div className="p-6 space-y-4">
                <div>
                  <div className="font-medium">Author: {postDetails?.profiles?.full_name} (@{postDetails?.profiles?.username})</div>
                  <div className="text-xs text-gray-500">Post ID: {postDetails?.id}</div>
                  <div className="text-xs text-gray-500">Post Link: <a href={`/post/${postDetails?.id}`} className="text-blue-500 underline" target="_blank" rel="noopener noreferrer">View Post</a></div>
                  <div className="mt-2">Content: <span className="text-gray-900 dark:text-white">{postDetails?.content}</span></div>
                  {postDetails?.media_files && postDetails.media_files.length > 0 && (
                    <div className="mt-2">
                      <div className="font-medium">Media:</div>
                      <div className="flex flex-wrap gap-2 mt-1">
                        {postDetails.media_files.map((file: any) => (
                          <a key={file.id} href={file.url} target="_blank" rel="noopener noreferrer">
                            <img src={file.url} alt="media" className="w-20 h-20 object-cover rounded" />
                          </a>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
                <div className="flex flex-col gap-2">
                  <button
                    className="px-4 py-2 bg-red-500 text-white rounded-lg hover:bg-red-600"
                    onClick={async () => {
                      // Delete post logic
                      await supabase.from('posts').delete().eq('id', postDetails.id);
                      toast.success('Post deleted');
                      setShowActionDialog(false);
                      fetchFlaggedContent();
                    }}
                  >
                    Delete Post
                  </button>
                  <button
                    className="px-4 py-2 bg-yellow-500 text-white rounded-lg hover:bg-yellow-600"
                    onClick={() => {
                      // TODO: Open edit post dialog/modal
                      toast('Edit post feature coming soon!');
                    }}
                  >
                    Edit Post
                  </button>
                  <button
                    className="px-4 py-2 bg-red-700 text-white rounded-lg hover:bg-red-800"
                    onClick={async () => {
                      // Ban user logic
                      await supabase.from('profiles').update({ is_banned: true, ban_reason: 'Banned by admin' }).eq('id', postDetails.user_id);
                      toast.success('User banned');
                      setShowActionDialog(false);
                    }}
                  >
                    Ban User
                  </button>
                </div>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
} 
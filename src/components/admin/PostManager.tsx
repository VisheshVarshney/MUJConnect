import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Trash2, Flag, Archive, Search, X } from 'lucide-react';
import { toast } from 'react-hot-toast';
import { supabase } from '../../lib/supabase';

interface Post {
  id: string;
  content: string;
  created_at: string;
  user_id: string;
  is_flagged: boolean;
  flag_reason?: string;
  profiles: {
    username: string;
    full_name: string;
  };
}

export default function PostManager() {
  const [posts, setPosts] = useState<Post[]>([]);
  const [selectedPosts, setSelectedPosts] = useState<string[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [showFlagModal, setShowFlagModal] = useState(false);
  const [flagForm, setFlagForm] = useState({
    reason: ''
  });

  useEffect(() => {
    fetchPosts();
  }, []);

  const fetchPosts = async () => {
    try {
      setIsLoading(true);
      const { data, error } = await supabase
        .from('posts')
        .select('*, profiles(username, full_name)')
        .order('created_at', { ascending: false });

      if (error) throw error;
      setPosts(data || []);
    } catch (error) {
      console.error('Error fetching posts:', error);
      toast.error('Error loading posts');
    } finally {
      setIsLoading(false);
    }
  };

  const handleDeletePosts = async () => {
    try {
      const { error } = await supabase
        .from('posts')
        .delete()
        .in('id', selectedPosts);

      if (error) throw error;

      toast.success('Posts deleted successfully');
      setSelectedPosts([]);
      fetchPosts();
    } catch (error) {
      console.error('Error deleting posts:', error);
      toast.error('Error deleting posts');
    }
  };

  const handleFlagPosts = async () => {
    try {
      const { error } = await supabase
        .from('posts')
        .update({
          is_flagged: true,
          flag_reason: flagForm.reason
        })
        .in('id', selectedPosts);

      if (error) throw error;

      toast.success('Posts flagged successfully');
      setShowFlagModal(false);
      setSelectedPosts([]);
      fetchPosts();
    } catch (error) {
      console.error('Error flagging posts:', error);
      toast.error('Error flagging posts');
    }
  };

  const filteredPosts = posts.filter(post =>
    post.content.toLowerCase().includes(searchQuery.toLowerCase()) ||
    post.profiles.username.toLowerCase().includes(searchQuery.toLowerCase()) ||
    post.profiles.full_name.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div className="flex items-center space-x-4">
          <div className="relative">
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search posts..."
              className="pl-10 pr-4 py-2 border dark:border-gray-600 dark:bg-amoled-light rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 dark:text-white"
            />
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
          </div>
        </div>

        {selectedPosts.length > 0 && (
          <div className="flex space-x-2">
            <button
              onClick={handleDeletePosts}
              className="px-4 py-2 bg-red-500 text-white rounded-lg hover:bg-red-600"
            >
              <Trash2 className="w-5 h-5" />
            </button>
            <button
              onClick={() => setShowFlagModal(true)}
              className="px-4 py-2 bg-yellow-500 text-white rounded-lg hover:bg-yellow-600"
            >
              <Flag className="w-5 h-5" />
            </button>
            <button
              className="px-4 py-2 bg-gray-500 text-white rounded-lg hover:bg-gray-600"
            >
              <Archive className="w-5 h-5" />
            </button>
          </div>
        )}
      </div>

      <div className="bg-white dark:bg-amoled-light rounded-xl shadow-lg overflow-hidden">
        {isLoading ? (
          <div className="flex justify-center py-8">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500"></div>
          </div>
        ) : (
          <table className="w-full">
            <thead className="bg-gray-50 dark:bg-amoled-lighter">
              <tr>
                <th className="px-6 py-3 text-left">
                  <input
                    type="checkbox"
                    onChange={(e) => {
                      if (e.target.checked) {
                        setSelectedPosts(posts.map(p => p.id));
                      } else {
                        setSelectedPosts([]);
                      }
                    }}
                  />
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                  Content
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                  Author
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                  Status
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200 dark:divide-gray-700">
              {filteredPosts.map((post) => (
                <tr key={post.id}>
                  <td className="px-6 py-4">
                    <input
                      type="checkbox"
                      checked={selectedPosts.includes(post.id)}
                      onChange={(e) => {
                        if (e.target.checked) {
                          setSelectedPosts([...selectedPosts, post.id]);
                        } else {
                          setSelectedPosts(selectedPosts.filter(id => id !== post.id));
                        }
                      }}
                    />
                  </td>
                  <td className="px-6 py-4">
                    <div className="text-sm dark:text-white line-clamp-2">{post.content}</div>
                  </td>
                  <td className="px-6 py-4">
                    <div className="text-sm dark:text-white">{post.profiles.full_name}</div>
                    <div className="text-xs text-gray-500 dark:text-gray-400">@{post.profiles.username}</div>
                  </td>
                  <td className="px-6 py-4">
                    <span className={`px-2 py-1 text-xs rounded-full ${
                      post.is_flagged
                        ? 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/20 dark:text-yellow-400'
                        : 'bg-green-100 text-green-800 dark:bg-green-900/20 dark:text-green-400'
                    }`}>
                      {post.is_flagged ? 'Flagged' : 'Active'}
                    </span>
                  </td>
                  <td className="px-6 py-4">
                    <div className="flex space-x-2">
                      <button
                        onClick={() => {
                          setSelectedPosts([post.id]);
                          handleDeletePosts();
                        }}
                        className="text-red-500 hover:text-red-700 dark:hover:text-red-400"
                      >
                        <Trash2 className="w-5 h-5" />
                      </button>
                      <button
                        onClick={() => {
                          setSelectedPosts([post.id]);
                          setShowFlagModal(true);
                        }}
                        className="text-yellow-500 hover:text-yellow-700 dark:hover:text-yellow-400"
                      >
                        <Flag className="w-5 h-5" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>

      {/* Flag Modal */}
      <AnimatePresence>
        {showFlagModal && (
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
              className="bg-white dark:bg-amoled rounded-xl shadow-lg max-w-md w-full"
            >
              <div className="p-6 border-b dark:border-gray-700">
                <div className="flex justify-between items-center">
                  <h2 className="text-xl font-semibold dark:text-white">Flag Post</h2>
                  <button
                    onClick={() => setShowFlagModal(false)}
                    className="text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200"
                  >
                    <X className="w-6 h-6" />
                  </button>
                </div>
              </div>

              <div className="p-6 space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">Flag Reason</label>
                  <textarea
                    value={flagForm.reason}
                    onChange={(e) => setFlagForm({ reason: e.target.value })}
                    className="mt-1 block w-full px-3 py-2 border dark:border-gray-600 dark:bg-gray-800 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-yellow-500 dark:text-white"
                    rows={3}
                  />
                </div>
              </div>

              <div className="p-6 border-t dark:border-gray-700">
                <div className="flex justify-end space-x-4">
                  <button
                    onClick={() => setShowFlagModal(false)}
                    className="px-4 py-2 text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-lg"
                  >
                    Cancel
                  </button>
                  <button
                    onClick={handleFlagPosts}
                    className="px-4 py-2 bg-yellow-500 text-white rounded-lg hover:bg-yellow-600"
                  >
                    Flag Post{selectedPosts.length > 1 ? 's' : ''}
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
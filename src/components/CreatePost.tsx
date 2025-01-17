import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Image, Send } from 'lucide-react';
import { supabase } from '../lib/supabase';
import { toast } from 'react-hot-toast';

export default function CreatePost() {
  const [content, setContent] = useState('');
  const [isAnonymous, setIsAnonymous] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!content.trim()) return;

    setIsLoading(true);
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('Not authenticated');

      // Ensure user has a profile
      const { data: profile } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', user.id)
        .maybeSingle();

      if (!profile) {
        // Create profile if it doesn't exist
        await supabase
          .from('profiles')
          .insert({
            id: user.id,
            username: user.email?.split('@')[0], // Temporary username
            full_name: 'User' // Temporary name
          });
      }

      const { error } = await supabase.from('posts').insert({
        content,
        user_id: user.id,
        is_anonymous: isAnonymous,
      });

      if (error) throw error;

      setContent('');
      setIsAnonymous(false);
      toast.success('Post created successfully!');
      
      // Refresh the feed (you'll need to implement this)
      window.location.reload();
    } catch (error: any) {
      toast.error(error.message);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: -20 }}
      animate={{ opacity: 1, y: 0 }}
      className="bg-white dark:bg-gray-800 rounded-xl shadow-md p-6 mb-6"
    >
      <form onSubmit={handleSubmit}>
        <textarea
          value={content}
          onChange={(e) => setContent(e.target.value)}
          placeholder="What's on your mind?"
          className="w-full p-4 rounded-lg bg-gray-50 dark:bg-gray-700 border border-gray-200 dark:border-gray-600 focus:outline-none focus:ring-2 focus:ring-blue-500 resize-none dark:text-white dark:placeholder-gray-400"
          rows={3}
        />
        
        <div className="mt-4 flex items-center justify-between">
          <div className="flex items-center space-x-4">
            <button
              type="button"
              className="flex items-center space-x-2 text-gray-600 dark:text-gray-300 hover:text-gray-900 dark:hover:text-white"
            >
              <Image className="w-5 h-5" />
              <span>Add Image</span>
            </button>
            
            <label className="flex items-center space-x-2">
              <input
                type="checkbox"
                checked={isAnonymous}
                onChange={(e) => setIsAnonymous(e.target.checked)}
                className="rounded text-blue-500 focus:ring-blue-500 dark:bg-gray-700 dark:border-gray-600"
              />
              <span className="text-gray-600 dark:text-gray-300">Post Anonymously</span>
            </label>
          </div>
          
          <button
            type="submit"
            disabled={isLoading || !content.trim()}
            className="px-6 py-2 bg-blue-500 text-white rounded-full hover:bg-blue-600 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center space-x-2"
          >
            <Send className="w-4 h-4" />
            <span>Post</span>
          </button>
        </div>
      </form>
    </motion.div>
  );
}
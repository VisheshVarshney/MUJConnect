import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { ArrowLeft, Send } from 'lucide-react';
import { supabase } from '../lib/supabase';
import { toast } from 'react-hot-toast';
import Post from '../components/Post';
import { format } from 'date-fns';

export default function PostDetails() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [post, setPost] = useState<any>(null);
  const [comments, setComments] = useState<any[]>([]);
  const [newComment, setNewComment] = useState('');
  const [currentUser, setCurrentUser] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    fetchPost();
    getCurrentUser();
  }, [id]);

  const getCurrentUser = async () => {
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

  const fetchPost = async () => {
    try {
      setIsLoading(true);
      const { data: post, error: postError } = await supabase
        .from('posts')
        .select(`
          *,
          profiles (*),
          likes (*),
          comments (
            *,
            profiles (*)
          ),
          media_files (*)
        `)
        .eq('id', id)
        .single();

      if (postError) throw postError;

      if (post) {
        // Process media files
        if (post.media_files) {
          post.media_files = post.media_files.map((file: any) => {
            const { data: { publicUrl } } = supabase.storage
              .from('post-media')
              .getPublicUrl(file.file_path);
            return { ...file, url: publicUrl };
          });
        }

        setPost(post);
        setComments(post.comments || []);
      }
    } catch (error) {
      console.error('Error fetching post:', error);
      toast.error('Error loading post');
      navigate('/feed');
    } finally {
      setIsLoading(false);
    }
  };

  const handleAddComment = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!currentUser) {
      toast.error('Please log in to comment');
      return;
    }

    if (!newComment.trim()) return;

    try {
      const { data, error } = await supabase
        .from('comments')
        .insert({
          post_id: post.id,
          user_id: currentUser.id,
          content: newComment.trim()
        })
        .select('*, profiles(*)')
        .single();

      if (error) throw error;

      setComments([...comments, data]);
      setNewComment('');
      toast.success('Comment added');
    } catch (error: any) {
      console.error('Error adding comment:', error);
      toast.error('Error adding comment');
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-amoled flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500"></div>
      </div>
    );
  }

  if (!post) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-amoled flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">
            Post not found
          </h1>
          <Link
            to="/feed"
            className="text-blue-500 hover:text-blue-600 flex items-center justify-center"
          >
            <ArrowLeft className="w-4 h-4 mr-2" />
            Back to Feed
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-amoled py-8">
      <div className="max-w-2xl mx-auto px-4">
        <Link
          to="/feed"
          className="inline-flex items-center text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-gray-200 mb-6"
        >
          <ArrowLeft className="w-4 h-4 mr-2" />
          Back to Feed
        </Link>

        <Post
          post={post}
          currentUser={currentUser}
          onDelete={() => navigate('/feed')}
          onUpdate={fetchPost}
        />

        <div className="mt-8">
          <h2 className="text-xl font-semibold mb-6 dark:text-white">
            Comments ({comments.length})
          </h2>

          <form onSubmit={handleAddComment} className="mb-8">
            <div className="flex space-x-4">
              <input
                type="text"
                value={newComment}
                onChange={(e) => setNewComment(e.target.value)}
                placeholder={currentUser ? "Add a comment..." : "Log in to comment"}
                disabled={!currentUser}
                className="flex-1 px-4 py-2 bg-white dark:bg-amoled-light border dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 dark:text-white dark:placeholder-gray-400"
              />
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                type="submit"
                disabled={!currentUser || !newComment.trim()}
                className="px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <Send className="w-5 h-5" />
              </motion.button>
            </div>
          </form>

          <div className="space-y-6">
            {comments.map((comment) => (
              <motion.div
                key={comment.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="flex space-x-4"
              >
                <img
                  src={comment.profiles.avatar_url || `https://api.dicebear.com/9.x/adventurer-neutral/svg?backgroundColor=b6e3f4,c0aede,d1d4f9`}
                  alt=""
                  className="w-10 h-10 rounded-full"
                />
                <div className="flex-1">
                  <div className="bg-white dark:bg-amoled-light rounded-lg p-4">
                    <div className="flex items-center justify-between mb-2">
                      <div className="font-medium dark:text-white">
                        {comment.profiles.full_name}
                      </div>
                      <div className="text-sm text-gray-500 dark:text-gray-400">
                        {format(new Date(comment.created_at), 'MMM d, yyyy h:mm a')}
                      </div>
                    </div>
                    <p className="text-gray-700 dark:text-gray-300">{comment.content}</p>
                  </div>
                </div>
              </motion.div>
            ))}

            {comments.length === 0 && (
              <div className="text-center py-8 text-gray-500 dark:text-gray-400">
                No comments yet. Be the first to comment!
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
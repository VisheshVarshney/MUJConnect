import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Heart, MessageCircle, Share2, User, ChevronLeft, ChevronRight } from 'lucide-react';
import { format } from 'date-fns';
import { Link, useNavigate } from 'react-router-dom';
import { supabase } from '../lib/supabase';
import { toast } from 'react-hot-toast';
import CustomVideoPlayer from './CustomVideoPlayer';

interface SharedPostModalProps {
  post: any;
  onClose: () => void;
  currentUser: any;
}

export default function SharedPostModal({ post, onClose, currentUser }: SharedPostModalProps) {
  const [likes, setLikes] = useState(post.likes || []);
  const [isLiked, setIsLiked] = useState(
    likes.some((like: any) => like.user_id === currentUser?.id)
  );
  const [currentMediaIndex, setCurrentMediaIndex] = useState(0);
  const [isHoveringMedia, setIsHoveringMedia] = useState(false);
  const [comments, setComments] = useState<any[]>([]);
  const [newComment, setNewComment] = useState('');
  const navigate = useNavigate();

  useEffect(() => {
    if (post.media_files) {
      const processedFiles = post.media_files.map((file: any) => {
        const { data: { publicUrl } } = supabase.storage
          .from('post-media')
          .getPublicUrl(file.file_path);
        return { ...file, url: publicUrl };
      });
      post.media_files = processedFiles;
    }
    fetchComments();
  }, [post]);

  const fetchComments = async () => {
    try {
      const { data, error } = await supabase
        .from('comments')
        .select('*, profiles(*)')
        .eq('post_id', post.id)
        .order('created_at', { ascending: true });

      if (error) throw error;
      setComments(data || []);
    } catch (error) {
      console.error('Error fetching comments:', error);
    }
  };

  const handleAddComment = async () => {
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
          content: newComment.trim(),
        })
        .select('*, profiles(*)')
        .single();

      if (error) throw error;

      setComments([...comments, data]);
      setNewComment('');
      toast.success('Comment added');
    } catch (error: any) {
      toast.error('Error adding comment');
    }
  };

  const handleLike = async () => {
    if (!currentUser) {
      toast.error('Please log in to like posts');
      return;
    }

    try {
      if (isLiked) {
        await supabase
          .from('likes')
          .delete()
          .match({ post_id: post.id, user_id: currentUser.id });
        setLikes(likes.filter((like: any) => like.user_id !== currentUser.id));
      } else {
        const { data } = await supabase
          .from('likes')
          .insert({ post_id: post.id, user_id: currentUser.id })
          .select()
          .single();
        if (data) setLikes([...likes, data]);
      }
      setIsLiked(!isLiked);
    } catch (error: any) {
      toast.error('Error updating like');
    }
  };

  const handleShare = async () => {
    try {
      const shareUrl = `${window.location.origin}?post=${post.id}`;
      await navigator.clipboard.writeText(shareUrl);
      toast.success('Link copied to clipboard');
    } catch (error: any) {
      toast.error('Error copying link');
    }
  };

  const showUserInfo = !post.is_anonymous || currentUser?.is_superadmin;

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 z-50 bg-black/90 flex items-center justify-center p-4 md:p-0"
    >
      <button
        onClick={onClose}
        className="absolute top-4 right-4 p-2 text-white hover:text-gray-300"
      >
        <X className="w-6 h-6" />
      </button>

      <div className="w-full max-w-6xl bg-white dark:bg-amoled rounded-lg overflow-hidden md:flex h-[90vh]">
        {/* Media Section */}
        <div className="relative md:w-7/12 bg-black">
          {post.media_files && post.media_files.length > 0 ? (
            <div 
              className="relative h-full"
              onMouseEnter={() => setIsHoveringMedia(true)}
              onMouseLeave={() => setIsHoveringMedia(false)}
            >
              <div className="absolute inset-0 flex items-center justify-center">
                {post.media_files[currentMediaIndex].file_type === 'image' ? (
                  <img
                    src={post.media_files[currentMediaIndex].url}
                    alt=""
                    className="max-h-full max-w-full object-contain"
                  />
                ) : (
                  <CustomVideoPlayer
                    src={post.media_files[currentMediaIndex].url}
                    className="max-h-full max-w-full"
                  />
                )}
              </div>

              {post.media_files.length > 1 && (
                <>
                  <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: isHoveringMedia ? 1 : 0 }}
                    transition={{ duration: 0.2 }}
                    className="absolute inset-0 flex items-center justify-between px-4"
                  >
                    <motion.button
                      whileHover={{ scale: 1.1 }}
                      whileTap={{ scale: 0.9 }}
                      onClick={() => setCurrentMediaIndex(prev => 
                        prev === 0 ? post.media_files.length - 1 : prev - 1
                      )}
                      className="p-2 bg-black/50 text-white rounded-full hover:bg-black/75"
                    >
                      <ChevronLeft className="w-6 h-6" />
                    </motion.button>
                    <motion.button
                      whileHover={{ scale: 1.1 }}
                      whileTap={{ scale: 0.9 }}
                      onClick={() => setCurrentMediaIndex(prev =>
                        prev === post.media_files.length - 1 ? 0 : prev + 1
                      )}
                      className="p-2 bg-black/50 text-white rounded-full hover:bg-black/75"
                    >
                      <ChevronRight className="w-6 h-6" />
                    </motion.button>
                  </motion.div>

                  <div className="absolute bottom-4 left-1/2 transform -translate-x-1/2 flex space-x-2">
                    {post.media_files.map((_: any, index: number) => (
                      <button
                        key={index}
                        onClick={() => setCurrentMediaIndex(index)}
                        className={`w-2 h-2 rounded-full transition-colors ${
                          index === currentMediaIndex
                            ? 'bg-white'
                            : 'bg-white/50 hover:bg-white/75'
                        }`}
                      />
                    ))}
                  </div>
                </>
              )}
            </div>
          ) : (
            <div className="flex items-center justify-center h-full p-8">
              <p className="text-2xl text-white text-center font-medium">
                {post.content}
              </p>
            </div>
          )}
        </div>

        {/* Content Section */}
        <div className="md:w-5/12 flex flex-col max-h-[90vh]">
          {/* Header */}
          <div className="p-4 border-b dark:border-gray-800">
            <div className="flex items-center space-x-3">
              {showUserInfo ? (
                <Link to={`/profile/${post.profiles.id}`}>
                  <img
                    src={post.profiles.avatar_url || `https://api.dicebear.com/9.x/adventurer-neutral/svg?backgroundColor=b6e3f4,c0aede,d1d4f9`}
                    alt={post.profiles.username}
                    className="w-10 h-10 rounded-full"
                  />
                </Link>
              ) : (
                <div className="w-10 h-10 rounded-full bg-gray-200 dark:bg-amoled-light flex items-center justify-center">
                  <User className="w-6 h-6 text-gray-500 dark:text-gray-400" />
                </div>
              )}

              <div>
                {showUserInfo ? (
                  <Link
                    to={`/profile/${post.profiles.id}`}
                    className="font-semibold text-gray-900 dark:text-white hover:underline"
                  >
                    {post.profiles.full_name}
                  </Link>
                ) : (
                  <span className="font-semibold text-gray-900 dark:text-white">
                    Anonymous
                  </span>
                )}
                <div className="text-sm text-gray-500 dark:text-gray-400">
                  {format(new Date(post.created_at), 'MMM d, yyyy')}
                </div>
              </div>
            </div>
          </div>

          {/* Content */}
          <div className="p-4 flex-1 overflow-y-auto">
            <p className="text-gray-900 dark:text-white whitespace-pre-wrap">
              {post.content}
            </p>

            {/* Comments */}
            <div className="mt-6">
              <h3 className="font-semibold text-gray-900 dark:text-white mb-4">
                Comments ({comments.length})
              </h3>
              <div className="space-y-4">
                {comments.length > 0 ? (
                  comments.map((comment) => (
                    <div key={comment.id} className="flex space-x-3">
                      <img
                        src={comment.profiles.avatar_url || `https://api.dicebear.com/9.x/adventurer-neutral/svg?backgroundColor=b6e3f4,c0aede,d1d4f9`}
                        alt=""
                        className="w-8 h-8 rounded-full"
                      />
                      <div className="flex-1">
                        <div className="bg-gray-50 dark:bg-amoled-light rounded-lg p-3">
                          <div className="font-medium dark:text-white">
                            {comment.profiles.full_name}
                          </div>
                          <p className="text-gray-700 dark:text-gray-200">
                            {comment.content}
                          </p>
                        </div>
                        <div className="mt-1 text-xs text-gray-500 dark:text-gray-400">
                          {format(new Date(comment.created_at), 'MMM d, yyyy h:mm a')}
                        </div>
                      </div>
                    </div>
                  ))
                ) : (
                  <div className="text-center py-8 text-gray-500 dark:text-gray-400">
                    No comments yet. Be the first to comment!
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Actions */}
          <div className="p-4 border-t dark:border-gray-800">
            <div className="flex items-center space-x-4 text-gray-600 dark:text-gray-400 mb-4">
              <button
                onClick={handleLike}
                className={`flex items-center space-x-2 transition-colors ${
                  isLiked ? 'text-red-500' : 'hover:text-red-500'
                }`}
              >
                <Heart className={`w-6 h-6 ${isLiked ? 'fill-current' : ''}`} />
                <span>{likes.length}</span>
              </button>

              <button
                onClick={() => {
                  if (!currentUser) {
                    toast.error('Please log in to comment');
                    return;
                  }
                }}
                className="flex items-center space-x-2 hover:text-blue-500 transition-colors"
              >
                <MessageCircle className="w-6 h-6" />
                <span>{comments.length}</span>
              </button>

              <button
                onClick={handleShare}
                className="flex items-center space-x-2 hover:text-green-500 transition-colors"
              >
                <Share2 className="w-6 h-6" />
              </button>
            </div>

            <div className="flex space-x-2">
              <input
                type="text"
                value={newComment}
                onChange={(e) => setNewComment(e.target.value)}
                placeholder={currentUser ? "Add a comment..." : "Log in to comment"}
                disabled={!currentUser}
                className="flex-1 px-4 py-2 bg-gray-50 dark:bg-amoled-light border dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 dark:text-white dark:placeholder-gray-400"
              />
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={handleAddComment}
                disabled={!currentUser || !newComment.trim()}
                className="px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Post
              </motion.button>
            </div>
          </div>
        </div>
      </div>
    </motion.div>
  );
}
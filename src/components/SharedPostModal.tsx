import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Heart, MessageCircle, Share2, User } from 'lucide-react';
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
  const navigate = useNavigate();

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
      await navigator.share({
        title: 'Check out this post',
        text: post.content,
        url: window.location.href,
      });
    } catch (error) {
      // Fallback to copying the URL
      await navigator.clipboard.writeText(window.location.href);
      toast.success('Link copied to clipboard');
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
        {post.media_files && post.media_files.length > 0 ? (
          <div className="relative md:w-7/12 bg-black">
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
          </div>
        ) : (
          <div className="hidden md:flex md:w-7/12 bg-gradient-to-br from-blue-500 to-purple-600 items-center justify-center p-8">
            <p className="text-2xl text-white text-center font-medium">
              {post.content}
            </p>
          </div>
        )}

        {/* Content Section */}
        <div className="md:w-5/12 flex flex-col max-h-[90vh]">
          {/* Header */}
          <div className="p-4 border-b dark:border-gray-800">
            <div className="flex items-center space-x-3">
              {showUserInfo ? (
                <Link to={`/profile/${post.profiles.id}`}>
                  <img
                    src={post.profiles.avatar_url || `https://api.dicebear.com/9.x/big-ears-neutral/svg?backgroundColor=b6e3f4,c0aede,d1d4f9`}
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
          </div>

          {/* Actions */}
          <div className="p-4 border-t dark:border-gray-800">
            <div className="flex items-center space-x-4 text-gray-600 dark:text-gray-400">
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
                  navigate(`/feed?post=${post.id}`);
                }}
                className="flex items-center space-x-2 hover:text-blue-500 transition-colors"
              >
                <MessageCircle className="w-6 h-6" />
                <span>{post.comments?.length || 0}</span>
              </button>

              <button
                onClick={handleShare}
                className="flex items-center space-x-2 hover:text-green-500 transition-colors"
              >
                <Share2 className="w-6 h-6" />
              </button>
            </div>
          </div>
        </div>
      </div>
    </motion.div>
  );
}
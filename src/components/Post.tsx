import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Heart,
  MessageCircle,
  Share2,
  User,
  MoreVertical,
  Edit2,
  Trash2,
  Send,
  ChevronLeft,
  ChevronRight,
} from 'lucide-react';
import { format } from 'date-fns';
import { Link, useNavigate } from 'react-router-dom';
import { supabase } from '../lib/supabase';
import { toast } from 'react-hot-toast';
import CustomVideoPlayer from './CustomVideoPlayer';

interface PostProps {
  post: any;
  currentUser: any;
  onDelete?: () => void;
}

export default function Post({ post, currentUser, onDelete }: PostProps) {
  const [likes, setLikes] = useState(post.likes || []);
  const [isLiked, setIsLiked] = useState(
    likes.some((like: any) => like.user_id === currentUser?.id)
  );
  const [showMenu, setShowMenu] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [content, setContent] = useState(post.content);
  const [showComments, setShowComments] = useState(false);
  const [comments, setComments] = useState<any[]>([]);
  const [newComment, setNewComment] = useState('');
  const [showAllComments, setShowAllComments] = useState(false);
  const [mediaFiles, setMediaFiles] = useState<any[]>([]);
  const [currentMediaIndex, setCurrentMediaIndex] = useState(0);
  const [isHovered, setIsHovered] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    if (post.comments) {
      setComments(post.comments);
    }
    fetchMediaFiles();
  }, [post.comments]);

  const fetchMediaFiles = async () => {
    try {
      const { data } = await supabase
        .from('media_files')
        .select('*')
        .eq('post_id', post.id)
        .order('created_at', { ascending: true });
      
      if (data) {
        const filesWithUrls = await Promise.all(data.map(async (file) => {
          try {
            const { data: { publicUrl } } = supabase.storage
              .from('post-media')
              .getPublicUrl(file.file_path);
            return { ...file, url: publicUrl };
          } catch (error) {
            console.error('Error getting public URL:', error);
            return null;
          }
        }));
        
        setMediaFiles(filesWithUrls.filter(Boolean));
      }
    } catch (error) {
      console.error('Error fetching media files:', error);
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

  const handleDelete = async () => {
    try {
      if (!currentUser) {
        toast.error('Please log in to delete posts');
        return;
      }

      if (!currentUser.is_superadmin && currentUser.id !== post.user_id) {
        toast.error('Unauthorized to delete this post');
        return;
      }

      for (const file of mediaFiles) {
        await supabase.storage
          .from('post-media')
          .remove([file.file_path]);
      }

      const { error } = await supabase
        .from('posts')
        .delete()
        .eq('id', post.id);

      if (error) throw error;
      
      toast.success('Post deleted successfully');
      onDelete?.();
      setShowMenu(false);
    } catch (error: any) {
      console.error('Error deleting post:', error);
      toast.error('Error deleting post');
    }
  };

  const handleEdit = async () => {
    if (!currentUser) {
      toast.error('Please log in to edit posts');
      return;
    }

    try {
      if (!currentUser.is_superadmin && currentUser.id !== post.user_id) {
        toast.error('Unauthorized to edit this post');
        return;
      }

      const { error } = await supabase
        .from('posts')
        .update({ content })
        .eq('id', post.id);

      if (error) throw error;
      
      post.content = content;
      setIsEditing(false);
      toast.success('Post updated successfully');
    } catch (error: any) {
      console.error('Error updating post:', error);
      toast.error('Error updating post');
    }
  };

  const handleShare = async () => {
    try {
      const shareUrl = `${window.location.origin}/feed?post=${post.id}`;
      
      // Check if Web Share API is supported and we're on HTTPS
      if (navigator.share && window.isSecureContext) {
        try {
          await navigator.share({
            title: 'Check out this post',
            text: post.content,
            url: shareUrl,
          });
        } catch (error: any) {
          // Handle user cancellation gracefully
          if (error.name === 'AbortError') {
            return; // User cancelled sharing
          }
          // If sharing fails, fallback to clipboard
          throw error;
        }
      } else {
        // Fallback to clipboard
        await navigator.clipboard.writeText(shareUrl);
        toast.success('Link copied to clipboard');
      }
    } catch (error: any) {
      console.error('Error sharing:', error);
      // Try clipboard as last resort
      try {
        await navigator.clipboard.writeText(shareUrl);
        toast.success('Link copied to clipboard');
      } catch (clipboardError) {
        toast.error('Unable to share or copy link');
      }
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

  const fetchComments = async () => {
    try {
      const { data, error } = await supabase
        .from('comments')
        .select('*, profiles(*)')
        .eq('post_id', post.id)
        .order('created_at', { ascending: true });

      if (error) throw error;
      setComments(data || []);
      setShowComments(true);
      setShowAllComments(true);
    } catch (error: any) {
      toast.error('Error fetching comments');
    }
  };

  const displayedComments = showAllComments ? comments : comments.slice(0, 3);
  const canModifyPost = currentUser?.is_superadmin || currentUser?.id === post.user_id;
  const showUserInfo = !post.is_anonymous || currentUser?.is_superadmin;

  const postVariants = {
    initial: { scale: 1 },
    hover: { scale: 1.01, transition: { duration: 0.2 } },
    tap: { scale: 0.98, transition: { duration: 0.1 } }
  };

  const mediaControlsVariants = {
    hidden: { opacity: 0 },
    visible: { opacity: 1 }
  };

  const carouselVariants = {
    enter: (direction: number) => ({
      x: direction > 0 ? 1000 : -1000,
      opacity: 0
    }),
    center: {
      zIndex: 1,
      x: 0,
      opacity: 1
    },
    exit: (direction: number) => ({
      zIndex: 0,
      x: direction < 0 ? 1000 : -1000,
      opacity: 0
    })
  };

  const swipeConfidenceThreshold = 10000;
  const swipePower = (offset: number, velocity: number) => {
    return Math.abs(offset) * velocity;
  };

  const paginate = (newDirection: number) => {
    if (mediaFiles.length <= 1) return;
    setCurrentMediaIndex((prev) => {
      const nextIndex = prev + newDirection;
      if (nextIndex < 0) return mediaFiles.length - 1;
      if (nextIndex >= mediaFiles.length) return 0;
      return nextIndex;
    });
  };

  return (
    <motion.div
      variants={postVariants}
      initial="initial"
      whileHover="hover"
      whileTap="tap"
      className="bg-white dark:bg-amoled rounded-xl shadow-md p-6 hover:shadow-lg transition-all duration-300 animate-fade-in"
    >
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-3">
          {showUserInfo ? (
            <Link to={`/profile/${post.profiles.id}`}>
              <motion.img
                whileHover={{ scale: 1.1 }}
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

        {canModifyPost && (
          <div className="relative">
            <motion.button
              whileHover={{ scale: 1.1 }}
              onClick={() => setShowMenu(!showMenu)}
              className="p-2 text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-200 rounded-full"
            >
              <MoreVertical className="w-5 h-5" />
            </motion.button>

            <AnimatePresence>
              {showMenu && (
                <motion.div
                  initial={{ opacity: 0, scale: 0.95 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.95 }}
                  className="absolute right-0 mt-2 w-48 bg-white dark:bg-amoled rounded-lg shadow-lg z-10"
                >
                  <motion.button
                    whileHover={{ backgroundColor: "rgb(243 244 246)" }}
                    onClick={() => {
                      setIsEditing(true);
                      setShowMenu(false);
                    }}
                    className="flex items-center space-x-2 w-full px-4 py-2 text-left text-gray-700 dark:text-gray-200 hover:bg-gray-100 dark:hover:bg-amoled-light"
                  >
                    <Edit2 className="w-4 h-4" />
                    <span>Edit</span>
                  </motion.button>
                  <motion.button
                    whileHover={{ backgroundColor: "rgb(254 226 226)" }}
                    onClick={handleDelete}
                    className="flex items-center space-x-2 w-full px-4 py-2 text-left text-red-600 hover:bg-red-50 dark:hover:bg-red-900/20"
                  >
                    <Trash2 className="w-4 h-4" />
                    <span>Delete</span>
                  </motion.button>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        )}
      </div>

      {isEditing ? (
        <div className="mt-4">
          <textarea
            value={content}
            onChange={(e) => setContent(e.target.value)}
            className="w-full p-3 border dark:border-gray-600 dark:bg-amoled-light dark:text-white rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            rows={3}
          />
          <div className="mt-2 flex justify-end space-x-2">
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={() => {
                setContent(post.content);
                setIsEditing(false);
              }}
              className="px-4 py-2 text-gray-600 dark:text-gray-300 hover:text-gray-800 dark:hover:text-gray-100"
            >
              Cancel
            </motion.button>
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={handleEdit}
              className="px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600"
            >
              Save
            </motion.button>
          </div>
        </div>
      ) : (
        <p className="mt-4 text-gray-700 dark:text-gray-200">{post.content}</p>
      )}

      {mediaFiles.length > 0 && (
        <div 
          className="mt-4 relative animate-scale-in"
          onMouseEnter={() => setIsHovered(true)}
          onMouseLeave={() => setIsHovered(false)}
        >
          <div className="aspect-square rounded-lg overflow-hidden bg-black">
            <AnimatePresence initial={false} custom={currentMediaIndex}>
              <motion.div
                key={currentMediaIndex}
                custom={currentMediaIndex}
                variants={carouselVariants}
                initial="enter"
                animate="center"
                exit="exit"
                transition={{
                  x: { type: "spring", stiffness: 300, damping: 30 },
                  opacity: { duration: 0.2 }
                }}
                drag="x"
                dragConstraints={{ left: 0, right: 0 }}
                dragElastic={1}
                onDragEnd={(e, { offset, velocity }) => {
                  const swipe = swipePower(offset.x, velocity.x);
                  if (swipe < -swipeConfidenceThreshold) {
                    paginate(1);
                  } else if (swipe > swipeConfidenceThreshold) {
                    paginate(-1);
                  }
                }}
                className="absolute w-full h-full"
              >
                {mediaFiles[currentMediaIndex].file_type === 'image' ? (
                  <img
                    src={mediaFiles[currentMediaIndex].url}
                    alt=""
                    className="w-full h-full object-contain"
                  />
                ) : (
                  <CustomVideoPlayer
                    src={mediaFiles[currentMediaIndex].url}
                    className="w-full h-full"
                  />
                )}
              </motion.div>
            </AnimatePresence>
          </div>
          
          {mediaFiles.length > 1 && (
            <motion.div
              variants={mediaControlsVariants}
              initial="hidden"
              animate={isHovered ? "visible" : "hidden"}
              className="absolute inset-0 flex items-center justify-between px-4"
            >
              <motion.button
                whileHover={{ scale: 1.1 }}
                whileTap={{ scale: 0.9 }}
                onClick={() => paginate(-1)}
                className="p-2 bg-black/50 text-white rounded-full hover:bg-black/75 transition-colors"
                disabled={currentMediaIndex === 0}
              >
                <ChevronLeft className="w-6 h-6" />
              </motion.button>
              <motion.button
                whileHover={{ scale: 1.1 }}
                whileTap={{ scale: 0.9 }}
                onClick={() => paginate(1)}
                className="p-2 bg-black/50 text-white rounded-full hover:bg-black/75 transition-colors"
                disabled={currentMediaIndex === mediaFiles.length - 1}
              >
                <ChevronRight className="w-6 h-6" />
              </motion.button>
            </motion.div>
          )}
          
          {mediaFiles.length > 1 && (
            <div className="absolute bottom-4 left-1/2 transform -translate-x-1/2 flex space-x-2">
              {mediaFiles.map((_, index) => (
                <motion.button
                  key={index}
                  onClick={() => setCurrentMediaIndex(index)}
                  className={`w-2 h-2 rounded-full transition-colors ${
                    index === currentMediaIndex
                      ? 'bg-white'
                      : 'bg-white/50 hover:bg-white/75'
                  }`}
                  whileHover={{ scale: 1.2 }}
                  whileTap={{ scale: 0.8 }}
                />
              ))}
            </div>
          )}
        </div>
      )}

      <div className="mt-4 flex items-center space-x-6 text-gray-600 dark:text-gray-400">
        <motion.button
          whileHover={{ scale: 1.1 }}
          whileTap={{ scale: 0.9 }}
          onClick={handleLike}
          className={`flex items-center space-x-2 transition-colors ${
            isLiked ? 'text-red-500' : 'hover:text-red-500'
          }`}
        >
          <Heart className={`w-5 h-5 ${isLiked ? 'fill-current' : ''}`} />
          <span>{likes.length}</span>
        </motion.button>

        <motion.button
          whileHover={{ scale: 1.1 }}
          whileTap={{ scale: 0.9 }}
          onClick={() => {
            if (!showComments) fetchComments();
            else setShowComments(false);
          }}
          className="flex items-center space-x-2 hover:text-blue-500 transition-colors"
        >
          <MessageCircle className="w-5 h-5" />
          <span>{comments.length}</span>
        </motion.button>

        <motion.button
          whileHover={{ scale: 1.1 }}
          whileTap={{ scale: 0.9 }}
          onClick={handleShare}
          className="flex items-center space-x-2 hover:text-green-500 transition-colors"
        >
          <Share2 className="w-5 h-5" />
        </motion.button>
      </div>

      <div className="mt-4">
        <div className="flex space-x-2">
          <input
            type="text"
            value={newComment}
            onChange={(e) => setNewComment(e.target.value)}
            placeholder="Add a comment..."
            className="flex-1 px-4 py-2 bg-gray-50 dark:bg-amoled-light border dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 dark:text-white dark:placeholder-gray-400"
          />
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={handleAddComment}
            disabled={!newComment.trim()}
            className="px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 disabled:opacity-50 disabled:cursor-not-allowed flex items-center space-x-2"
          >
            <Send className="w-4 h-4" />
          </motion.button>
        </div>
      </div>

      <AnimatePresence>
        {comments.length > 0 && showComments && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: "auto" }}
            exit={{ opacity: 0, height: 0 }}
            className="mt-4 space-y-4"
          >
            {displayedComments.map((comment) => (
              <motion.div
                key={comment.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
                className="flex space-x-3"
              >
                <img
                  src={
                    comment.profiles.avatar_url ||
                    `https://api.dicebear.com/7.x/avatars/svg?seed=${comment.profiles.username}`
                  }
                  alt=""
                  className="w-8 h-8 rounded-full"
                />
                <div className="flex-1">
                  <motion.div
                    whileHover={{ scale: 1.01 }}
                    className="bg-gray-50 dark:bg-amoled-light rounded-lg p-3"
                  >
                    <div className="font-medium dark:text-white">
                      {comment.profiles.full_name}
                    </div>
                    <p className="text-gray-700 dark:text-gray-200">
                      {comment.content}
                    </p>
                  </motion.div>
                  <div className="mt-1 text-xs text-gray-500 dark:text-gray-400">
                    {format(new Date(comment.created_at), 'MMM d, yyyy h:mm a')}
                  </div>
                </div>
              </motion.div>
            ))}
            {comments.length > 3 && !showAllComments && (
              <motion.button
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                onClick={() => setShowAllComments(true)}
                className="text-blue-500 hover:text-blue-600 text-sm"
              >
                View all {comments.length} comments
              </motion.button>
            )}
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
}
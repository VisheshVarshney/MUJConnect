import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';
import { format } from 'date-fns';
import {
  Heart,
  MessageCircle,
  Share2,
  MoreVertical,
  Trash2,
  Edit2,
  User,
  Flag,
} from 'lucide-react';
import { supabase } from '../lib/supabase';
import { toast } from 'react-hot-toast';
import ImageCarousel from './ImageCarousel';
import CommentModal from './CommentModal';
import TextWithEmbeds from './TextWithEmbeds';

interface PostProps {
  post: any;
  currentUser: any;
  onDelete?: () => void;
  onUpdate?: () => void;
  onLikeChange?: (postId: string, newLikes: any[]) => void;
}

export default function Post({ post, currentUser, onDelete, onUpdate, onLikeChange }: PostProps) {
  const [likes, setLikes] = useState<any[]>(post.likes || []);
  const [isLiked, setIsLiked] = useState(false);
  const [showMenu, setShowMenu] = useState(false);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [showEditForm, setShowEditForm] = useState(false);
  const [editContent, setEditContent] = useState(post.content);
  const [isAnonymous, setIsAnonymous] = useState(post.is_anonymous);
  const [isLikeAnimating, setIsLikeAnimating] = useState(false);
  const [showComments, setShowComments] = useState(false);
  const [showReportModal, setShowReportModal] = useState(false);
  const [reportReason, setReportReason] = useState('');

  // Initialize like state when component mounts or post changes
  useEffect(() => {
    if (currentUser && post.likes) {
      const userLike = post.likes.find((like: any) => like.user_id === currentUser.id);
      setIsLiked(!!userLike);
    }
  }, [currentUser, post.likes]);

  const handleLike = async () => {
    if (!currentUser) {
      toast.error('Please log in to like posts');
      return;
    }

    try {
      setIsLikeAnimating(true);
      const newLikeCount = isLiked ? likes.length - 1 : likes.length + 1;
      let updatedLikes;
      if (isLiked) {
        const { error } = await supabase
          .from('likes')
          .delete()
          .match({ post_id: post.id, user_id: currentUser.id });

        if (error) throw error;

        updatedLikes = likes.filter((like: any) => like.user_id !== currentUser.id);
        setLikes(updatedLikes);
      } else {
        const { data, error } = await supabase
          .from('likes')
          .insert({ post_id: post.id, user_id: currentUser.id })
          .select()
          .single();

        if (error) throw error;
        if (data) updatedLikes = [...likes, data];
        else updatedLikes = likes;
        setLikes(updatedLikes);
      }

      setIsLiked(!isLiked);
      if (onLikeChange) {
        onLikeChange(post.id, updatedLikes);
      }
      setTimeout(() => setIsLikeAnimating(false), 300);
    } catch (error: any) {
      console.error('Error updating like:', error);
      toast.error('Error updating like');
    }
  };

  const handleDelete = async () => {
    try {
      const { error } = await supabase
        .from('posts')
        .delete()
        .eq('id', post.id);

      if (error) throw error;

      setShowDeleteConfirm(false);
      if (onDelete) onDelete();
      toast.success('Post deleted');
    } catch (error: any) {
      console.error('Error deleting post:', error);
      toast.error('Error deleting post');
    }
  };

  const handleEdit = async () => {
    try {
      const { error } = await supabase
        .from('posts')
        .update({
          content: editContent,
          is_anonymous: isAnonymous
        })
        .eq('id', post.id);

      if (error) throw error;

      setShowEditForm(false);
      if (onUpdate) onUpdate();
      toast.success('Post updated');
    } catch (error: any) {
      console.error('Error updating post:', error);
      toast.error('Error updating post');
    }
  };

  const handleShare = () => {
    navigator.clipboard.writeText(`${window.location.origin}/post/${post.id}`);
  };

  const handleReport = async () => {
    if (!currentUser) {
      toast.error('Please log in to report posts');
      return;
    }

    try {
      const { error } = await supabase
        .from('flagged_content')
        .insert({
          content_type: 'post',
          content_id: post.id,
          reason: reportReason,
          reported_by: currentUser.id,
          status: 'pending'
        });

      if (error) throw error;

      setShowReportModal(false);
      setReportReason('');
      toast.success('Post reported successfully');
    } catch (error: any) {
      console.error('Error reporting post:', error);
      toast.error('Error reporting post');
    }
  };

  const showUserInfo = !post.is_anonymous || currentUser?.id === post.user_id || currentUser?.is_superadmin;

  return (
    <div className="bg-white dark:bg-amoled rounded-xl shadow-md p-6 hover:shadow-lg transition-all duration-300 group">
      <div className="flex justify-between items-start">
        <div className="flex items-center space-x-3">
          {showUserInfo ? (
            <Link to={`/profile/${post.profiles.id}`}>
              <img
                src={
                  post.profiles.avatar_url ||
                  `https://api.dicebear.com/9.x/adventurer-neutral/svg?seed=${post.profiles.id}`
                }
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
              <div className="flex items-center space-x-2">
                <Link
                  to={`/profile/${post.profiles.id}`}
                  className="font-semibold text-gray-900 dark:text-white hover:underline"
                >
                  {post.profiles.full_name}
                </Link>
                {post.is_anonymous && currentUser?.is_superadmin && (
                  <span className="text-sm text-gray-500 dark:text-gray-400">
                    (Anonymous)
                  </span>
                )}
              </div>
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

        <div className="flex space-x-2 opacity-0 group-hover:opacity-100 transition-opacity">
          {currentUser && (
            <>
              {currentUser.is_superadmin && (
                <motion.button
                  whileHover={{ scale: 1.1 }}
                  whileTap={{ scale: 0.9 }}
                  onClick={() => setShowReportModal(true)}
                  className="text-gray-500 hover:text-yellow-500 dark:text-gray-400 dark:hover:text-yellow-400"
                >
                  <Flag className="w-5 h-5" />
                </motion.button>
              )}
              {(currentUser.id === post.user_id || currentUser.is_superadmin) && (
                <>
                  <motion.button
                    whileHover={{ scale: 1.1 }}
                    whileTap={{ scale: 0.9 }}
                    onClick={() => setShowEditForm(true)}
                    className="text-gray-500 hover:text-blue-500 dark:text-gray-400 dark:hover:text-blue-400"
                  >
                    <Edit2 className="w-5 h-5" />
                  </motion.button>
                  <motion.button
                    whileHover={{ scale: 1.1 }}
                    whileTap={{ scale: 0.9 }}
                    onClick={() => setShowDeleteConfirm(true)}
                    className="text-gray-500 hover:text-red-500 dark:text-gray-400 dark:hover:text-red-400"
                  >
                    <Trash2 className="w-5 h-5" />
                  </motion.button>
                </>
              )}
            </>
          )}
        </div>
      </div>

      {showEditForm ? (
        <div className="mt-4 space-y-4">
          <textarea
            value={editContent}
            onChange={(e) => setEditContent(e.target.value)}
            className="w-full p-4 rounded-lg bg-gray-50 dark:bg-amoled-light border border-gray-200 dark:border-gray-600 focus:outline-none focus:ring-2 focus:ring-blue-500 resize-none dark:text-white"
            rows={4}
          />
          <label className="flex items-center space-x-2">
            <input
              type="checkbox"
              checked={isAnonymous}
              onChange={(e) => setIsAnonymous(e.target.checked)}
              className="rounded text-blue-500 focus:ring-blue-500"
            />
            <span className="text-gray-700 dark:text-gray-300">
              Post anonymously
            </span>
          </label>
          <div className="flex space-x-2">
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={handleEdit}
              disabled={!editContent.trim()}
              className="px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              Save Changes
            </motion.button>
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={() => {
                setShowEditForm(false);
                setEditContent(post.content);
                setIsAnonymous(post.is_anonymous);
              }}
              className="px-4 py-2 bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-300 rounded-lg hover:bg-gray-300 dark:hover:bg-gray-600"
            >
              Cancel
            </motion.button>
          </div>
        </div>
      ) : (
        <>
          <div className="mt-2 text-gray-800 dark:text-gray-200 whitespace-pre-wrap">
            <TextWithEmbeds text={post.content} />
          </div>

          {post.media_files && post.media_files.length > 0 && (
            <div className="mt-4">
              <ImageCarousel
                images={post.media_files.map((file: any) => ({
                  url: file.url,
                  type: file.file_type,
                }))}
              />
            </div>
          )}

          <div className="mt-4 flex border-t dark:border-gray-700 pt-3">
            <motion.button
              onClick={handleLike}
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              className={`flex-1 flex items-center justify-center space-x-2 py-2 rounded-lg transition-colors ${
                isLiked
                  ? 'text-red-500'
                  : 'text-gray-500 dark:text-gray-400 hover:text-red-500'
              }`}
            >
              <motion.div
                animate={
                  isLikeAnimating
                    ? {
                        scale: [1, 1.2, 1],
                        rotate: [0, -10, 10, 0],
                      }
                    : {}
                }
                transition={{ duration: 0.3 }}
              >
                <Heart className={`w-5 h-5 ${isLiked ? 'fill-current' : ''}`} />
              </motion.div>
              <span>{likes.length}</span>
            </motion.button>

            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={() => setShowComments(true)}
              className="flex-1 flex items-center justify-center space-x-2 py-2 text-gray-500 dark:text-gray-400 hover:text-blue-500 dark:hover:text-blue-400 rounded-lg transition-colors"
            >
              <MessageCircle className="w-5 h-5" />
              <span>{post.comments?.length || 0}</span>
            </motion.button>

            <motion.button
              onClick={handleShare}
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              className="flex-1 flex items-center justify-center space-x-2 py-2 text-gray-500 dark:text-gray-400 hover:text-green-500 dark:hover:text-green-400 rounded-lg transition-colors"
            >
              <Share2 className="w-5 h-5" />
              <span>Share</span>
            </motion.button>
          </div>
        </>
      )}

      {showDeleteConfirm && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50"
        >
          <motion.div
            initial={{ scale: 0.9, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0.9, opacity: 0 }}
            className="bg-white dark:bg-amoled rounded-lg p-6 max-w-sm mx-4"
          >
            <h3 className="text-lg font-semibold mb-4 dark:text-white">
              Delete Post?
            </h3>
            <p className="text-gray-600 dark:text-gray-400 mb-6">
              This action cannot be undone. Are you sure you want to delete this
              post?
            </p>
            <div className="flex space-x-4">
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={handleDelete}
                className="flex-1 px-4 py-2 bg-red-500 text-white rounded-lg hover:bg-red-600"
              >
                Delete
              </motion.button>
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={() => setShowDeleteConfirm(false)}
                className="flex-1 px-4 py-2 bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-300 rounded-lg hover:bg-gray-300 dark:hover:bg-gray-600"
              >
                Cancel
              </motion.button>
            </div>
          </motion.div>
        </motion.div>
      )}

      {showComments && (
        <CommentModal
          postId={post.id}
          currentUser={currentUser}
          onClose={() => setShowComments(false)}
        />
      )}

      {showReportModal && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50"
        >
          <motion.div
            initial={{ scale: 0.9, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0.9, opacity: 0 }}
            className="bg-white dark:bg-amoled rounded-lg p-6 max-w-sm mx-4"
          >
            <h3 className="text-lg font-semibold mb-4 dark:text-white">
              Report Post
            </h3>
            <textarea
              value={reportReason}
              onChange={(e) => setReportReason(e.target.value)}
              placeholder="Please provide a reason for reporting this post..."
              className="w-full p-4 rounded-lg bg-gray-50 dark:bg-amoled-light border border-gray-200 dark:border-gray-600 focus:outline-none focus:ring-2 focus:ring-blue-500 resize-none dark:text-white mb-4"
              rows={4}
            />
            <div className="flex space-x-4">
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={handleReport}
                disabled={!reportReason.trim()}
                className="flex-1 px-4 py-2 bg-yellow-500 text-white rounded-lg hover:bg-yellow-600 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Report
              </motion.button>
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={() => {
                  setShowReportModal(false);
                  setReportReason('');
                }}
                className="flex-1 px-4 py-2 bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-300 rounded-lg hover:bg-gray-300 dark:hover:bg-gray-600"
              >
                Cancel
              </motion.button>
            </div>
          </motion.div>
        </motion.div>
      )}
    </div>
  );
}
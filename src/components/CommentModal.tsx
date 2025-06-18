import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { format } from 'date-fns';
import { X, Edit2, Trash2, Reply } from 'lucide-react';
import { supabase } from '../lib/supabase';
import { toast } from 'react-hot-toast';
import { moderateContent } from '../lib/moderation';

interface Comment {
  id: string;
  content: string;
  created_at: string;
  edited_at: string | null;
  is_edited: boolean;
  user_id: string;
  parent_id: string | null;
  profiles: {
    id: string;
    username: string;
    full_name: string;
    avatar_url: string | null;
  };
  replies?: Comment[];
}

interface CommentModalProps {
  postId: string;
  currentUser: any;
  onClose: () => void;
}

export default function CommentModal({
  postId,
  currentUser,
  onClose,
}: CommentModalProps) {
  const [comments, setComments] = useState<Comment[]>([]);
  const [newComment, setNewComment] = useState('');
  const [replyingTo, setReplyingTo] = useState<string | null>(null);
  const [editingComment, setEditingComment] = useState<string | null>(null);
  const [editCommentContent, setEditCommentContent] = useState('');
  const [isAnalyzing, setIsAnalyzing] = useState(false);

  useEffect(() => {
    fetchComments();
  }, [postId]);

  const fetchComments = async () => {
    try {
      const { data, error } = await supabase
        .from('comments')
        .select('*, profiles(*)')
        .eq('post_id', postId)
        .order('created_at', { ascending: true });

      if (error) throw error;

      // Organize comments into threads
      const threads = (data || []).reduce((acc: any, comment: Comment) => {
        if (!comment.parent_id) {
          comment.replies = [];
          acc[comment.id] = comment;
        } else {
          const parent = acc[comment.parent_id];
          if (parent) {
            parent.replies = parent.replies || [];
            parent.replies.push(comment);
          }
        }
        return acc;
      }, {});

      setComments(Object.values(threads));
    } catch (error) {
      console.error('Error fetching comments:', error);
      toast.error('Error loading comments');
    }
  };

  const handleAddComment = async (parentId: string | null = null) => {
    if (!currentUser) {
      toast.error('Please log in to comment');
      return;
    }

    const content = parentId ? newComment : newComment.trim();
    if (!content) return;
    setIsAnalyzing(true);
    // Moderate comment before posting
    const moderation = await moderateContent(content, currentUser.id);
    setIsAnalyzing(false);
    if (!moderation.isAcceptable) {
      toast.error(`Content rejected by Connect Assistant: ${moderation.reason || 'Not allowed'}`);
      return;
    }

    try {
      const { data, error } = await supabase
        .from('comments')
        .insert({
          post_id: postId,
          user_id: currentUser.id,
          content,
          parent_id: parentId,
        })
        .select('*, profiles(*)')
        .single();

      if (error) throw error;

      if (parentId) {
        setComments(
          comments.map((comment) => {
            if (comment.id === parentId) {
              return {
                ...comment,
                replies: [...(comment.replies || []), data],
              };
            }
            return comment;
          })
        );
      } else {
        setComments([...comments, { ...data, replies: [] }]);
      }

      setNewComment('');
      setReplyingTo(null);
      toast.success('Comment added');
    } catch (error: any) {
      toast.error('Error adding comment');
    }
  };

  const handleEditComment = async (commentId: string) => {
    setIsAnalyzing(true);
    // Moderate comment before editing
    const moderation = await moderateContent(editCommentContent, currentUser.id);
    setIsAnalyzing(false);
    if (!moderation.isAcceptable) {
      toast.error(`Content rejected by Connect Assistant: ${moderation.reason || 'Not allowed'}`);
      return;
    }
    try {
      const { error } = await supabase
        .from('comments')
        .update({
          content: editCommentContent,
          is_edited: true,
          edited_at: new Date().toISOString(),
        })
        .eq('id', commentId);

      if (error) throw error;

      setComments(
        comments.map((comment) => {
          if (comment.id === commentId) {
            return {
              ...comment,
              content: editCommentContent,
              is_edited: true,
              edited_at: new Date().toISOString(),
            };
          }
          if (comment.replies) {
            return {
              ...comment,
              replies: comment.replies.map((reply) =>
                reply.id === commentId
                  ? {
                      ...reply,
                      content: editCommentContent,
                      is_edited: true,
                      edited_at: new Date().toISOString(),
                    }
                  : reply
              ),
            };
          }
          return comment;
        })
      );

      setEditingComment(null);
      setEditCommentContent('');
      toast.success('Comment updated');
    } catch (error) {
      toast.error('Error updating comment');
    }
  };

  const handleDeleteComment = async (commentId: string) => {
    try {
      const { error } = await supabase
        .from('comments')
        .delete()
        .eq('id', commentId);

      if (error) throw error;

      setComments(
        comments.filter((comment) => {
          if (comment.id === commentId) return false;
          if (comment.replies) {
            comment.replies = comment.replies.filter(
              (reply) => reply.id !== commentId
            );
          }
          return true;
        })
      );

      toast.success('Comment deleted');
    } catch (error) {
      toast.error('Error deleting comment');
    }
  };

  const renderComment = (comment: Comment, isReply: boolean = false) => (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -20 }}
      className={`flex space-x-3 ${isReply ? 'ml-8' : ''}`}
    >
      <img
        src={
          comment.profiles.avatar_url ||
          `https://api.dicebear.com/9.x/adventurer-neutral/svg?seed=${comment.profiles.id}`
        }
        alt=""
        className="w-8 h-8 rounded-full"
      />
      <div className="flex-1">
        <div className="bg-gray-50 dark:bg-amoled-light rounded-lg p-3">
          <div className="flex justify-between items-start">
            <div>
              <span className="font-medium dark:text-white">
                {comment.profiles.full_name}
              </span>
              <span className="text-sm text-gray-500 dark:text-gray-400 ml-2">
                @{comment.profiles.username}
              </span>
            </div>
            {(currentUser?.id === comment.user_id ||
              currentUser?.is_superadmin) && (
              <div className="flex space-x-2">
                <motion.button
                  whileHover={{ scale: 1.1 }}
                  whileTap={{ scale: 0.9 }}
                  onClick={() => {
                    setEditingComment(comment.id);
                    setEditCommentContent(comment.content);
                  }}
                  className="text-gray-500 hover:text-blue-500"
                >
                  <Edit2 className="w-4 h-4" />
                </motion.button>
                <motion.button
                  whileHover={{ scale: 1.1 }}
                  whileTap={{ scale: 0.9 }}
                  onClick={() => handleDeleteComment(comment.id)}
                  className="text-gray-500 hover:text-red-500"
                >
                  <Trash2 className="w-4 h-4" />
                </motion.button>
              </div>
            )}
          </div>

          {editingComment === comment.id ? (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="mt-2"
            >
              <textarea
                value={editCommentContent}
                onChange={(e) => setEditCommentContent(e.target.value)}
                className="w-full p-2 border dark:border-gray-600 rounded-lg dark:bg-gray-800 dark:text-white"
                rows={2}
              />
              <div className="flex justify-end space-x-2 mt-2">
                <motion.button
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  onClick={() => setEditingComment(null)}
                  className="px-3 py-1 text-sm text-gray-600 dark:text-gray-400"
                >
                  Cancel
                </motion.button>
                <motion.button
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  onClick={() => handleEditComment(comment.id)}
                  disabled={isAnalyzing}
                  className="px-3 py-1 text-sm bg-blue-500 text-white rounded-lg flex items-center space-x-2 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {isAnalyzing ? (
                    <>
                      <svg className="animate-spin h-4 w-4 text-white mr-1" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                      </svg>
                      <span>Analyzing...</span>
                    </>
                  ) : (
                    <span>Save</span>
                  )}
                </motion.button>
              </div>
            </motion.div>
          ) : (
            <>
              <p className="text-gray-700 dark:text-gray-300 mt-1">
                {comment.content}
              </p>
              {comment.is_edited && (
                <span className="text-xs text-gray-500 dark:text-gray-400 ml-2">
                  (edited{' '}
                  {format(new Date(comment.edited_at!), 'MMM d, yyyy h:mm a')})
                </span>
              )}
            </>
          )}
        </div>

        <div className="flex items-center space-x-4 mt-2 ml-2">
          {!isReply && (
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={() => setReplyingTo(comment.id)}
              className="text-sm text-gray-500 dark:text-gray-400 hover:text-blue-500 flex items-center space-x-1"
            >
              <Reply className="w-4 h-4" />
              <span>Reply</span>
            </motion.button>
          )}
          <span className="text-sm text-gray-500 dark:text-gray-400">
            {format(new Date(comment.created_at), 'MMM d, yyyy h:mm a')}
          </span>
        </div>

        {replyingTo === comment.id && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            className="mt-2 flex space-x-2"
          >
            <input
              type="text"
              value={newComment}
              onChange={(e) => setNewComment(e.target.value)}
              placeholder="Write a reply..."
              className="flex-1 px-3 py-2 bg-gray-50 dark:bg-gray-800 border dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 dark:text-white"
            />
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={() => handleAddComment(comment.id)}
              className="px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600"
            >
              Reply
            </motion.button>
          </motion.div>
        )}

        {comment.replies && comment.replies.length > 0 && (
          <div className="mt-4 space-y-4">
            {comment.replies.map((reply) => renderComment(reply, true))}
          </div>
        )}
      </div>
    </motion.div>
  );

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4"
      onClick={onClose}
    >
      <motion.div
        initial={{ scale: 0.9, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        exit={{ scale: 0.9, opacity: 0 }}
        className="bg-white dark:bg-amoled rounded-xl shadow-xl w-full max-w-2xl max-h-[90vh] flex flex-col"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="p-4 border-b dark:border-gray-800 flex justify-between items-center">
          <h2 className="text-xl font-semibold dark:text-white">Comments</h2>
          <motion.button
            whileHover={{ scale: 1.1 }}
            whileTap={{ scale: 0.9 }}
            onClick={onClose}
            className="text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200"
          >
            <X className="w-6 h-6" />
          </motion.button>
        </div>

        <div className="flex-1 overflow-y-auto p-4 space-y-4">
          <AnimatePresence>
            {comments.map((comment) => (
              <motion.div
                key={comment.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
              >
                {renderComment(comment)}
              </motion.div>
            ))}
          </AnimatePresence>
        </div>

        <div className="p-4 border-t dark:border-gray-800">
          <div className="flex space-x-2">
            <input
              type="text"
              value={newComment}
              onChange={(e) => setNewComment(e.target.value)}
              placeholder={
                currentUser ? 'Write a comment...' : 'Log in to comment'
              }
              disabled={!currentUser}
              className="flex-1 px-4 py-2 bg-gray-50 dark:bg-gray-800 border dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 dark:text-white"
            />
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={() => handleAddComment()}
              disabled={!currentUser || !newComment.trim() || isAnalyzing}
              className="px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 disabled:opacity-50 disabled:cursor-not-allowed flex items-center space-x-2"
            >
              {isAnalyzing ? (
                <>
                  <svg className="animate-spin h-5 w-5 text-white mr-2" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                  </svg>
                  <span>Analyzing...</span>
                </>
              ) : (
                <span>Comment</span>
              )}
            </motion.button>
          </div>
        </div>
      </motion.div>
    </motion.div>
  );
}

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
  X,
  Send,
} from 'lucide-react';
import { format } from 'date-fns';
import { Link } from 'react-router-dom';
import { supabase } from '../lib/supabase';
import { toast } from 'react-hot-toast';

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

  useEffect(() => {
    if (post.comments) {
      setComments(post.comments);
    }
  }, [post.comments]);

  const handleLike = async () => {
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
      if (!currentUser?.is_superadmin && currentUser?.id !== post.user_id) {
        throw new Error('Unauthorized');
      }

      // First delete all likes
      await supabase.from('likes').delete().eq('post_id', post.id);

      // Then delete all comments
      await supabase.from('comments').delete().eq('post_id', post.id);

      // Finally delete the post
      const { error } = await supabase.from('posts').delete().eq('id', post.id);

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
    try {
      if (!currentUser?.is_superadmin && currentUser?.id !== post.user_id) {
        throw new Error('Unauthorized');
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
      await navigator.share({
        title: 'Check out this post',
        text: post.content,
        url: window.location.href,
      });
    } catch (error) {
      toast.error('Sharing not supported on this device');
    }
  };

  const handleAddComment = async () => {
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

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="bg-white dark:bg-gray-800 rounded-xl shadow-md p-6 hover:shadow-lg transition-shadow"
    >
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-3">
          {!post.is_anonymous ? (
            <Link to={`/profile/${post.profiles.id}`}>
              <img
                src={
                  post.profiles.avatar_url ||
                  `https://api.dicebear.com/7.x/pixel-art/svg?seed=${post.profiles.username}`
                }
                alt={post.profiles.username}
                className="w-10 h-10 rounded-full"
              />
            </Link>
          ) : (
            <div className="w-10 h-10 rounded-full bg-gray-200 dark:bg-gray-700 flex items-center justify-center">
              <User className="w-6 h-6 text-gray-500 dark:text-gray-400" />
            </div>
          )}

          <div>
            <Link
              to={`/profile/${post.profiles.id}`}
              className="font-semibold text-gray-900 dark:text-white hover:underline"
            >
              {post.is_anonymous ? 'Anonymous' : post.profiles.full_name}
            </Link>
            <div className="text-sm text-gray-500 dark:text-gray-400">
              {format(new Date(post.created_at), 'MMM d, yyyy')}
            </div>
          </div>
        </div>

        {(currentUser?.is_superadmin || currentUser?.id === post.user_id) && (
          <div className="relative">
            <button
              onClick={() => setShowMenu(!showMenu)}
              className="p-2 text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-200 rounded-full"
            >
              <MoreVertical className="w-5 h-5" />
            </button>

            {showMenu && (
              <div className="absolute right-0 mt-2 w-48 bg-white dark:bg-gray-800 rounded-lg shadow-lg z-10">
                <button
                  onClick={() => {
                    setIsEditing(true);
                    setShowMenu(false);
                  }}
                  className="flex items-center space-x-2 w-full px-4 py-2 text-left text-gray-700 dark:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-700"
                >
                  <Edit2 className="w-4 h-4" />
                  <span>Edit</span>
                </button>
                <button
                  onClick={handleDelete}
                  className="flex items-center space-x-2 w-full px-4 py-2 text-left text-red-600 hover:bg-gray-100 dark:hover:bg-gray-700"
                >
                  <Trash2 className="w-4 h-4" />
                  <span>Delete</span>
                </button>
              </div>
            )}
          </div>
        )}
      </div>

      {isEditing ? (
        <div className="mt-4">
          <textarea
            value={content}
            onChange={(e) => setContent(e.target.value)}
            className="w-full p-3 border dark:border-gray-600 dark:bg-gray-700 dark:text-white rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            rows={3}
          />
          <div className="mt-2 flex justify-end space-x-2">
            <button
              onClick={() => {
                setContent(post.content);
                setIsEditing(false);
              }}
              className="px-4 py-2 text-gray-600 dark:text-gray-300 hover:text-gray-800 dark:hover:text-gray-100"
            >
              Cancel
            </button>
            <button
              onClick={handleEdit}
              className="px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600"
            >
              Save
            </button>
          </div>
        </div>
      ) : (
        <p className="mt-4 text-gray-700 dark:text-gray-200">{post.content}</p>
      )}

      {post.image_url && (
        <img
          src={post.image_url}
          alt="Post content"
          className="mt-4 rounded-lg w-full object-cover"
        />
      )}

      <div className="mt-4 flex items-center space-x-6 text-gray-600 dark:text-gray-400">
        <button
          onClick={handleLike}
          className={`flex items-center space-x-2 transition-colors ${
            isLiked ? 'text-red-500' : 'hover:text-red-500'
          }`}
        >
          <Heart className={`w-5 h-5 ${isLiked ? 'fill-current' : ''}`} />
          <span>{likes.length}</span>
        </button>

        <button
          onClick={() => {
            if (!showComments) fetchComments();
            else setShowComments(false);
          }}
          className="flex items-center space-x-2 hover:text-blue-500 transition-colors"
        >
          <MessageCircle className="w-5 h-5" />
          <span>{comments.length}</span>
        </button>

        <button
          onClick={handleShare}
          className="flex items-center space-x-2 hover:text-green-500 transition-colors"
        >
          <Share2 className="w-5 h-5" />
        </button>
      </div>

      {/* Add Comment Input */}
      <div className="mt-4">
        <div className="flex space-x-2">
          <input
            type="text"
            value={newComment}
            onChange={(e) => setNewComment(e.target.value)}
            placeholder="Add a comment..."
            className="flex-1 px-4 py-2 bg-gray-50 dark:bg-gray-700 border dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 dark:text-white dark:placeholder-gray-400"
          />
          <button
            onClick={handleAddComment}
            disabled={!newComment.trim()}
            className="px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 disabled:opacity-50 disabled:cursor-not-allowed flex items-center space-x-2"
          >
            <Send className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Preview Comments (up to 3) */}
      {comments.length > 0 && (
        <div className="mt-4 space-y-4">
          {displayedComments.map((comment) => (
            <div key={comment.id} className="flex space-x-3">
              <img
                src={
                  comment.profiles.avatar_url ||
                  `https://api.dicebear.com/7.x/avatars/svg?seed=${comment.profiles.username}`
                }
                alt=""
                className="w-8 h-8 rounded-full"
              />
              <div className="flex-1">
                <div className="bg-gray-50 dark:bg-gray-700 rounded-lg p-3">
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
          ))}
          {comments.length > 3 && !showAllComments && (
            <button
              onClick={() => setShowAllComments(true)}
              className="text-blue-500 hover:text-blue-600 text-sm"
            >
              View all {comments.length} comments
            </button>
          )}
        </div>
      )}
    </motion.div>
  );
}
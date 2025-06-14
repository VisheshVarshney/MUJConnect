import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { supabase } from '../lib/supabase';
import { toast } from 'react-hot-toast';
import FeedSidebar from '../components/feed/FeedSidebar';
import Post from '../components/Post';
import { ArrowLeft } from 'lucide-react';

export default function PostFull() {
  const { id } = useParams();
  console.log('PostFull rendered with id:', id);
  const navigate = useNavigate();
  const [post, setPost] = useState<any>(null);
  const [currentUser, setCurrentUser] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [fetchError, setFetchError] = useState<string | null>(null);
  const [comments, setComments] = useState<any[]>([]);
  const [following, setFollowing] = useState<any[]>([]);
  const [suggestedUsers, setSuggestedUsers] = useState<any[]>([]);

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
        fetchFollowing(profile);
      }
    } catch (error) {
      console.error('Error fetching current user:', error);
    }
  };

  const fetchFollowing = async (profile: any) => {
    try {
      const { data: followingData } = await supabase
        .from('follows')
        .select('following_id, profiles!follows_following_id_fkey(*)')
        .eq('follower_id', profile.id)
        .limit(5);
      setFollowing(followingData || []);
      if (followingData && followingData.length < 5) {
        const { data: suggestions } = await supabase
          .from('profiles')
          .select('*')
          .neq('id', profile.id)
          .not('id', 'in', `(${followingData.map(f => f.following_id).join(',') || '00000000-0000-0000-0000-000000000000'})`)
          .limit(5);
        setSuggestedUsers(suggestions || []);
      }
    } catch (error) {
      console.error('Error fetching following:', error);
    }
  };

  const fetchPost = async () => {
    try {
      setIsLoading(true);
      setFetchError(null);
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
    } catch (error: any) {
      setFetchError(error?.message || error?.toString() || 'Unknown error');
      toast.error('Error loading post');
    } finally {
      setIsLoading(false);
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
          {fetchError && (
            <div className="text-red-500 mb-2">{fetchError}</div>
          )}
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
    <div className="max-w-7xl mx-auto px-4 py-8">
      <div className="grid grid-cols-12 gap-6">
        {/* Left Sidebar */}
        <div className="hidden lg:block col-span-3">
          <FeedSidebar
            following={following}
            suggestedUsers={suggestedUsers}
            currentUser={currentUser}
            isLoading={isLoading}
            onFollow={async () => {}}
          />
        </div>
        {/* Main Content */}
        <div className="col-span-12 lg:col-span-6">
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
            <div className="space-y-6">
              {comments.map((comment) => (
                <div key={comment.id} className="flex space-x-4">
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
                          {new Date(comment.created_at).toLocaleString()}
                        </div>
                      </div>
                      <p className="text-gray-700 dark:text-gray-300">{comment.content}</p>
                    </div>
                  </div>
                </div>
              ))}
              {comments.length === 0 && (
                <div className="text-center py-8 text-gray-500 dark:text-gray-400">
                  No comments yet. Be the first to comment!
                </div>
              )}
            </div>
          </div>
        </div>
        {/* Right Sidebar Placeholder */}
        <div className="hidden lg:block col-span-3">
          <div className="sticky top-20 space-y-6 max-h-[calc(100vh-5rem)] overflow-y-auto hide-scrollbar">
            <div className="bg-white dark:bg-amoled rounded-xl shadow-md p-6 text-center">
              <h2 className="text-lg font-semibold mb-4 text-gray-900 dark:text-white">Right Sidebar</h2>
              <p className="text-gray-600 dark:text-gray-400">Add widgets or info here.</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
} 
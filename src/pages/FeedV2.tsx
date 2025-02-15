import React, { useEffect, useState, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Link } from 'react-router-dom';
import { useInView } from 'react-intersection-observer';
import { CSSTransition, TransitionGroup } from 'react-transition-group';
import Skeleton from 'react-loading-skeleton';
import 'react-loading-skeleton/dist/skeleton.css';
import {
  House,
  User,
  Bell,
  SignOut,
  MagnifyingGlass,
  ChatCircle,
  Moon,
  Sun,
  ShieldStar,
  Utensils,
  List,
  X,
  PaperPlaneTilt,
  TrendUp,
  Fire,
  Clock,
  Hash
} from '@phosphor-icons/react';
import { supabase } from '../lib/supabase';
import CreatePost from '../components/CreatePost';
import Post from '../components/Post';
import { PostSkeleton } from '../components/PostSkeleton';
import { FollowingSkeleton } from '../components/Skeleton';
import { useThemeStore } from '../lib/store';
import { toast } from 'react-hot-toast';

const POSTS_PER_PAGE = 10;

const tabs = [
  { id: 'latest', label: 'Latest', icon: Clock },
  { id: 'trending', label: 'Trending', icon: TrendUp },
  { id: 'hot', label: 'Hot', icon: Fire },
];

export default function FeedV2() {
  const [posts, setPosts] = useState<any[]>([]);
  const [currentUser, setCurrentUser] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [page, setPage] = useState(0);
  const [hasMore, setHasMore] = useState(true);
  const [activeTab, setActiveTab] = useState('latest');
  const [showCreatePost, setShowCreatePost] = useState(false);
  const [trendingTopics, setTrendingTopics] = useState([
    { tag: 'MUJLife', count: 234 },
    { tag: 'CampusFood', count: 156 },
    { tag: 'AcademicLife', count: 98 },
    { tag: 'HostelDiaries', count: 87 },
    { tag: 'MUJMemes', count: 65 },
  ]);
  const { isDark, toggleDark } = useThemeStore();

  // Infinite scroll setup
  const { ref: loadMoreRef, inView } = useInView({
    threshold: 0,
    rootMargin: '100px',
  });

  useEffect(() => {
    if (inView && hasMore && !isLoading) {
      loadMorePosts();
    }
  }, [inView]);

  const fetchPosts = async () => {
    try {
      setError(null);
      let query = supabase
        .from('posts')
        .select(`
          *,
          profiles (*),
          likes (*),
          comments (*),
          media_files (*)
        `)
        .order('created_at', { ascending: false });

      // Apply different sorting based on active tab
      if (activeTab === 'trending') {
        query = query.order('likes.length', { ascending: false });
      } else if (activeTab === 'hot') {
        query = query.order('comments.length', { ascending: false });
      }

      query = query.range(0, POSTS_PER_PAGE - 1);

      const { data, error: postsError } = await query;

      if (postsError) throw postsError;
      
      if (data) {
        const processedPosts = await Promise.all(data.map(async (post) => {
          if (post.media_files) {
            const mediaWithUrls = await Promise.all(post.media_files.map(async (file: any) => {
              try {
                const { data: { publicUrl } } = supabase.storage
                  .from('post-media')
                  .getPublicUrl(file.file_path);
                return { ...file, url: publicUrl };
              } catch (error) {
                console.error('Error getting media URL:', error);
                return null;
              }
            }));
            post.media_files = mediaWithUrls.filter(Boolean);
          }
          return post;
        }));
        
        setPosts(processedPosts);
        setPage(1);
      }
    } catch (error: any) {
      console.error('Error fetching posts:', error);
      setError(error.message);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchPosts();
  }, [activeTab]);

  const getCurrentUser = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (user) {
        const { data: profile } = await supabase
          .from('profiles')
          .select('*')
          .eq('id', user.id)
          .single();
        
        if (!profile) {
          const { data: newProfile } = await supabase
            .from('profiles')
            .insert({
              id: user.id,
              username: user.email?.split('@')[0],
              full_name: 'User'
            })
            .select()
            .single();
          
          setCurrentUser(newProfile);
        } else {
          setCurrentUser(profile);
        }
      }
    } catch (error) {
      console.error('Error fetching user:', error);
    }
  };

  useEffect(() => {
    getCurrentUser();
  }, []);

  const handlePostDelete = () => {
    fetchPosts();
  };

  const handlePostCreated = async (newPost: any) => {
    const { data: post } = await supabase
      .from('posts')
      .select(`
        *,
        profiles (*),
        likes (*),
        comments (*),
        media_files (*)
      `)
      .eq('id', newPost.id)
      .single();

    if (post) {
      if (post.media_files) {
        const mediaWithUrls = await Promise.all(post.media_files.map(async (file: any) => {
          try {
            const { data: { publicUrl } } = supabase.storage
              .from('post-media')
              .getPublicUrl(file.file_path);
            return { ...file, url: publicUrl };
          } catch (error) {
            console.error('Error getting media URL:', error);
            return null;
          }
        }));
        post.media_files = mediaWithUrls.filter(Boolean);
      }

      setPosts(prevPosts => [post, ...prevPosts]);
      setShowCreatePost(false);
    }
  };

  const loadMorePosts = async () => {
    try {
      const from = page * POSTS_PER_PAGE;
      const to = from + POSTS_PER_PAGE - 1;

      let query = supabase
        .from('posts')
        .select(`
          *,
          profiles (*),
          likes (*),
          comments (*),
          media_files (*)
        `);

      if (activeTab === 'trending') {
        query = query.order('likes.length', { ascending: false });
      } else if (activeTab === 'hot') {
        query = query.order('comments.length', { ascending: false });
      } else {
        query = query.order('created_at', { ascending: false });
      }

      query = query.range(from, to);

      const { data: newPosts, error: postsError } = await query;

      if (postsError) throw postsError;

      if (newPosts) {
        const processedPosts = await Promise.all(newPosts.map(async (post) => {
          if (post.media_files) {
            const mediaWithUrls = await Promise.all(post.media_files.map(async (file: any) => {
              try {
                const { data: { publicUrl } } = supabase.storage
                  .from('post-media')
                  .getPublicUrl(file.file_path);
                return { ...file, url: publicUrl };
              } catch (error) {
                console.error('Error getting media URL:', error);
                return null;
              }
            }));
            post.media_files = mediaWithUrls.filter(Boolean);
          }
          return post;
        }));

        if (processedPosts.length < POSTS_PER_PAGE) {
          setHasMore(false);
        }
        setPosts(prev => [...prev, ...processedPosts]);
        setPage(prev => prev + 1);
      }
    } catch (error) {
      console.error('Error loading more posts:', error);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-amoled">
      {/* Top Navigation */}
      <div className="sticky top-0 z-50 bg-white dark:bg-amoled-light border-b dark:border-gray-800 mb-6">
        <div className="max-w-7xl mx-auto px-4">
          <div className="flex items-center justify-between h-16">
            <div className="flex items-center space-x-4">
              {tabs.map(({ id, label, icon: Icon }) => (
                <button
                  key={id}
                  onClick={() => setActiveTab(id)}
                  className={`flex items-center space-x-2 px-4 py-2 rounded-full transition-colors ${
                    activeTab === id
                      ? 'bg-blue-50 dark:bg-blue-900/20 text-blue-600 dark:text-blue-400'
                      : 'text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-800'
                  }`}
                >
                  <Icon weight="bold" className="w-5 h-5" />
                  <span className="font-medium">{label}</span>
                </button>
              ))}
            </div>

            <div className="flex items-center space-x-4">
              <button
                onClick={() => toggleDark()}
                className="p-2 text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-full"
              >
                {isDark ? <Sun weight="bold" className="w-5 h-5" /> : <Moon weight="bold" className="w-5 h-5" />}
              </button>
              {currentUser && (
                <img
                  src={currentUser.avatar_url || `https://api.dicebear.com/9.x/adventurer-neutral/svg?backgroundColor=b6e3f4,c0aede,d1d4f9`}
                  alt=""
                  className="w-8 h-8 rounded-full"
                />
              )}
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4">
        <div className="grid grid-cols-12 gap-6">
          {/* Left Sidebar */}
          <div className="hidden lg:block col-span-3">
            <div className="sticky top-24">
              <div className="bg-white dark:bg-amoled-light rounded-xl shadow-sm p-6">
                <h2 className="text-lg font-semibold mb-4 dark:text-white flex items-center">
                  <Hash weight="bold" className="w-5 h-5 mr-2" />
                  Trending Topics
                </h2>
                <div className="space-y-4">
                  {trendingTopics.map(({ tag, count }) => (
                    <div
                      key={tag}
                      className="flex items-center justify-between group cursor-pointer"
                    >
                      <span className="text-blue-500 dark:text-blue-400 group-hover:text-blue-600 dark:group-hover:text-blue-300">
                        #{tag}
                      </span>
                      <span className="text-sm text-gray-500 dark:text-gray-400">
                        {count} posts
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>

          {/* Main Content */}
          <div className="col-span-12 lg:col-span-6">
            {/* Create Post Button */}
            <motion.button
              onClick={() => setShowCreatePost(true)}
              className="w-full bg-white dark:bg-amoled-light rounded-xl shadow-sm p-4 mb-6 text-left text-gray-500 dark:text-gray-400 hover:bg-gray-50 dark:hover:bg-amoled-lighter transition-colors"
              whileHover={{ y: -2 }}
              whileTap={{ scale: 0.98 }}
            >
              <div className="flex items-center space-x-4">
                <img
                  src={currentUser?.avatar_url || `https://api.dicebear.com/9.x/adventurer-neutral/svg?backgroundColor=b6e3f4,c0aede,d1d4f9`}
                  alt=""
                  className="w-10 h-10 rounded-full"
                />
                <span>What's on your mind?</span>
              </div>
            </motion.button>

            {/* Create Post Modal */}
            <AnimatePresence>
              {showCreatePost && (
                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4"
                >
                  <motion.div
                    initial={{ scale: 0.9, opacity: 0 }}
                    animate={{ scale: 1, opacity: 1 }}
                    exit={{ scale: 0.9, opacity: 0 }}
                    className="bg-white dark:bg-amoled-light rounded-xl shadow-lg w-full max-w-2xl"
                  >
                    <div className="flex justify-between items-center p-4 border-b dark:border-gray-800">
                      <h2 className="text-xl font-semibold dark:text-white">Create Post</h2>
                      <button
                        onClick={() => setShowCreatePost(false)}
                        className="p-2 text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200"
                      >
                        <X weight="bold" className="w-5 h-5" />
                      </button>
                    </div>
                    <div className="p-4">
                      <CreatePost onPostCreated={handlePostCreated} />
                    </div>
                  </motion.div>
                </motion.div>
              )}
            </AnimatePresence>

            {/* Posts */}
            <TransitionGroup className="space-y-6">
              {isLoading ? (
                Array.from({ length: 3 }).map((_, index) => (
                  <CSSTransition
                    key={index}
                    timeout={300}
                    classNames="post"
                  >
                    <PostSkeleton />
                  </CSSTransition>
                ))
              ) : (
                posts.map((post) => (
                  <CSSTransition
                    key={post.id}
                    timeout={300}
                    classNames="post"
                  >
                    <motion.div
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: -20 }}
                      className="group"
                    >
                      <Post 
                        post={post} 
                        currentUser={currentUser}
                        onDelete={handlePostDelete}
                      />
                    </motion.div>
                  </CSSTransition>
                ))
              )}
            </TransitionGroup>

            {hasMore && (
              <div ref={loadMoreRef} className="h-20 flex items-center justify-center">
                <Skeleton height={100} />
              </div>
            )}
          </div>

          {/* Right Sidebar */}
          <div className="hidden lg:block col-span-3">
            <div className="sticky top-24">
              {!currentUser ? (
                <div className="bg-white dark:bg-amoled-light rounded-xl shadow-sm p-6 text-center">
                  <h2 className="text-xl font-semibold mb-4 dark:text-white">Join the Community</h2>
                  <p className="text-gray-600 dark:text-gray-400 mb-6">
                    Sign up now to share your thoughts and connect with others!
                  </p>
                  <div className="space-y-4">
                    <Link
                      to="/register"
                      className="block w-full px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors"
                    >
                      Sign Up
                    </Link>
                    <Link
                      to="/login"
                      className="block w-full px-4 py-2 bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-300 rounded-lg hover:bg-gray-200 dark:hover:bg-gray-700 transition-colors"
                    >
                      Log In
                    </Link>
                  </div>
                </div>
              ) : (
                <div className="bg-white dark:bg-amoled-light rounded-xl shadow-sm p-6">
                  <h2 className="text-lg font-semibold mb-4 dark:text-white">Your Activity</h2>
                  <div className="space-y-4">
                    <div className="flex justify-between items-center">
                      <span className="text-gray-600 dark:text-gray-400">Posts</span>
                      <span className="font-semibold dark:text-white">{posts.filter(p => p.user_id === currentUser.id).length}</span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-gray-600 dark:text-gray-400">Likes</span>
                      <span className="font-semibold dark:text-white">{posts.reduce((acc, post) => acc + post.likes.length, 0)}</span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-gray-600 dark:text-gray-400">Comments</span>
                      <span className="font-semibold dark:text-white">{posts.reduce((acc, post) => acc + post.comments.length, 0)}</span>
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
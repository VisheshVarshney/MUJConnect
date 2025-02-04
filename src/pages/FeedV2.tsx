import React, { useEffect, useState, useCallback, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Link } from 'react-router-dom';
import { useInView } from 'react-intersection-observer';
import { useSpring, animated } from '@react-spring/web';
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
  PaperPlaneTilt
} from '@phosphor-icons/react';
import { supabase } from '../lib/supabase';
import CreatePost from '../components/CreatePost';
import Post from '../components/Post';
import { PostSkeleton } from '../components/PostSkeleton';
import { FollowingSkeleton } from '../components/Skeleton';
import StarBorder from '../components/StarBorder';
import { useThemeStore } from '../lib/store';
import { toast } from 'react-hot-toast';

const POSTS_PER_PAGE = 10;

export default function FeedV2() {
  const [posts, setPosts] = useState<any[]>([]);
  const [currentUser, setCurrentUser] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [following, setFollowing] = useState<any[]>([]);
  const [suggestedUsers, setSuggestedUsers] = useState<any[]>([]);
  const [page, setPage] = useState(0);
  const [hasMore, setHasMore] = useState(true);
  const { isDark, toggleDark } = useThemeStore();
  const [showMobileMenu, setShowMobileMenu] = useState(false);
  const [showNotifications, setShowNotifications] = useState(false);
  const [notifications, setNotifications] = useState<any[]>([]);
  const [searchQuery, setSearchQuery] = useState('');

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
      const { data, error: postsError } = await supabase
        .from('posts')
        .select(`
          *,
          profiles (*),
          likes (*),
          comments (*),
          media_files (*)
        `)
        .order('created_at', { ascending: false })
        .range(0, POSTS_PER_PAGE - 1);

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
    }
  };

  const loadMorePosts = async () => {
    try {
      const from = page * POSTS_PER_PAGE;
      const to = from + POSTS_PER_PAGE - 1;

      const { data: newPosts, error: postsError } = await supabase
        .from('posts')
        .select(`
          *,
          profiles (*),
          likes (*),
          comments (*),
          media_files (*)
        `)
        .order('created_at', { ascending: false })
        .range(from, to);

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

  // Animation for post entrance
  const postAnimation = {
    initial: { opacity: 0, y: 20 },
    animate: { opacity: 1, y: 0 },
    exit: { opacity: 0, y: -20 },
  };

  useEffect(() => {
    fetchPosts();
    getCurrentUser();
  }, []);

  return (
    <div className="max-w-7xl mx-auto px-4">
      <div className="grid grid-cols-12 gap-6">
        {/* Main Feed Column */}
        <div className="col-span-12 lg:col-span-8">
          {!currentUser ? (
            <motion.div
              initial={{ opacity: 0, y: -20 }}
              animate={{ opacity: 1, y: 0 }}
              className="relative mb-6"
            >
              <div className="absolute inset-0 bg-white/50 dark:bg-black/50 backdrop-blur-sm z-10 rounded-xl flex items-center justify-center">
                <div className="text-center p-6 bg-white dark:bg-amoled rounded-lg shadow-lg">
                  <h3 className="text-lg font-semibold mb-2 dark:text-white">
                    You need an account to create/send posts
                  </h3>
                  <div className="flex gap-4 justify-center">
                    <Link
                      to="/login"
                      className="flex items-center px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors"
                    >
                      <SignOut className="w-4 h-4 mr-2" />
                      Log In
                    </Link>
                    <Link
                      to="/register"
                      className="flex items-center px-4 py-2 bg-green-500 text-white rounded-lg hover:bg-green-600 transition-colors"
                    >
                      <User className="w-4 h-4 mr-2" />
                      Sign Up
                    </Link>
                  </div>
                </div>
              </div>
              <CreatePost disabled={true} />
            </motion.div>
          ) : (
            <CreatePost onPostCreated={handlePostCreated} />
          )}
          
          {error && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="bg-red-50 dark:bg-red-900/20 text-red-600 dark:text-red-400 p-4 rounded-lg mb-6"
            >
              {error}
            </motion.div>
          )}
          
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
                    {...postAnimation}
                    className="group"
                  >
                    <StarBorder color="#3b82f6" speed="4s" className="w-full">
                      <Post 
                        post={post} 
                        currentUser={currentUser}
                        onDelete={handlePostDelete}
                      />
                    </StarBorder>
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
        <div className="hidden lg:block col-span-4">
          {/* Right sidebar content */}
        </div>
      </div>
    </div>
  );
}
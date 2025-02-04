import React, { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';
import { supabase } from '../lib/supabase';
import CreatePost from '../components/CreatePost';
import Post from '../components/Post';
import { PostSkeleton } from '../components/PostSkeleton';
import { FollowingSkeleton } from '../components/Skeleton';
import StarBorder from '../components/StarBorder';
import { LogIn, UserPlus, Users, Utensils, ChevronRight } from 'lucide-react';

export default function Feed() {
  const [posts, setPosts] = useState<any[]>([]);
  const [currentUser, setCurrentUser] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [following, setFollowing] = useState<any[]>([]);
  const [suggestedUsers, setSuggestedUsers] = useState<any[]>([]);

  useEffect(() => {
    fetchPosts();
    getCurrentUser();
  }, []);

  useEffect(() => {
    if (currentUser) {
      fetchFollowing();
    }
  }, [currentUser]);

  const fetchFollowing = async () => {
    try {
      const { data: followingData } = await supabase
        .from('follows')
        .select('following_id, profiles!follows_following_id_fkey(*)')
        .eq('follower_id', currentUser.id)
        .limit(5);
      
      if (followingData) {
        setFollowing(followingData);
        
        if (followingData.length < 5) {
          const { data: suggestions } = await supabase
            .from('profiles')
            .select('*')
            .neq('id', currentUser.id)
            .not('id', 'in', `(${followingData.map(f => f.following_id).join(',') || '00000000-0000-0000-0000-000000000000'})`)
            .limit(5);
          
          if (suggestions) setSuggestedUsers(suggestions);
        }
      }
    } catch (error) {
      console.error('Error fetching following:', error);
    }
  };

  const handleFollow = async (userId: string) => {
    try {
      const { error } = await supabase
        .from('follows')
        .insert({ follower_id: currentUser.id, following_id: userId });

      if (error) throw error;

      fetchFollowing();
      toast.success('User followed successfully');
    } catch (error) {
      console.error('Error following user:', error);
      toast.error('Error following user');
    }
  };

  const fetchPosts = async () => {
    try {
      setError(null);
      const { data, error: postsError } = await supabase
        .from('posts')
        .select(`
          *,
          profiles (*),
          likes (*),
          media_files (*)
        `)
        .order('created_at', { ascending: false });

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
          .maybeSingle();
        
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

  const restaurants = [
    {
      id: 1,
      name: "Dialog Cafe",
      image: "https://images.unsplash.com/photo-1559925393-8be0ec4767c8?w=800&auto=format&fit=crop&q=60&ixlib=rb-4.0.3",
    },
    {
      id: 2,
      name: "Let's Go Live",
      image: "https://images.unsplash.com/photo-1555396273-367ea4eb4db5?w=800&auto=format&fit=crop&q=60&ixlib=rb-4.0.3",
    },
    {
      id: 3,
      name: "China Town",
      image: "https://images.unsplash.com/photo-1589734435753-747b0aa53b78?w=800&auto=format&fit=crop&q=60&ixlib=rb-4.0.3",
    },
  ];

  return (
    <div className="max-w-7xl mx-auto px-4">
      <div className="grid grid-cols-12 gap-6">
        {/* Main Feed Column */}
        <div className="col-span-12 lg:col-span-8">
          {!currentUser ? (
            <div className="relative mb-6">
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
                      <LogIn className="w-4 h-4 mr-2" />
                      Log In
                    </Link>
                    <Link
                      to="/register"
                      className="flex items-center px-4 py-2 bg-green-500 text-white rounded-lg hover:bg-green-600 transition-colors"
                    >
                      <UserPlus className="w-4 h-4 mr-2" />
                      Sign Up
                    </Link>
                  </div>
                </div>
              </div>
              <CreatePost disabled={true} />
            </div>
          ) : (
            <CreatePost onPostCreated={handlePostCreated} />
          )}
          
          {error && (
            <div className="bg-red-50 dark:bg-red-900/20 text-red-600 dark:text-red-400 p-4 rounded-lg mb-6">
              {error}
            </div>
          )}
          
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="space-y-6"
          >
            {isLoading ? (
              Array.from({ length: 3 }).map((_, index) => (
                <PostSkeleton key={index} />
              ))
            ) : (
              posts.map((post) => (
                <div key={post.id} className="group">
                  <StarBorder color="#3b82f6" speed="4s" className="w-full">
                    <Post 
                      post={post} 
                      currentUser={currentUser}
                      onDelete={handlePostDelete}
                    />
                  </StarBorder>
                </div>
              ))
            )}
          </motion.div>
        </div>

        {/* Right Sidebar */}
        <div className="hidden lg:block col-span-4">
          <div className="sticky top-20 space-y-6 max-h-[calc(100vh-5rem)] overflow-y-auto hide-scrollbar">
            {/* Following Section */}
            <div className="bg-white dark:bg-amoled rounded-xl shadow-md p-6">
              <h2 className="text-lg font-semibold mb-4 dark:text-white flex items-center">
                <Users className="w-5 h-5 mr-2" />
                Following
              </h2>
              <div className="space-y-4 hide-scrollbar overflow-y-auto max-h-[calc(100vh-20rem)]">
                {isLoading ? (
                  <FollowingSkeleton />
                ) : (
                  <>
                    {following.map((follow) => (
                      <Link
                        key={follow.following_id}
                        to={`/profile/${follow.following_id}`}
                        className="block p-3 rounded-lg hover:bg-gray-50 dark:hover:bg-amoled-light transition-colors animate-fade-in"
                      >
                        <div className="flex items-center space-x-3">
                          <img
                            src={follow.profiles.avatar_url || `https://api.dicebear.com/9.x/adventurer-neutral/svg?backgroundColor=b6e3f4,c0aede,d1d4f9`}
                            alt=""
                            className="w-10 h-10 rounded-full"
                          />
                          <div>
                            <div className="font-medium dark:text-white">{follow.profiles.full_name}</div>
                            <div className="text-sm text-gray-500 dark:text-gray-400">@{follow.profiles.username}</div>
                          </div>
                        </div>
                      </Link>
                    ))}

                    {following.length < 5 && suggestedUsers.length > 0 && (
                      <>
                        <div className="text-sm font-medium text-gray-500 dark:text-gray-400 mt-6 mb-4">
                          Suggested Users
                        </div>
                        {suggestedUsers.map((user) => (
                          <div
                            key={user.id}
                            className="flex items-center justify-between p-3 rounded-lg hover:bg-gray-50 dark:hover:bg-amoled-light transition-colors animate-fade-in"
                          >
                            <Link
                              to={`/profile/${user.id}`}
                              className="flex items-center space-x-3 flex-1"
                            >
                              <img
                                src={user.avatar_url || `https://api.dicebear.com/9.x/adventurer-neutral/svg?backgroundColor=b6e3f4,c0aede,d1d4f9`}
                                alt=""
                                className="w-10 h-10 rounded-full"
                              />
                              <div>
                                <div className="font-medium dark:text-white">{user.full_name}</div>
                                <div className="text-sm text-gray-500 dark:text-gray-400">@{user.username}</div>
                              </div>
                            </Link>
                            <button
                              onClick={(e) => {
                                e.preventDefault();
                                handleFollow(user.id);
                              }}
                              className="px-3 py-1 text-sm bg-blue-500 text-white rounded-full hover:bg-blue-600 transition-colors"
                            >
                              Follow
                            </button>
                          </div>
                        ))}
                      </>
                    )}
                  </>
                )}
              </div>
            </div>

            {/* MUJ Menus Section */}
            <div className="bg-white dark:bg-amoled rounded-xl shadow-md p-6">
              <h2 className="text-lg font-semibold mb-4 dark:text-white flex items-center">
                <Utensils className="w-5 h-5 mr-2" />
                MUJ Menus
              </h2>
              <div className="space-y-4">
                {restaurants.map((restaurant) => (
                  <Link
                    key={restaurant.id}
                    to={`/menu/${restaurant.id}`}
                    className="group block"
                  >
                    <div className="flex items-center space-x-3 p-3 rounded-lg hover:bg-gray-50 dark:hover:bg-amoled-light transition-colors animate-fade-in">
                      <img
                        src={restaurant.image}
                        alt={restaurant.name}
                        className="w-12 h-12 rounded-lg object-cover"
                      />
                      <div className="flex-1">
                        <div className="font-medium dark:text-white group-hover:text-blue-500 transition-colors">
                          {restaurant.name}
                        </div>
                      </div>
                      <ChevronRight className="w-5 h-5 text-gray-400 group-hover:text-blue-500 transition-colors" />
                    </div>
                  </Link>
                ))}
                <Link
                  to="/muj-menus"
                  className="block text-center text-sm text-blue-500 hover:text-blue-600 dark:text-blue-400 dark:hover:text-blue-300"
                >
                  Show More
                </Link>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
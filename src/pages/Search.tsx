import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { useSearchParams } from 'react-router-dom';
import { supabase } from '../lib/supabase';
import Post from '../components/Post';
import { Search as SearchIcon, Users, Hash, FileText } from 'lucide-react';
import { SearchSkeleton } from '../components/skeletons/SearchSkeleton';

export default function Search() {
  const [searchParams, setSearchParams] = useSearchParams();
  const [query, setQuery] = useState(searchParams.get('q') || '');
  const [activeTab, setActiveTab] = useState('all');
  const [results, setResults] = useState<{
    users: any[];
    posts: any[];
    hashtags: any[];
  }>({
    users: [],
    posts: [],
    hashtags: [],
  });
  const [isLoading, setIsLoading] = useState(false);
  const [currentUser, setCurrentUser] = useState<any>(null);

  useEffect(() => {
    getCurrentUser();
    if (query) {
      performSearch();
    }
  }, [query]);

  const getCurrentUser = async () => {
    const {
      data: { user },
    } = await supabase.auth.getUser();
    if (user) {
      const { data: profile } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', user.id)
        .single();
      setCurrentUser(profile);
    }
  };

  const performSearch = async () => {
    setIsLoading(true);
    try {
      // Search users
      const { data: users } = await supabase
        .from('profiles')
        .select('*')
        .or(`username.ilike.%${query}%,full_name.ilike.%${query}%`)
        .limit(10);

      // Search posts
      const { data: posts } = await supabase
        .from('posts')
        .select('*, profiles(*), likes(*)')
        .or(`content.ilike.%${query}%`)
        .order('created_at', { ascending: false })
        .limit(20);

      // Search posts by user
      const { data: userPosts } = await supabase
        .from('posts')
        .select('*, profiles(*), likes(*)')
        .in('user_id', users?.map((u) => u.id) || [])
        .order('created_at', { ascending: false })
        .limit(20);

      // Combine and deduplicate posts
      const allPosts = [...(posts || []), ...(userPosts || [])];
      const uniquePosts = Array.from(
        new Map(allPosts.map((post) => [post.id, post])).values()
      );

      // Search hashtags
      const { data: hashtagPosts } = await supabase
        .from('posts')
        .select('*, profiles(*), likes(*)')
        .ilike('content', `%#${query}%`)
        .order('created_at', { ascending: false })
        .limit(20);

      setResults({
        users: users || [],
        posts: uniquePosts,
        hashtags: hashtagPosts || [],
      });
    } catch (error) {
      console.error('Error performing search:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (query.trim()) {
      setSearchParams({ q: query });
      performSearch();
    }
  };

  const tabs = [
    { id: 'all', label: 'All', icon: SearchIcon },
    { id: 'people', label: 'People', icon: Users },
    { id: 'posts', label: 'Posts', icon: FileText },
    { id: 'hashtags', label: 'Hashtags', icon: Hash },
  ];

  return (
    <div className="w-full py-8 md:max-w-4xl md:mx-auto overflow-x-hidden" style={{ boxSizing: 'border-box' }}>
      <div className="px-4">
        <form onSubmit={handleSearch} className="mb-8">
          <div className="relative">
            <input
              type="text"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Search for people, posts, or hashtags..."
              className="w-full px-4 py-3 pl-12 bg-white dark:bg-gray-800 border dark:border-gray-700 rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 dark:text-white"
              style={{ fontSize: '16px' }}
            />
            <SearchIcon className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
          </div>
        </form>

        <div className="mb-6 overflow-x-auto">
          <div className="border-b dark:border-gray-700 inline-flex space-x-8">
            <nav className="flex">
              {tabs.map(({ id, label, icon: Icon }) => (
                <button
                  key={id}
                  onClick={() => setActiveTab(id)}
                  className={`flex items-center space-x-2 py-4 px-3 border-b-2 font-medium text-sm whitespace-nowrap ${
                    activeTab === id
                      ? 'border-blue-500 text-blue-600 dark:text-blue-400'
                      : 'border-transparent text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-300'
                  }`}
                >
                  <Icon className="w-5 h-5" />
                  <span>{label}</span>
                  {id === 'people' && results.users.length > 0 && (
                    <span className="ml-2 bg-blue-100 text-blue-600 dark:bg-blue-900 dark:text-blue-300 px-2 py-0.5 rounded-full text-xs">
                      {results.users.length}
                    </span>
                  )}
                </button>
              ))}
            </nav>
          </div>
        </div>

        {isLoading ? (
          <SearchSkeleton />
        ) : (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.2 }}
          >
            {(activeTab === 'all' || activeTab === 'people') &&
              results.users.length > 0 && (
                <div className="mb-8 w-full overflow-hidden">
                  <h2 className="text-lg font-semibold mb-4 dark:text-white">
                    People
                  </h2>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {results.users.map((user) => (
                      <div
                        key={user.id}
                        className="flex items-center space-x-4 p-4 bg-white dark:bg-gray-800 rounded-lg shadow-sm"
                      >
                        <img
                          src={
                            user.avatar_url ||
                            `https://api.dicebear.com/9.x/adventurer-neutral/svg?backgroundColor=b6e3f4,c0aede,d1d4f9`
                          }
                          alt=""
                          className="w-12 h-12 rounded-full"
                        />
                        <div>
                          <div className="font-medium dark:text-white">
                            {user.full_name}
                          </div>
                          <div className="text-sm text-gray-500 dark:text-gray-400">
                            @{user.username}
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

            {(activeTab === 'all' || activeTab === 'posts') &&
              results.posts.length > 0 && (
                <div className="mb-8 w-full overflow-hidden">
                  <h2 className="text-lg font-semibold mb-4 dark:text-white">
                    Posts
                  </h2>
                  <div className="space-y-4">
                    {results.posts.map((post) => (
                      <Post key={post.id} post={post} currentUser={currentUser} />
                    ))}
                  </div>
                </div>
              )}

            {(activeTab === 'all' || activeTab === 'hashtags') &&
              results.hashtags.length > 0 && (
                <div className="mb-8 w-full overflow-hidden">
                  <h2 className="text-lg font-semibold mb-4 dark:text-white">
                    Posts with Hashtags
                  </h2>
                  <div className="space-y-4">
                    {results.hashtags.map((post) => (
                      <Post key={post.id} post={post} currentUser={currentUser} />
                    ))}
                  </div>
                </div>
              )}

            {!isLoading &&
              query &&
              Object.values(results).every((arr) => arr.length === 0) && (
                <div className="text-center py-8">
                  <p className="text-gray-500 dark:text-gray-400">
                    No results found for "{query}"
                  </p>
                </div>
              )}
          </motion.div>
        )}
      </div>
    </div>
  );
}

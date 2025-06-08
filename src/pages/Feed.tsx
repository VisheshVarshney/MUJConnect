import React, { useState, useEffect } from 'react';
import { supabase } from '../lib/supabase';
import { toast } from 'react-hot-toast';
import FeedHeader from '../components/feed/FeedHeader';
import FeedContent from '../components/feed/FeedContent';
import FeedSidebar from '../components/feed/FeedSidebar';

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
        .order('created_at', { ascending: false });

      if (postsError) throw postsError;
      
      if (data) {
        const processedPosts = data.map(post => {
          if (post.media_files && post.media_files.length > 0) {
            post.media_files = post.media_files.map((file: any) => ({
              ...file,
              url: getMediaUrl(file.file_path)
            }));
          }
          return post;
        });
        
        setPosts(processedPosts);
      }
    } catch (error: any) {
      console.error('Error fetching posts:', error);
      setError(error.message);
    } finally {
      setIsLoading(false);
    }
  };

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

  const handlePostCreated = async (newPost: any) => {
    try {
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
        if (post.media_files && post.media_files.length > 0) {
          post.media_files = post.media_files.map((file: any) => ({
            ...file,
            url: getMediaUrl(file.file_path)
          }));
        }

        setPosts(prevPosts => [post, ...prevPosts]);
      }
    } catch (error) {
      console.error('Error processing new post:', error);
      toast.error('Error loading new post');
    }
  };

  const handleLikeChange = (postId: string, newLikes: any[]) => {
    setPosts(prevPosts => prevPosts.map(post =>
      post.id === postId ? { ...post, likes: newLikes } : post
    ));
  };

  const getMediaUrl = (filePath: string): string => {
    if (!filePath) return '';
    
    const { data: { publicUrl } } = supabase.storage
      .from('post-media')
      .getPublicUrl(filePath);

    return publicUrl;
  };

  return (
    <div className="max-w-7xl mx-auto px-4">
      <div className="grid grid-cols-12 gap-6">
        <div className="col-span-12 lg:col-span-8">
          <FeedHeader
            currentUser={currentUser}
            onPostCreated={handlePostCreated}
          />
          
          <FeedContent
            posts={posts}
            currentUser={currentUser}
            isLoading={isLoading}
            error={error}
            onPostDelete={fetchPosts}
            onPostUpdate={fetchPosts}
            onLikeChange={handleLikeChange}
          />
        </div>
        
        <FeedSidebar
          following={following}
          suggestedUsers={suggestedUsers}
          currentUser={currentUser}
          isLoading={isLoading}
          onFollow={handleFollow}
        />
      </div>
    </div>
  );
}
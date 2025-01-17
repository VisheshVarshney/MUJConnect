import React, { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { supabase } from '../lib/supabase';
import CreatePost from '../components/CreatePost';
import Post from '../components/Post';

export default function Feed() {
    const [posts, setPosts] = useState<any[]>([]);
  const [currentUser, setCurrentUser] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    fetchPosts();
    getCurrentUser();
  }, []);

  const fetchPosts = async () => {
    const { data } = await supabase
      .from('posts')
      .select('*, profiles(*), likes(*)')
      .order('created_at', { ascending: false });
    
    if (data) setPosts(data);
  };

  const getCurrentUser = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (user) {
        const { data: profile } = await supabase
          .from('profiles')
          .select('*')
          .eq('id', user.id)
          .maybeSingle(); // Use maybeSingle instead of single to avoid error
        
        if (!profile) {
          // Create profile if it doesn't exist
          const { data: newProfile } = await supabase
            .from('profiles')
            .insert({
              id: user.id,
              username: user.email?.split('@')[0], // Temporary username
              full_name: 'User' // Temporary name
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
    } finally {
      setIsLoading(false);
    }
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500"></div>
      </div>
    );
  }

  const handlePostDelete = () => {
    fetchPosts(); // Refresh the posts list after deletion
  };

  return (
    <div className="max-w-2xl mx-auto px-4">
      <CreatePost />
      
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        className="space-y-6"
      >
        {posts.map((post) => (
          <Post 
            key={post.id} 
            post={post} 
            currentUser={currentUser}
            onDelete={handlePostDelete}
          />
        ))}
      </motion.div>
    </div>
  );
}
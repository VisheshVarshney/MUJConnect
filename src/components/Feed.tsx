import React, { useState, useEffect, useCallback } from 'react';
import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';
import { supabase, getMediaUrl } from '../lib/supabase';
import CreatePost from '../components/CreatePost';
import Post from '../components/Post';
import { PostSkeleton } from '../components/PostSkeleton';
import { FollowingSkeleton } from '../components/Skeleton';
import StarBorder from '../components/StarBorder';
import { LogIn, UserPlus, Users, Utensils, ChevronRight } from 'lucide-react';
import { toast } from 'react-hot-toast';

export default function Feed() {
  // State declarations remain the same...

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

  // Rest of the component remains the same...
}
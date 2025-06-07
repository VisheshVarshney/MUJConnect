import React from 'react';
import { motion } from 'framer-motion';
import Post from '../Post';
import { PostSkeleton } from '../PostSkeleton';
import StarBorder from '../StarBorder';

interface FeedContentProps {
  posts: any[];
  currentUser: any;
  isLoading: boolean;
  error: string | null;
  onPostDelete: () => void;
  onPostUpdate: () => void;
}

export default function FeedContent({
  posts,
  currentUser,
  isLoading,
  error,
  onPostDelete,
  onPostUpdate
}: FeedContentProps) {
  console.log('FeedContent currentUser:', currentUser); // Debug log
  return (
    <div className="col-span-12 lg:col-span-8">
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
                  onDelete={onPostDelete}
                  onUpdate={onPostUpdate}
                />
              </StarBorder>
            </div>
          ))
        )}
      </motion.div>
    </div>
  );
}
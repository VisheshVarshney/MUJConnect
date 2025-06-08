import React from 'react';
import { Link } from 'react-router-dom';
import { LogIn, UserPlus } from 'lucide-react';
import CreatePost from '../CreatePost';

interface FeedHeaderProps {
  currentUser: any;
  onPostCreated: (post: any) => void;
}

export default function FeedHeader({ currentUser, onPostCreated }: FeedHeaderProps) {
  return (
    <>
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
        <CreatePost onPostCreated={onPostCreated} currentUser={currentUser} />
      )}
    </>
  );
}
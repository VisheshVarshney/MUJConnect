import React from 'react';
import { Link } from 'react-router-dom';
import { Users, Utensils, ChevronRight } from 'lucide-react';
import { FollowingSkeleton } from '../Skeleton';
import { toast } from 'react-hot-toast';
import { supabase } from '../../lib/supabase';

interface FeedSidebarProps {
  following: any[];
  suggestedUsers: any[];
  currentUser: any;
  isLoading: boolean;
  onFollow: (userId: string) => Promise<void>;
}

export default function FeedSidebar({
  following,
  suggestedUsers,
  currentUser,
  isLoading,
  onFollow,
}: FeedSidebarProps) {
  return (
    <div className="hidden lg:block col-span-4">
      <div className="sticky top-20 space-y-6 max-h-[calc(100vh-5rem)] overflow-y-auto hide-scrollbar">
        {/* Following Section */}
        <div className="bg-white dark:bg-amoled rounded-xl shadow-md p-6">
          <h2 className="text-lg font-semibold mb-4 text-gray-900 dark:text-white flex items-center">
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
                        src={
                          follow.profiles.avatar_url ||
                          `https://api.dicebear.com/9.x/adventurer-neutral/svg?seed=${follow.profiles.id}`
                        }
                        alt=""
                        className="w-10 h-10 rounded-full"
                      />
                      <div>
                        <div className="font-medium text-gray-900 dark:text-white">
                          {follow.profiles.full_name}
                        </div>
                        <div className="text-sm text-gray-600 dark:text-gray-400">
                          @{follow.profiles.username}
                        </div>
                      </div>
                    </div>
                  </Link>
                ))}

                {following.length < 5 && suggestedUsers.length > 0 && (
                  <>
                    <div className="text-sm font-medium text-gray-700 dark:text-gray-300 mt-6 mb-4">
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
                            src={
                              user.avatar_url ||
                              `https://api.dicebear.com/9.x/adventurer-neutral/svg?seed=${user.id}`
                            }
                            alt=""
                            className="w-10 h-10 rounded-full"
                          />
                          <div>
                            <div className="font-medium text-gray-900 dark:text-white">
                              {user.full_name}
                            </div>
                            <div className="text-sm text-gray-600 dark:text-gray-400">
                              @{user.username}
                            </div>
                          </div>
                        </Link>
                        <button
                          onClick={(e) => {
                            e.preventDefault();
                            onFollow(user.id);
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
            {[
              {
                id: 'f6126fc6-7b2b-416c-a219-a1ce94d930d0',
                name: 'Dialog Cafe',
                image: 'https://i.imgur.com/7lPqEEP.jpeg',
              },
              {
                id: 'c2f0a3a0-72c5-4db9-91af-7432c0b97e18',
                name: "Let's Go Live",
                image: 'https://i.imgur.com/tiJicH8.png',
              },
              {
                id: 'fdbe303b-5bae-45a1-89d7-929f7a2178d8',
                name: 'China Town',
                image: 'https://i.imgur.com/pn6EZej.png',
              },
            ].map((restaurant) => (
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
  );
}

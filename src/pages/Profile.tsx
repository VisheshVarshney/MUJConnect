import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { supabase } from '../lib/supabase';
import { Settings, MapPin, Calendar, Camera, X, UserMinus, UserPlus } from 'lucide-react';
import { format } from 'date-fns';
import { toast } from 'react-hot-toast';
import Post from '../components/Post';

export default function Profile() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [profile, setProfile] = useState<any>(null);
  const [posts, setPosts] = useState<any[]>([]);
  const [isEditing, setIsEditing] = useState(false);
  const [currentUser, setCurrentUser] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isFollowing, setIsFollowing] = useState(false);
  const [editForm, setEditForm] = useState({
    full_name: '',
    username: '',
    bio: '',
    settings: {
      email_notifications: true,
      show_activity: true,
      theme: 'light'
    }
  });

  useEffect(() => {
    loadProfile();
  }, [id]);

  useEffect(() => {
    if (profile?.id) {
      checkFollowStatus(profile.id);
    }
  }, [profile?.id]);

  const checkFollowStatus = async (profileId: string) => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      const { data: follow } = await supabase
        .from('follows')
        .select('*')
        .eq('follower_id', user.id)
        .eq('following_id', profileId)
        .single();

      setIsFollowing(!!follow);
    } catch (error) {
      console.error('Error checking follow status:', error);
    }
  };

  const handleFollow = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        toast.error('Please log in to follow users');
        return;
      }

      if (isFollowing) {
        // Unfollow
        const { error } = await supabase
          .from('follows')
          .delete()
          .match({ follower_id: user.id, following_id: profile.id });

        if (error) throw error;
        setIsFollowing(false);
        toast.success('User unfollowed successfully');
      } else {
        // Follow
        const { error } = await supabase
          .from('follows')
          .insert({ follower_id: user.id, following_id: profile.id });

        if (error) throw error;
        setIsFollowing(true);
        toast.success('User followed successfully');
      }
    } catch (error: any) {
      toast.error('Error updating follow status');
    }
  };

  const loadProfile = async () => {
    try {
      setIsLoading(true);
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        navigate('/login');
        return;
      }

      // Get current user's profile for permissions
      const { data: currentUserProfile } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', user.id)
        .single();
      
      setCurrentUser(currentUserProfile);

      // Handle 'me' route
      const profileId = id === 'me' ? user.id : id;

      const { data: profileData } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', profileId)
        .single();

      if (profileData) {
        setProfile(profileData);
        setEditForm({
          full_name: profileData.full_name,
          username: profileData.username,
          bio: profileData.bio || '',
          settings: profileData.settings || {
            email_notifications: true,
            show_activity: true,
            theme: 'light'
          }
        });
        
        // Fetch posts
        let query = supabase
          .from('posts')
          .select('*, profiles(*), likes(*), comments(*)')
          .eq('user_id', profileId)
          .order('created_at', { ascending: false });

        // If not superadmin and viewing someone else's profile, exclude anonymous posts
        if (!currentUserProfile?.is_superadmin && profileId !== user.id) {
          query = query.eq('is_anonymous', false);
        }

        const { data: postsData } = await query;
        if (postsData) setPosts(postsData);
      }
    } catch (error) {
      console.error('Error loading profile:', error);
      toast.error('Error loading profile');
    } finally {
      setIsLoading(false);
    }
  };

  const handleUpdateProfile = async () => {
    try {
      // Allow superadmin to update any profile
      if (!currentUser?.is_superadmin && currentUser?.id !== profile.id) {
        throw new Error('Unauthorized');
      }

      const { error } = await supabase
        .from('profiles')
        .update({
          full_name: editForm.full_name,
          username: editForm.username,
          bio: editForm.bio,
          settings: editForm.settings,
          updated_at: new Date().toISOString()
        })
        .eq('id', profile.id);

      if (error) throw error;
      
      setProfile({
        ...profile,
        ...editForm
      });
      setIsEditing(false);
      toast.success('Profile updated successfully');
    } catch (error: any) {
      toast.error('Error updating profile');
    }
  };

  const handleAvatarUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    try {
      const fileExt = file.name.split('.').pop();
      const fileName = `${profile.id}/${Math.random()}.${fileExt}`;

      const { error: uploadError } = await supabase.storage
        .from('avatars')
        .upload(fileName, file);

      if (uploadError) throw uploadError;

      const { data: { publicUrl } } = supabase.storage
        .from('avatars')
        .getPublicUrl(fileName);

      const { error: updateError } = await supabase
        .from('profiles')
        .update({ avatar_url: publicUrl })
        .eq('id', profile.id);

      if (updateError) throw updateError;

      setProfile({
        ...profile,
        avatar_url: publicUrl
      });

      toast.success('Avatar updated successfully');
    } catch (error: any) {
      toast.error('Error uploading avatar');
    }
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500"></div>
      </div>
    );
  }

  if (!profile) {
    return (
      <div className="max-w-4xl mx-auto px-4 py-8 text-center">
        <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Profile not found</h1>
        <p className="mt-2 text-gray-600 dark:text-gray-400">The profile you're looking for doesn't exist.</p>
      </div>
    );
  }

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="max-w-4xl mx-auto px-4 py-8"
    >
      <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg overflow-hidden">
        <div className="h-48 bg-gradient-to-r from-blue-400 to-purple-500"></div>
        
        <div className="relative px-6 pb-6">
          <div className="flex justify-between items-end -mt-16">
            <div className="relative">
              <img
                src={profile.avatar_url || `https://api.dicebear.com/7.x/avatars/svg?seed=${profile.username}`}
                alt={profile.username}
                className="w-32 h-32 rounded-full border-4 border-white bg-white dark:border-gray-800"
              />
              {(currentUser?.id === profile.id || currentUser?.is_superadmin) && (
                <label className="absolute bottom-0 right-0 p-2 bg-white dark:bg-gray-700 rounded-full shadow-lg cursor-pointer">
                  <Camera className="w-5 h-5 text-gray-600 dark:text-gray-300" />
                  <input
                    type="file"
                    accept="image/*"
                    onChange={handleAvatarUpload}
                    className="hidden"
                  />
                </label>
              )}
            </div>
            
            <div className="flex space-x-4">
              {(currentUser?.id === profile.id || currentUser?.is_superadmin) && (
                <button
                  onClick={() => setIsEditing(true)}
                  className="px-6 py-2 bg-blue-500 text-white rounded-full hover:bg-blue-600 transition-colors"
                >
                  Edit Profile
                </button>
              )}
              {currentUser?.id !== profile.id && (
                <button
                  onClick={handleFollow}
                  className={`px-6 py-2 rounded-full transition-colors flex items-center space-x-2 ${
                    isFollowing
                      ? 'bg-red-500 hover:bg-red-600 text-white'
                      : 'bg-blue-500 hover:bg-blue-600 text-white'
                  }`}
                >
                  {isFollowing ? (
                    <>
                      <UserMinus className="w-4 h-4" />
                      <span>Unfollow</span>
                    </>
                  ) : (
                    <>
                      <UserPlus className="w-4 h-4" />
                      <span>Follow</span>
                    </>
                  )}
                </button>
              )}
            </div>
          </div>

          <AnimatePresence>
            {isEditing ? (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="mt-6 space-y-4"
              >
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">Full Name</label>
                  <input
                    type="text"
                    value={editForm.full_name}
                    onChange={(e) => setEditForm({ ...editForm, full_name: e.target.value })}
                    className="mt-1 block w-full rounded-md border-gray-300 dark:border-gray-600 dark:bg-gray-700 dark:text-white shadow-sm focus:border-blue-500 focus:ring-blue-500"
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">Username</label>
                  <input
                    type="text"
                    value={editForm.username}
                    onChange={(e) => setEditForm({ ...editForm, username: e.target.value })}
                    className="mt-1 block w-full rounded-md border-gray-300 dark:border-gray-600 dark:bg-gray-700 dark:text-white shadow-sm focus:border-blue-500 focus:ring-blue-500"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">Bio</label>
                  <textarea
                    value={editForm.bio}
                    onChange={(e) => setEditForm({ ...editForm, bio: e.target.value })}
                    rows={3}
                    className="mt-1 block w-full rounded-md border-gray-300 dark:border-gray-600 dark:bg-gray-700 dark:text-white shadow-sm focus:border-blue-500 focus:ring-blue-500"
                  />
                </div>

                <div className="space-y-2">
                  <h3 className="text-lg font-medium text-gray-900 dark:text-white">Settings</h3>
                  
                  <label className="flex items-center space-x-2">
                    <input
                      type="checkbox"
                      checked={editForm.settings.email_notifications}
                      onChange={(e) => setEditForm({
                        ...editForm,
                        settings: {
                          ...editForm.settings,
                          email_notifications: e.target.checked
                        }
                      })}
                      className="rounded text-blue-500 focus:ring-blue-500 dark:bg-gray-700"
                    />
                    <span className="text-gray-700 dark:text-gray-300">Email Notifications</span>
                  </label>

                  <label className="flex items-center space-x-2">
                    <input
                      type="checkbox"
                      checked={editForm.settings.show_activity}
                      onChange={(e) => setEditForm({
                        ...editForm,
                        settings: {
                          ...editForm.settings,
                          show_activity: e.target.checked
                        }
                      })}
                      className="rounded text-blue-500 focus:ring-blue-500 dark:bg-gray-700"
                    />
                    <span className="text-gray-700 dark:text-gray-300">Show Activity</span>
                  </label>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">Theme</label>
                    <select
                      value={editForm.settings.theme}
                      onChange={(e) => setEditForm({
                        ...editForm,
                        settings: {
                          ...editForm.settings,
                          theme: e.target.value
                        }
                      })}
                      className="mt-1 block w-full rounded-md border-gray-300 dark:border-gray-600 dark:bg-gray-700 dark:text-white shadow-sm focus:border-blue-500 focus:ring-blue-500"
                    >
                      <option value="light">Light</option>
                      <option value="dark">Dark</option>
                    </select>
                  </div>
                </div>

                <div className="flex space-x-4">
                  <button
                    onClick={handleUpdateProfile}
                    className="px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600"
                  >
                    Save Changes
                  </button>
                  <button
                    onClick={() => setIsEditing(false)}
                    className="px-4 py-2 bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-300 rounded-lg hover:bg-gray-300 dark:hover:bg-gray-600"
                  >
                    Cancel
                  </button>
                </div>
              </motion.div>
            ) : (
              <div className="mt-4">
                <h1 className="text-2xl font-bold text-gray-900 dark:text-white">{profile.full_name}</h1>
                <p className="text-gray-600 dark:text-gray-400">@{profile.username}</p>
                
                {profile.bio && (
                  <p className="mt-4 text-gray-700 dark:text-gray-300">{profile.bio}</p>
                )}

                <div className="mt-4 flex items-center space-x-4 text-gray-600 dark:text-gray-400">
                  <div className="flex items-center">
                    <MapPin className="w-4 h-4 mr-1" />
                    <span>Earth</span>
                  </div>
                  <div className="flex items-center">
                    <Calendar className="w-4 h-4 mr-1" />
                    <span>Joined {format(new Date(profile.created_at), 'MMMM yyyy')}</span>
                  </div>
                </div>

                <div className="mt-6 flex space-x-4">
                  <div className="text-center">
                    <div className="font-bold text-gray-900 dark:text-white">{posts.length}</div>
                    <div className="text-gray-600 dark:text-gray-400">Posts</div>
                  </div>
                  <div className="text-center">
                    <div className="font-bold text-gray-900 dark:text-white">0</div>
                    <div className="text-gray-600 dark:text-gray-400">Followers</div>
                  </div>
                  <div className="text-center">
                    <div className="font-bold text-gray-900 dark:text-white">0</div>
                    <div className="text-gray-600 dark:text-gray-400">Following</div>
                  </div>
                </div>
              </div>
            )}
          </AnimatePresence>
        </div>
      </div>

      <div className="mt-8 space-y-6">
        {posts.map((post) => (
          <Post 
            key={post.id} 
            post={post} 
            currentUser={currentUser}
            onDelete={() => {
              setPosts(posts.filter(p => p.id !== post.id));
            }}
          />
        ))}
        {posts.length === 0 && (
          <div className="text-center py-8">
            <p className="text-gray-500 dark:text-gray-400">No posts yet</p>
          </div>
        )}
      </div>
    </motion.div>
  );
}
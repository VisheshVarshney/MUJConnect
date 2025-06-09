import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { supabase } from '../lib/supabase';
import { Settings, MapPin, Calendar, Camera, X, Shield, Star } from 'lucide-react';
import { format } from 'date-fns';
import { toast } from 'react-hot-toast';
import Post from '../components/Post';
import FancyFollowButton from '../components/FancyFollowButton';
import Cropper from 'react-easy-crop';

interface Point { x: number; y: number }
interface Area { x: number; y: number; width: number; height: number }

interface Profile {
  id: string;
  full_name: string;
  username: string;
  bio: string | null;
  avatar_url: string | null;
  banner_url: string | null;
  email: string | null;
  is_superadmin: boolean;
  address: string | null;
  is_hostel: boolean;
  hostel_block: string | null;
  created_at: string;
  updated_at: string;
}

export default function Profile() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [profile, setProfile] = useState<Profile | null>(null);
  const [posts, setPosts] = useState<any[]>([]);
  const [isEditing, setIsEditing] = useState(false);
  const [currentUser, setCurrentUser] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isFollowing, setIsFollowing] = useState(false);
  const [followers, setFollowers] = useState<any[]>([]);
  const [following, setFollowing] = useState<any[]>([]);
  const [showCropper, setShowCropper] = useState(false);
  const [image, setImage] = useState<string | null>(null);
  const [crop, setCrop] = useState<Point>({ x: 0, y: 0 });
  const [zoom, setZoom] = useState(1);
  const [croppedArea, setCroppedArea] = useState<Area | null>(null);
  const [editForm, setEditForm] = useState({
    full_name: '',
    username: '',
    bio: '',
    banner_url: '',
    address: '',
    is_hostel: false,
    hostel_block: '',
    currentPassword: '',
    newPassword: ''
  });

  useEffect(() => {
    loadProfile();
  }, [id]);

  useEffect(() => {
    if (profile?.id) {
      checkFollowStatus(profile.id);
      fetchFollowCounts();
    }
  }, [profile?.id]);

  const fetchFollowCounts = async () => {
    if (!profile?.id) return;

    try {
      // Get followers
      const { data: followersData } = await supabase
        .from('follows')
        .select('follower_id')
        .eq('following_id', profile.id);

      // Get following
      const { data: followingData } = await supabase
        .from('follows')
        .select('following_id')
        .eq('follower_id', profile.id);

      setFollowers(followersData || []);
      setFollowing(followingData || []);
    } catch (error) {
      console.error('Error fetching follow counts:', error);
    }
  };

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

      if (!profile) {
        toast.error('Profile not loaded');
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
        setFollowers(prev => prev.filter(f => f.follower_id !== user.id));
        toast.success('User unfollowed successfully');
      } else {
        // Follow
        const { error } = await supabase
          .from('follows')
          .insert({ follower_id: user.id, following_id: profile.id });

        if (error) throw error;
        setIsFollowing(true);
        setFollowers(prev => [...prev, { follower_id: user.id }]);
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
      
      // Get current user's profile for permissions if logged in
      if (user) {
        const { data: currentUserProfile } = await supabase
          .from('profiles')
          .select('*')
          .eq('id', user.id)
          .single();
        
        setCurrentUser(currentUserProfile);
      }

      // Handle 'me' route
      const profileId = id === 'me' ? user?.id : id;
      if (!profileId) {
        navigate('/login');
        return;
      }

      const { data: profileData } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', profileId)
        .single();

      if (profileData) {
        const typedProfile: Profile = {
          id: profileData.id,
          full_name: profileData.full_name,
          username: profileData.username,
          bio: profileData.bio || '',
          avatar_url: profileData.avatar_url,
          banner_url: profileData.banner_url,
          email: profileData.email,
          is_superadmin: profileData.is_superadmin,
          address: profileData.address || '',
          is_hostel: profileData.is_hostel || false,
          hostel_block: profileData.hostel_block || '',
          created_at: profileData.created_at,
          updated_at: profileData.updated_at
        };

        setProfile(typedProfile);
        setEditForm({
          full_name: typedProfile.full_name,
          username: typedProfile.username,
          bio: typedProfile.bio || '',
          banner_url: typedProfile.banner_url || '',
          address: typedProfile.address || '',
          is_hostel: typedProfile.is_hostel || false,
          hostel_block: typedProfile.hostel_block || '',
          currentPassword: '',
          newPassword: ''
        });
        
        // Fetch posts
        let query = supabase
          .from('posts')
          .select('*, profiles(*), likes(*), comments(*)')
          .eq('user_id', profileId)
          .order('created_at', { ascending: false });

        // If not superadmin and viewing someone else's profile, exclude anonymous posts
        if (!currentUser?.is_superadmin && profileId !== user?.id) {
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
      if (!profile) {
        toast.error('Profile not loaded');
        return;
      }

      // Allow superadmin to update any profile
      if (!currentUser?.is_superadmin && currentUser?.id !== profile.id) {
        throw new Error('Unauthorized');
      }

      // Validate hostel block if is_hostel is true
      if (editForm.is_hostel && !editForm.hostel_block?.trim()) {
        toast.error('Please enter your hostel block');
        return;
      }

      // Prepare update data
      const updateData: Partial<Profile> = {
        full_name: editForm.full_name.trim(),
        username: editForm.username.trim(),
        bio: editForm.bio?.trim() || null,
        banner_url: editForm.banner_url || null,
        address: editForm.is_hostel ? null : editForm.address?.trim() || null,
        is_hostel: editForm.is_hostel,
        hostel_block: editForm.is_hostel ? editForm.hostel_block.trim() : null,
        updated_at: new Date().toISOString()
      };

      const { error: updateError } = await supabase
        .from('profiles')
        .update(updateData)
        .eq('id', profile.id);

      if (updateError) {
        console.error('Profile update error:', updateError);
        throw updateError;
      }
      
      setProfile((prevProfile: Profile | null) => {
        if (!prevProfile) return null;
        return {
          ...prevProfile,
          ...updateData
        };
      });
      setIsEditing(false);
      toast.success('Profile updated successfully');
    } catch (error: any) {
      console.error('Error updating profile:', error);
      toast.error(error.message || 'Error updating profile');
    }
  };

  const handleAvatarUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    if (!profile) {
      toast.error('Profile not loaded');
      return;
    }

    const file = e.target.files?.[0];
    if (!file) return;

    // Check file size (max 5MB)
    if (file.size > 5 * 1024 * 1024) {
      toast.error('Image size should be less than 5MB');
      return;
    }

    // Check file type
    if (!file.type.startsWith('image/')) {
      toast.error('Please upload an image file');
      return;
    }

    const reader = new FileReader();
    reader.onload = () => {
      setImage(reader.result as string);
      setShowCropper(true);
    };
    reader.readAsDataURL(file);
  };

  const onCropComplete = (croppedArea: Area, croppedAreaPixels: Area) => {
    setCroppedArea(croppedAreaPixels);
  };

  const createImage = (url: string): Promise<HTMLImageElement> =>
    new Promise((resolve, reject) => {
      const image = new Image();
      image.addEventListener('load', () => resolve(image));
      image.addEventListener('error', error => reject(error));
      image.src = url;
    });

  const getCroppedImg = async (
    imageSrc: string,
    pixelCrop: Area
  ): Promise<Blob> => {
    const image = await createImage(imageSrc);
    const canvas = document.createElement('canvas');
    const ctx = canvas.getContext('2d');

    if (!ctx) {
      throw new Error('No 2d context');
    }

    canvas.width = pixelCrop.width;
    canvas.height = pixelCrop.height;

    ctx.drawImage(
      image,
      pixelCrop.x,
      pixelCrop.y,
      pixelCrop.width,
      pixelCrop.height,
      0,
      0,
      pixelCrop.width,
      pixelCrop.height
    );

    return new Promise((resolve) => {
      canvas.toBlob((blob) => {
        if (!blob) {
          throw new Error('Canvas is empty');
        }
        resolve(blob);
      }, 'image/jpeg');
    });
  };

  const handleSaveCroppedImage = async () => {
    try {
      if (!profile) {
        toast.error('Profile not loaded');
        return;
      }

      if (!image || !croppedArea) return;

      const croppedImage = await getCroppedImg(image, croppedArea);
      const fileName = `${profile.id}/banner_${Date.now()}.jpg`;

      const { error: uploadError } = await supabase.storage
        .from('banners')
        .upload(fileName, croppedImage);

      if (uploadError) throw uploadError;

      const { data: { publicUrl } } = supabase.storage
        .from('banners')
        .getPublicUrl(fileName);

      const { error: updateError } = await supabase
        .from('profiles')
        .update({ 
          banner_url: publicUrl,
          updated_at: new Date().toISOString()
        })
        .eq('id', profile.id);

      if (updateError) throw updateError;

      // Update both profile and editForm state immediately
      setProfile(prev => {
        if (!prev) return null;
        return {
          ...prev,
          banner_url: publicUrl
        };
      });

      setEditForm(prev => ({
        ...prev,
        banner_url: publicUrl
      }));

      setShowCropper(false);
      setImage(null);
      toast.success('Banner updated successfully');
    } catch (error: any) {
      console.error('Banner upload error:', error);
      toast.error(error.message || 'Error uploading banner');
    }
  };

  const handleBannerUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    if (!profile) {
      toast.error('Profile not loaded');
      return;
    }

    const file = e.target.files?.[0];
    if (!file) return;

    // Check file size (max 5MB)
    if (file.size > 5 * 1024 * 1024) {
      toast.error('Image size should be less than 5MB');
      return;
    }

    // Check file type
    if (!file.type.startsWith('image/')) {
      toast.error('Please upload an image file');
      return;
    }

    const reader = new FileReader();
    reader.onload = () => {
      setImage(reader.result as string);
      setShowCropper(true);
    };
    reader.readAsDataURL(file);
  };

  const handlePasswordChange = async () => {
    try {
      // Get current user first
      const { data: { user }, error: userError } = await supabase.auth.getUser();
      if (userError) {
        console.error('Auth error:', userError);
        toast.error('Authentication error');
        return;
      }
      
      if (!user) {
        toast.error('Please log in to change your password');
        return;
      }

      if (!editForm.currentPassword || !editForm.newPassword) {
        toast.error('Please enter both current and new password');
        return;
      }

      // First verify the current password
      const { error: signInError } = await supabase.auth.signInWithPassword({
        email: user.email || '',
        password: editForm.currentPassword
      });

      if (signInError) {
        toast.error('Current password is incorrect');
        return;
      }

      // Update the password
      const { error: updateError } = await supabase.auth.updateUser({
        password: editForm.newPassword
      });

      if (updateError) throw updateError;

      toast.success('Password updated successfully');
      setEditForm(prev => ({ ...prev, currentPassword: '', newPassword: '' }));
    } catch (error: any) {
      toast.error(error.message || 'Error updating password');
    }
  };

  const handlePasswordReset = async () => {
    try {
      // Get current user first
      const { data: { user }, error: userError } = await supabase.auth.getUser();
      if (userError) {
        console.error('Auth error:', userError);
        toast.error('Authentication error');
        return;
      }
      
      if (!user?.email) {
        toast.error('No email address found');
        return;
      }

      const { error } = await supabase.auth.resetPasswordForEmail(user.email, {
        redirectTo: `${window.location.origin}/reset-password`
      });

      if (error) throw error;

      toast.success('Password reset email sent');
    } catch (error: any) {
      toast.error(error.message || 'Error sending reset email');
    }
  };

  const handleEmailChange = async () => {
    try {
      // Get current user first
      const { data: { user }, error: userError } = await supabase.auth.getUser();
      if (userError) {
        console.error('Auth error:', userError);
        toast.error('Authentication error');
        return;
      }
      
      if (!user) {
        toast.error('Please log in to change your email');
        return;
      }

      if (!user.email) {
        console.error('No email found for user:', user);
        toast.error('Email not found');
        return;
      }

      // Send verification email to current email
      const { error: otpError } = await supabase.auth.signInWithOtp({
        email: user.email,
        options: {
          emailRedirectTo: `${window.location.origin}/email-change`
        }
      });

      if (otpError) {
        console.error('OTP error:', otpError);
        throw otpError;
      }

      toast.success('Verification email sent to your current email address');
    } catch (error: any) {
      console.error('Email change error:', error);
      toast.error(error.message || 'Error sending verification email');
    }
  };

  if (isLoading) {
    return (
      <div className="max-w-4xl mx-auto px-4 py-8">
        <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg overflow-hidden">
          <div className="h-48 bg-gradient-to-r from-blue-400 to-purple-500"></div>
          
          <div className="relative px-6 pb-6">
            <div className="flex justify-between items-end -mt-16">
              <div className="relative">
                <div className="w-32 h-32 rounded-full border-4 border-white dark:border-gray-800 bg-gray-200 dark:bg-gray-700 animate-pulse"></div>
              </div>
              
              <div className="flex space-x-4">
                <div className="w-24 h-10 bg-gray-200 dark:bg-gray-700 rounded-full animate-pulse"></div>
              </div>
            </div>

            <div className="mt-4 space-y-4">
              <div className="h-8 w-48 bg-gray-200 dark:bg-gray-700 rounded animate-pulse"></div>
              <div className="h-4 w-32 bg-gray-200 dark:bg-gray-700 rounded animate-pulse"></div>
              
              <div className="mt-4 flex items-center space-x-4">
                <div className="h-4 w-24 bg-gray-200 dark:bg-gray-700 rounded animate-pulse"></div>
                <div className="h-4 w-32 bg-gray-200 dark:bg-gray-700 rounded animate-pulse"></div>
              </div>

              <div className="mt-6 flex space-x-8">
                <div className="text-center">
                  <div className="h-6 w-8 bg-gray-200 dark:bg-gray-700 rounded animate-pulse"></div>
                  <div className="mt-1 h-4 w-16 bg-gray-200 dark:bg-gray-700 rounded animate-pulse"></div>
                </div>
                <div className="text-center">
                  <div className="h-6 w-8 bg-gray-200 dark:bg-gray-700 rounded animate-pulse"></div>
                  <div className="mt-1 h-4 w-20 bg-gray-200 dark:bg-gray-700 rounded animate-pulse"></div>
                </div>
                <div className="text-center">
                  <div className="h-6 w-8 bg-gray-200 dark:bg-gray-700 rounded animate-pulse"></div>
                  <div className="mt-1 h-4 w-20 bg-gray-200 dark:bg-gray-700 rounded animate-pulse"></div>
                </div>
              </div>
            </div>
          </div>
        </div>

        <div className="mt-8 space-y-6">
          {[1, 2, 3].map((i) => (
            <div key={i} className="bg-white dark:bg-gray-800 rounded-xl shadow-md p-6">
              <div className="flex items-center space-x-3">
                <div className="w-10 h-10 rounded-full bg-gray-200 dark:bg-gray-700 animate-pulse"></div>
                <div className="space-y-2">
                  <div className="h-4 w-32 bg-gray-200 dark:bg-gray-700 rounded animate-pulse"></div>
                  <div className="h-3 w-24 bg-gray-200 dark:bg-gray-700 rounded animate-pulse"></div>
                </div>
              </div>
              <div className="mt-4 space-y-2">
                <div className="h-4 w-full bg-gray-200 dark:bg-gray-700 rounded animate-pulse"></div>
                <div className="h-4 w-3/4 bg-gray-200 dark:bg-gray-700 rounded animate-pulse"></div>
              </div>
              <div className="mt-4 flex space-x-4">
                <div className="h-8 w-16 bg-gray-200 dark:bg-gray-700 rounded animate-pulse"></div>
                <div className="h-8 w-16 bg-gray-200 dark:bg-gray-700 rounded animate-pulse"></div>
                <div className="h-8 w-16 bg-gray-200 dark:bg-gray-700 rounded animate-pulse"></div>
              </div>
            </div>
          ))}
        </div>
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
        <div className="relative h-32 sm:h-48 bg-gradient-to-r from-blue-400 to-purple-500">
          {profile?.banner_url && (
            <img
              src={profile.banner_url}
              alt="Profile banner"
              className="w-full h-full object-cover"
            />
          )}
          {profile && (currentUser?.id === profile.id || currentUser?.is_superadmin) && (
            <label className="absolute bottom-4 right-4 p-2 bg-white dark:bg-gray-700 rounded-full shadow-lg cursor-pointer hover:bg-gray-100 dark:hover:bg-gray-600 transition-colors z-10">
              <Camera className="w-4 h-4 sm:w-5 sm:h-5 text-gray-600 dark:text-gray-300" />
              <input
                type="file"
                accept="image/*"
                onChange={handleBannerUpload}
                className="hidden"
                onClick={(e) => {
                  // Reset the input value to allow uploading the same file again
                  e.currentTarget.value = '';
                }}
              />
            </label>
          )}
        </div>
        
        <div className="relative px-4 sm:px-6 pb-6">
          <div className="flex flex-col sm:flex-row sm:justify-between sm:items-end -mt-12 sm:-mt-16">
            <div className="relative mx-auto sm:mx-0">
              <motion.img
                whileHover={{ scale: 1.05 }}
                transition={{ type: "spring", stiffness: 300 }}
                src={profile?.avatar_url || `https://api.dicebear.com/9.x/adventurer-neutral/svg?backgroundColor=b6e3f4,c0aede,d1d4f9`}
                alt={profile?.username}
                className="w-24 h-24 sm:w-32 sm:h-32 rounded-full border-4 border-white bg-white dark:border-gray-800"
              />
              {(currentUser?.id === profile?.id || currentUser?.is_superadmin) && (
                <label className="absolute bottom-0 right-0 p-1.5 sm:p-2 bg-white dark:bg-gray-700 rounded-full shadow-lg cursor-pointer hover:bg-gray-100 dark:hover:bg-gray-600 transition-colors">
                  <Camera className="w-4 h-4 sm:w-5 sm:h-5 text-gray-600 dark:text-gray-300" />
                  <input
                    type="file"
                    accept="image/*"
                    onChange={handleAvatarUpload}
                    className="hidden"
                  />
                </label>
              )}
            </div>
            
            <div className="flex justify-center sm:justify-end space-x-4 mt-4 sm:mt-0">
              {(currentUser?.id === profile?.id || currentUser?.is_superadmin) && (
                <motion.button
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  onClick={() => setIsEditing(true)}
                  className="px-4 sm:px-6 py-2 bg-blue-500 text-white rounded-full hover:bg-blue-600 transition-colors text-sm sm:text-base"
                >
                  Edit Profile
                </motion.button>
              )}
              {currentUser?.id !== profile?.id && (
                <FancyFollowButton
                  isFollowing={isFollowing}
                  onToggleFollow={handleFollow}
                  disabled={!currentUser}
                />
              )}
            </div>
          </div>

          <div className="mt-4 text-center sm:text-left">
            <div className="flex items-center justify-center sm:justify-start space-x-2">
              <h1 className="text-xl sm:text-2xl font-bold text-gray-900 dark:text-white">
                {profile?.full_name}
              </h1>
              {profile?.is_superadmin && (
                <div className="group relative">
                  <Shield className="w-4 h-4 sm:w-5 sm:h-5 text-blue-500" />
                  <div className="absolute bottom-full left-1/2 transform -translate-x-1/2 mb-2 px-2 py-1 bg-gray-900 text-white text-xs sm:text-sm rounded opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap">
                    Connect's Admin
                  </div>
                </div>
              )}
              {profile?.email === "varshneyvisheshin@gmail.com" && profile?.username === "vishesh" && (
                <div className="group relative">
                  <Star className="w-4 h-4 sm:w-5 sm:h-5 text-yellow-500" />
                  <div className="absolute bottom-full left-1/2 transform -translate-x-1/2 mb-2 px-2 py-1 bg-gray-900 text-white text-xs sm:text-sm rounded opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap">
                    Your friendly neighbourhood Vishesh
                  </div>
                </div>
              )}
            </div>
            <p className="text-sm sm:text-base text-gray-600 dark:text-gray-400">@{profile?.username}</p>
            {profile?.bio && (
              <p className="mt-2 text-sm sm:text-base text-gray-700 dark:text-gray-300">{profile.bio}</p>
            )}
            
            {/* Address/Hostel Info and Joined Date in a flex container */}
            <div className="mt-2 flex flex-wrap items-center justify-center sm:justify-start gap-x-4 gap-y-2 text-sm sm:text-base text-gray-600 dark:text-gray-400">
              {/* Address/Hostel Info */}
              {profile?.is_hostel ? (
                <div className="flex items-center space-x-2">
                  <MapPin className="w-4 h-4" />
                  <span>{profile.hostel_block} GHS Hostel, MUJ</span>
                </div>
              ) : profile?.address && (
                <div className="flex items-center space-x-2">
                  <MapPin className="w-4 h-4" />
                  <span>{profile.address}</span>
                </div>
              )}
              
              {/* Joined Date */}
              {profile?.created_at && (
                <div className="flex items-center space-x-2">
                  <Calendar className="w-4 h-4" />
                  <span>Joined {format(new Date(profile.created_at), 'MMMM yyyy')}</span>
                </div>
              )}
            </div>
          </div>

          <AnimatePresence>
            {isEditing ? (
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
                className="mt-6 space-y-4"
              >
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">Full Name</label>
                  <input
                    type="text"
                    value={editForm.full_name}
                    onChange={(e) => setEditForm({ ...editForm, full_name: e.target.value })}
                    className="mt-1 block w-full px-3 sm:px-4 py-2 sm:py-3 rounded-lg border-gray-300 dark:border-gray-600 dark:bg-gray-700 dark:text-white shadow-sm focus:border-blue-500 focus:ring-blue-500 text-base sm:text-lg"
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">Username</label>
                  <input
                    type="text"
                    value={editForm.username}
                    onChange={(e) => setEditForm({ ...editForm, username: e.target.value })}
                    className="mt-1 block w-full px-3 sm:px-4 py-2 sm:py-3 rounded-lg border-gray-300 dark:border-gray-600 dark:bg-gray-700 dark:text-white shadow-sm focus:border-blue-500 focus:ring-blue-500 text-base sm:text-lg"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">Bio</label>
                  <textarea
                    value={editForm.bio}
                    onChange={(e) => setEditForm({ ...editForm, bio: e.target.value })}
                    rows={4}
                    className="mt-1 block w-full px-3 sm:px-4 py-2 sm:py-3 rounded-lg border-gray-300 dark:border-gray-600 dark:bg-gray-700 dark:text-white shadow-sm focus:border-blue-500 focus:ring-blue-500 text-base sm:text-lg resize-none"
                  />
                </div>

                <div>
                  <label className="flex items-center space-x-2 mb-4">
                    <input
                      type="checkbox"
                      checked={editForm.is_hostel}
                      onChange={(e) => setEditForm({
                        ...editForm,
                        is_hostel: e.target.checked,
                        // Clear hostel block if not in hostel
                        hostel_block: e.target.checked ? editForm.hostel_block : ''
                      })}
                      className="w-4 h-4 sm:w-5 sm:h-5 rounded text-blue-500 focus:ring-blue-500 dark:bg-gray-700"
                    />
                    <span className="text-base sm:text-lg text-gray-700 dark:text-gray-300">I live in hostel</span>
                  </label>

                  {editForm.is_hostel ? (
                    <div>
                      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">Hostel Block</label>
                      <input
                        type="text"
                        value={editForm.hostel_block}
                        onChange={(e) => setEditForm({ ...editForm, hostel_block: e.target.value })}
                        placeholder="e.g., A, B, C, etc."
                        className="mt-1 block w-full px-3 sm:px-4 py-2 sm:py-3 rounded-lg border-gray-300 dark:border-gray-600 dark:bg-gray-700 dark:text-white shadow-sm focus:border-blue-500 focus:ring-blue-500 text-base sm:text-lg"
                      />
                    </div>
                  ) : (
                    <div>
                      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">Address</label>
                      <textarea
                        value={editForm.address}
                        onChange={(e) => setEditForm({ ...editForm, address: e.target.value })}
                        rows={3}
                        placeholder="Enter your address"
                        className="mt-1 block w-full px-3 sm:px-4 py-2 sm:py-3 rounded-lg border-gray-300 dark:border-gray-600 dark:bg-gray-700 dark:text-white shadow-sm focus:border-blue-500 focus:ring-blue-500 text-base sm:text-lg resize-none"
                      />
                    </div>
                  )}
                </div>

                <div className="flex space-x-4">
                  <motion.button
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    onClick={handleUpdateProfile}
                    className="flex-1 px-4 sm:px-6 py-2 sm:py-3 bg-blue-500 text-white rounded-lg hover:bg-blue-600 text-base sm:text-lg font-medium"
                  >
                    Save Changes
                  </motion.button>
                  <motion.button
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    onClick={() => setIsEditing(false)}
                    className="flex-1 px-4 sm:px-6 py-2 sm:py-3 bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-300 rounded-lg hover:bg-gray-300 dark:hover:bg-gray-600 text-base sm:text-lg font-medium"
                  >
                    Cancel
                  </motion.button>
                </div>

                {/* Account Credentials Section */}
                <div className="mt-8 border-t border-gray-200 dark:border-gray-700 pt-8">
                  <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-4">Account Credentials</h3>
                  
                  {/* Password Change */}
                  <div className="space-y-4">
                    <div>
                      <h4 className="text-base font-medium text-gray-700 dark:text-gray-300 mb-2">Change Password</h4>
                      <div className="space-y-4">
                        <div>
                          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">Current Password</label>
                          <input
                            type="password"
                            value={editForm.currentPassword || ''}
                            onChange={(e) => setEditForm({ ...editForm, currentPassword: e.target.value })}
                            className="mt-1 block w-full px-3 sm:px-4 py-2 sm:py-3 rounded-lg border-gray-300 dark:border-gray-600 dark:bg-gray-700 dark:text-white shadow-sm focus:border-blue-500 focus:ring-blue-500 text-base sm:text-lg"
                          />
                        </div>
                        <div>
                          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">New Password</label>
                          <input
                            type="password"
                            value={editForm.newPassword || ''}
                            onChange={(e) => setEditForm({ ...editForm, newPassword: e.target.value })}
                            className="mt-1 block w-full px-3 sm:px-4 py-2 sm:py-3 rounded-lg border-gray-300 dark:border-gray-600 dark:bg-gray-700 dark:text-white shadow-sm focus:border-blue-500 focus:ring-blue-500 text-base sm:text-lg"
                          />
                        </div>
                        <div className="flex space-x-4">
                          <motion.button
                            whileHover={{ scale: 1.05 }}
                            whileTap={{ scale: 0.95 }}
                            onClick={handlePasswordChange}
                            className="flex-1 px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors"
                          >
                            Update Password
                          </motion.button>
                          <motion.button
                            whileHover={{ scale: 1.05 }}
                            whileTap={{ scale: 0.95 }}
                            onClick={handlePasswordReset}
                            className="flex-1 px-4 py-2 bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-300 rounded-lg hover:bg-gray-300 dark:hover:bg-gray-600 transition-colors"
                          >
                            Forgot Password?
                          </motion.button>
                        </div>
                      </div>
                    </div>

                    {/* Email Change */}
                    <div>
                      <h4 className="text-base font-medium text-gray-700 dark:text-gray-300 mb-2">Change Email</h4>
                      <p className="text-sm text-gray-600 dark:text-gray-400 mb-4">
                        To change your email, you'll need to verify your current email first.
                      </p>
                      <motion.button
                        whileHover={{ scale: 1.05 }}
                        whileTap={{ scale: 0.95 }}
                        onClick={handleEmailChange}
                        className="w-full px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors"
                      >
                        Start Email Change Process
                      </motion.button>
                    </div>
                  </div>
                </div>
              </motion.div>
            ) : null}
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

      {/* Image Cropper Modal */}
      <AnimatePresence>
        {showCropper && image && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black bg-opacity-75 z-50 flex items-center justify-center p-4"
          >
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              className="bg-white dark:bg-gray-800 rounded-lg p-4 w-full max-w-4xl mx-auto"
            >
              <div className="relative w-full" style={{ paddingBottom: '22.22%' }}> {/* 9:2 aspect ratio container */}
                <div className="absolute inset-0">
                  <Cropper
                    image={image}
                    crop={crop}
                    zoom={zoom}
                    aspect={9/2}
                    onCropChange={(crop: Point) => setCrop(crop)}
                    onCropComplete={(croppedArea, croppedAreaPixels) => {
                      setCroppedArea(croppedAreaPixels);
                    }}
                    onZoomChange={(zoom: number) => setZoom(zoom)}
                    objectFit="horizontal-cover"
                    style={{
                      containerStyle: {
                        width: '100%',
                        height: '100%',
                        backgroundColor: '#333',
                      },
                      cropAreaStyle: {
                        border: '2px solid #fff',
                      },
                    }}
                  />
                </div>
              </div>
              <div className="flex flex-col space-y-4">
                <div className="flex items-center space-x-4">
                  <span className="text-sm text-gray-600 dark:text-gray-400">Zoom</span>
                  <input
                    type="range"
                    min={1}
                    max={3}
                    step={0.1}
                    value={zoom}
                    onChange={(e) => setZoom(Number(e.target.value))}
                    className="flex-1"
                  />
                </div>
                <div className="flex space-x-4">
                  <motion.button
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    onClick={handleSaveCroppedImage}
                    className="flex-1 px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors"
                  >
                    Save
                  </motion.button>
                  <motion.button
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    onClick={() => {
                      setShowCropper(false);
                      setImage(null);
                      setCrop({ x: 0, y: 0 });
                      setZoom(1);
                    }}
                    className="flex-1 px-4 py-2 bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-300 rounded-lg hover:bg-gray-300 dark:hover:bg-gray-600 transition-colors"
                  >
                    Cancel
                  </motion.button>
                </div>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
}
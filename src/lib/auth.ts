import { supabase } from './supabase';

export const getCurrentUser = async () => {
  try {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return null;

    const { data: profile } = await supabase
      .from('profiles')
      .select('*')
      .eq('id', user.id)
      .single();

    if (!profile) {
      // Create profile if it doesn't exist
      const { data: newProfile } = await supabase
        .from('profiles')
        .insert({
          id: user.id,
          username: user.email?.split('@')[0],
          full_name: 'User'
        })
        .select()
        .single();

      return newProfile;
    }

    return profile;
  } catch (error) {
    console.error('Error getting current user:', error);
    return null;
  }
}; 
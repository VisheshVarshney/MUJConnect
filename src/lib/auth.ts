import { supabase } from './supabase';
import type { User } from '@supabase/supabase-js';

export async function signIn(email: string, password: string) {
  const { data, error } = await supabase.auth.signInWithPassword({
    email,
    password
  });

  if (error) throw error;
  if (!data.user) throw new Error('No user data returned');

  // Fetch the user's superadmin status
  const { data: userData, error: userError } = await supabase
    .from('users')
    .select('is_superadmin')
    .eq('id', data.user.id)
    .single();

  if (userError) throw new Error('Failed to fetch user data');

  return {
    user: data.user,
    isSuperAdmin: userData?.is_superadmin || false
  };
}

export async function signOut() {
  const { error } = await supabase.auth.signOut();
  if (error) throw error;
}

export async function getCurrentUser(): Promise<{ user: User | null; isSuperAdmin: boolean }> {
  const { data: { user } } = await supabase.auth.getUser();
  
  if (!user) {
    return { user: null, isSuperAdmin: false };
  }

  const { data: userData, error } = await supabase
    .from('users')
    .select('is_superadmin')
    .eq('id', user.id)
    .single();

  if (error) {
    console.error('Error fetching user data:', error);
    return { user, isSuperAdmin: false };
  }

  return { 
    user, 
    isSuperAdmin: userData?.is_superadmin || false 
  };
}
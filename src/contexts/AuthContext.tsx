import React, { createContext, useContext, useEffect, useState } from 'react';
import { User } from '@supabase/supabase-js';
import { getCurrentUser } from '../lib/auth';
import { supabase } from '../lib/supabase';

interface AuthContextType {
  user: User | null;
  isSuperAdmin: boolean;
  loading: boolean;
  refreshUser: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType>({
  user: null,
  isSuperAdmin: false,
  loading: true,
  refreshUser: async () => {},
});

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [isSuperAdmin, setIsSuperAdmin] = useState(false);
  const [loading, setLoading] = useState(true);

  async function loadUser() {
    try {
      const { user, isSuperAdmin } = await getCurrentUser();
      setUser(user);
      setIsSuperAdmin(isSuperAdmin);
    } catch (error) {
      console.error('Error loading user:', error);
      setUser(null);
      setIsSuperAdmin(false);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    loadUser();

    const { data: { subscription } } = supabase.auth.onAuthStateChange((event, session) => {
      if (event === 'SIGNED_IN') {
        loadUser();
      } else if (event === 'SIGNED_OUT') {
        setUser(null);
        setIsSuperAdmin(false);
        setLoading(false);
      }
    });

    return () => {
      subscription.unsubscribe();
    };
  }, []);

  return (
    <AuthContext.Provider value={{ user, isSuperAdmin, loading, refreshUser: loadUser }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  return useContext(AuthContext);
}
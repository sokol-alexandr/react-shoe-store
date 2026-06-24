import { createContext, useContext, useState, useEffect, type ReactNode } from 'react';
import { supabase } from '../lib/supabase';
import type { User, Role } from '../types';

type AuthContextType = {
  user: User | null;
  isLoading: boolean; // True while verifying an active user session on application mount
  logout: () => Promise<void>;
};

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  // Helper method to convert a Supabase Auth user object into our internal domain User type
  const mapSupabaseUser = (sbUser: any): User | null => {
    if (!sbUser) return null;
    
    return {
      id: sbUser.id,
      name: sbUser.user_metadata?.name || 'Unknown User',
      role: (sbUser.user_metadata?.role as Role) || 'CUSTOMER',
    };
  };

  useEffect(() => {
    // 1. Initial check to see if a valid session token exists in local storage
    const checkActiveSession = async () => {
      const { data: { user: sbUser } } = await supabase.auth.getUser();
      setUser(mapSupabaseUser(sbUser));
      setIsLoading(false);
    };

    checkActiveSession();

    // 2. Global event listener that triggers on sign-in, sign-out, or token refreshes
    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      setUser(mapSupabaseUser(session?.user ?? null));
    });

    return () => {
      subscription.unsubscribe();
    };
  }, []);

  const logout = async () => {
    const { error } = await supabase.auth.signOut();
    if (error) console.error('Error signing out from Supabase:', error.message);
  };

  return (
    <AuthContext.Provider value={{ user, isLoading, logout }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}
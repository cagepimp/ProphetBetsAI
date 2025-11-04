import React, { createContext, useContext, useState, useEffect } from 'react';
import { supabase } from '@/api/supabaseClient';

const AuthContext = createContext({
  user: null,
  loading: true,
  error: null,
  signIn: null,
  signOut: null,
  signUp: null
});

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    // Get initial session
    const loadUser = async () => {
      try {
        const { data: { session }, error: sessionError } = await supabase.auth.getSession();

        if (sessionError) throw sessionError;

        setUser(session?.user ?? null);
        setError(null);
      } catch (err) {
        console.error('Failed to load user:', err);
        setError(err);
        setUser(null);
      } finally {
        setLoading(false);
      }
    };

    loadUser();

    // Listen for auth changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      setUser(session?.user ?? null);
      setLoading(false);
    });

    return () => subscription.unsubscribe();
  }, []);

  const signIn = async (email, password) => {
    try {
      const { data, error } = await supabase.auth.signInWithPassword({ email, password });
      if (error) throw error;
      setUser(data.user);
      return { success: true, user: data.user };
    } catch (err) {
      setError(err);
      return { success: false, error: err.message };
    }
  };

  const signUp = async (email, password, metadata = {}) => {
    try {
      const { data, error } = await supabase.auth.signUp({
        email,
        password,
        options: { data: metadata }
      });
      if (error) throw error;
      return { success: true, user: data.user };
    } catch (err) {
      setError(err);
      return { success: false, error: err.message };
    }
  };

  const signOut = async () => {
    try {
      const { error } = await supabase.auth.signOut();
      if (error) throw error;
      setUser(null);
      return { success: true };
    } catch (err) {
      setError(err);
      return { success: false, error: err.message };
    }
  };

  return (
    <AuthContext.Provider value={{ user, loading, error, signIn, signOut, signUp }}>
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

// Alias exports for convenience
export const ProphetBetAIContext = AuthContext;
export const ProphetBetAIProvider = AuthProvider;
export const useProphetBetAI = useAuth;

// Legacy exports for backward compatibility (deprecated)
export const Base44Context = AuthContext;
export const Base44Provider = AuthProvider;
export const useBase44 = useAuth;
'use server';

import { getSupabaseServer, getCurrentUser } from '@/lib/supabase-server';
import { redirect } from 'next/navigation';

export const signIn = async (email: string, password: string) => {
  const supabase = await getSupabaseServer();
  const { error, data } = await supabase.auth.signInWithPassword({
    email,
    password,
  });

  if (error) {
    return { error: error.message };
  }

  return { success: true, data };
};

export const signUp = async (email: string, password: string, fullName: string) => {
  const supabase = await getSupabaseServer();
  
  const { error, data } = await supabase.auth.signUp({
    email,
    password,
    options: {
      data: {
        full_name: fullName,
      },
      emailRedirectTo: process.env.NEXT_PUBLIC_DEV_SUPABASE_REDIRECT_URL || `${process.env.NEXT_PUBLIC_APP_URL}/auth/callback`,
    },
  });

  if (error) {
    return { error: error.message };
  }

  return { success: true, data };
};

export const signOut = async () => {
  const supabase = await getSupabaseServer();
  await supabase.auth.signOut();
  redirect('/auth/login');
};

export const checkAuth = async () => {
  const user = await getCurrentUser();
  if (!user) {
    redirect('/auth/login');
  }
  return user;
};

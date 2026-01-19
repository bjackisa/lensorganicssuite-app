'use server';

import { getSupabaseServer } from '@/lib/supabase-server';
import { revalidateTag, updateTag } from 'next/cache';

export const createFarm = async (
  name: string,
  location: string,
  acres: number,
  description?: string
) => {
  const supabase = await getSupabaseServer();

  try {
    const { data, error } = await supabase
      .from('farms')
      .insert([
        {
          name,
          location,
          acres,
          description,
          status: 'active',
        },
      ])
      .select()
      .single();

    if (error) {
      return { error: error.message };
    }

    revalidateTag('farms');
    updateTag('farms');

    return { success: true, data };
  } catch (error: any) {
    return { error: error.message };
  }
};

export const updateFarm = async (
  farmId: string,
  updates: {
    name?: string;
    location?: string;
    acres?: number;
    description?: string;
    status?: 'active' | 'inactive' | 'discontinued';
  }
) => {
  const supabase = await getSupabaseServer();

  try {
    const { data, error } = await supabase
      .from('farms')
      .update(updates)
      .eq('id', farmId)
      .select()
      .single();

    if (error) {
      return { error: error.message };
    }

    revalidateTag('farms');
    updateTag('farms');

    return { success: true, data };
  } catch (error: any) {
    return { error: error.message };
  }
};

export const getFarms = async () => {
  const supabase = await getSupabaseServer();

  const { data, error } = await supabase
    .from('farms')
    .select('*')
    .order('created_at', { ascending: false });

  if (error) {
    return { error: error.message };
  }

  return { success: true, data };
};

export const getFarmById = async (farmId: string) => {
  const supabase = await getSupabaseServer();

  const { data, error } = await supabase
    .from('farms')
    .select('*, crops(*)')
    .eq('id', farmId)
    .single();

  if (error) {
    return { error: error.message };
  }

  return { success: true, data };
};

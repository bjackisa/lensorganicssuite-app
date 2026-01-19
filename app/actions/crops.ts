'use server';

import { getSupabaseServer } from '@/lib/supabase-server';
import { revalidateTag, updateTag } from 'next/cache';

export const createCrop = async (
  name: string,
  type: 'crop' | 'livestock',
  description?: string,
  lifecycle: ('farming' | 'processing' | 'sale')[] = ['farming', 'sale']
) => {
  const supabase = await getSupabaseServer();

  try {
    const { data, error } = await supabase
      .from('crops')
      .insert([
        {
          name,
          type,
          description,
          lifecycle,
          status: 'active',
        },
      ])
      .select()
      .single();

    if (error) {
      return { error: error.message };
    }

    revalidateTag('crops');
    updateTag('crops');

    return { success: true, data };
  } catch (error: any) {
    return { error: error.message };
  }
};

export const updateCrop = async (
  cropId: string,
  updates: {
    name?: string;
    type?: 'crop' | 'livestock';
    description?: string;
    lifecycle?: ('farming' | 'processing' | 'sale')[];
    status?: 'active' | 'inactive' | 'discontinued';
  }
) => {
  const supabase = await getSupabaseServer();

  try {
    const { data, error } = await supabase
      .from('crops')
      .update(updates)
      .eq('id', cropId)
      .select()
      .single();

    if (error) {
      return { error: error.message };
    }

    revalidateTag('crops');
    updateTag('crops');

    return { success: true, data };
  } catch (error: any) {
    return { error: error.message };
  }
};

export const getCrops = async (statusFilter?: 'active' | 'inactive' | 'discontinued') => {
  'use cache';
  const supabase = await getSupabaseServer();

  let query = supabase.from('crops').select('*').order('name', { ascending: true });

  if (statusFilter) {
    query = query.eq('status', statusFilter);
  }

  const { data, error } = await query;

  if (error) {
    return { error: error.message };
  }

  return { success: true, data };
};

export const toggleCropLifecycleStage = async (
  cropId: string,
  stage: 'farming' | 'processing' | 'sale'
) => {
  const supabase = await getSupabaseServer();

  try {
    // Get current crop
    const { data: crop, error: getError } = await supabase
      .from('crops')
      .select('lifecycle')
      .eq('id', cropId)
      .single();

    if (getError) {
      return { error: getError.message };
    }

    const currentLifecycle = crop.lifecycle || [];
    const newLifecycle = currentLifecycle.includes(stage)
      ? currentLifecycle.filter((l: string) => l !== stage)
      : [...currentLifecycle, stage];

    const { data, error } = await supabase
      .from('crops')
      .update({ lifecycle: newLifecycle })
      .eq('id', cropId)
      .select()
      .single();

    if (error) {
      return { error: error.message };
    }

    revalidateTag('crops');
    updateTag('crops');

    return { success: true, data };
  } catch (error: any) {
    return { error: error.message };
  }
};

export const toggleCropStatus = async (
  cropId: string,
  newStatus: 'active' | 'inactive' | 'discontinued'
) => {
  const supabase = await getSupabaseServer();

  try {
    const { data, error } = await supabase
      .from('crops')
      .update({ status: newStatus })
      .eq('id', cropId)
      .select()
      .single();

    if (error) {
      return { error: error.message };
    }

    revalidateTag('crops');
    updateTag('crops');

    return { success: true, data };
  } catch (error: any) {
    return { error: error.message };
  }
};

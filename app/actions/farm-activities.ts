'use server';

import { getSupabaseServer } from '@/lib/supabase-server';
import { revalidateTag, updateTag } from 'next/cache';

export const createFarmActivity = async (
  cropId: string,
  farmId: string,
  stage: 'farming' | 'processing' | 'sale',
  activityType: string,
  description: string,
  quantity?: number,
  unit?: string,
  recordedBy: string
) => {
  const supabaseServer = await getSupabaseServer();

  try {
    const { data, error } = await supabaseServer
      .from('farm_activities')
      .insert([
        {
          crop_id: cropId,
          farm_id: farmId,
          stage,
          activity_type: activityType,
          description,
          quantity,
          unit,
          recorded_by: recordedBy,
          date_recorded: new Date().toISOString(),
          status: 'completed',
        },
      ])
      .select()
      .single();

    if (error) {
      return { error: error.message };
    }

    revalidateTag(`farm-activities-${farmId}`);
    updateTag(`farm-activities-${farmId}`);

    return { success: true, data };
  } catch (error: any) {
    return { error: error.message };
  }
};

export const getFarmActivities = async (
  farmId: string,
  cropId?: string,
  stage?: 'farming' | 'processing' | 'sale'
) => {
  const supabaseServer = await getSupabaseServer();

  let query = supabaseServer
    .from('farm_activities')
    .select('*, crops(name), farms(name)')
    .eq('farm_id', farmId)
    .order('date_recorded', { ascending: false });

  if (cropId) {
    query = query.eq('crop_id', cropId);
  }

  if (stage) {
    query = query.eq('stage', stage);
  }

  const { data, error } = await query;

  if (error) {
    return { error: error.message };
  }

  return { success: true, data };
};

export const getCropActivityTimeline = async (cropId: string) => {
  const supabaseServer = await getSupabaseServer();

  const { data, error } = await supabaseServer
    .from('farm_activities')
    .select('*, farms(name)')
    .eq('crop_id', cropId)
    .order('date_recorded', { ascending: true });

  if (error) {
    return { error: error.message };
  }

  return { success: true, data };
};

export const updateFarmActivity = async (
  activityId: string,
  updates: {
    description?: string;
    quantity?: number;
    unit?: string;
    status?: 'completed' | 'in_progress' | 'pending';
  }
) => {
  const supabaseServer = await getSupabaseServer();

  try {
    const { data, error } = await supabaseServer
      .from('farm_activities')
      .update(updates)
      .eq('id', activityId)
      .select()
      .single();

    if (error) {
      return { error: error.message };
    }

    revalidateTag('farm-activities');
    updateTag('farm-activities');

    return { success: true, data };
  } catch (error: any) {
    return { error: error.message };
  }
};

export const deleteFarmActivity = async (activityId: string) => {
  const supabaseServer = await getSupabaseServer();

  try {
    const { error } = await supabaseServer
      .from('farm_activities')
      .delete()
      .eq('id', activityId);

    if (error) {
      return { error: error.message };
    }

    revalidateTag('farm-activities');
    updateTag('farm-activities');

    return { success: true };
  } catch (error: any) {
    return { error: error.message };
  }
};

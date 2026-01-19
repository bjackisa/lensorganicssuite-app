'use server';

import { getSupabaseServer } from '@/lib/supabase-server';
import { revalidateTag, updateTag } from 'next/cache';

export const createUser = async (
  email: string,
  password: string,
  fullName: string,
  role: 'field_manager' | 'managing_director' | 'it_admin',
  farmIds: string[] = []
) => {
  const supabase = await getSupabaseServer();

  try {
    // Create auth user
    const { data: authData, error: authError } = await supabase.auth.admin.createUser({
      email,
      password,
      email_confirm: true,
    });

    if (authError) {
      return { error: authError.message };
    }

    // Create user profile
    const { data: userData, error: userError } = await supabase
      .from('users')
      .insert([
        {
          id: authData.user.id,
          email,
          full_name: fullName,
          role,
          status: 'active',
        },
      ])
      .select()
      .single();

    if (userError) {
      return { error: userError.message };
    }

    // Assign farms if provided
    if (farmIds.length > 0) {
      const farmAssignments = farmIds.map((farmId) => ({
        user_id: authData.user.id,
        farm_id: farmId,
      }));

      const { error: assignError } = await supabase
        .from('farm_assignments')
        .insert(farmAssignments);

      if (assignError) {
        return { error: assignError.message };
      }
    }

    revalidateTag('users');
    updateTag('users');

    return { success: true, data: userData };
  } catch (error: any) {
    return { error: error.message };
  }
};

export const updateUser = async (
  userId: string,
  updates: {
    full_name?: string;
    role?: 'field_manager' | 'managing_director' | 'it_admin';
    status?: 'active' | 'inactive';
  }
) => {
  const supabase = await getSupabaseServer();

  try {
    const { data, error } = await supabase
      .from('users')
      .update(updates)
      .eq('id', userId)
      .select()
      .single();

    if (error) {
      return { error: error.message };
    }

    revalidateTag('users');
    updateTag('users');

    return { success: true, data };
  } catch (error: any) {
    return { error: error.message };
  }
};

export const deleteUser = async (userId: string) => {
  const supabase = await getSupabaseServer();

  try {
    // Delete farm assignments
    await supabase.from('farm_assignments').delete().eq('user_id', userId);

    // Delete user profile
    const { error: profileError } = await supabase.from('users').delete().eq('id', userId);

    if (profileError) {
      return { error: profileError.message };
    }

    // Delete auth user
    const { error: authError } = await supabase.auth.admin.deleteUser(userId);

    if (authError) {
      return { error: authError.message };
    }

    revalidateTag('users');
    updateTag('users');

    return { success: true };
  } catch (error: any) {
    return { error: error.message };
  }
};

export const getUsers = async () => {
  const supabase = await getSupabaseServer();

  const { data, error } = await supabase
    .from('users')
    .select('*, farm_assignments(farm_id)')
    .order('created_at', { ascending: false });

  if (error) {
    return { error: error.message };
  }

  return { success: true, data };
};

export const assignUserToFarm = async (userId: string, farmId: string) => {
  const supabase = await getSupabaseServer();

  try {
    const { data, error } = await supabase
      .from('farm_assignments')
      .insert([{ user_id: userId, farm_id: farmId }])
      .select()
      .single();

    if (error) {
      return { error: error.message };
    }

    revalidateTag('farm_assignments');
    updateTag('farm_assignments');

    return { success: true, data };
  } catch (error: any) {
    return { error: error.message };
  }
};

export const removeUserFromFarm = async (userId: string, farmId: string) => {
  const supabase = await getSupabaseServer();

  try {
    const { error } = await supabase
      .from('farm_assignments')
      .delete()
      .eq('user_id', userId)
      .eq('farm_id', farmId);

    if (error) {
      return { error: error.message };
    }

    revalidateTag('farm_assignments');
    updateTag('farm_assignments');

    return { success: true };
  } catch (error: any) {
    return { error: error.message };
  }
};

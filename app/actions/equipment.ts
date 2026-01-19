'use server';

import { getSupabaseServer } from '@/lib/supabase-server';
import { revalidateTag, updateTag } from 'next/cache';

export const createEquipment = async (
  name: string,
  farmId: string,
  category: string,
  purchaseDate: string,
  purchasePrice: number,
  serialNumber?: string,
  description?: string
) => {
  const supabaseServer = await getSupabaseServer();

  try {
    const { data, error } = await supabaseServer
      .from('equipment')
      .insert([
        {
          name,
          farm_id: farmId,
          category,
          purchase_date: purchaseDate,
          purchase_price: purchasePrice,
          serial_number: serialNumber,
          description,
          status: 'active',
        },
      ])
      .select()
      .single();

    if (error) {
      return { error: error.message };
    }

    revalidateTag('equipment');
    updateTag('equipment');

    return { success: true, data };
  } catch (error: any) {
    return { error: error.message };
  }
};

export const getEquipment = async (farmId?: string) => {
  'use cache';
  const supabaseServer = await getSupabaseServer();

  let query = supabaseServer.from('equipment').select('*, farms(name)').order('created_at', { ascending: false });

  if (farmId) {
    query = query.eq('farm_id', farmId);
  }

  const { data, error } = await query;

  if (error) {
    return { error: error.message };
  }

  return { success: true, data };
};

export const updateEquipmentStatus = async (
  equipmentId: string,
  status: 'active' | 'maintenance' | 'retired'
) => {
  const supabaseServer = await getSupabaseServer();

  try {
    const { data, error } = await supabaseServer
      .from('equipment')
      .update({ status })
      .eq('id', equipmentId)
      .select()
      .single();

    if (error) {
      return { error: error.message };
    }

    revalidateTag('equipment');
    updateTag('equipment');

    return { success: true, data };
  } catch (error: any) {
    return { error: error.message };
  }
};

export const logEquipmentMaintenance = async (
  equipmentId: string,
  type: string,
  description: string,
  cost?: number
) => {
  const supabaseServer = await getSupabaseServer();

  try {
    const { data, error } = await supabaseServer
      .from('equipment_maintenance')
      .insert([
        {
          equipment_id: equipmentId,
          maintenance_type: type,
          description,
          cost,
          date: new Date().toISOString(),
        },
      ])
      .select()
      .single();

    if (error) {
      return { error: error.message };
    }

    revalidateTag('equipment-maintenance');
    updateTag('equipment-maintenance');

    return { success: true, data };
  } catch (error: any) {
    return { error: error.message };
  }
};

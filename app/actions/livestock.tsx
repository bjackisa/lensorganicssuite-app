'use server';

import { getSupabaseServer } from '@/lib/supabase-server';
import { revalidatePath } from 'next/cache';

// =====================================================
// LIVESTOCK BATCHES
// =====================================================

export async function getLivestockBatches(productionItemId?: string, status?: string) {
  const supabase = await getSupabaseServer();

  let query = supabase
    .from('livestock_batches')
    .select(`
      *,
      production_item:production_items(*, crop_type:crop_types(*), farm:farms(*)),
      zone:farm_zones(*)
    `)
    .order('acquisition_date', { ascending: false });

  if (productionItemId) query = query.eq('production_item_id', productionItemId);
  if (status) query = query.eq('status', status);

  const { data, error } = await query;
  if (error) return { error: error.message };
  return { success: true, data };
}

export async function createLivestockBatch(batchData: {
  production_item_id: string;
  zone_id?: string;
  batch_code: string;
  breed?: string;
  source?: string;
  acquisition_date: string;
  acquisition_type?: 'purchase' | 'hatched' | 'born' | 'transferred';
  initial_count: number;
  age_at_acquisition_days?: number;
  unit_cost?: number;
  total_cost?: number;
  currency?: string;
  notes?: string;
  created_by?: string;
}) {
  const supabase = await getSupabaseServer();

  const { data, error } = await supabase
    .from('livestock_batches')
    .insert({
      ...batchData,
      current_count: batchData.initial_count,
      status: 'active',
    })
    .select()
    .single();

  if (error) return { error: error.message };
  revalidatePath('/dashboard/farms');
  return { success: true, data };
}

export async function updateLivestockBatchCount(
  id: string,
  currentCount: number,
  reason?: string
) {
  const supabase = await getSupabaseServer();

  const { data, error } = await supabase
    .from('livestock_batches')
    .update({ current_count: currentCount })
    .eq('id', id)
    .select()
    .single();

  if (error) return { error: error.message };
  revalidatePath('/dashboard/farms');
  return { success: true, data };
}

export async function updateLivestockBatchStatus(
  id: string,
  status: 'active' | 'sold' | 'culled' | 'deceased' | 'transferred'
) {
  const supabase = await getSupabaseServer();

  const { data, error } = await supabase
    .from('livestock_batches')
    .update({ status })
    .eq('id', id)
    .select()
    .single();

  if (error) return { error: error.message };
  revalidatePath('/dashboard/farms');
  return { success: true, data };
}

// =====================================================
// LIVESTOCK HEALTH RECORDS
// =====================================================

export async function getLivestockHealthRecords(batchId: string) {
  const supabase = await getSupabaseServer();

  const { data, error } = await supabase
    .from('livestock_health_records')
    .select('*, recorded_by_user:users(full_name)')
    .eq('batch_id', batchId)
    .order('record_date', { ascending: false });

  if (error) return { error: error.message };
  return { success: true, data };
}

export async function createLivestockHealthRecord(recordData: {
  batch_id: string;
  record_date: string;
  record_type: 'vaccination' | 'medication' | 'health_check' | 'disease_outbreak' | 'mortality' | 'treatment' | 'deworming' | 'other';
  description: string;
  medication_name?: string;
  dosage?: string;
  administered_by?: string;
  veterinarian_name?: string;
  affected_count?: number;
  mortality_count?: number;
  cost?: number;
  currency?: string;
  next_due_date?: string;
  notes?: string;
  recorded_by: string;
}) {
  const supabase = await getSupabaseServer();

  const { data, error } = await supabase
    .from('livestock_health_records')
    .insert(recordData)
    .select()
    .single();

  if (error) return { error: error.message };

  // If mortality, update batch count
  if (recordData.record_type === 'mortality' && recordData.mortality_count) {
    const { data: batch } = await supabase
      .from('livestock_batches')
      .select('current_count')
      .eq('id', recordData.batch_id)
      .single();

    if (batch) {
      await supabase
        .from('livestock_batches')
        .update({ current_count: batch.current_count - recordData.mortality_count })
        .eq('id', recordData.batch_id);
    }
  }

  revalidatePath('/dashboard/farms');
  return { success: true, data };
}

// =====================================================
// EGG PRODUCTION RECORDS (Layers)
// =====================================================

export async function getEggProductionRecords(
  batchId: string,
  startDate?: string,
  endDate?: string
) {
  const supabase = await getSupabaseServer();

  let query = supabase
    .from('egg_production_records')
    .select('*, recorded_by_user:users(full_name)')
    .eq('batch_id', batchId)
    .order('production_date', { ascending: false });

  if (startDate) query = query.gte('production_date', startDate);
  if (endDate) query = query.lte('production_date', endDate);

  const { data, error } = await query;
  if (error) return { error: error.message };
  return { success: true, data };
}

export async function createEggProductionRecord(recordData: {
  batch_id: string;
  production_date: string;
  total_eggs: number;
  grade_a_count?: number;
  grade_b_count?: number;
  broken_count?: number;
  collection_time?: string;
  bird_count?: number;
  notes?: string;
  recorded_by: string;
}) {
  const supabase = await getSupabaseServer();

  // Calculate production rate if bird count provided
  let productionRate: number | undefined;
  if (recordData.bird_count && recordData.bird_count > 0) {
    productionRate = (recordData.total_eggs / recordData.bird_count) * 100;
  }

  const { data, error } = await supabase
    .from('egg_production_records')
    .insert({
      ...recordData,
      production_rate: productionRate,
    })
    .select()
    .single();

  if (error) return { error: error.message };
  revalidatePath('/dashboard/farms');
  return { success: true, data };
}

export async function getEggProductionSummary(batchId: string, period: 'week' | 'month' | 'year') {
  const supabase = await getSupabaseServer();

  const now = new Date();
  let startDate: string;

  switch (period) {
    case 'week':
      startDate = new Date(now.setDate(now.getDate() - 7)).toISOString().split('T')[0];
      break;
    case 'month':
      startDate = new Date(now.setMonth(now.getMonth() - 1)).toISOString().split('T')[0];
      break;
    case 'year':
      startDate = new Date(now.setFullYear(now.getFullYear() - 1)).toISOString().split('T')[0];
      break;
  }

  const { data, error } = await supabase
    .from('egg_production_records')
    .select('total_eggs, grade_a_count, grade_b_count, broken_count, production_rate')
    .eq('batch_id', batchId)
    .gte('production_date', startDate);

  if (error) return { error: error.message };

  const summary = {
    totalEggs: data?.reduce((sum, r) => sum + r.total_eggs, 0) || 0,
    gradeAEggs: data?.reduce((sum, r) => sum + (r.grade_a_count || 0), 0) || 0,
    gradeBEggs: data?.reduce((sum, r) => sum + (r.grade_b_count || 0), 0) || 0,
    brokenEggs: data?.reduce((sum, r) => sum + (r.broken_count || 0), 0) || 0,
    averageProductionRate: data?.length 
      ? data.reduce((sum, r) => sum + (r.production_rate || 0), 0) / data.length 
      : 0,
    recordCount: data?.length || 0,
  };

  return { success: true, data: summary };
}

// =====================================================
// FEED RECORDS
// =====================================================

export async function getFeedRecords(batchId: string, startDate?: string, endDate?: string) {
  const supabase = await getSupabaseServer();

  let query = supabase
    .from('feed_records')
    .select('*, recorded_by_user:users(full_name)')
    .eq('batch_id', batchId)
    .order('feed_date', { ascending: false });

  if (startDate) query = query.gte('feed_date', startDate);
  if (endDate) query = query.lte('feed_date', endDate);

  const { data, error } = await query;
  if (error) return { error: error.message };
  return { success: true, data };
}

export async function createFeedRecord(recordData: {
  batch_id: string;
  feed_date: string;
  feed_type: string;
  brand?: string;
  quantity: number;
  unit: string;
  cost_per_unit?: number;
  total_cost?: number;
  currency?: string;
  feeding_time?: string;
  notes?: string;
  recorded_by: string;
}) {
  const supabase = await getSupabaseServer();

  // Calculate total cost if not provided
  let totalCost = recordData.total_cost;
  if (!totalCost && recordData.cost_per_unit) {
    totalCost = recordData.quantity * recordData.cost_per_unit;
  }

  const { data, error } = await supabase
    .from('feed_records')
    .insert({
      ...recordData,
      total_cost: totalCost,
    })
    .select()
    .single();

  if (error) return { error: error.message };
  revalidatePath('/dashboard/farms');
  return { success: true, data };
}

export async function getFeedConsumptionSummary(batchId: string, period: 'week' | 'month') {
  const supabase = await getSupabaseServer();

  const now = new Date();
  const startDate = period === 'week'
    ? new Date(now.setDate(now.getDate() - 7)).toISOString().split('T')[0]
    : new Date(now.setMonth(now.getMonth() - 1)).toISOString().split('T')[0];

  const { data, error } = await supabase
    .from('feed_records')
    .select('quantity, unit, total_cost, feed_type')
    .eq('batch_id', batchId)
    .gte('feed_date', startDate);

  if (error) return { error: error.message };

  // Group by feed type
  const byType: Record<string, { quantity: number; cost: number }> = {};
  data?.forEach(record => {
    if (!byType[record.feed_type]) {
      byType[record.feed_type] = { quantity: 0, cost: 0 };
    }
    byType[record.feed_type].quantity += record.quantity;
    byType[record.feed_type].cost += record.total_cost || 0;
  });

  const summary = {
    totalQuantity: data?.reduce((sum, r) => sum + r.quantity, 0) || 0,
    totalCost: data?.reduce((sum, r) => sum + (r.total_cost || 0), 0) || 0,
    byFeedType: byType,
    recordCount: data?.length || 0,
  };

  return { success: true, data: summary };
}

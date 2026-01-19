'use server';

import { getSupabaseServer } from '@/lib/supabase-server';
import { revalidatePath } from 'next/cache';

// =====================================================
// FISH PONDS
// =====================================================

export async function getFishPonds(farmId?: string, status?: string) {
  const supabase = await getSupabaseServer();

  let query = supabase
    .from('fish_ponds')
    .select(`
      *,
      farm:farms(name),
      zone:farm_zones(name)
    `)
    .order('name', { ascending: true });

  if (farmId) query = query.eq('farm_id', farmId);
  if (status) query = query.eq('status', status);

  const { data, error } = await query;
  if (error) return { error: error.message };
  return { success: true, data };
}

export async function createFishPond(pondData: {
  farm_id: string;
  zone_id?: string;
  name: string;
  pond_code: string;
  pond_type?: 'earthen' | 'concrete' | 'liner' | 'tank' | 'cage';
  length_m?: number;
  width_m?: number;
  depth_m?: number;
  water_source?: string;
  aeration_type?: string;
  construction_date?: string;
  construction_cost?: number;
  currency?: string;
  notes?: string;
}) {
  const supabase = await getSupabaseServer();

  // Calculate volume if dimensions provided
  let volumeLiters: number | undefined;
  if (pondData.length_m && pondData.width_m && pondData.depth_m) {
    volumeLiters = pondData.length_m * pondData.width_m * pondData.depth_m * 1000;
  }

  const { data, error } = await supabase
    .from('fish_ponds')
    .insert({
      ...pondData,
      volume_liters: volumeLiters,
      status: 'empty',
    })
    .select()
    .single();

  if (error) return { error: error.message };
  revalidatePath('/dashboard/farms');
  return { success: true, data };
}

export async function updateFishPondStatus(
  id: string,
  status: 'active' | 'stocked' | 'harvesting' | 'empty' | 'maintenance' | 'inactive'
) {
  const supabase = await getSupabaseServer();

  const { data, error } = await supabase
    .from('fish_ponds')
    .update({ status })
    .eq('id', id)
    .select()
    .single();

  if (error) return { error: error.message };
  revalidatePath('/dashboard/farms');
  return { success: true, data };
}

// =====================================================
// FISH STOCKING RECORDS
// =====================================================

export async function getFishStockingRecords(pondId?: string, status?: string) {
  const supabase = await getSupabaseServer();

  let query = supabase
    .from('fish_stocking_records')
    .select(`
      *,
      pond:fish_ponds(name, pond_code),
      production_item:production_items(*, crop_type:crop_types(*))
    `)
    .order('stocking_date', { ascending: false });

  if (pondId) query = query.eq('pond_id', pondId);
  if (status) query = query.eq('status', status);

  const { data, error } = await query;
  if (error) return { error: error.message };
  return { success: true, data };
}

export async function createFishStockingRecord(stockingData: {
  pond_id: string;
  production_item_id: string;
  stocking_date: string;
  fish_species: string;
  fingerling_source?: string;
  quantity: number;
  average_weight_grams?: number;
  unit_cost?: number;
  expected_harvest_date?: string;
  notes?: string;
  created_by?: string;
}) {
  const supabase = await getSupabaseServer();

  // Calculate totals
  let totalWeightKg: number | undefined;
  let totalCost: number | undefined;

  if (stockingData.average_weight_grams) {
    totalWeightKg = (stockingData.quantity * stockingData.average_weight_grams) / 1000;
  }
  if (stockingData.unit_cost) {
    totalCost = stockingData.quantity * stockingData.unit_cost;
  }

  const { data, error } = await supabase
    .from('fish_stocking_records')
    .insert({
      ...stockingData,
      total_weight_kg: totalWeightKg,
      total_cost: totalCost,
      currency: 'UGX',
      status: 'active',
    })
    .select()
    .single();

  if (error) return { error: error.message };

  // Update pond status to stocked
  await supabase
    .from('fish_ponds')
    .update({ status: 'stocked' })
    .eq('id', stockingData.pond_id);

  revalidatePath('/dashboard/farms');
  return { success: true, data };
}

export async function updateFishStockingStatus(
  id: string,
  status: 'active' | 'growing' | 'ready_for_harvest' | 'harvested' | 'failed'
) {
  const supabase = await getSupabaseServer();

  const { data, error } = await supabase
    .from('fish_stocking_records')
    .update({ status })
    .eq('id', id)
    .select()
    .single();

  if (error) return { error: error.message };
  revalidatePath('/dashboard/farms');
  return { success: true, data };
}

// =====================================================
// WATER QUALITY RECORDS
// =====================================================

export async function getWaterQualityRecords(pondId: string, limit?: number) {
  const supabase = await getSupabaseServer();

  let query = supabase
    .from('water_quality_records')
    .select('*, recorded_by_user:users(full_name)')
    .eq('pond_id', pondId)
    .order('record_date', { ascending: false });

  if (limit) query = query.limit(limit);

  const { data, error } = await query;
  if (error) return { error: error.message };
  return { success: true, data };
}

export async function createWaterQualityRecord(recordData: {
  pond_id: string;
  record_date: string;
  record_time?: string;
  temperature_celsius?: number;
  ph_level?: number;
  dissolved_oxygen_mg_l?: number;
  ammonia_mg_l?: number;
  nitrite_mg_l?: number;
  nitrate_mg_l?: number;
  turbidity?: string;
  water_color?: string;
  water_level_cm?: number;
  actions_taken?: string;
  notes?: string;
  recorded_by: string;
}) {
  const supabase = await getSupabaseServer();

  const { data, error } = await supabase
    .from('water_quality_records')
    .insert(recordData)
    .select()
    .single();

  if (error) return { error: error.message };
  revalidatePath('/dashboard/farms');
  return { success: true, data };
}

// =====================================================
// FISH FEEDING RECORDS
// =====================================================

export async function getFishFeedingRecords(pondId: string, startDate?: string, endDate?: string) {
  const supabase = await getSupabaseServer();

  let query = supabase
    .from('fish_feeding_records')
    .select('*, recorded_by_user:users(full_name)')
    .eq('pond_id', pondId)
    .order('feed_date', { ascending: false });

  if (startDate) query = query.gte('feed_date', startDate);
  if (endDate) query = query.lte('feed_date', endDate);

  const { data, error } = await query;
  if (error) return { error: error.message };
  return { success: true, data };
}

export async function createFishFeedingRecord(recordData: {
  pond_id: string;
  stocking_id?: string;
  feed_date: string;
  feed_time?: string;
  feed_type: string;
  brand?: string;
  quantity_kg: number;
  cost_per_kg?: number;
  fish_response?: 'excellent' | 'good' | 'moderate' | 'poor' | 'not_eating';
  notes?: string;
  recorded_by: string;
}) {
  const supabase = await getSupabaseServer();

  // Calculate total cost
  let totalCost: number | undefined;
  if (recordData.cost_per_kg) {
    totalCost = recordData.quantity_kg * recordData.cost_per_kg;
  }

  const { data, error } = await supabase
    .from('fish_feeding_records')
    .insert({
      ...recordData,
      total_cost: totalCost,
      currency: 'UGX',
    })
    .select()
    .single();

  if (error) return { error: error.message };
  revalidatePath('/dashboard/farms');
  return { success: true, data };
}

// =====================================================
// FISH SAMPLING/GROWTH RECORDS
// =====================================================

export async function getFishSamplingRecords(stockingId: string) {
  const supabase = await getSupabaseServer();

  const { data, error } = await supabase
    .from('fish_sampling_records')
    .select('*, recorded_by_user:users(full_name)')
    .eq('stocking_id', stockingId)
    .order('sample_date', { ascending: false });

  if (error) return { error: error.message };
  return { success: true, data };
}

export async function createFishSamplingRecord(recordData: {
  stocking_id: string;
  sample_date: string;
  fish_sampled: number;
  average_weight_grams?: number;
  min_weight_grams?: number;
  max_weight_grams?: number;
  average_length_cm?: number;
  health_status?: 'excellent' | 'good' | 'fair' | 'poor' | 'diseased';
  mortality_observed?: number;
  notes?: string;
  recorded_by: string;
}) {
  const supabase = await getSupabaseServer();

  // Get stocking record to calculate estimated biomass
  let estimatedBiomassKg: number | undefined;
  if (recordData.average_weight_grams) {
    const { data: stocking } = await supabase
      .from('fish_stocking_records')
      .select('quantity')
      .eq('id', recordData.stocking_id)
      .single();

    if (stocking) {
      estimatedBiomassKg = (stocking.quantity * recordData.average_weight_grams) / 1000;
    }
  }

  const { data, error } = await supabase
    .from('fish_sampling_records')
    .insert({
      ...recordData,
      estimated_total_biomass_kg: estimatedBiomassKg,
    })
    .select()
    .single();

  if (error) return { error: error.message };
  revalidatePath('/dashboard/farms');
  return { success: true, data };
}

// =====================================================
// FISH HARVEST RECORDS
// =====================================================

export async function getFishHarvestRecords(pondId?: string, stockingId?: string) {
  const supabase = await getSupabaseServer();

  let query = supabase
    .from('fish_harvest_records')
    .select(`
      *,
      pond:fish_ponds(name),
      stocking:fish_stocking_records(fish_species, stocking_date)
    `)
    .order('harvest_date', { ascending: false });

  if (pondId) query = query.eq('pond_id', pondId);
  if (stockingId) query = query.eq('stocking_id', stockingId);

  const { data, error } = await query;
  if (error) return { error: error.message };
  return { success: true, data };
}

export async function createFishHarvestRecord(harvestData: {
  stocking_id: string;
  pond_id: string;
  harvest_date: string;
  harvest_type?: 'partial' | 'complete';
  quantity_harvested: number;
  total_weight_kg: number;
  grade_a_kg?: number;
  grade_b_kg?: number;
  grade_c_kg?: number;
  mortality_during_harvest?: number;
  destination?: 'processing' | 'direct_sale' | 'live_sale' | 'storage';
  notes?: string;
  harvested_by?: string;
}) {
  const supabase = await getSupabaseServer();

  // Calculate average weight
  const averageWeightGrams = (harvestData.total_weight_kg / harvestData.quantity_harvested) * 1000;

  const { data, error } = await supabase
    .from('fish_harvest_records')
    .insert({
      ...harvestData,
      average_weight_grams: averageWeightGrams,
    })
    .select()
    .single();

  if (error) return { error: error.message };

  // Update stocking status if complete harvest
  if (harvestData.harvest_type === 'complete') {
    await supabase
      .from('fish_stocking_records')
      .update({ status: 'harvested' })
      .eq('id', harvestData.stocking_id);

    // Update pond status to empty
    await supabase
      .from('fish_ponds')
      .update({ status: 'empty' })
      .eq('id', harvestData.pond_id);
  } else {
    // Update pond status to harvesting
    await supabase
      .from('fish_ponds')
      .update({ status: 'harvesting' })
      .eq('id', harvestData.pond_id);
  }

  revalidatePath('/dashboard/farms');
  return { success: true, data };
}

// =====================================================
// POND ANALYTICS
// =====================================================

export async function getPondAnalytics(pondId: string) {
  const supabase = await getSupabaseServer();

  // Get pond details
  const { data: pond } = await supabase
    .from('fish_ponds')
    .select('*')
    .eq('id', pondId)
    .single();

  // Get active stocking
  const { data: stocking } = await supabase
    .from('fish_stocking_records')
    .select('*')
    .eq('pond_id', pondId)
    .in('status', ['active', 'growing', 'ready_for_harvest'])
    .order('stocking_date', { ascending: false })
    .limit(1)
    .single();

  // Get latest water quality
  const { data: waterQuality } = await supabase
    .from('water_quality_records')
    .select('*')
    .eq('pond_id', pondId)
    .order('record_date', { ascending: false })
    .limit(1)
    .single();

  // Get latest sampling
  let latestSampling = null;
  if (stocking) {
    const { data: sampling } = await supabase
      .from('fish_sampling_records')
      .select('*')
      .eq('stocking_id', stocking.id)
      .order('sample_date', { ascending: false })
      .limit(1)
      .single();
    latestSampling = sampling;
  }

  // Get feed consumption this month
  const startOfMonth = new Date();
  startOfMonth.setDate(1);
  const { data: feedRecords } = await supabase
    .from('fish_feeding_records')
    .select('quantity_kg, total_cost')
    .eq('pond_id', pondId)
    .gte('feed_date', startOfMonth.toISOString().split('T')[0]);

  const monthlyFeedKg = feedRecords?.reduce((sum: number, r: { quantity_kg: number }) => sum + r.quantity_kg, 0) || 0;
  const monthlyFeedCost = feedRecords?.reduce((sum: number, r: { total_cost: number | null }) => sum + (r.total_cost || 0), 0) || 0;

  return {
    success: true,
    data: {
      pond,
      activeStocking: stocking,
      latestWaterQuality: waterQuality,
      latestSampling,
      monthlyFeedKg,
      monthlyFeedCost,
      daysToHarvest: stocking?.expected_harvest_date
        ? Math.ceil((new Date(stocking.expected_harvest_date).getTime() - Date.now()) / (1000 * 60 * 60 * 24))
        : null,
    },
  };
}

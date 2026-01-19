'use server';

import { getSupabaseServer } from '@/lib/supabase-server';
import { revalidatePath } from 'next/cache';

// =====================================================
// PRODUCTION ITEMS (Crops/Livestock on Farms)
// =====================================================

export async function getProductionItems(farmId?: string, status?: string) {
  const supabase = await getSupabaseServer();
  
  let query = supabase
    .from('production_items')
    .select(`
      *,
      farm:farms(*),
      crop_type:crop_types(*)
    `)
    .order('created_at', { ascending: false });

  if (farmId) query = query.eq('farm_id', farmId);
  if (status) query = query.eq('status', status);

  const { data, error } = await query;
  if (error) return { error: error.message };
  return { success: true, data };
}

export async function createProductionItem(
  farmId: string,
  cropTypeId: string,
  farmStageActive: boolean = true,
  processingStageActive: boolean = false,
  saleStageActive: boolean = false,
  notes?: string
) {
  const supabase = await getSupabaseServer();

  const { data, error } = await supabase
    .from('production_items')
    .insert({
      farm_id: farmId,
      crop_type_id: cropTypeId,
      status: 'active',
      farm_stage_active: farmStageActive,
      processing_stage_active: processingStageActive,
      sale_stage_active: saleStageActive,
      notes,
    })
    .select()
    .single();

  if (error) return { error: error.message };
  revalidatePath('/dashboard/farms');
  return { success: true, data };
}

export async function updateProductionItemStages(
  id: string,
  stages: {
    farm_stage_active?: boolean;
    processing_stage_active?: boolean;
    sale_stage_active?: boolean;
  }
) {
  const supabase = await getSupabaseServer();

  const { data, error } = await supabase
    .from('production_items')
    .update(stages)
    .eq('id', id)
    .select()
    .single();

  if (error) return { error: error.message };
  revalidatePath('/dashboard/farms');
  return { success: true, data };
}

export async function updateProductionItemStatus(
  id: string,
  status: 'active' | 'inactive' | 'discontinued'
) {
  const supabase = await getSupabaseServer();

  const { data, error } = await supabase
    .from('production_items')
    .update({ status })
    .eq('id', id)
    .select()
    .single();

  if (error) return { error: error.message };
  revalidatePath('/dashboard/farms');
  return { success: true, data };
}

// =====================================================
// PLANTING BATCHES
// =====================================================

export async function getPlantingBatches(productionItemId?: string, status?: string) {
  const supabase = await getSupabaseServer();

  let query = supabase
    .from('planting_batches')
    .select(`
      *,
      production_item:production_items(*, crop_type:crop_types(*), farm:farms(*)),
      zone:farm_zones(*),
      variety:crop_varieties(*)
    `)
    .order('planting_date', { ascending: false });

  if (productionItemId) query = query.eq('production_item_id', productionItemId);
  if (status) query = query.eq('status', status);

  const { data, error } = await query;
  if (error) return { error: error.message };
  return { success: true, data };
}

export async function createPlantingBatch(batchData: {
  production_item_id: string;
  zone_id?: string;
  variety_id?: string;
  batch_code: string;
  planting_date: string;
  expected_harvest_date?: string;
  quantity_planted?: number;
  quantity_unit?: string;
  area_planted?: number;
  area_unit?: string;
  seed_source?: string;
  seed_cost?: number;
  notes?: string;
  created_by: string;
}) {
  const supabase = await getSupabaseServer();

  const { data, error } = await supabase
    .from('planting_batches')
    .insert({
      ...batchData,
      status: 'planted',
    })
    .select()
    .single();

  if (error) return { error: error.message };
  revalidatePath('/dashboard/farms');
  return { success: true, data };
}

export async function updatePlantingBatchStatus(
  id: string,
  status: string,
  actualHarvestDate?: string
) {
  const supabase = await getSupabaseServer();

  const updates: Record<string, any> = { status };
  if (actualHarvestDate) updates.actual_harvest_date = actualHarvestDate;

  const { data, error } = await supabase
    .from('planting_batches')
    .update(updates)
    .eq('id', id)
    .select()
    .single();

  if (error) return { error: error.message };
  revalidatePath('/dashboard/farms');
  return { success: true, data };
}

// =====================================================
// GROWTH RECORDS
// =====================================================

export async function getGrowthRecords(batchId: string) {
  const supabase = await getSupabaseServer();

  const { data, error } = await supabase
    .from('growth_records')
    .select('*, recorded_by_user:users(full_name)')
    .eq('batch_id', batchId)
    .order('record_date', { ascending: false });

  if (error) return { error: error.message };
  return { success: true, data };
}

export async function createGrowthRecord(recordData: {
  batch_id: string;
  record_date: string;
  growth_stage?: string;
  height_cm?: number;
  health_status?: string;
  pest_observations?: string;
  disease_observations?: string;
  weather_conditions?: string;
  temperature_high?: number;
  temperature_low?: number;
  rainfall_mm?: number;
  humidity_percent?: number;
  actions_taken?: string;
  photos?: string[];
  recorded_by: string;
}) {
  const supabase = await getSupabaseServer();

  const { data, error } = await supabase
    .from('growth_records')
    .insert(recordData)
    .select()
    .single();

  if (error) return { error: error.message };
  revalidatePath('/dashboard/farms');
  return { success: true, data };
}

// =====================================================
// FARM ACTIVITIES
// =====================================================

export async function getFarmActivities(
  farmId?: string,
  status?: string,
  startDate?: string,
  endDate?: string
) {
  const supabase = await getSupabaseServer();

  let query = supabase
    .from('farm_activities')
    .select(`
      *,
      farm:farms(name),
      zone:farm_zones(name),
      batch:planting_batches(batch_code),
      assigned_user:users(full_name),
      created_by_user:users(full_name)
    `)
    .order('scheduled_date', { ascending: true });

  if (farmId) query = query.eq('farm_id', farmId);
  if (status) query = query.eq('status', status);
  if (startDate) query = query.gte('scheduled_date', startDate);
  if (endDate) query = query.lte('scheduled_date', endDate);

  const { data, error } = await query;
  if (error) return { error: error.message };
  return { success: true, data };
}

export async function createFarmActivity(activityData: {
  farm_id: string;
  zone_id?: string;
  batch_id?: string;
  production_item_id?: string;
  activity_type: string;
  title: string;
  description?: string;
  scheduled_date?: string;
  priority?: string;
  assigned_to?: string;
  cost?: number;
  currency?: string;
  notes?: string;
  created_by: string;
}) {
  const supabase = await getSupabaseServer();

  const { data, error } = await supabase
    .from('farm_activities')
    .insert({
      ...activityData,
      status: 'pending',
    })
    .select()
    .single();

  if (error) return { error: error.message };
  revalidatePath('/dashboard/farms');
  return { success: true, data };
}

export async function updateFarmActivityStatus(
  id: string,
  status: string,
  completedBy?: string,
  completedDate?: string,
  laborHours?: number
) {
  const supabase = await getSupabaseServer();

  const updates: Record<string, any> = { status };
  if (completedBy) updates.completed_by = completedBy;
  if (completedDate) updates.completed_date = completedDate;
  if (laborHours) updates.labor_hours = laborHours;

  const { data, error } = await supabase
    .from('farm_activities')
    .update(updates)
    .eq('id', id)
    .select()
    .single();

  if (error) return { error: error.message };
  revalidatePath('/dashboard/farms');
  return { success: true, data };
}

// =====================================================
// HARVEST RECORDS
// =====================================================

export async function getHarvestRecords(
  productionItemId?: string,
  startDate?: string,
  endDate?: string
) {
  const supabase = await getSupabaseServer();

  let query = supabase
    .from('harvest_records')
    .select(`
      *,
      production_item:production_items(*, crop_type:crop_types(*)),
      batch:planting_batches(batch_code),
      zone:farm_zones(name)
    `)
    .order('harvest_date', { ascending: false });

  if (productionItemId) query = query.eq('production_item_id', productionItemId);
  if (startDate) query = query.gte('harvest_date', startDate);
  if (endDate) query = query.lte('harvest_date', endDate);

  const { data, error } = await query;
  if (error) return { error: error.message };
  return { success: true, data };
}

export async function createHarvestRecord(harvestData: {
  batch_id?: string;
  production_item_id: string;
  zone_id?: string;
  harvest_date: string;
  quantity: number;
  unit: string;
  quality_grade?: string;
  quality_notes?: string;
  storage_location?: string;
  destination?: string;
  labor_hours?: number;
  workers_count?: number;
  weather_conditions?: string;
  harvested_by?: string;
  notes?: string;
  photos?: string[];
}) {
  const supabase = await getSupabaseServer();

  const { data, error } = await supabase
    .from('harvest_records')
    .insert(harvestData)
    .select()
    .single();

  if (error) return { error: error.message };
  revalidatePath('/dashboard/farms');
  return { success: true, data };
}

// =====================================================
// INPUT APPLICATIONS
// =====================================================

export async function getInputApplications(batchId?: string, zoneId?: string) {
  const supabase = await getSupabaseServer();

  let query = supabase
    .from('input_applications')
    .select(`
      *,
      batch:planting_batches(batch_code),
      zone:farm_zones(name),
      applied_by_user:users(full_name)
    `)
    .order('application_date', { ascending: false });

  if (batchId) query = query.eq('batch_id', batchId);
  if (zoneId) query = query.eq('zone_id', zoneId);

  const { data, error } = await query;
  if (error) return { error: error.message };
  return { success: true, data };
}

export async function createInputApplication(inputData: {
  farm_activity_id?: string;
  batch_id?: string;
  zone_id?: string;
  input_type: string;
  product_name: string;
  brand?: string;
  quantity: number;
  unit: string;
  application_method?: string;
  application_date: string;
  weather_at_application?: string;
  cost?: number;
  currency?: string;
  batch_number?: string;
  expiry_date?: string;
  applied_by?: string;
  notes?: string;
}) {
  const supabase = await getSupabaseServer();

  const { data, error } = await supabase
    .from('input_applications')
    .insert(inputData)
    .select()
    .single();

  if (error) return { error: error.message };
  revalidatePath('/dashboard/farms');
  return { success: true, data };
}

// =====================================================
// CROP TYPES & VARIETIES
// =====================================================

export async function getCropTypes(type?: string) {
  const supabase = await getSupabaseServer();

  let query = supabase
    .from('crop_types')
    .select('*')
    .order('name', { ascending: true });

  if (type) query = query.eq('type', type);

  const { data, error } = await query;
  if (error) return { error: error.message };
  return { success: true, data };
}

export async function createCropType(cropData: {
  name: string;
  type: 'crop' | 'livestock' | 'fish';
  description?: string;
  scientific_name?: string;
  growth_duration_days?: number;
  optimal_temperature_min?: number;
  optimal_temperature_max?: number;
  water_requirements?: string;
  soil_requirements?: string;
  harvest_method?: string;
  storage_requirements?: string;
  icon_name?: string;
  color_code?: string;
}) {
  const supabase = await getSupabaseServer();

  const { data, error } = await supabase
    .from('crop_types')
    .insert(cropData)
    .select()
    .single();

  if (error) return { error: error.message };
  revalidatePath('/dashboard/admin');
  return { success: true, data };
}

export async function getCropVarieties(cropTypeId?: string) {
  const supabase = await getSupabaseServer();

  let query = supabase
    .from('crop_varieties')
    .select('*, crop_type:crop_types(name)')
    .order('name', { ascending: true });

  if (cropTypeId) query = query.eq('crop_type_id', cropTypeId);

  const { data, error } = await query;
  if (error) return { error: error.message };
  return { success: true, data };
}

// =====================================================
// FARM ZONES
// =====================================================

export async function getFarmZones(farmId: string) {
  const supabase = await getSupabaseServer();

  const { data, error } = await supabase
    .from('farm_zones')
    .select('*')
    .eq('farm_id', farmId)
    .order('name', { ascending: true });

  if (error) return { error: error.message };
  return { success: true, data };
}

export async function createFarmZone(zoneData: {
  farm_id: string;
  name: string;
  code: string;
  zone_type?: string;
  acreage?: number;
  gps_coordinates?: string;
  soil_type?: string;
  irrigation_type?: string;
  notes?: string;
}) {
  const supabase = await getSupabaseServer();

  const { data, error } = await supabase
    .from('farm_zones')
    .insert({
      ...zoneData,
      status: 'active',
    })
    .select()
    .single();

  if (error) return { error: error.message };
  revalidatePath('/dashboard/farms');
  return { success: true, data };
}

export async function updateFarmZone(id: string, updates: Record<string, any>) {
  const supabase = await getSupabaseServer();

  const { data, error } = await supabase
    .from('farm_zones')
    .update(updates)
    .eq('id', id)
    .select()
    .single();

  if (error) return { error: error.message };
  revalidatePath('/dashboard/farms');
  return { success: true, data };
}

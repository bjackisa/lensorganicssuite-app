'use server';

import { getSupabaseServer } from '@/lib/supabase-server';
import { revalidateTag, updateTag } from 'next/cache';

export const createProcessingPlant = async (
  name: string,
  farmId: string,
  type: 'lemongrass_extraction' | 'coffee_processing' | 'catfish_processing' | 'general',
  capacity: number,
  capacityUnit: string,
  location: string,
  description?: string
) => {
  const supabaseServer = await getSupabaseServer();

  try {
    const { data, error } = await supabaseServer
      .from('processing_plants')
      .insert([
        {
          name,
          farm_id: farmId,
          type,
          capacity,
          capacity_unit: capacityUnit,
          location,
          description,
          status: 'active',
        },
      ])
      .select()
      .single();

    if (error) {
      return { error: error.message };
    }

    revalidateTag('processing-plants');
    updateTag('processing-plants');

    return { success: true, data };
  } catch (error: any) {
    return { error: error.message };
  }
};

export const getProcessingPlants = async (farmId?: string) => {
  'use cache';
  const supabaseServer = await getSupabaseServer();

  let query = supabaseServer
    .from('processing_plants')
    .select('*, farms(name)')
    .order('created_at', { ascending: false });

  if (farmId) {
    query = query.eq('farm_id', farmId);
  }

  const { data, error } = await query;

  if (error) {
    return { error: error.message };
  }

  return { success: true, data };
};

export const logProcessingRun = async (
  plantId: string,
  cropId: string,
  inputQuantity: number,
  inputUnit: string,
  outputQuantity: number,
  outputUnit: string,
  description?: string,
  staffAssigned?: string[]
) => {
  const supabaseServer = await getSupabaseServer();

  try {
    const { data, error } = await supabaseServer
      .from('processing_runs')
      .insert([
        {
          plant_id: plantId,
          crop_id: cropId,
          input_quantity: inputQuantity,
          input_unit: inputUnit,
          output_quantity: outputQuantity,
          output_unit: outputUnit,
          description,
          staff_assigned: staffAssigned,
          date_run: new Date().toISOString(),
          status: 'completed',
        },
      ])
      .select()
      .single();

    if (error) {
      return { error: error.message };
    }

    revalidateTag('processing-runs');
    updateTag('processing-runs');

    return { success: true, data };
  } catch (error: any) {
    return { error: error.message };
  }
};

export const getProcessingRuns = async (plantId?: string, cropId?: string) => {
  'use cache';
  const supabaseServer = await getSupabaseServer();

  let query = supabaseServer
    .from('processing_runs')
    .select('*, processing_plants(name), crops(name)')
    .order('date_run', { ascending: false });

  if (plantId) {
    query = query.eq('plant_id', plantId);
  }

  if (cropId) {
    query = query.eq('crop_id', cropId);
  }

  const { data, error } = await query;

  if (error) {
    return { error: error.message };
  }

  return { success: true, data };
};

export const logProcessingOutput = async (
  runId: string,
  outputType: string,
  quantity: number,
  unit: string,
  qualityGrade: 'A' | 'B' | 'C',
  storageLocation?: string,
  notes?: string
) => {
  const supabaseServer = await getSupabaseServer();

  try {
    const { data, error } = await supabaseServer
      .from('processing_outputs')
      .insert([
        {
          run_id: runId,
          output_type: outputType,
          quantity,
          unit,
          quality_grade: qualityGrade,
          storage_location: storageLocation,
          notes,
          date_produced: new Date().toISOString(),
        },
      ])
      .select()
      .single();

    if (error) {
      return { error: error.message };
    }

    revalidateTag('processing-outputs');
    updateTag('processing-outputs');

    return { success: true, data };
  } catch (error: any) {
    return { error: error.message };
  }
};

export const getProcessingCapacityAnalysis = async (farmId: string) => {
  'use cache';
  const supabaseServer = await getSupabaseServer();

  try {
    const { data: plants } = await supabaseServer
      .from('processing_plants')
      .select('id, name, capacity, capacity_unit')
      .eq('farm_id', farmId);

    if (!plants) {
      return { error: 'No plants found' };
    }

    const analysis = await Promise.all(
      plants.map(async (plant) => {
        const { data: runs } = await supabaseServer
          .from('processing_runs')
          .select('output_quantity')
          .eq('plant_id', plant.id);

        const totalOutput = runs?.reduce((sum, run) => sum + run.output_quantity, 0) || 0;
        const utilizationRate = (totalOutput / plant.capacity) * 100;

        return {
          ...plant,
          totalOutput,
          utilizationRate: Math.min(utilizationRate, 100),
          efficiency: utilizationRate > 80 ? 'high' : utilizationRate > 50 ? 'medium' : 'low',
        };
      })
    );

    return { success: true, data: analysis };
  } catch (error: any) {
    return { error: error.message };
  }
};

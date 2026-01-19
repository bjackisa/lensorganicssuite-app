'use server';

import { getSupabaseServer } from '@/lib/supabase-server';
import { revalidateTag, updateTag } from 'next/cache';

export const createEmployee = async (
  firstName: string,
  lastName: string,
  email: string,
  phone: string,
  role: string,
  salary: number,
  farmIds: string[] = []
) => {
  const supabaseServer = await getSupabaseServer();

  try {
    const { data: employee, error: employeeError } = await supabaseServer
      .from('employees')
      .insert([
        {
          first_name: firstName,
          last_name: lastName,
          email,
          phone,
          role,
          salary,
          status: 'active',
        },
      ])
      .select()
      .single();

    if (employeeError) {
      return { error: employeeError.message };
    }

    // Assign to farms
    if (farmIds.length > 0) {
      const farmAssignments = farmIds.map((farmId) => ({
        employee_id: employee.id,
        farm_id: farmId,
      }));

      const { error: assignError } = await supabaseServer
        .from('employee_farm_assignments')
        .insert(farmAssignments);

      if (assignError) {
        return { error: assignError.message };
      }
    }

    revalidateTag('employees');
    updateTag('employees');

    return { success: true, data: employee };
  } catch (error: any) {
    return { error: error.message };
  }
};

export const getEmployees = async (farmId?: string, status?: 'active' | 'inactive' | 'suspended') => {
  'use cache';
  const supabaseServer = await getSupabaseServer();

  let query = supabaseServer
    .from('employees')
    .select('*, employee_farm_assignments(farm_id)')
    .order('created_at', { ascending: false });

  if (farmId) {
    query = query.eq('employee_farm_assignments.farm_id', farmId);
  }

  if (status) {
    query = query.eq('status', status);
  }

  const { data, error } = await query;

  if (error) {
    return { error: error.message };
  }

  return { success: true, data };
};

export const updateEmployee = async (
  employeeId: string,
  updates: {
    first_name?: string;
    last_name?: string;
    email?: string;
    phone?: string;
    role?: string;
    salary?: number;
    status?: 'active' | 'inactive' | 'suspended';
  }
) => {
  const supabaseServer = await getSupabaseServer();

  try {
    const { data, error } = await supabaseServer
      .from('employees')
      .update(updates)
      .eq('id', employeeId)
      .select()
      .single();

    if (error) {
      return { error: error.message };
    }

    revalidateTag('employees');
    updateTag('employees');

    return { success: true, data };
  } catch (error: any) {
    return { error: error.message };
  }
};

export const logEmployeeAttendance = async (
  employeeId: string,
  date: string,
  status: 'present' | 'absent' | 'leave',
  notes?: string
) => {
  const supabaseServer = await getSupabaseServer();

  try {
    const { data, error } = await supabaseServer
      .from('employee_attendance')
      .insert([
        {
          employee_id: employeeId,
          date,
          status,
          notes,
        },
      ])
      .select()
      .single();

    if (error) {
      return { error: error.message };
    }

    revalidateTag('attendance');
    updateTag('attendance');

    return { success: true, data };
  } catch (error: any) {
    return { error: error.message };
  }
};

export const logEmployeePayment = async (
  employeeId: string,
  amount: number,
  paymentDate: string,
  paymentMethod: string,
  notes?: string
) => {
  const supabaseServer = await getSupabaseServer();

  try {
    const { data, error } = await supabaseServer
      .from('employee_payments')
      .insert([
        {
          employee_id: employeeId,
          amount,
          payment_date: paymentDate,
          payment_method: paymentMethod,
          notes,
        },
      ])
      .select()
      .single();

    if (error) {
      return { error: error.message };
    }

    revalidateTag('employee-payments');
    updateTag('employee-payments');

    return { success: true, data };
  } catch (error: any) {
    return { error: error.message };
  }
};

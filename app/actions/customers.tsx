'use server';

import { getSupabaseServer } from '@/lib/supabase-server';
import { revalidatePath } from 'next/cache';

// =====================================================
// CUSTOMERS
// =====================================================

export async function getCustomers(isActive?: boolean) {
  const supabase = await getSupabaseServer();

  let query = supabase
    .from('customers')
    .select('*')
    .order('company_name', { ascending: true });

  if (isActive !== undefined) query = query.eq('is_active', isActive);

  const { data, error } = await query;
  if (error) return { error: error.message };
  return { success: true, data };
}

export async function getCustomerById(id: string) {
  const supabase = await getSupabaseServer();

  const { data, error } = await supabase
    .from('customers')
    .select(`
      *,
      contacts:customer_contacts(*),
      orders:customer_orders(*, items:customer_order_items(*)),
      invoices:invoices(*)
    `)
    .eq('id', id)
    .single();

  if (error) return { error: error.message };
  return { success: true, data };
}

export async function createCustomer(customerData: {
  customer_type?: 'individual' | 'business' | 'government' | 'ngo';
  company_name?: string;
  contact_person?: string;
  email?: string;
  phone?: string;
  alternate_phone?: string;
  address?: string;
  city?: string;
  country?: string;
  tin_number?: string;
  payment_terms?: number;
  credit_limit?: number;
  currency?: string;
  preferred_payment_method?: 'cash' | 'mobile_money' | 'bank_transfer' | 'cheque';
  bank_name?: string;
  bank_account?: string;
  mobile_money_number?: string;
  notes?: string;
  tags?: string[];
  created_by?: string;
}) {
  const supabase = await getSupabaseServer();

  // Generate customer code
  const { data: sequence } = await supabase
    .from('number_sequences')
    .select('current_value, prefix, padding_length')
    .eq('sequence_name', 'customer')
    .single();

  let customerCode = 'CUS-00001';
  if (sequence) {
    const nextValue = sequence.current_value + 1;
    customerCode = `${sequence.prefix}${String(nextValue).padStart(sequence.padding_length, '0')}`;
    
    await supabase
      .from('number_sequences')
      .update({ current_value: nextValue })
      .eq('sequence_name', 'customer');
  }

  const { data, error } = await supabase
    .from('customers')
    .insert({
      ...customerData,
      customer_code: customerCode,
      is_active: true,
    })
    .select()
    .single();

  if (error) return { error: error.message };
  revalidatePath('/dashboard/financial');
  return { success: true, data };
}

export async function updateCustomer(id: string, updates: Record<string, unknown>) {
  const supabase = await getSupabaseServer();

  const { data, error } = await supabase
    .from('customers')
    .update(updates)
    .eq('id', id)
    .select()
    .single();

  if (error) return { error: error.message };
  revalidatePath('/dashboard/financial');
  return { success: true, data };
}

// =====================================================
// CUSTOMER CONTACTS
// =====================================================

export async function addCustomerContact(contactData: {
  customer_id: string;
  name: string;
  position?: string;
  email?: string;
  phone?: string;
  is_primary?: boolean;
  notes?: string;
}) {
  const supabase = await getSupabaseServer();

  const { data, error } = await supabase
    .from('customer_contacts')
    .insert(contactData)
    .select()
    .single();

  if (error) return { error: error.message };
  revalidatePath('/dashboard/financial');
  return { success: true, data };
}

// =====================================================
// CUSTOMER ORDERS (Pre-orders)
// =====================================================

export async function getCustomerOrders(
  customerId?: string,
  status?: string,
  startDate?: string,
  endDate?: string
) {
  const supabase = await getSupabaseServer();

  let query = supabase
    .from('customer_orders')
    .select(`
      *,
      customer:customers(company_name, contact_person, phone),
      farm:farms(name),
      items:customer_order_items(*)
    `)
    .order('order_date', { ascending: false });

  if (customerId) query = query.eq('customer_id', customerId);
  if (status) query = query.eq('status', status);
  if (startDate) query = query.gte('order_date', startDate);
  if (endDate) query = query.lte('order_date', endDate);

  const { data, error } = await query;
  if (error) return { error: error.message };
  return { success: true, data };
}

export async function createCustomerOrder(orderData: {
  customer_id: string;
  farm_id?: string;
  order_date: string;
  expected_delivery_date?: string;
  currency?: string;
  delivery_address?: string;
  delivery_notes?: string;
  notes?: string;
  created_by: string;
  items: Array<{
    production_item_id?: string;
    product_name: string;
    description?: string;
    quantity: number;
    unit: string;
    unit_price: number;
    discount?: number;
    tax_rate?: number;
  }>;
}) {
  const supabase = await getSupabaseServer();

  // Generate order number
  const { data: sequence } = await supabase
    .from('number_sequences')
    .select('current_value, prefix, padding_length')
    .eq('sequence_name', 'order')
    .single();

  let orderNumber = 'ORD-000001';
  if (sequence) {
    const nextValue = sequence.current_value + 1;
    orderNumber = `${sequence.prefix}${String(nextValue).padStart(sequence.padding_length, '0')}`;
    
    await supabase
      .from('number_sequences')
      .update({ current_value: nextValue })
      .eq('sequence_name', 'order');
  }

  // Calculate totals
  let subtotal = 0;
  let taxAmount = 0;
  const itemsWithTotals = orderData.items.map(item => {
    const itemTax = item.tax_rate ? (item.quantity * item.unit_price * item.tax_rate) / 100 : 0;
    const itemTotal = (item.quantity * item.unit_price) - (item.discount || 0) + itemTax;
    subtotal += item.quantity * item.unit_price - (item.discount || 0);
    taxAmount += itemTax;
    return {
      ...item,
      tax_amount: itemTax,
      total: itemTotal,
    };
  });

  const totalAmount = subtotal + taxAmount;

  // Create order
  const { data: order, error: orderError } = await supabase
    .from('customer_orders')
    .insert({
      order_number: orderNumber,
      customer_id: orderData.customer_id,
      farm_id: orderData.farm_id,
      order_date: orderData.order_date,
      expected_delivery_date: orderData.expected_delivery_date,
      currency: orderData.currency || 'UGX',
      subtotal,
      tax_amount: taxAmount,
      total_amount: totalAmount,
      status: 'pending',
      payment_status: 'unpaid',
      delivery_address: orderData.delivery_address,
      delivery_notes: orderData.delivery_notes,
      notes: orderData.notes,
      created_by: orderData.created_by,
    })
    .select()
    .single();

  if (orderError) return { error: orderError.message };

  // Create order items
  const orderItems = itemsWithTotals.map(item => ({
    order_id: order.id,
    ...item,
  }));

  const { error: itemsError } = await supabase
    .from('customer_order_items')
    .insert(orderItems);

  if (itemsError) return { error: itemsError.message };

  revalidatePath('/dashboard/financial');
  return { success: true, data: order };
}

export async function updateOrderStatus(
  id: string,
  status: 'pending' | 'confirmed' | 'processing' | 'ready' | 'shipped' | 'delivered' | 'cancelled',
  actualDeliveryDate?: string
) {
  const supabase = await getSupabaseServer();

  const updates: Record<string, unknown> = { status };
  if (actualDeliveryDate) updates.actual_delivery_date = actualDeliveryDate;

  const { data, error } = await supabase
    .from('customer_orders')
    .update(updates)
    .eq('id', id)
    .select()
    .single();

  if (error) return { error: error.message };
  revalidatePath('/dashboard/financial');
  return { success: true, data };
}

// =====================================================
// SUPPLIERS
// =====================================================

export async function getSuppliers(isActive?: boolean) {
  const supabase = await getSupabaseServer();

  let query = supabase
    .from('suppliers')
    .select('*')
    .order('company_name', { ascending: true });

  if (isActive !== undefined) query = query.eq('is_active', isActive);

  const { data, error } = await query;
  if (error) return { error: error.message };
  return { success: true, data };
}

export async function createSupplier(supplierData: {
  company_name: string;
  contact_person?: string;
  email?: string;
  phone?: string;
  address?: string;
  city?: string;
  country?: string;
  tin_number?: string;
  payment_terms?: number;
  bank_name?: string;
  bank_account?: string;
  mobile_money_number?: string;
  category?: string;
  notes?: string;
  created_by?: string;
}) {
  const supabase = await getSupabaseServer();

  // Generate supplier code
  const { data: sequence } = await supabase
    .from('number_sequences')
    .select('current_value, prefix, padding_length')
    .eq('sequence_name', 'supplier')
    .single();

  let supplierCode = 'SUP-00001';
  if (sequence) {
    const nextValue = sequence.current_value + 1;
    supplierCode = `${sequence.prefix}${String(nextValue).padStart(sequence.padding_length, '0')}`;
    
    await supabase
      .from('number_sequences')
      .update({ current_value: nextValue })
      .eq('sequence_name', 'supplier');
  }

  const { data, error } = await supabase
    .from('suppliers')
    .insert({
      ...supplierData,
      supplier_code: supplierCode,
      is_active: true,
    })
    .select()
    .single();

  if (error) return { error: error.message };
  revalidatePath('/dashboard/financial');
  return { success: true, data };
}

// =====================================================
// CUSTOMER PRICE LISTS
// =====================================================

export async function getCustomerPriceList(customerId: string) {
  const supabase = await getSupabaseServer();

  const { data, error } = await supabase
    .from('customer_price_lists')
    .select('*, production_item:production_items(*, crop_type:crop_types(name))')
    .eq('customer_id', customerId)
    .order('product_name', { ascending: true });

  if (error) return { error: error.message };
  return { success: true, data };
}

export async function setCustomerPrice(priceData: {
  customer_id: string;
  production_item_id?: string;
  product_name: string;
  unit: string;
  standard_price: number;
  customer_price: number;
  discount_percentage?: number;
  effective_from?: string;
  effective_to?: string;
  min_quantity?: number;
  notes?: string;
}) {
  const supabase = await getSupabaseServer();

  const { data, error } = await supabase
    .from('customer_price_lists')
    .upsert(priceData, { onConflict: 'customer_id,product_name' })
    .select()
    .single();

  if (error) return { error: error.message };
  revalidatePath('/dashboard/financial');
  return { success: true, data };
}

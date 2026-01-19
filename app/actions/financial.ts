'use server';

import { getSupabaseServer } from '@/lib/supabase-server';
import { revalidateTag, updateTag } from 'next/cache';

export const createInvoice = async (
  cropId: string,
  farmId: string,
  clientName: string,
  quantity: number,
  unit: string,
  unitPrice: number,
  totalPrice: number,
  dueDate: string,
  description?: string
) => {
  const supabaseServer = await getSupabaseServer();

  try {
    const { data, error } = await supabaseServer
      .from('invoices')
      .insert([
        {
          crop_id: cropId,
          farm_id: farmId,
          client_name: clientName,
          quantity,
          unit,
          unit_price: unitPrice,
          total_price: totalPrice,
          due_date: dueDate,
          description,
          status: 'pending',
          invoice_date: new Date().toISOString(),
        },
      ])
      .select()
      .single();

    if (error) {
      return { error: error.message };
    }

    revalidateTag('invoices');
    updateTag('invoices');

    return { success: true, data };
  } catch (error: any) {
    return { error: error.message };
  }
};

export const createReceipt = async (
  invoiceId: string,
  amount: number,
  paymentMethod: 'cash' | 'check' | 'bank_transfer' | 'mobile_money',
  notes?: string
) => {
  const supabaseServer = await getSupabaseServer();

  try {
    const { data: receipt, error: receiptError } = await supabaseServer
      .from('receipts')
      .insert([
        {
          invoice_id: invoiceId,
          amount,
          payment_method: paymentMethod,
          notes,
          receipt_date: new Date().toISOString(),
        },
      ])
      .select()
      .single();

    if (receiptError) {
      return { error: receiptError.message };
    }

    // Update invoice status to paid if full amount received
    const { data: invoice } = await supabaseServer
      .from('invoices')
      .select('total_price')
      .eq('id', invoiceId)
      .single();

    if (invoice && amount >= invoice.total_price) {
      await supabaseServer.from('invoices').update({ status: 'paid' }).eq('id', invoiceId);
    }

    revalidateTag('receipts');
    updateTag('receipts');
    revalidateTag('invoices');
    updateTag('invoices');

    return { success: true, data: receipt };
  } catch (error: any) {
    return { error: error.message };
  }
};

export const getInvoices = async (farmId?: string, status?: 'pending' | 'paid' | 'overdue') => {
  const supabaseServer = await getSupabaseServer();

  let query = supabaseServer
    .from('invoices')
    .select('*, crops(name), farms(name)')
    .order('invoice_date', { ascending: false });

  if (farmId) {
    query = query.eq('farm_id', farmId);
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

export const getReceipts = async (invoiceId?: string) => {
  const supabaseServer = await getSupabaseServer();

  let query = supabaseServer
    .from('receipts')
    .select('*, invoices(client_name, total_price)')
    .order('receipt_date', { ascending: false });

  if (invoiceId) {
    query = query.eq('invoice_id', invoiceId);
  }

  const { data, error } = await query;

  if (error) {
    return { error: error.message };
  }

  return { success: true, data };
};

export const logExpense = async (
  farmId: string,
  category: string,
  amount: number,
  description: string,
  date: string,
  paymentMethod?: string
) => {
  const supabaseServer = await getSupabaseServer();

  try {
    const { data, error } = await supabaseServer
      .from('expenses')
      .insert([
        {
          farm_id: farmId,
          category,
          amount,
          description,
          date,
          payment_method: paymentMethod,
          status: 'recorded',
        },
      ])
      .select()
      .single();

    if (error) {
      return { error: error.message };
    }

    revalidateTag('expenses');
    updateTag('expenses');

    return { success: true, data };
  } catch (error: any) {
    return { error: error.message };
  }
};

export const getFinancialSummary = async (farmId?: string, startDate?: string, endDate?: string) => {
  const supabaseServer = await getSupabaseServer();

  try {
    // Get invoices
    let invoiceQuery = supabaseServer.from('invoices').select('total_price, status');
    if (farmId) invoiceQuery = invoiceQuery.eq('farm_id', farmId);
    if (startDate) invoiceQuery = invoiceQuery.gte('invoice_date', startDate);
    if (endDate) invoiceQuery = invoiceQuery.lte('invoice_date', endDate);

    const { data: invoices } = await invoiceQuery;

    // Get expenses
    let expenseQuery = supabaseServer.from('expenses').select('amount');
    if (farmId) expenseQuery = expenseQuery.eq('farm_id', farmId);
    if (startDate) expenseQuery = expenseQuery.gte('date', startDate);
    if (endDate) expenseQuery = expenseQuery.lte('date', endDate);

    const { data: expenses } = await expenseQuery;

    const totalRevenue = invoices?.reduce((sum, inv) => sum + inv.total_price, 0) || 0;
    const totalExpenses = expenses?.reduce((sum, exp) => sum + exp.amount, 0) || 0;
    const netProfit = totalRevenue - totalExpenses;

    return {
      success: true,
      data: {
        totalRevenue,
        totalExpenses,
        netProfit,
        invoiceCount: invoices?.length || 0,
        paidInvoices: invoices?.filter((i) => i.status === 'paid').length || 0,
      },
    };
  } catch (error: any) {
    return { error: error.message };
  }
};

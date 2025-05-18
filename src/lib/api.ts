import { supabase } from './supabase';
import type { Database } from './database.types';

type VehicleCategory = Database['public']['Tables']['vehicle_categories']['Row'];
type TollPass = Database['public']['Tables']['toll_passes']['Row'];
type Transaction = Database['public']['Tables']['transactions']['Row'];
type User = Database['public']['Tables']['users']['Row'];

// Staff Management
export async function getStaffMembers() {
  const { data, error } = await supabase
    .from('users')
    .select('*')
    .neq('role', 'admin')
    .order('created_at', { ascending: false });
  
  if (error) throw error;
  return data;
}

export async function createStaffMember(userData: Omit<User, 'id' | 'created_at' | 'last_login'>) {
  const { data, error } = await supabase
    .from('users')
    .insert([userData])
    .select()
    .single();
  
  if (error) throw error;
  return data;
}

export async function updateStaffMember(id: string, updates: Partial<User>) {
  const { data, error } = await supabase
    .from('users')
    .update(updates)
    .eq('id', id)
    .select()
    .single();
  
  if (error) throw error;
  return data;
}

// Analytics
export async function getAnalytics(startDate: string, endDate: string) {
  // Get transactions within date range
  const { data: transactions, error: transactionError } = await supabase
    .from('transactions')
    .select(`
      amount,
      processed_by,
      toll_passes (
        category_id,
        vehicle_categories (name)
      )
    `)
    .gte('processed_at', startDate)
    .lte('processed_at', endDate);

  if (transactionError) throw transactionError;

  // Get active passes count
  const { count: activePasses, error: passError } = await supabase
    .from('toll_passes')
    .select('*', { count: 'exact', head: true })
    .eq('status', 'active');

  if (passError) throw passError;

  // Calculate statistics
  const totalRevenue = transactions?.reduce((sum, t) => sum + t.amount, 0) || 0;

  const categoryStats = transactions?.reduce((acc: any, t) => {
    const categoryName = t.toll_passes?.vehicle_categories?.name || 'Unknown';
    if (!acc[categoryName]) {
      acc[categoryName] = { revenue: 0, count: 0 };
    }
    acc[categoryName].revenue += t.amount;
    acc[categoryName].count += 1;
    return acc;
  }, {});

  const staffStats = transactions?.reduce((acc: any, t) => {
    const staffId = t.processed_by;
    if (!acc[staffId]) {
      acc[staffId] = { transactions: 0, revenue: 0 };
    }
    acc[staffId].transactions += 1;
    acc[staffId].revenue += t.amount;
    return acc;
  }, {});

  return {
    totalRevenue,
    categoryStats,
    staffStats,
    activePasses: activePasses || 0
  };
}

// Vehicle Categories
export async function getVehicleCategories() {
  const { data, error } = await supabase
    .from('vehicle_categories')
    .select('*')
    .order('name', { ascending: true });
  
  if (error) throw error;
  return data;
}

export async function createVehicleCategory(categoryData: Omit<VehicleCategory, 'id' | 'created_at' | 'updated_at'>) {
  const { data, error } = await supabase
    .from('vehicle_categories')
    .insert([categoryData])
    .select()
    .single();
  
  if (error) throw error;
  return data;
}

export async function updateVehicleCategory(id: string, updates: Partial<VehicleCategory>) {
  const { data, error } = await supabase
    .from('vehicle_categories')
    .update(updates)
    .eq('id', id)
    .select()
    .single();
  
  if (error) throw error;
  return data;
}

// Pass Management
export async function getTollPasses() {
  const { data, error } = await supabase
    .from('toll_passes')
    .select(`
      *,
      vehicle_categories (
        name,
        base_rate
      )
    `)
    .order('created_at', { ascending: false });
  
  if (error) throw error;
  return data;
}

export async function createTollPass(passData: Omit<TollPass, 'id' | 'created_at'>) {
  const { data, error } = await supabase
    .from('toll_passes')
    .insert([passData])
    .select()
    .single();
  
  if (error) throw error;
  return data;
}

export async function updateTollPass(id: string, updates: Partial<TollPass>) {
  const { data, error } = await supabase
    .from('toll_passes')
    .update(updates)
    .eq('id', id)
    .select()
    .single();
  
  if (error) throw error;
  return data;
}

// Transactions
export async function createTransaction(transactionData: Omit<Transaction, 'id' | 'processed_at' | 'receipt_number'>) {
  const { data: receiptData, error: receiptError } = await supabase
    .rpc('generate_receipt_number');
  
  if (receiptError) throw receiptError;

  const { data, error } = await supabase
    .from('transactions')
    .insert([{ ...transactionData, receipt_number: receiptData }])
    .select()
    .single();
  
  if (error) throw error;
  return data;
}

export async function getTransactions(filters?: {
  startDate?: string;
  endDate?: string;
  vehicleNumber?: string;
  categoryId?: string;
}) {
  let query = supabase
    .from('transactions')
    .select(`
      *,
      toll_passes (
        vehicle_number,
        vehicle_categories (
          name
        )
      )
    `);

  if (filters) {
    if (filters.startDate) {
      query = query.gte('processed_at', filters.startDate);
    }
    if (filters.endDate) {
      query = query.lte('processed_at', filters.endDate);
    }
    if (filters.vehicleNumber) {
      query = query.eq('toll_passes.vehicle_number', filters.vehicleNumber);
    }
    if (filters.categoryId) {
      query = query.eq('toll_passes.category_id', filters.categoryId);
    }
  }

  const { data, error } = await query.order('processed_at', { ascending: false });
  
  if (error) throw error;
  return data;
}
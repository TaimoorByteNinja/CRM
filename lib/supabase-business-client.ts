import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;

export const supabase = createClient(supabaseUrl, supabaseAnonKey);

// Helper function to get current user ID (you can modify this based on your auth)
export const getCurrentUserId = (): string => {
  // For now, using a default user ID. Replace with actual auth when implemented
  return 'default-user';
};

// Settings operations
export const settingsAPI = {
  async save(settings: any) {
    const userId = getCurrentUserId();
    const { data, error } = await supabase
      .from('settings')
      .upsert({
        user_id: userId,
        general_settings: settings.general || {},
        transaction_settings: settings.transaction || {},
        invoice_settings: settings.invoice || {},
        party_settings: settings.party || {},
        item_settings: settings.item || {},
        message_settings: settings.message || {},
        tax_settings: settings.tax || {},
      })
      .select()
      .single();

    if (error) throw error;
    return data;
  },

  async load() {
    const userId = getCurrentUserId();
    const { data, error } = await supabase
      .from('settings')
      .select('*')
      .eq('user_id', userId)
      .single();

    if (error && error.code !== 'PGRST116') throw error;
    return data;
  },

  async reset() {
    const userId = getCurrentUserId();
    const { error } = await supabase
      .from('settings')
      .delete()
      .eq('user_id', userId);

    if (error) throw error;
    return { success: true };
  }
};

// Items operations
export const itemsAPI = {
  async create(item: any) {
    const userId = getCurrentUserId();
    const { data, error } = await supabase
      .from('items')
      .insert([{ ...item, user_id: userId }])
      .select()
      .single();

    if (error) throw error;
    return data;
  },

  async getAll() {
    const userId = getCurrentUserId();
    const { data, error } = await supabase
      .from('items')
      .select('*')
      .eq('user_id', userId)
      .eq('is_active', true)
      .order('item_name');

    if (error) throw error;
    return data || [];
  },

  async update(id: string, updates: any) {
    const { data, error } = await supabase
      .from('items')
      .update(updates)
      .eq('id', id)
      .select()
      .single();

    if (error) throw error;
    return data;
  },

  async delete(id: string) {
    const { error } = await supabase
      .from('items')
      .update({ is_active: false })
      .eq('id', id);

    if (error) throw error;
    return { success: true };
  },

  async getStockSummary() {
    const userId = getCurrentUserId();
    const { data, error } = await supabase
      .from('stock_summary')
      .select('*')
      .eq('user_id', userId);

    if (error) throw error;
    return data || [];
  }
};

// Parties operations (Customers & Suppliers)
export const partiesAPI = {
  async create(party: any) {
    console.log('➕ partiesAPI.create called with:', party);
    
    // Map to actual database schema (no user_id column in this table)
    const dbParty = {
      name: party.party_name || party.name,
      type: party.party_type || party.type,
      phone: party.phone,
      email: party.email,
      address: party.address,
      city: party.city,
      state: party.state,
      pincode: party.pincode,
      gstin: party.gstin,
      pan: party.pan,
      credit_limit: party.credit_limit || party.creditLimit || 0,
      balance: party.current_balance || party.balance || party.opening_balance || 0,
      status: party.is_active !== false ? 'active' : 'inactive',
    };

    console.log('📤 Mapped database party:', dbParty);

    const { data, error } = await supabase
      .from('parties')
      .insert([dbParty])
      .select()
      .single();

    if (error) {
      console.error('❌ Supabase create error:', error);
      throw new Error(`Database insert failed: ${error.message} (Code: ${error.code})`);
    }
    
    console.log('✅ Create successful, returning:', data);
    return data;
  },

  async getAll(type?: 'customer' | 'supplier' | 'both') {
    let query = supabase
      .from('parties')
      .select('*')
      .eq('status', 'active')
      .order('name');

    if (type) {
      query = query.or(`type.eq.${type},type.eq.both`);
    }

    const { data, error } = await query;
    if (error) throw error;
    return data || [];
  },

  async update(id: string, updates: any) {
    console.log('🔄 partiesAPI.update called with:', { id, updates });
    
    // Map to actual database schema
    const dbUpdates: any = {
      name: updates.party_name || updates.name,
      type: updates.party_type || updates.type,
      phone: updates.phone,
      email: updates.email,
      address: updates.address,
      city: updates.city,
      state: updates.state,
      pincode: updates.pincode,
      gstin: updates.gstin,
      pan: updates.pan,
      credit_limit: updates.credit_limit || updates.creditLimit,
      balance: updates.current_balance || updates.balance,
      status: updates.is_active !== false ? 'active' : 'inactive',
    };

    // Remove undefined values
    Object.keys(dbUpdates).forEach(key => {
      if (dbUpdates[key] === undefined) {
        delete dbUpdates[key];
      }
    });

    console.log('📤 Mapped database updates:', dbUpdates);

    const { data, error } = await supabase
      .from('parties')
      .update(dbUpdates)
      .eq('id', id)
      .select()
      .single();

    if (error) {
      console.error('❌ Supabase update error:', error);
      throw new Error(`Database update failed: ${error.message} (Code: ${error.code})`);
    }
    
    console.log('✅ Update successful, returning:', data);
    return data;
  },

  async delete(id: string) {
    const { error } = await supabase
      .from('parties')
      .update({ status: 'inactive' })
      .eq('id', id);

    if (error) throw error;
    return { success: true };
  },

  async getBalanceSummary() {
    const userId = getCurrentUserId();
    const { data, error } = await supabase
      .from('party_balance_summary')
      .select('*')
      .eq('user_id', userId);

    if (error) throw error;
    return data || [];
  }
};

// Sales operations
export const salesAPI = {
  async create(sale: any, items: any[]) {
    const userId = getCurrentUserId();
    
    // Start a transaction
    const { data: saleData, error: saleError } = await supabase
      .from('sales')
      .insert([{ ...sale, user_id: userId }])
      .select()
      .single();

    if (saleError) throw saleError;

    // Insert sale items
    const saleItems = items.map(item => ({
      ...item,
      sale_id: saleData.id
    }));

    const { data: itemsData, error: itemsError } = await supabase
      .from('sale_items')
      .insert(saleItems)
      .select();

    if (itemsError) throw itemsError;

    return { sale: saleData, items: itemsData };
  },

  async getAll(startDate?: string, endDate?: string) {
    const userId = getCurrentUserId();
    let query = supabase
      .from('sales_summary')
      .select('*')
      .eq('user_id', userId)
      .order('invoice_date', { ascending: false });

    if (startDate) {
      query = query.gte('invoice_date', startDate);
    }
    if (endDate) {
      query = query.lte('invoice_date', endDate);
    }

    const { data, error } = await query;
    if (error) throw error;
    return data || [];
  },

  async getById(id: string) {
    const { data: sale, error: saleError } = await supabase
      .from('sales')
      .select(`
        *,
        parties (party_name, phone, email, address),
        sale_items (*)
      `)
      .eq('id', id)
      .single();

    if (saleError) throw saleError;
    return sale;
  },

  async update(id: string, updates: any) {
    const { data, error } = await supabase
      .from('sales')
      .update(updates)
      .eq('id', id)
      .select()
      .single();

    if (error) throw error;
    return data;
  },

  async delete(id: string) {
    const { error } = await supabase
      .from('sales')
      .update({ is_active: false })
      .eq('id', id);

    if (error) throw error;
    return { success: true };
  }
};

// Purchases operations
export const purchasesAPI = {
  async create(purchase: any, items: any[]) {
    const userId = getCurrentUserId();
    
    const { data: purchaseData, error: purchaseError } = await supabase
      .from('purchases')
      .insert([{ ...purchase, user_id: userId }])
      .select()
      .single();

    if (purchaseError) throw purchaseError;

    const purchaseItems = items.map(item => ({
      ...item,
      purchase_id: purchaseData.id
    }));

    const { data: itemsData, error: itemsError } = await supabase
      .from('purchase_items')
      .insert(purchaseItems)
      .select();

    if (itemsError) throw itemsError;

    return { purchase: purchaseData, items: itemsData };
  },

  async getAll(startDate?: string, endDate?: string) {
    const userId = getCurrentUserId();
    let query = supabase
      .from('purchase_summary')
      .select('*')
      .eq('user_id', userId)
      .order('bill_date', { ascending: false });

    if (startDate) {
      query = query.gte('bill_date', startDate);
    }
    if (endDate) {
      query = query.lte('bill_date', endDate);
    }

    const { data, error } = await query;
    if (error) throw error;
    return data || [];
  },

  async getById(id: string) {
    const { data: purchase, error: purchaseError } = await supabase
      .from('purchases')
      .select(`
        *,
        parties (party_name, phone, email, address),
        purchase_items (*)
      `)
      .eq('id', id)
      .single();

    if (purchaseError) throw purchaseError;
    return purchase;
  },

  async update(id: string, updates: any) {
    const { data, error } = await supabase
      .from('purchases')
      .update(updates)
      .eq('id', id)
      .select()
      .single();

    if (error) throw error;
    return data;
  }
};

// Payments operations
export const paymentsAPI = {
  async create(payment: any) {
    const userId = getCurrentUserId();
    const { data, error } = await supabase
      .from('payments')
      .insert([{ ...payment, user_id: userId }])
      .select()
      .single();

    if (error) throw error;
    return data;
  },

  async getAll(type?: 'received' | 'paid') {
    const userId = getCurrentUserId();
    let query = supabase
      .from('payments')
      .select(`
        *,
        parties (party_name, party_type)
      `)
      .eq('user_id', userId)
      .eq('is_active', true)
      .order('payment_date', { ascending: false });

    if (type) {
      query = query.eq('payment_type', type);
    }

    const { data, error } = await query;
    if (error) throw error;
    return data || [];
  },

  async update(id: string, updates: any) {
    const { data, error } = await supabase
      .from('payments')
      .update(updates)
      .eq('id', id)
      .select()
      .single();

    if (error) throw error;
    return data;
  }
};

// Expenses operations
export const expensesAPI = {
  async create(expense: any) {
    const userId = getCurrentUserId();
    const { data, error } = await supabase
      .from('expenses')
      .insert([{ ...expense, user_id: userId }])
      .select()
      .single();

    if (error) throw error;
    return data;
  },

  async getAll(startDate?: string, endDate?: string) {
    const userId = getCurrentUserId();
    let query = supabase
      .from('expenses')
      .select('*')
      .eq('user_id', userId)
      .eq('is_active', true)
      .order('expense_date', { ascending: false });

    if (startDate) {
      query = query.gte('expense_date', startDate);
    }
    if (endDate) {
      query = query.lte('expense_date', endDate);
    }

    const { data, error } = await query;
    if (error) throw error;
    return data || [];
  },

  async update(id: string, updates: any) {
    const { data, error } = await supabase
      .from('expenses')
      .update(updates)
      .eq('id', id)
      .select()
      .single();

    if (error) throw error;
    return data;
  },

  async delete(id: string) {
    const { error } = await supabase
      .from('expenses')
      .update({ is_active: false })
      .eq('id', id);

    if (error) throw error;
    return { success: true };
  }
};

// Bank accounts operations
export const bankAccountsAPI = {
  async create(account: any) {
    const userId = getCurrentUserId();
    const { data, error } = await supabase
      .from('bank_accounts')
      .insert([{ ...account, user_id: userId }])
      .select()
      .single();

    if (error) throw error;
    return data;
  },

  async getAll() {
    const userId = getCurrentUserId();
    const { data, error } = await supabase
      .from('bank_accounts')
      .select('*')
      .eq('user_id', userId)
      .eq('is_active', true)
      .order('account_name');

    if (error) throw error;
    return data || [];
  },

  async update(id: string, updates: any) {
    const { data, error } = await supabase
      .from('bank_accounts')
      .update(updates)
      .eq('id', id)
      .select()
      .single();

    if (error) throw error;
    return data;
  }
};

// Dashboard analytics
export const analyticsAPI = {
  async getDashboardStats() {
    const userId = getCurrentUserId();
    
    // Get sales summary
    const { data: salesStats } = await supabase
      .from('sales')
      .select('total_amount, payment_status')
      .eq('user_id', userId)
      .eq('is_active', true);

    // Get purchase summary
    const { data: purchaseStats } = await supabase
      .from('purchases')
      .select('total_amount, payment_status')
      .eq('user_id', userId)
      .eq('is_active', true);

    // Get party counts
    const { data: partyStats } = await supabase
      .from('parties')
      .select('party_type')
      .eq('user_id', userId)
      .eq('is_active', true);

    // Get item counts
    const { data: itemStats } = await supabase
      .from('items')
      .select('id, current_stock, minimum_stock')
      .eq('user_id', userId)
      .eq('is_active', true);

    return {
      sales: salesStats || [],
      purchases: purchaseStats || [],
      parties: partyStats || [],
      items: itemStats || []
    };
  }
};

// Real-time subscriptions
export const subscriptions = {
  subscribeToSales(callback: (payload: any) => void) {
    return supabase
      .channel('sales_changes')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'sales' }, callback)
      .subscribe();
  },

  subscribeToItems(callback: (payload: any) => void) {
    return supabase
      .channel('items_changes')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'items' }, callback)
      .subscribe();
  },

  subscribeToParties(callback: (payload: any) => void) {
    return supabase
      .channel('parties_changes')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'parties' }, callback)
      .subscribe();
  }
};

export default {
  settingsAPI,
  itemsAPI,
  partiesAPI,
  salesAPI,
  purchasesAPI,
  paymentsAPI,
  expensesAPI,
  bankAccountsAPI,
  analyticsAPI,
  subscriptions
};

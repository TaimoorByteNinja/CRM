import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || 'https://txpufkxjnxhpnmydwdng.supabase.co';
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InR4cHVma3hqbnhocG5teWR3ZG5nIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTI0OTI0MzksImV4cCI6MjA2ODA2ODQzOX0.kgf6HZRrKMRgO76Mb2lhHBo1dV-FJyGSDPfyfoFRwTI';

const supabase = createClient(supabaseUrl, supabaseKey);

// Items API - Matches actual database schema
export const itemsAPI = {
  async getAll() {
    const { data, error } = await supabase
      .from('items')
      .select('*')
      .order('created_at', { ascending: false });
    
    if (error) {
      console.error('Items API error:', error);
      throw error;
    }
    
    // Map database fields to expected interface
    return data?.map(item => ({
      id: item.id,
      item_name: item.name,
      item_code: item.sku || '',
      category_id: item.category_id,
      unit_price: item.sale_price,
      sale_price: item.sale_price,
      purchase_price: item.purchase_price,
      current_stock: item.stock,
      min_stock: item.min_stock,
      stock: item.stock,
      description: item.description,
      tax_rate: item.tax_rate,
      status: item.status,
      created_at: item.created_at,
      updated_at: item.updated_at,
      total_sold: item.total_sold || 0,
      type: item.type
    })) || [];
  },

  async create(itemData: any) {
    console.log('Creating item with data:', itemData);
    
    // Map interface fields to database fields
    const dbData = {
      name: itemData.item_name || itemData.name,
      sku: itemData.item_code || itemData.sku || '',
      category_id: itemData.category_id || null,
      sale_price: itemData.sale_price || itemData.unit_price || 0,
      purchase_price: itemData.purchase_price || 0,
      stock: itemData.current_stock || itemData.stock || 0,
      min_stock: itemData.min_stock || 0,
      description: itemData.description || '',
      tax_rate: itemData.tax_rate || 0,
      status: itemData.status || 'active',
      type: itemData.type || 'product'
    };

    console.log('Mapped data for database:', dbData);

    const { data, error } = await supabase
      .from('items')
      .insert(dbData)
      .select()
      .single();

    if (error) {
      console.error('Create item error:', error);
      throw error;
    }
    
    // Map back to expected interface
    return {
      id: data.id,
      item_name: data.name,
      item_code: data.sku,
      sale_price: data.sale_price,
      purchase_price: data.purchase_price,
      current_stock: data.stock,
      description: data.description,
      tax_rate: data.tax_rate,
      status: data.status,
      created_at: data.created_at,
      updated_at: data.updated_at
    };
  },

  async update(id: string, itemData: any) {
    console.log('Updating item:', id, 'with data:', itemData);
    
    // Map interface fields to database fields
    const dbData = {
      name: itemData.item_name || itemData.name,
      sku: itemData.item_code || itemData.sku,
      sale_price: itemData.sale_price || itemData.unit_price,
      purchase_price: itemData.purchase_price,
      stock: itemData.current_stock || itemData.stock,
      min_stock: itemData.min_stock,
      description: itemData.description,
      tax_rate: itemData.tax_rate,
      status: itemData.status,
      type: itemData.type
    };

    const { data, error } = await supabase
      .from('items')
      .update(dbData)
      .eq('id', id)
      .select()
      .single();

    if (error) {
      console.error('Update item error:', error);
      throw error;
    }
    
    return {
      id: data.id,
      item_name: data.name,
      item_code: data.sku,
      sale_price: data.sale_price,
      purchase_price: data.purchase_price,
      current_stock: data.stock,
      description: data.description,
      tax_rate: data.tax_rate,
      status: data.status,
      created_at: data.created_at,
      updated_at: data.updated_at
    };
  },

  async delete(id: string) {
    const { error } = await supabase
      .from('items')
      .delete()
      .eq('id', id);

    if (error) {
      console.error('Delete item error:', error);
      throw error;
    }
    return { success: true };
  }
};

// Parties API - Matches actual database schema
export const partiesAPI = {
  async getAll(type?: string) {
    let query = supabase
      .from('parties')
      .select('*')
      .order('created_at', { ascending: false });
    
    if (type) {
      query = query.eq('type', type);
    }
    
    const { data, error } = await query;
    
    if (error) {
      console.error('Parties API error:', error);
      throw error;
    }
    
    // Map database fields to expected interface
    return data?.map(party => ({
      id: party.id,
      party_name: party.name,
      party_type: party.type,
      phone: party.phone,
      email: party.email,
      address: party.address,
      city: party.city,
      state: party.state,
      pincode: party.pincode,
      gstin: party.gstin,
      pan: party.pan,
      credit_limit: party.credit_limit,
      current_balance: party.balance,
      status: party.status,
      created_at: party.created_at,
      updated_at: party.updated_at
    })) || [];
  },

  async create(partyData: any) {
    console.log('Creating party with data:', partyData);
    
    // Map interface fields to database fields
    const dbData = {
      name: partyData.party_name || partyData.name,
      type: partyData.party_type || partyData.type,
      phone: partyData.phone || '',
      email: partyData.email || '',
      address: partyData.address || '',
      city: partyData.city || '',
      state: partyData.state || '',
      pincode: partyData.pincode || '',
      gstin: partyData.gstin || '',
      pan: partyData.pan || '',
      credit_limit: partyData.credit_limit || 0,
      balance: partyData.current_balance || 0,
      status: partyData.status || 'active'
    };

    const { data, error } = await supabase
      .from('parties')
      .insert(dbData)
      .select()
      .single();

    if (error) {
      console.error('Create party error:', error);
      throw error;
    }
    
    return {
      id: data.id,
      party_name: data.name,
      party_type: data.type,
      phone: data.phone,
      email: data.email,
      address: data.address,
      current_balance: data.balance,
      status: data.status,
      created_at: data.created_at,
      updated_at: data.updated_at
    };
  },

  async update(id: string, partyData: any) {
    console.log('Updating party:', id, 'with data:', partyData);
    
    const dbData = {
      name: partyData.party_name || partyData.name,
      type: partyData.party_type || partyData.type,
      phone: partyData.phone,
      email: partyData.email,
      address: partyData.address,
      city: partyData.city,
      state: partyData.state,
      pincode: partyData.pincode,
      gstin: partyData.gstin,
      pan: partyData.pan,
      credit_limit: partyData.credit_limit,
      balance: partyData.current_balance || partyData.balance,
      status: partyData.status
    };

    const { data, error } = await supabase
      .from('parties')
      .update(dbData)
      .eq('id', id)
      .select()
      .single();

    if (error) {
      console.error('Update party error:', error);
      throw error;
    }
    
    return {
      id: data.id,
      party_name: data.name,
      party_type: data.type,
      phone: data.phone,
      email: data.email,
      address: data.address,
      current_balance: data.balance,
      status: data.status,
      created_at: data.created_at,
      updated_at: data.updated_at
    };
  },

  async delete(id: string) {
    const { error } = await supabase
      .from('parties')
      .delete()
      .eq('id', id);

    if (error) {
      console.error('Delete party error:', error);
      throw error;
    }
    return { success: true };
  }
};

// Sales API - Matches actual database schema
export const salesAPI = {
  async getAll(startDate?: string, endDate?: string) {
    let query = supabase
      .from('sales')
      .select('*')
      .order('created_at', { ascending: false });
    
    if (startDate && endDate) {
      query = query.gte('created_at', startDate).lte('created_at', endDate);
    }
    
    const { data, error } = await query;
    
    if (error) {
      console.error('Sales API error:', error);
      throw error;
    }
    
    // Map database fields to expected interface
    return data?.map(sale => ({
      id: sale.id,
      invoice_number: sale.invoice_number,
      party_id: sale.customer_id,
      party_name: sale.customer_name,
      customerName: sale.customer_name,
      customerEmail: sale.customer_email,
      customerPhone: sale.customer_phone,
      customerAddress: sale.customer_address,
      items: sale.items || [],
      subtotal: sale.subtotal,
      tax_amount: sale.tax,
      tax: sale.tax,
      taxRate: sale.tax_rate,
      discount_amount: sale.discount,
      discount: sale.discount,
      total_amount: sale.total,
      total: sale.total,
      status: sale.status,
      paymentMethod: sale.payment_method,
      payment_status: sale.payment_status,
      paymentStatus: sale.payment_status,
      due_date: sale.due_date,
      dueDate: sale.due_date,
      created_at: sale.created_at,
      createdAt: sale.created_at,
      notes: sale.notes
    })) || [];
  },

  async create(saleData: any, items?: any[]) {
    console.log('Creating sale with data:', saleData, 'items:', items);
    
    const dbData = {
      invoice_number: saleData.invoice_number || saleData.invoiceNumber,
      customer_id: saleData.party_id || saleData.customer_id || saleData.customerId,
      customer_name: saleData.party_name || saleData.customer_name || saleData.customerName,
      customer_email: saleData.customerEmail || '',
      customer_phone: saleData.customerPhone || '',
      customer_address: saleData.customerAddress || '',
      items: items || saleData.items || [],
      subtotal: saleData.subtotal || 0,
      tax: saleData.tax_amount || saleData.tax || 0,
      tax_rate: saleData.taxRate || saleData.tax_rate || 0,
      discount: saleData.discount_amount || saleData.discount || 0,
      total: saleData.total_amount || saleData.total || 0,
      status: saleData.status || 'draft',
      payment_method: saleData.paymentMethod || saleData.payment_method || 'cash',
      payment_status: saleData.payment_status || saleData.paymentStatus || 'pending',
      due_date: saleData.due_date || saleData.dueDate,
      notes: saleData.notes || ''
    };

    const { data, error } = await supabase
      .from('sales')
      .insert(dbData)
      .select()
      .single();

    if (error) {
      console.error('Create sale error:', error);
      throw error;
    }
    
    return {
      id: data.id,
      invoice_number: data.invoice_number,
      party_id: data.customer_id,
      party_name: data.customer_name,
      items: data.items,
      subtotal: data.subtotal,
      tax_amount: data.tax,
      discount_amount: data.discount,
      total_amount: data.total,
      status: data.status,
      payment_status: data.payment_status,
      due_date: data.due_date,
      created_at: data.created_at,
      updated_at: data.updated_at
    };
  },

  async update(id: string, saleData: any) {
    console.log('Updating sale:', id, 'with data:', saleData);
    
    const dbData = {
      invoice_number: saleData.invoice_number || saleData.invoiceNumber,
      customer_name: saleData.party_name || saleData.customer_name || saleData.customerName,
      customer_email: saleData.customerEmail,
      customer_phone: saleData.customerPhone,
      customer_address: saleData.customerAddress,
      items: saleData.items,
      subtotal: saleData.subtotal,
      tax: saleData.tax_amount || saleData.tax,
      tax_rate: saleData.taxRate || saleData.tax_rate,
      discount: saleData.discount_amount || saleData.discount,
      total: saleData.total_amount || saleData.total,
      status: saleData.status,
      payment_method: saleData.paymentMethod || saleData.payment_method,
      payment_status: saleData.payment_status || saleData.paymentStatus,
      due_date: saleData.due_date || saleData.dueDate,
      notes: saleData.notes
    };

    const { data, error } = await supabase
      .from('sales')
      .update(dbData)
      .eq('id', id)
      .select()
      .single();

    if (error) {
      console.error('Update sale error:', error);
      throw error;
    }
    
    return {
      id: data.id,
      invoice_number: data.invoice_number,
      party_id: data.customer_id,
      party_name: data.customer_name,
      items: data.items,
      subtotal: data.subtotal,
      tax_amount: data.tax,
      discount_amount: data.discount,
      total_amount: data.total,
      status: data.status,
      payment_status: data.payment_status,
      due_date: data.due_date,
      created_at: data.created_at,
      updated_at: data.updated_at
    };
  },

  async delete(id: string) {
    const { error } = await supabase
      .from('sales')
      .delete()
      .eq('id', id);

    if (error) {
      console.error('Delete sale error:', error);
      throw error;
    }
    return { success: true };
  }
};

// Settings API
export const settingsAPI = {
  async getAll() {
    const { data, error } = await supabase
      .from('settings')
      .select('*');
    
    if (error) {
      console.error('Settings API error:', error);
      throw error;
    }
    
    // Convert array of settings to object
    const settingsObj: any = {};
    data?.forEach(setting => {
      settingsObj[setting.category] = setting.settings_data;
    });
    
    return settingsObj;
  },

  async updateCategory(category: string, settingsData: any) {
    console.log('Updating settings category:', category, 'with data:', settingsData);
    
    const { data, error } = await supabase
      .from('settings')
      .upsert({
        category,
        settings_data: settingsData
      }, {
        onConflict: 'category'
      })
      .select()
      .single();

    if (error) {
      console.error('Update settings error:', error);
      throw error;
    }
    
    return data;
  }
};

// Test connection function
export const testConnection = async () => {
  try {
    const { data, error } = await supabase
      .from('settings')
      .select('*')
      .limit(1);
    
    if (error) throw error;
    
    console.log('✅ Supabase connection successful');
    return { success: true, data };
  } catch (error) {
    console.error('❌ Supabase connection failed:', error);
    return { success: false, error };
  }
};

export default {
  itemsAPI,
  partiesAPI,
  salesAPI,
  settingsAPI,
  testConnection
};

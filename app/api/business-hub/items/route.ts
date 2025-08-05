import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
);

// Helper function to map database item to frontend format
function mapItemFromApi(item: any) {
  const itemData = item.item_data || {};
  return {
    id: item.id,
    item_id: item.item_id,
    name: item.item_name || 'Unnamed Item',
    item_name: item.item_name || 'Unnamed Item',
    sku: item.item_code || '',
    item_code: item.item_code || '',
    category: item.category || '',
    unit: item.unit || '',
    price: parseFloat(item.sale_price) || 0,
    sale_price: parseFloat(item.sale_price) || 0,
    cost: parseFloat(item.purchase_price) || 0,
    purchase_price: parseFloat(item.purchase_price) || 0,
    stock: parseFloat(item.stock_quantity) || 0,
    stock_quantity: parseFloat(item.stock_quantity) || 0,
    current_stock: parseFloat(item.stock_quantity) || 0,
    opening_stock: parseFloat(item.stock_quantity) || 0,
    minStock: parseFloat(item.min_stock) || 0,
    min_stock: parseFloat(item.min_stock) || 0,
    minimum_stock: parseFloat(item.min_stock) || 0,
    created_at: item.created_at,
    updated_at: item.updated_at,
    // Default type for regular items, can be overridden by item_data
    type: 'product',
    // Include any additional data from item_data JSONB field
    ...itemData
  };
}

// GET: List all items for a specific user
export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const phone = searchParams.get('phone');
    
    console.log('🔥 Items API GET called with phone:', phone);
    
    if (!phone) {
      console.log('❌ No phone number provided to items API');
      return NextResponse.json({ error: 'Phone number is required' }, { status: 400 });
    }

    console.log('🔍 Querying user_items table for phone:', phone);
    const { data, error } = await supabase
      .from('user_items')
      .select('*')
      .eq('phone_number', phone)
      .order('created_at', { ascending: false });
      
    if (error) {
      console.error('❌ Error fetching user items:', error);
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    console.log('✅ Raw data from user_items:', { count: data?.length, data: data });

    // Map the data to frontend format
    const mappedData = (data || []).map(mapItemFromApi);
    console.log('✅ Mapped items data:', { count: mappedData.length, mappedData });
    
    return NextResponse.json(mappedData);
  } catch (error) {
    console.error('❌ Error in items GET:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

// POST: Create a new item for a specific user
export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { phone, ...itemData } = body;
    
    if (!phone) {
      return NextResponse.json({ error: 'Phone number is required' }, { status: 400 });
    }

    // Map the item data to match the database schema
    const mappedItemData = {
      phone_number: phone,
      item_id: itemData.id || itemData.item_id || `item_${Date.now()}`,
      item_name: itemData.item_name || itemData.name || 'Unnamed Item',
      item_code: itemData.item_code || itemData.sku || '',
      category: itemData.category || 'General',
      unit: itemData.unit || 'pcs',
      sale_price: parseFloat(itemData.sale_price || itemData.price || '0'),
      purchase_price: parseFloat(itemData.purchase_price || itemData.cost || '0'),
      stock_quantity: parseFloat(itemData.stock_quantity || itemData.stock || itemData.current_stock || '0'),
      min_stock: parseFloat(itemData.minimum_stock || itemData.min_stock || itemData.minStock || '0'),
      item_data: {
        // Store additional fields that don't have direct database columns
        description: itemData.description,
        tax_rate: itemData.tax_rate,
        gst_rate: itemData.gst_rate,
        hsn_code: itemData.hsn_code || itemData.hsn,
        barcode: itemData.barcode,
        status: itemData.status,
        type: itemData.type,
        opening_stock: itemData.opening_stock,
        current_stock: itemData.current_stock,
        is_active: itemData.is_active
      }
    };

    const { data, error } = await supabase
      .from('user_items')
      .insert([mappedItemData])
      .select()
      .single();
      
    if (error) {
      console.error('Error creating user item:', error);
      return NextResponse.json({ error: error.message }, { status: 400 });
    }

    // Map the response to frontend format
    const mappedData = mapItemFromApi(data);
    return NextResponse.json(mappedData, { status: 201 });
  } catch (error) {
    console.error('Error in items POST:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
} 
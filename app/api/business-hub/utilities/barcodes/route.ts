import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
);

// POST: Create barcode for items
export async function POST(req: NextRequest) {
  try {
    const { itemIds } = await req.json();
    
    if (!Array.isArray(itemIds) || itemIds.length === 0) {
      return NextResponse.json({ error: 'Item IDs must be a non-empty array' }, { status: 400 });
    }

    // Get items from database
    const { data: items, error: fetchError } = await supabase
      .from('items')
      .select('id, name, sale_price, stock')
      .in('id', itemIds);

    if (fetchError) {
      return NextResponse.json({ error: fetchError.message }, { status: 400 });
    }

    // Generate barcodes for each item
    const barcodes = items.map(item => ({
      item_id: item.id,
      barcode: `BC${Date.now()}${Math.random().toString(36).substr(2, 5)}`.toUpperCase(),
      item_name: item.name,
      price: item.sale_price,
      stock: item.stock,
      created_at: new Date().toISOString()
    }));

    // Store barcodes in database (you might want to create a barcodes table)
    // For now, we'll return the generated data
    return NextResponse.json({ 
      success: true, 
      barcodes: barcodes 
    });

  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

// GET: Retrieve barcode by barcode value
export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const barcode = searchParams.get('barcode');

    if (!barcode) {
      return NextResponse.json({ error: 'Barcode parameter is required' }, { status: 400 });
    }

    // In a real implementation, you'd query a barcodes table
    // For now, we'll simulate finding an item
    const { data: items, error } = await supabase
      .from('items')
      .select('id, name, sale_price, stock')
      .limit(1);

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 400 });
    }

    if (items.length === 0) {
      return NextResponse.json({ error: 'Barcode not found' }, { status: 404 });
    }

    const item = items[0];
    return NextResponse.json({
      barcode,
      itemId: item.id,
      itemName: item.name,
      price: item.sale_price,
      stock: item.stock,
      timestamp: new Date().toISOString()
    });

  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

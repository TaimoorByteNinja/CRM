import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
);

// POST: Bulk update items
export async function POST(req: NextRequest) {
  try {
    const { updates } = await req.json();
    
    if (!Array.isArray(updates) || updates.length === 0) {
      return NextResponse.json({ error: 'Updates must be a non-empty array' }, { status: 400 });
    }

    const results = [];
    const errors = [];

    // Process each update
    for (const update of updates) {
      try {
        const { id, ...updateData } = update;
        
        // Map frontend fields to database fields
        const mappedData: any = {};
        if (updateData.salePrice !== undefined) mappedData.sale_price = updateData.salePrice;
        if (updateData.purchasePrice !== undefined) mappedData.purchase_price = updateData.purchasePrice;
        if (updateData.stock !== undefined) mappedData.stock = updateData.stock;
        if (updateData.minStock !== undefined) mappedData.min_stock = updateData.minStock;
        if (updateData.name !== undefined) mappedData.name = updateData.name;
        if (updateData.category !== undefined) mappedData.category = updateData.category;

        const { data, error } = await supabase
          .from('items')
          .update(mappedData)
          .eq('id', id)
          .select()
          .single();

        if (error) {
          errors.push({ id, error: error.message });
        } else {
          results.push(data);
        }
      } catch (error: any) {
        errors.push({ id: update.id, error: error.message });
      }
    }

    return NextResponse.json({ 
      success: true, 
      updated: results.length,
      errorCount: errors.length,
      results,
      errors
    });

  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

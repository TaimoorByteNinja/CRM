import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
);

// GET: Verify data integrity
export async function GET() {
  try {
    // Get all items
    const { data: items, error } = await supabase
      .from('items')
      .select('*');

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 400 });
    }

    // Perform various data integrity checks
    const results = {
      totalItems: items.length,
      missingHSN: items.filter(item => !item.hsn || item.hsn.trim() === '').length,
      missingCategory: items.filter(item => !item.category_id).length,
      duplicateEntries: 0, // Will be calculated below
      stockMismatches: items.filter(item => item.stock < 0).length,
      missingTaxFields: items.filter(item => item.tax_rate === null || item.tax_rate === undefined).length,
      priceInconsistencies: items.filter(item => item.sale_price < item.purchase_price).length,
      lowStockItems: items.filter(item => item.stock <= item.min_stock).length,
      inactiveItems: items.filter(item => item.status !== 'active').length,
      totalIssues: 0, // Will be calculated below
    };

    // Check for duplicate entries (by name or SKU)
    const nameMap = new Map();
    const skuMap = new Map();
    
    items.forEach(item => {
      if (nameMap.has(item.name)) {
        results.duplicateEntries++;
      } else {
        nameMap.set(item.name, true);
      }
      
      if (item.sku && skuMap.has(item.sku)) {
        results.duplicateEntries++;
      } else if (item.sku) {
        skuMap.set(item.sku, true);
      }
    });

    // Calculate total issues
    results.totalIssues = results.missingHSN + results.missingCategory + 
                         results.duplicateEntries + results.stockMismatches + 
                         results.missingTaxFields + results.priceInconsistencies;

    return NextResponse.json(results);

  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
);

export async function GET(req: NextRequest) {
  try {
    const url = new URL(req.url);
    const phoneNumber = url.searchParams.get('phone');

    // If no phone number provided, return empty data
    if (!phoneNumber) {
      return NextResponse.json({
        categories: []
      });
    }

    // Fetch user-specific sales with items data
    const { data: sales, error: salesError } = await supabase
      .from('user_sales')
      .select('items, total, created_at')
      .eq('phone_number', phoneNumber);

    if (salesError) {
      console.error('Error fetching sales for category analytics:', salesError);
      return NextResponse.json({ error: salesError.message }, { status: 500 });
    }

    // Fetch user-specific items for category mapping
    const { data: items, error: itemsError } = await supabase
      .from('user_items')
      .select('id, name, sku')
      .eq('phone_number', phoneNumber);

    if (itemsError) {
      console.error('Error fetching items:', itemsError);
      return NextResponse.json({ error: itemsError.message }, { status: 500 });
    }

    // Create item mapping for quick lookup
    const itemMap: { [key: string]: any } = {};
    items?.forEach(item => {
      itemMap[item.id] = item;
    });

    // Analyze category data from sales
    const categoryStats: { [key: string]: { sales: number; revenue: number; count: number; items: Set<string> } } = {};

    sales?.forEach(sale => {
      if (sale.items && Array.isArray(sale.items)) {
        sale.items.forEach((saleItem: any) => {
          const item = itemMap[saleItem.itemId];
          const category = item?.name ? 'General' : 'Unknown'; // Default category since items table doesn't have category field
          
          if (!categoryStats[category]) {
            categoryStats[category] = { sales: 0, revenue: 0, count: 0, items: new Set() };
          }
          
          categoryStats[category].sales += saleItem.total || 0;
          categoryStats[category].revenue += (saleItem.total || 0);
          categoryStats[category].count += saleItem.quantity || 1;
          categoryStats[category].items.add(saleItem.itemId);
        });
      }
    });

    // Convert to array format
    const categoryData = Object.entries(categoryStats).map(([category, stats]) => ({
      category,
      sales: stats.sales,
      revenue: stats.revenue,
      count: stats.count,
      uniqueItems: stats.items.size,
      percentage: 0 // Will be calculated below
    }));

    // Calculate percentages
    const totalSales = categoryData.reduce((sum, item) => sum + item.sales, 0);
    categoryData.forEach(item => {
      item.percentage = totalSales > 0 ? (item.sales / totalSales) * 100 : 0;
    });

    // Sort by sales descending
    categoryData.sort((a, b) => b.sales - a.sales);

    return NextResponse.json({
      categories: categoryData,
      totalCategories: categoryData.length,
      totalSales,
      topCategory: categoryData[0]?.category || 'None'
    });

  } catch (error) {
    console.error('Error in category analytics API:', error);
    return NextResponse.json(
      { error: 'Failed to fetch category analytics' },
      { status: 500 }
    );
  }
}

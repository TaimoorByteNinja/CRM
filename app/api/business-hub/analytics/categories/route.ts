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

    // Fetch user-specific sales with items data from both tables
    const [businessTransactionResult, userSalesResult] = await Promise.all([
      // Business transaction sales
      supabase
        .from('user_business_transactions')
        .select('item_name, total_price, timestamp, type')
        .eq('phone_number', phoneNumber)
        .eq('type', 'sale'),
      
      // User sales (direct sales)
      supabase
        .from('user_sales')
        .select('sale_data, total_amount, created_at')
        .eq('phone_number', phoneNumber)
    ]);

    if (businessTransactionResult.error) {
      console.error('Error fetching business transaction sales for category analytics:', businessTransactionResult.error);
      return NextResponse.json({ error: businessTransactionResult.error.message }, { status: 500 });
    }

    if (userSalesResult.error) {
      console.error('Error fetching user sales for category analytics:', userSalesResult.error);
      return NextResponse.json({ error: userSalesResult.error.message }, { status: 500 });
    }

    const businessTransactionSales = businessTransactionResult.data || [];
    const userSales = userSalesResult.data || [];

    console.log('📊 Categories: Found', businessTransactionSales.length, 'business transaction sales and', userSales.length, 'user sales');

    // Fetch user-specific business modules for category mapping
    const { data: modules, error: modulesError } = await supabase
      .from('user_business_modules')
      .select('id, name, type')
      .eq('phone_number', phoneNumber);

    if (modulesError) {
      console.error('Error fetching modules:', modulesError);
      return NextResponse.json({ error: modulesError.message }, { status: 500 });
    }

    // Create module mapping for category lookup
    const moduleMap: { [key: string]: any } = {};
    modules?.forEach(module => {
      moduleMap[module.name] = module;
    });

    // Analyze category data from both sales sources
    const categoryStats: { [key: string]: { sales: number; revenue: number; count: number; items: Set<string> } } = {};

    // Process business transaction sales
    businessTransactionSales.forEach((sale: any) => {
      const itemName = sale.item_name || 'Unknown';
      const module = moduleMap[itemName];
      const category = module?.type || 'General'; // Use module type as category
      
      if (!categoryStats[category]) {
        categoryStats[category] = { sales: 0, revenue: 0, count: 0, items: new Set() };
      }
      
      const revenue = sale.total_price || 0;
      categoryStats[category].sales += revenue;
      categoryStats[category].revenue += revenue;
      categoryStats[category].count += 1;
      categoryStats[category].items.add(itemName);
    });

    // Process user sales (direct sales page)
    userSales.forEach((sale: any) => {
      const saleData = sale.sale_data || {};
      const items = saleData.items || [];
      const totalAmount = sale.total_amount || 0;
      
      if (items.length > 0) {
        // Distribute sale amount across items
        const amountPerItem = totalAmount / items.length;
        
        items.forEach((item: any) => {
          const itemName = item.itemName || item.item_name || 'Sale Item';
          const module = moduleMap[itemName];
          const category = module?.type || 'General';
          
          if (!categoryStats[category]) {
            categoryStats[category] = { sales: 0, revenue: 0, count: 0, items: new Set() };
          }
          
          categoryStats[category].sales += amountPerItem;
          categoryStats[category].revenue += amountPerItem;
          categoryStats[category].count += 1;
          categoryStats[category].items.add(itemName);
        });
      } else {
        // No items specified, add to General
        const category = 'General';
        if (!categoryStats[category]) {
          categoryStats[category] = { sales: 0, revenue: 0, count: 0, items: new Set() };
        }
        categoryStats[category].sales += totalAmount;
        categoryStats[category].revenue += totalAmount;
        categoryStats[category].count += 1;
        categoryStats[category].items.add('Direct Sale');
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

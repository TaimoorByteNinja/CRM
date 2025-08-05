import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
);

export async function GET(req: NextRequest) {
  try {
    const url = new URL(req.url);
    const period = url.searchParams.get('period') || 'allTime';
    const phoneNumber = url.searchParams.get('phone');

    // If no phone number provided, return empty data
    if (!phoneNumber) {
      return NextResponse.json({
        data: [],
        totalSales: 0,
        totalRevenue: 0,
        totalProfit: 0,
        totalCount: 0
      });
    }

    // Calculate date range based on period
    let startDate: string | null = null;
    let endDate: string | null = null;
    const now = new Date();

    switch (period) {
      case 'last7Days':
        startDate = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000).toISOString().split('T')[0];
        endDate = now.toISOString().split('T')[0];
        break;
      case 'last30Days':
        startDate = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0];
        endDate = now.toISOString().split('T')[0];
        break;
      case 'thisMonth':
        startDate = new Date(now.getFullYear(), now.getMonth(), 1).toISOString().split('T')[0];
        endDate = now.toISOString().split('T')[0];
        break;
      case 'lastMonth':
        const lastMonth = new Date(now.getFullYear(), now.getMonth() - 1, 1);
        startDate = lastMonth.toISOString().split('T')[0];
        endDate = new Date(now.getFullYear(), now.getMonth(), 0).toISOString().split('T')[0];
        break;
      case 'thisYear':
        startDate = new Date(now.getFullYear(), 0, 1).toISOString().split('T')[0];
        endDate = now.toISOString().split('T')[0];
        break;
      case 'lastYear':
        startDate = new Date(now.getFullYear() - 1, 0, 1).toISOString().split('T')[0];
        endDate = new Date(now.getFullYear() - 1, 11, 31).toISOString().split('T')[0];
        break;
      default: // allTime
        break;
    }

    // Build query for user-specific sales data
    let query = supabase
      .from('user_sales')
      .select('created_at, total_amount, subtotal, tax_amount')
      .eq('phone_number', phoneNumber)
      .order('created_at', { ascending: true });

    if (startDate && endDate) {
      query = query.gte('created_at', startDate).lte('created_at', endDate);
    }

    const { data: sales, error } = await query;

    if (error) {
      console.error('Error fetching sales chart data:', error);
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    // Group data by date
    const groupedData: { [key: string]: { sales: number; revenue: number; profit: number; count: number } } = {};

    sales?.forEach(sale => {
      const date = new Date(sale.created_at).toISOString().split('T')[0];
      if (!groupedData[date]) {
        groupedData[date] = { sales: 0, revenue: 0, profit: 0, count: 0 };
      }
      groupedData[date].sales += sale.total_amount || 0;
      groupedData[date].revenue += sale.subtotal || 0;
      groupedData[date].profit += (sale.subtotal || 0) * 0.25; // Assuming 25% profit margin
      groupedData[date].count += 1;
    });

    // Convert to array format for charts
    const chartData = Object.entries(groupedData).map(([date, data]) => ({
      date,
      sales: data.sales,
      revenue: data.revenue,
      profit: data.profit,
      count: data.count,
      name: new Date(date).toLocaleDateString('en-US', { 
        month: 'short', 
        day: 'numeric' 
      })
    }));

    // Return zero data for new users instead of sample data
    let finalChartData = chartData;
    if (chartData.length === 0) {
      console.log('No sales data found for user, returning empty chart with zero values');
      
      const today = new Date();
      const emptyData = [];
      
      // Generate last 7 days with zero values for new users
      for (let i = 6; i >= 0; i--) {
        const date = new Date(today.getTime() - i * 24 * 60 * 60 * 1000);
        const dateStr = date.toISOString().split('T')[0];
        
        emptyData.push({
          date: dateStr,
          sales: 0,
          revenue: 0,
          profit: 0,
          count: 0,
          name: date.toLocaleDateString('en-US', { 
            month: 'short', 
            day: 'numeric' 
          })
        });
      }
      
      finalChartData = emptyData;
    } else if (chartData.length < 3) {
      // Fill in missing days with actual zero data if we have some but limited data
      const today = new Date();
      const filledData = [];
      
      for (let i = 6; i >= 0; i--) {
        const date = new Date(today.getTime() - i * 24 * 60 * 60 * 1000);
        const dateStr = date.toISOString().split('T')[0];
        const existingData = chartData.find(item => item.date === dateStr);
        
        if (existingData) {
          filledData.push(existingData);
        } else {
          // Use zero values for missing days instead of sample data
          filledData.push({
            date: dateStr,
            sales: 0,
            revenue: 0,
            profit: 0,
            count: 0,
            name: date.toLocaleDateString('en-US', { 
              month: 'short', 
              day: 'numeric' 
            })
          });
        }
      }
      
      finalChartData = filledData;
    }

    return NextResponse.json({
      period,
      data: finalChartData,
      totalSales: finalChartData.reduce((sum, item) => sum + item.sales, 0),
      totalRevenue: finalChartData.reduce((sum, item) => sum + item.revenue, 0),
      totalProfit: finalChartData.reduce((sum, item) => sum + item.profit, 0),
      totalCount: finalChartData.reduce((sum, item) => sum + item.count, 0),
    });

  } catch (error) {
    console.error('Error in sales chart API:', error);
    return NextResponse.json(
      { error: 'Failed to fetch sales chart data' },
      { status: 500 }
    );
  }
}

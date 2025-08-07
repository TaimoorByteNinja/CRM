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

    // Build queries for user-specific sales data from both tables
    console.log('📊 Analytics: Fetching sales data from both tables for phone:', phoneNumber);

    // Query 1: Business transactions (business manager sales)
    let businessTransactionQuery = supabase
      .from('user_business_transactions')
      .select('timestamp, total_price, type')
      .eq('phone_number', phoneNumber)
      .eq('type', 'sale')
      .order('timestamp', { ascending: true });

    if (startDate && endDate) {
      businessTransactionQuery = businessTransactionQuery.gte('timestamp', startDate).lte('timestamp', endDate);
    }

    // Query 2: Direct sales (sales page sales)
    let userSalesQuery = supabase
      .from('user_sales')
      .select('created_at, total_amount')
      .eq('phone_number', phoneNumber)
      .order('created_at', { ascending: true });

    if (startDate && endDate) {
      userSalesQuery = userSalesQuery.gte('created_at', startDate).lte('created_at', endDate);
    }

    // Execute both queries in parallel, plus get purchases and expenses for accurate profit calculation
    const [businessTransactionResult, userSalesResult, purchasesResult, expensesResult] = await Promise.all([
      businessTransactionQuery,
      userSalesQuery,
      // Get purchases for profit calculation (same as overview page)
      supabase
        .from('user_purchases')
        .select('purchase_date, total_amount, created_at')
        .eq('phone_number', phoneNumber)
        .then(result => {
          if (startDate && endDate) {
            // Filter purchases by date range
            const filtered = (result.data || []).filter(purchase => {
              const purchaseDate = new Date(purchase.purchase_date || purchase.created_at).toISOString().split('T')[0];
              return purchaseDate >= startDate && purchaseDate <= endDate;
            });
            return { ...result, data: filtered };
          }
          return result;
        }),
      // Get expenses for profit calculation (same as overview page)
      supabase
        .from('user_expenses')
        .select('expense_date, amount, created_at')
        .eq('phone_number', phoneNumber)
        .then(result => {
          if (startDate && endDate) {
            // Filter expenses by date range
            const filtered = (result.data || []).filter(expense => {
              const expenseDate = new Date(expense.expense_date || expense.created_at).toISOString().split('T')[0];
              return expenseDate >= startDate && expenseDate <= endDate;
            });
            return { ...result, data: filtered };
          }
          return result;
        })
    ]);

    if (businessTransactionResult.error) {
      console.error('Error fetching business transaction sales:', businessTransactionResult.error);
      return NextResponse.json({ error: businessTransactionResult.error.message }, { status: 500 });
    }

    if (userSalesResult.error) {
      console.error('Error fetching user sales:', userSalesResult.error);
      return NextResponse.json({ error: userSalesResult.error.message }, { status: 500 });
    }

    if (purchasesResult.error) {
      console.error('Error fetching purchases:', purchasesResult.error);
      // Continue without purchases data
    }

    if (expensesResult.error) {
      console.error('Error fetching expenses:', expensesResult.error);
      // Continue without expenses data
    }

    const businessTransactionSales = businessTransactionResult.data || [];
    const userSales = userSalesResult.data || [];
    const purchases = purchasesResult.data || [];
    const expenses = expensesResult.data || [];

    console.log('📈 Analytics: Found', businessTransactionSales.length, 'business transaction sales,', userSales.length, 'user sales,', purchases.length, 'purchases, and', expenses.length, 'expenses');

    // Group purchases and expenses by date for accurate profit calculation
    const purchasesByDate: { [key: string]: number } = {};
    const expensesByDate: { [key: string]: number } = {};

    purchases.forEach(purchase => {
      const date = new Date(purchase.purchase_date || purchase.created_at).toISOString().split('T')[0];
      purchasesByDate[date] = (purchasesByDate[date] || 0) + (purchase.total_amount || 0);
    });

    expenses.forEach(expense => {
      const date = new Date(expense.expense_date || expense.created_at).toISOString().split('T')[0];
      expensesByDate[date] = (expensesByDate[date] || 0) + (expense.amount || 0);
    });

    // Group data by date, combining both sources (same logic as overview page)
    const groupedData: { [key: string]: { sales: number; revenue: number; profit: number; count: number } } = {};

    // Process business transaction sales
    businessTransactionSales.forEach(sale => {
      const date = new Date(sale.timestamp).toISOString().split('T')[0];
      if (!groupedData[date]) {
        groupedData[date] = { sales: 0, revenue: 0, profit: 0, count: 0 };
      }
      const totalPrice = sale.total_price || 0;
      groupedData[date].sales += totalPrice;
      groupedData[date].count += 1;
    });

    // Process user sales
    userSales.forEach(sale => {
      const date = new Date(sale.created_at).toISOString().split('T')[0];
      if (!groupedData[date]) {
        groupedData[date] = { sales: 0, revenue: 0, profit: 0, count: 0 };
      }
      const totalAmount = sale.total_amount || 0;
      groupedData[date].sales += totalAmount;
      groupedData[date].count += 1;
    });

    // Calculate revenue and profit using the same logic as overview page
    Object.keys(groupedData).forEach(date => {
      const dayData = groupedData[date];
      // Revenue = Sales (same as overview page)
      dayData.revenue = dayData.sales;
      
      // Profit = Sales - Purchases - Expenses (same as overview page)
      const dayPurchases = purchasesByDate[date] || 0;
      const dayExpenses = expensesByDate[date] || 0;
      dayData.profit = Math.max(0, dayData.sales - dayPurchases - dayExpenses);
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

    // Calculate overall totals for verification (same as overview API)
    const overallSales = businessTransactionSales.reduce((sum, sale) => sum + (sale.total_price || 0), 0) + 
                        userSales.reduce((sum, sale) => sum + (sale.total_amount || 0), 0);
    const overallPurchases = purchases.reduce((sum, purchase) => sum + (purchase.total_amount || 0), 0);
    const overallExpenses = expenses.reduce((sum, expense) => sum + (expense.amount || 0), 0);
    const overallProfit = Math.max(0, overallSales - overallPurchases - overallExpenses);

    console.log('📊 Analytics: Overall calculations:', {
      overallSales,
      overallPurchases, 
      overallExpenses,
      overallProfit,
      chartDataTotalSales: finalChartData.reduce((sum, item) => sum + item.sales, 0),
      chartDataTotalProfit: finalChartData.reduce((sum, item) => sum + item.profit, 0)
    });

    return NextResponse.json({
      period,
      data: finalChartData,
      // Use the same overall calculation method as overview API for consistency
      totalSales: overallSales,
      totalRevenue: overallSales, // Revenue = Sales (same as overview)
      totalProfit: overallProfit, // Profit = Sales - Purchases - Expenses (same as overview)
      totalCount: finalChartData.reduce((sum, item) => sum + item.count, 0),
      // Add totals calculated the same way as overview API for verification
      overallTotals: {
        totalSalesFromData: overallSales,
        totalPurchasesFromData: overallPurchases,
        totalExpensesFromData: overallExpenses,
        calculatedProfit: overallProfit
      },
      debug: {
        rawDataCount: businessTransactionSales.length + userSales.length,
        businessTransactionCount: businessTransactionSales.length,
        userSalesCount: userSales.length,
        purchasesCount: purchases.length,
        expensesCount: expenses.length,
        groupedDataKeys: Object.keys(groupedData),
        sampleData: finalChartData.slice(0, 2),
        purchasesByDate: Object.keys(purchasesByDate).length > 0 ? purchasesByDate : 'No purchases found',
        expensesByDate: Object.keys(expensesByDate).length > 0 ? expensesByDate : 'No expenses found'
      }
    });

  } catch (error) {
    console.error('Error in sales chart API:', error);
    return NextResponse.json(
      { error: 'Failed to fetch sales chart data' },
      { status: 500 }
    );
  }
}

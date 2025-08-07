import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
);

// GET: Fetch comprehensive business metrics for overview dashboard
export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const period = searchParams.get('period') || 'allTime';
    const startDate = searchParams.get('startDate');
    const endDate = searchParams.get('endDate');
    const phoneNumber = searchParams.get('phone');

    // If no phone number provided, return empty data
    if (!phoneNumber) {
      return NextResponse.json({
        success: true,
        data: {
          totalSales: 0,
          totalPurchases: 0,
          todaysSales: 0,
          profitMargin: 0,
          totalParties: 0,
          customers: 0,
          suppliers: 0,
          totalSalesAllTime: 0,
          totalRevenueAllTime: 0,
          totalProfitAllTime: 0,
          totalOrdersAllTime: 0,
          availableBalance: 0,
          totalExpenses: 0,
          inventoryValue: 0,
          pendingOrders: 0,
          completedOrders: 0,
          growth: {
            salesGrowth: 0,
            purchaseGrowth: 0,
            customerGrowth: 0,
            profitGrowth: 0
          }
        }
      });
    }

    // Helper function to filter by date range if specified
    const getDateFilter = (dateColumn: string = 'created_at') => {
      if (period === 'allTime' || (!startDate && !endDate)) return '';
      
      let conditions = [];
      if (startDate) conditions.push(`${dateColumn}.gte.${startDate}`);
      if (endDate) conditions.push(`${dateColumn}.lte.${endDate}`);
      return conditions.length > 0 ? `&${conditions.join('&')}` : '';
    };

    // Get today's date for today's sales
    const today = new Date().toISOString().split('T')[0];

    // Parallel fetch all data from USER-SPECIFIC tables
    const [
      businessTransactionSalesData,
      userSalesData,
      todaysBusinessTransactionSalesData,
      todaysUserSalesData,
      purchasesData,
      itemsData,
      partiesData,
      bankAccountsData,
      expensesData,
      salesSummaryData
    ] = await Promise.all([
      // Total Sales from user_business_transactions table (business manager sales)
      supabase
        .from('user_business_transactions')
        .select('*')
        .eq('phone_number', phoneNumber)
        .eq('type', 'sale')
        .then(({ data, error }) => {
          if (error) throw error;
          return data || [];
        }),

      // Total Sales from user_sales table (direct sales page)
      supabase
        .from('user_sales')
        .select('*')
        .eq('phone_number', phoneNumber)
        .then(({ data, error }) => {
          if (error) throw error;
          return data || [];
        }),

      // Today's Sales from user_business_transactions table
      supabase
        .from('user_business_transactions')
        .select('*')
        .eq('phone_number', phoneNumber)
        .eq('type', 'sale')
        .gte('timestamp', `${today}T00:00:00`)
        .lte('timestamp', `${today}T23:59:59`)
        .then(({ data, error }) => {
          if (error) throw error;
          return data || [];
        }),

      // Today's Sales from user_sales table
      supabase
        .from('user_sales')
        .select('*')
        .eq('phone_number', phoneNumber)
        .gte('created_at', `${today}T00:00:00`)
        .lte('created_at', `${today}T23:59:59`)
        .then(({ data, error }) => {
          if (error) throw error;
          return data || [];
        }),

      // Total Purchases from user_purchases table
      supabase
        .from('user_purchases')
        .select('*')
        .eq('phone_number', phoneNumber)
        .then(({ data, error }) => {
          if (error) throw error;
          return data || [];
        }),

      // Items from user_items table
      supabase
        .from('user_items')
        .select('*')
        .eq('phone_number', phoneNumber)
        .then(({ data, error }) => {
          if (error) throw error;
          return data || [];
        }),

      // Parties from user_parties table
      supabase
        .from('user_parties')
        .select('*')
        .eq('phone_number', phoneNumber)
        .then(({ data, error }) => {
          if (error) throw error;
          return data || [];
        }),

      // Bank accounts from user_bank_accounts table
      supabase
        .from('user_bank_accounts')
        .select('*')
        .eq('phone_number', phoneNumber)
        .then(({ data, error }) => {
          if (error) throw error;
          return data || [];
        }),

      // Expenses from user_expenses table
      supabase
        .from('user_expenses')
        .select('*')
        .eq('phone_number', phoneNumber)
        .then(({ data, error }) => {
          if (error) throw error;
          return data || [];
        }),

      // Sales summary (if view exists)
      supabase
        .from('sales_summary')
        .select('*')
        .then(({ data, error }) => {
          if (error) {
            console.warn('Sales summary view not available:', error);
            return [];
          }
          return data || [];
        })
    ]);

    // Calculate metrics by combining data from both sales tables
    console.log('📊 Overview: Calculating combined sales metrics...');
    console.log('Business Transaction Sales:', businessTransactionSalesData.length);
    console.log('User Sales:', userSalesData.length);

    // Combine and calculate total sales from both tables
    const businessTransactionTotal = businessTransactionSalesData.reduce((sum: number, sale: any) => {
      const amount = sale.total_price || 0;
      return sum + amount;
    }, 0);

    const userSalesTotal = userSalesData.reduce((sum: number, sale: any) => {
      const amount = sale.total_amount || 0;
      return sum + amount;
    }, 0);

    const totalSales = businessTransactionTotal + userSalesTotal;

    // Combine and calculate today's sales from both tables
    const todaysBusinessTransactionTotal = todaysBusinessTransactionSalesData.reduce((sum: number, sale: any) => {
      const amount = sale.total_price || 0;
      return sum + amount;
    }, 0);

    const todaysUserSalesTotal = todaysUserSalesData.reduce((sum: number, sale: any) => {
      const amount = sale.total_amount || 0;
      return sum + amount;
    }, 0);

    const todaysSales = todaysBusinessTransactionTotal + todaysUserSalesTotal;

    console.log('💰 Overview: Sales calculation results:', {
      businessTransactionTotal,
      userSalesTotal,
      totalSales,
      todaysBusinessTransactionTotal,
      todaysUserSalesTotal,
      todaysSales
    });

    const totalPurchases = purchasesData.reduce((sum, purchase) => {
      const amount = purchase.total_amount || 
                   (purchase.subtotal || 0) + (purchase.tax || 0) - (purchase.discount || 0);
      return sum + amount;
    }, 0);

    // Calculate inventory value
    const inventoryValue = itemsData.reduce((sum, item) => {
      const stock = item.current_stock || item.stock || 0;
      const price = item.selling_price || item.purchase_price || 0;
      return sum + (stock * price);
    }, 0);

    // Calculate available balance (total cash + bank balances)
    const availableBalance = bankAccountsData.reduce((sum, account) => {
      return sum + (account.balance || 0);
    }, 0);

    // Calculate total expenses
    const totalExpenses = expensesData.reduce((sum, expense) => {
      return sum + (expense.amount || 0);
    }, 0);

    // Calculate revenue (sales - returns/refunds)
    const revenue = totalSales; // Can be adjusted based on returns logic

    // Sales targets (this could be stored in settings or a separate table)
    const salesTargets = {
      monthly: 100000,  // Default targets - these should come from settings
      yearly: 1200000,
      daily: 3333
    };

    // Calculate some derived metrics
    const grossProfit = revenue - totalPurchases;
    const netProfit = grossProfit - totalExpenses;
    const profitMargin = revenue > 0 ? (netProfit / revenue) * 100 : 0;

    // Customer metrics
    const totalCustomers = partiesData.filter(p => 
      p.type === 'customer'
    ).length;

    const totalSuppliers = partiesData.filter(p => 
      p.type === 'supplier'
    ).length;

    // Stock metrics
    const lowStockItems = itemsData.filter(item => {
      const currentStock = item.current_stock || item.stock || 0;
      const minStock = item.minimum_stock || item.min_stock || 0;
      return currentStock <= minStock && minStock > 0;
    }).length;

    // Prepare response data
    const metrics = {
      // Core financial metrics
      totalSales: Math.round(totalSales * 100) / 100,
      totalPurchases: Math.round(totalPurchases * 100) / 100,
      revenue: Math.round(revenue * 100) / 100,
      todaysSales: Math.round(todaysSales * 100) / 100,
      
      // Inventory metrics
      inventoryValue: Math.round(inventoryValue * 100) / 100,
      totalItems: itemsData.length,
      lowStockItems,
      
      // Financial position
      availableBalance: Math.round(availableBalance * 100) / 100,
      totalExpenses: Math.round(totalExpenses * 100) / 100,
      grossProfit: Math.round(grossProfit * 100) / 100,
      netProfit: Math.round(netProfit * 100) / 100,
      profitMargin: Math.round(profitMargin * 100) / 100,
      
      // Targets and goals
      salesTargets,
      monthlyProgress: salesTargets.monthly > 0 ? (totalSales / salesTargets.monthly) * 100 : 0,
      dailyProgress: salesTargets.daily > 0 ? (todaysSales / salesTargets.daily) * 100 : 0,
      
      // Customer/supplier metrics
      totalCustomers,
      totalSuppliers,
      totalParties: partiesData.length,
      
      // Transaction counts
      totalSalesCount: businessTransactionSalesData.length + userSalesData.length,
      totalPurchasesCount: purchasesData.length,
      todaysSalesCount: todaysBusinessTransactionSalesData.length + todaysUserSalesData.length,
      
      // Additional metadata
      lastUpdated: new Date().toISOString(),
      period,
      dateRange: {
        start: startDate || 'all-time',
        end: endDate || 'current'
      }
    };

    return NextResponse.json({
      success: true,
      data: metrics,
      timestamp: new Date().toISOString()
    });

  } catch (error) {
    console.error('Error fetching overview metrics:', error);
    return NextResponse.json(
      { 
        success: false, 
        error: 'Failed to fetch overview metrics',
        details: error instanceof Error ? error.message : 'Unknown error'
      }, 
      { status: 500 }
    );
  }
}

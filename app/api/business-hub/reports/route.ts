import { NextRequest, NextResponse } from 'next/server';
import { supabaseServer } from '@/lib/supabaseServer';

// Updated: Fixed column name issues
export async function GET(req: NextRequest) {
  console.log('GET /api/business-hub/reports called');
  try {
    const { searchParams } = new URL(req.url);
    const phoneNumber = searchParams.get('phone');
    const reportType = searchParams.get('type');
    const startDate = searchParams.get('startDate');
    const endDate = searchParams.get('endDate');

    console.log('GET request params:', { phoneNumber, reportType, startDate, endDate });

    // If no phone number provided, return empty data
    if (!phoneNumber) {
      console.log('No phone number provided, returning empty data');
      return NextResponse.json({ error: 'Phone number is required' }, { status: 400 });
    }

    // If no report type specified, return error
    if (!reportType) {
      console.log('No report type specified');
      return NextResponse.json({ error: 'Report type is required' }, { status: 400 });
    }

    let reportData = {};

    switch (reportType) {
      case 'transaction-summary':
        reportData = await getTransactionSummary(phoneNumber, startDate, endDate);
        break;
      case 'sales-report':
        reportData = await getSalesReport(phoneNumber, startDate, endDate);
        break;
      case 'purchases-report':
        reportData = await getPurchasesReport(phoneNumber, startDate, endDate);
        break;
      case 'party-statement':
        reportData = await getPartyStatement(phoneNumber, startDate, endDate);
        break;
      case 'cash-flow':
        reportData = await getCashFlowReport(phoneNumber, startDate, endDate);
        break;
      case 'profit-loss':
        reportData = await getProfitLossReport(phoneNumber, startDate, endDate);
        break;
      
      // Party Reports
      case 'party-list':
      case 'party-report':
        reportData = await getPartyReport(phoneNumber, startDate, endDate);
        break;
      case 'party-report-item':
        reportData = await getPartyByItemReport(phoneNumber, startDate, endDate);
        break;
      
      // Item/Stock Reports
      case 'item-report':
      case 'stock-report':
        reportData = await getItemStockReport(phoneNumber, startDate, endDate);
        break;
      case 'item-report-party':
        reportData = await getItemByPartyReport(phoneNumber, startDate, endDate);
        break;
      case 'stock-summary':
      case 'stock-summary-item-category':
        reportData = await getStockSummaryReport(phoneNumber, startDate, endDate);
        break;
      
      // Business Status Reports
      case 'business-status':
      case 'trial-balance':
        reportData = await getBusinessStatusReport(phoneNumber, startDate, endDate);
        break;
      case 'balance-sheet':
        reportData = await getBalanceSheetReport(phoneNumber, startDate, endDate);
        break;
      
      // Tax Reports
      case 'tax-report':
        reportData = await getTaxReport(phoneNumber, startDate, endDate);
        break;
      case 'tax-rate-report':
        reportData = await getTaxRateReport(phoneNumber, startDate, endDate);
        break;
      
      // Expense Reports
      case 'expense-report':
        reportData = await getExpenseReport(phoneNumber, startDate, endDate);
        break;
      case 'expense-category':
        reportData = await getExpenseCategoryReport(phoneNumber, startDate, endDate);
        break;
      case 'expense-item':
        reportData = await getExpenseItemReport(phoneNumber, startDate, endDate);
        break;
      
      default:
        return NextResponse.json({ error: 'Invalid report type' }, { status: 400 });
    }

    console.log('Generated report data:', { type: reportType, dataCount: Array.isArray(reportData) ? reportData.length : Object.keys(reportData).length });
    return NextResponse.json(reportData);
  } catch (error) {
    console.error('GET API route error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

// Helper functions for different report types
async function getTransactionSummary(phoneNumber: string, startDate?: string | null, endDate?: string | null) {
  try {
    let query = supabaseServer
      .from('user_sales')
      .select('*')
      .eq('phone_number', phoneNumber);

    if (startDate) {
      query = query.gte('invoice_date', startDate);
    }
    if (endDate) {
      query = query.lte('invoice_date', endDate);
    }

    const { data: sales, error: salesError } = await query;

    if (salesError) {
      console.error('Error fetching sales for transaction summary:', salesError);
      return { sales: [], purchases: [], summary: { totalSales: 0, totalPurchases: 0, netProfit: 0 } };
    }

    // Similarly fetch purchases, cash transactions, etc.
    let purchaseQuery = supabaseServer
      .from('user_purchases')
      .select('*')
      .eq('phone_number', phoneNumber);

    if (startDate) {
      purchaseQuery = purchaseQuery.gte('created_at', startDate);
    }
    if (endDate) {
      purchaseQuery = purchaseQuery.lte('created_at', endDate);
    }

    const { data: purchases, error: purchaseError } = await purchaseQuery;

    const totalSales = sales?.reduce((sum, sale) => sum + (sale.total_amount || 0), 0) || 0;
    const totalPurchases = purchases?.reduce((sum, purchase) => sum + (purchase.total_amount || 0), 0) || 0;

    return {
      sales: sales || [],
      purchases: purchases || [],
      summary: {
        totalSales,
        totalPurchases,
        netProfit: totalSales - totalPurchases,
        transactionCount: (sales?.length || 0) + (purchases?.length || 0)
      }
    };
  } catch (error) {
    console.error('Error in getTransactionSummary:', error);
    return { sales: [], purchases: [], summary: { totalSales: 0, totalPurchases: 0, netProfit: 0 } };
  }
}

async function getSalesReport(phoneNumber: string, startDate?: string | null, endDate?: string | null) {
  try {
    let query = supabaseServer
      .from('user_sales')
      .select('*')
      .eq('phone_number', phoneNumber)
      .order('invoice_date', { ascending: false });

    if (startDate) {
      query = query.gte('invoice_date', startDate);
    }
    if (endDate) {
      query = query.lte('invoice_date', endDate);
    }

    const { data, error } = await query;

    if (error) {
      console.error('Error fetching sales report:', error);
      return [];
    }

    return data || [];
  } catch (error) {
    console.error('Error in getSalesReport:', error);
    return [];
  }
}

async function getPurchasesReport(phoneNumber: string, startDate?: string | null, endDate?: string | null) {
  try {
    let query = supabaseServer
      .from('user_purchases')
      .select('*')
      .eq('phone_number', phoneNumber)
      .order('created_at', { ascending: false });

    if (startDate) {
      query = query.gte('created_at', startDate);
    }
    if (endDate) {
      query = query.lte('created_at', endDate);
    }

    const { data, error } = await query;

    if (error) {
      console.error('Error fetching purchases report:', error);
      return [];
    }

    return data || [];
  } catch (error) {
    console.error('Error in getPurchasesReport:', error);
    return [];
  }
}

async function getPartyStatement(phoneNumber: string, startDate?: string | null, endDate?: string | null) {
  try {
    let salesQuery = supabaseServer
      .from('user_sales')
      .select('party_name, total_amount, paid_amount, invoice_date')
      .eq('phone_number', phoneNumber);

    let purchaseQuery = supabaseServer
      .from('user_purchases')
      .select('party_name, total_amount, paid_amount, created_at')
      .eq('phone_number', phoneNumber);

    if (startDate) {
      salesQuery = salesQuery.gte('invoice_date', startDate);
      purchaseQuery = purchaseQuery.gte('created_at', startDate);
    }
    if (endDate) {
      salesQuery = salesQuery.lte('invoice_date', endDate);
      purchaseQuery = purchaseQuery.lte('created_at', endDate);
    }

    const [{ data: sales }, { data: purchases }] = await Promise.all([
      salesQuery,
      purchaseQuery
    ]);

    // Group by party and calculate totals
    const partyData: Record<string, any> = {};
    
    sales?.forEach(sale => {
      if (!partyData[sale.party_name]) {
        partyData[sale.party_name] = { sales: 0, purchases: 0, balance: 0 };
      }
      partyData[sale.party_name].sales += sale.total_amount || 0;
      partyData[sale.party_name].balance += (sale.total_amount || 0) - (sale.paid_amount || 0);
    });

    purchases?.forEach(purchase => {
      if (!partyData[purchase.party_name]) {
        partyData[purchase.party_name] = { sales: 0, purchases: 0, balance: 0 };
      }
      partyData[purchase.party_name].purchases += purchase.total_amount || 0;
      partyData[purchase.party_name].balance -= (purchase.total_amount || 0) - (purchase.paid_amount || 0);
    });

    return Object.entries(partyData).map(([partyName, data]) => ({
      partyName,
      ...data
    }));
  } catch (error) {
    console.error('Error in getPartyStatement:', error);
    return [];
  }
}

async function getCashFlowReport(phoneNumber: string, startDate?: string | null, endDate?: string | null) {
  try {
    let cashQuery = supabaseServer
      .from('user_cash_transactions')
      .select('*')
      .eq('phone_number', phoneNumber)
      .order('created_at', { ascending: false });

    if (startDate) {
      cashQuery = cashQuery.gte('created_at', startDate);
    }
    if (endDate) {
      cashQuery = cashQuery.lte('created_at', endDate);
    }

    const { data: cashTransactions, error } = await cashQuery;

    if (error) {
      console.error('Error fetching cash flow report:', error);
      return { transactions: [], summary: { inflow: 0, outflow: 0, netFlow: 0 } };
    }

    const inflow = cashTransactions?.filter(t => t.type === 'income' || t.type === 'sale')
      .reduce((sum, t) => sum + (t.amount || 0), 0) || 0;
    
    const outflow = cashTransactions?.filter(t => t.type === 'expense' || t.type === 'purchase')
      .reduce((sum, t) => sum + (t.amount || 0), 0) || 0;

    return {
      transactions: cashTransactions || [],
      summary: {
        inflow,
        outflow,
        netFlow: inflow - outflow
      }
    };
  } catch (error) {
    console.error('Error in getCashFlowReport:', error);
    return { transactions: [], summary: { inflow: 0, outflow: 0, netFlow: 0 } };
  }
}

async function getProfitLossReport(phoneNumber: string, startDate?: string | null, endDate?: string | null) {
  try {
    const [salesData, purchasesData] = await Promise.all([
      getSalesReport(phoneNumber, startDate, endDate),
      getPurchasesReport(phoneNumber, startDate, endDate)
    ]);

    const totalRevenue = salesData.reduce((sum, sale) => sum + (sale.total_amount || 0), 0);
    const totalCosts = purchasesData.reduce((sum, purchase) => sum + (purchase.total_amount || 0), 0);
    const grossProfit = totalRevenue - totalCosts;

    return {
      revenue: totalRevenue,
      costs: totalCosts,
      grossProfit,
      profitMargin: totalRevenue > 0 ? ((grossProfit / totalRevenue) * 100).toFixed(2) : 0,
      salesData,
      purchasesData
    };
  } catch (error) {
    console.error('Error in getProfitLossReport:', error);
    return {
      revenue: 0,
      costs: 0,
      grossProfit: 0,
      profitMargin: 0,
      salesData: [],
      purchasesData: []
    };
  }
}

// Party Reports
async function getPartyReport(phoneNumber: string, startDate?: string | null, endDate?: string | null) {
  try {
    let query = supabaseServer
      .from('user_parties')
      .select('*')
      .eq('phone_number', phoneNumber)
      .order('created_at', { ascending: false });

    const { data: parties, error } = await query;

    if (error) {
      console.error('Error fetching party report:', error);
      return [];
    }

    // Get transaction data for each party
    const partiesWithTransactions = await Promise.all(
      (parties || []).map(async (party) => {
        const [salesData, purchasesData] = await Promise.all([
          getSalesForParty(phoneNumber, party.party_name || party.name, startDate, endDate),
          getPurchasesForParty(phoneNumber, party.party_name || party.name, startDate, endDate)
        ]);

        const totalSales = salesData.reduce((sum, sale) => sum + (sale.total_amount || 0), 0);
        const totalPurchases = purchasesData.reduce((sum, purchase) => sum + (purchase.total_amount || 0), 0);
        const totalReceivable = salesData.reduce((sum, sale) => sum + ((sale.total_amount || 0) - (sale.paid_amount || 0)), 0);
        const totalPayable = purchasesData.reduce((sum, purchase) => sum + ((purchase.total_amount || 0) - (purchase.paid_amount || 0)), 0);

        return {
          ...party,
          totalSales,
          totalPurchases,
          totalReceivable,
          totalPayable,
          netBalance: totalReceivable - totalPayable,
          transactionCount: salesData.length + purchasesData.length
        };
      })
    );

    return partiesWithTransactions;
  } catch (error) {
    console.error('Error in getPartyReport:', error);
    return [];
  }
}

async function getPartyByItemReport(phoneNumber: string, startDate?: string | null, endDate?: string | null) {
  try {
    // Get all sales and purchases with item details
    let salesQuery = supabaseServer
      .from('user_sales')
      .select('party_name, items')
      .eq('phone_number', phoneNumber);

    let purchasesQuery = supabaseServer
      .from('user_purchases')
      .select('party_name, items')
      .eq('phone_number', phoneNumber);

    if (startDate) {
      salesQuery = salesQuery.gte('invoice_date', startDate);
      purchasesQuery = purchasesQuery.gte('created_at', startDate);
    }
    if (endDate) {
      salesQuery = salesQuery.lte('invoice_date', endDate);
      purchasesQuery = purchasesQuery.lte('created_at', endDate);
    }

    const [{ data: sales }, { data: purchases }] = await Promise.all([
      salesQuery,
      purchasesQuery
    ]);

    const partyItemData: Record<string, any> = {};

    // Process sales data
    sales?.forEach(sale => {
      if (sale.items) {
        const items = typeof sale.items === 'string' ? JSON.parse(sale.items) : sale.items;
        items.forEach((item: any) => {
          const key = `${sale.party_name}-${item.name}`;
          if (!partyItemData[key]) {
            partyItemData[key] = {
              partyName: sale.party_name,
              itemName: item.name,
              salesQuantity: 0,
              salesAmount: 0,
              purchasesQuantity: 0,
              purchasesAmount: 0
            };
          }
          partyItemData[key].salesQuantity += item.quantity || 0;
          partyItemData[key].salesAmount += (item.quantity || 0) * (item.price || 0);
        });
      }
    });

    // Process purchases data
    purchases?.forEach(purchase => {
      if (purchase.items) {
        const items = typeof purchase.items === 'string' ? JSON.parse(purchase.items) : purchase.items;
        items.forEach((item: any) => {
          const key = `${purchase.party_name}-${item.name}`;
          if (!partyItemData[key]) {
            partyItemData[key] = {
              partyName: purchase.party_name,
              itemName: item.name,
              salesQuantity: 0,
              salesAmount: 0,
              purchasesQuantity: 0,
              purchasesAmount: 0
            };
          }
          partyItemData[key].purchasesQuantity += item.quantity || 0;
          partyItemData[key].purchasesAmount += (item.quantity || 0) * (item.price || 0);
        });
      }
    });

    return Object.values(partyItemData);
  } catch (error) {
    console.error('Error in getPartyByItemReport:', error);
    return [];
  }
}

// Item/Stock Reports
async function getItemStockReport(phoneNumber: string, startDate?: string | null, endDate?: string | null) {
  try {
    let query = supabaseServer
      .from('user_items')
      .select('*')
      .eq('phone_number', phoneNumber)
      .order('created_at', { ascending: false });

    const { data: items, error } = await query;

    if (error) {
      console.error('Error fetching item stock report:', error);
      return [];
    }

    // Get transaction data for each item
    const itemsWithStock = await Promise.all(
      (items || []).map(async (item) => {
        const [salesData, purchasesData] = await Promise.all([
          getSalesForItem(phoneNumber, item.item_name || item.name, startDate, endDate),
          getPurchasesForItem(phoneNumber, item.item_name || item.name, startDate, endDate)
        ]);

        const totalSold = salesData.reduce((sum, sale) => {
          if (sale.items) {
            const items = typeof sale.items === 'string' ? JSON.parse(sale.items) : sale.items;
            return sum + items.reduce((itemSum: number, saleItem: any) => 
              saleItem.name === (item.item_name || item.name) ? itemSum + (saleItem.quantity || 0) : itemSum, 0);
          }
          return sum;
        }, 0);

        const totalPurchased = purchasesData.reduce((sum, purchase) => {
          if (purchase.items) {
            const items = typeof purchase.items === 'string' ? JSON.parse(purchase.items) : purchase.items;
            return sum + items.reduce((itemSum: number, purchaseItem: any) => 
              purchaseItem.name === (item.item_name || item.name) ? itemSum + (purchaseItem.quantity || 0) : itemSum, 0);
          }
          return sum;
        }, 0);

        const currentStock = (item.opening_stock || item.stock_quantity || item.stock || 0) + totalPurchased - totalSold;

        return {
          ...item,
          currentStock,
          totalSold,
          totalPurchased,
          stockValue: currentStock * (item.sale_price || item.price || 0),
          isLowStock: currentStock <= (item.minimum_stock || item.min_stock || item.minStock || 5)
        };
      })
    );

    return itemsWithStock;
  } catch (error) {
    console.error('Error in getItemStockReport:', error);
    return [];
  }
}

async function getItemByPartyReport(phoneNumber: string, startDate?: string | null, endDate?: string | null) {
  try {
    // Get all sales and purchases with party details
    let salesQuery = supabaseServer
      .from('user_sales')
      .select('party_name, items')
      .eq('phone_number', phoneNumber);

    let purchasesQuery = supabaseServer
      .from('user_purchases')
      .select('party_name, items')
      .eq('phone_number', phoneNumber);

    if (startDate) {
      salesQuery = salesQuery.gte('invoice_date', startDate);
      purchasesQuery = purchasesQuery.gte('created_at', startDate);
    }
    if (endDate) {
      salesQuery = salesQuery.lte('invoice_date', endDate);
      purchasesQuery = purchasesQuery.lte('created_at', endDate);
    }

    const [{ data: sales }, { data: purchases }] = await Promise.all([
      salesQuery,
      purchasesQuery
    ]);

    const itemPartyData: Record<string, any> = {};

    // Process sales data
    sales?.forEach(sale => {
      if (sale.items) {
        const items = typeof sale.items === 'string' ? JSON.parse(sale.items) : sale.items;
        items.forEach((item: any) => {
          const key = `${item.name}-${sale.party_name}`;
          if (!itemPartyData[key]) {
            itemPartyData[key] = {
              itemName: item.name,
              partyName: sale.party_name,
              salesQuantity: 0,
              salesAmount: 0,
              purchasesQuantity: 0,
              purchasesAmount: 0
            };
          }
          itemPartyData[key].salesQuantity += item.quantity || 0;
          itemPartyData[key].salesAmount += (item.quantity || 0) * (item.price || 0);
        });
      }
    });

    // Process purchases data
    purchases?.forEach(purchase => {
      if (purchase.items) {
        const items = typeof purchase.items === 'string' ? JSON.parse(purchase.items) : purchase.items;
        items.forEach((item: any) => {
          const key = `${item.name}-${purchase.party_name}`;
          if (!itemPartyData[key]) {
            itemPartyData[key] = {
              itemName: item.name,
              partyName: purchase.party_name,
              salesQuantity: 0,
              salesAmount: 0,
              purchasesQuantity: 0,
              purchasesAmount: 0
            };
          }
          itemPartyData[key].purchasesQuantity += item.quantity || 0;
          itemPartyData[key].purchasesAmount += (item.quantity || 0) * (item.price || 0);
        });
      }
    });

    return Object.values(itemPartyData);
  } catch (error) {
    console.error('Error in getItemByPartyReport:', error);
    return [];
  }
}

async function getStockSummaryReport(phoneNumber: string, startDate?: string | null, endDate?: string | null) {
  try {
    const itemsData = await getItemStockReport(phoneNumber, startDate, endDate);
    
    // Group by category
    const categoryData: Record<string, any> = {};
    
    itemsData.forEach((item: any) => {
      const category = item.category || 'Uncategorized';
      if (!categoryData[category]) {
        categoryData[category] = {
          category,
          totalItems: 0,
          totalStock: 0,
          totalValue: 0,
          lowStockItems: 0
        };
      }
      
      categoryData[category].totalItems += 1;
      categoryData[category].totalStock += item.currentStock || 0;
      categoryData[category].totalValue += item.stockValue || 0;
      if (item.isLowStock) {
        categoryData[category].lowStockItems += 1;
      }
    });

    return Object.values(categoryData);
  } catch (error) {
    console.error('Error in getStockSummaryReport:', error);
    return [];
  }
}

// Business Status Reports
async function getBusinessStatusReport(phoneNumber: string, startDate?: string | null, endDate?: string | null) {
  try {
    // Get cash and bank data
    const [cashData, bankData, salesData, purchasesData] = await Promise.all([
      getCashTransactionsData(phoneNumber, startDate, endDate),
      getBankAccountsData(phoneNumber),
      getSalesReport(phoneNumber, startDate, endDate),
      getPurchasesReport(phoneNumber, startDate, endDate)
    ]);

    const totalCash = cashData.reduce((sum, transaction) => {
      return transaction.type === 'income' || transaction.type === 'sale' 
        ? sum + (transaction.amount || 0)
        : sum - (transaction.amount || 0);
    }, 0);

    const totalBank = bankData.reduce((sum, account) => sum + (account.balance || 0), 0);
    const totalSales = salesData.reduce((sum, sale) => sum + (sale.total_amount || 0), 0);
    const totalPurchases = purchasesData.reduce((sum, purchase) => sum + (purchase.total_amount || 0), 0);
    const totalReceivables = salesData.reduce((sum, sale) => sum + ((sale.total_amount || 0) - (sale.paid_amount || 0)), 0);
    const totalPayables = purchasesData.reduce((sum, purchase) => sum + ((purchase.total_amount || 0) - (purchase.paid_amount || 0)), 0);

    return {
      assets: {
        cash: totalCash,
        bank: totalBank,
        receivables: totalReceivables,
        total: totalCash + totalBank + totalReceivables
      },
      liabilities: {
        payables: totalPayables,
        total: totalPayables
      },
      equity: {
        capital: totalCash + totalBank + totalReceivables - totalPayables,
        total: totalCash + totalBank + totalReceivables - totalPayables
      },
      performance: {
        sales: totalSales,
        purchases: totalPurchases,
        profit: totalSales - totalPurchases
      }
    };
  } catch (error) {
    console.error('Error in getBusinessStatusReport:', error);
    return {
      assets: { cash: 0, bank: 0, receivables: 0, total: 0 },
      liabilities: { payables: 0, total: 0 },
      equity: { capital: 0, total: 0 },
      performance: { sales: 0, purchases: 0, profit: 0 }
    };
  }
}

async function getBalanceSheetReport(phoneNumber: string, startDate?: string | null, endDate?: string | null) {
  return await getBusinessStatusReport(phoneNumber, startDate, endDate);
}

// Tax Reports
async function getTaxReport(phoneNumber: string, startDate?: string | null, endDate?: string | null) {
  try {
    const [salesData, purchasesData, cashData] = await Promise.all([
      getSalesReport(phoneNumber, startDate, endDate),
      getPurchasesReport(phoneNumber, startDate, endDate),
      getCashTransactionsData(phoneNumber, startDate, endDate)
    ]);

    // Calculate tax from sales
    const salesTax = salesData.reduce((sum, sale) => {
      if (sale.items) {
        const items = typeof sale.items === 'string' ? JSON.parse(sale.items) : sale.items;
        return sum + items.reduce((itemSum: number, item: any) => {
          const itemTotal = (item.quantity || 0) * (item.price || 0);
          const taxRate = item.tax_rate || item.gst_rate || sale.gst_rate || 0;
          return itemSum + (itemTotal * (parseFloat(taxRate.toString()) / 100));
        }, 0);
      }
      return sum + ((sale.total_amount || 0) * ((sale.gst_rate || 0) / 100));
    }, 0);

    // Calculate tax from purchases
    const purchasesTax = purchasesData.reduce((sum, purchase) => {
      if (purchase.items) {
        const items = typeof purchase.items === 'string' ? JSON.parse(purchase.items) : purchase.items;
        return sum + items.reduce((itemSum: number, item: any) => {
          const itemTotal = (item.quantity || 0) * (item.price || 0);
          const taxRate = item.tax_rate || item.gst_rate || purchase.gst_rate || 0;
          return itemSum + (itemTotal * (parseFloat(taxRate.toString()) / 100));
        }, 0);
      }
      return sum + ((purchase.total_amount || 0) * ((purchase.gst_rate || 0) / 100));
    }, 0);

    // Calculate tax from cash transactions (if any)
    const cashTax = cashData.reduce((sum, transaction) => {
      return sum + ((transaction.tax_amount || 0));
    }, 0);

    return {
      salesTax,
      purchasesTax,
      cashTax,
      totalTax: salesTax + purchasesTax + cashTax,
      netTax: salesTax - purchasesTax + cashTax,
      breakdown: {
        sales: salesData.map(sale => ({
          ...sale,
          taxAmount: sale.items ? 
            (typeof sale.items === 'string' ? JSON.parse(sale.items) : sale.items).reduce((sum: number, item: any) => {
              const itemTotal = (item.quantity || 0) * (item.price || 0);
              const taxRate = item.tax_rate || item.gst_rate || sale.gst_rate || 0;
              return sum + (itemTotal * (parseFloat(taxRate.toString()) / 100));
            }, 0) :
            ((sale.total_amount || 0) * ((sale.gst_rate || 0) / 100))
        })),
        purchases: purchasesData.map(purchase => ({
          ...purchase,
          taxAmount: purchase.items ? 
            (typeof purchase.items === 'string' ? JSON.parse(purchase.items) : purchase.items).reduce((sum: number, item: any) => {
              const itemTotal = (item.quantity || 0) * (item.price || 0);
              const taxRate = item.tax_rate || item.gst_rate || purchase.gst_rate || 0;
              return sum + (itemTotal * (parseFloat(taxRate.toString()) / 100));
            }, 0) :
            ((purchase.total_amount || 0) * ((purchase.gst_rate || 0) / 100))
        })),
        cashTransactions: cashData.filter(t => (t.tax_amount || 0) > 0)
      }
    };
  } catch (error) {
    console.error('Error in getTaxReport:', error);
    return {
      salesTax: 0,
      purchasesTax: 0,
      cashTax: 0,
      totalTax: 0,
      netTax: 0,
      breakdown: { sales: [], purchases: [], cashTransactions: [] }
    };
  }
}

async function getTaxRateReport(phoneNumber: string, startDate?: string | null, endDate?: string | null) {
  try {
    const taxData = await getTaxReport(phoneNumber, startDate, endDate);
    
    // Group by tax rates
    const taxRateData: Record<string, any> = {};
    
    // Process sales
    taxData.breakdown.sales.forEach((sale: any) => {
      const taxRate = sale.gst_rate || 0;
      if (!taxRateData[taxRate]) {
        taxRateData[taxRate] = {
          taxRate,
          salesAmount: 0,
          purchasesAmount: 0,
          salesTax: 0,
          purchasesTax: 0,
          netTax: 0
        };
      }
      taxRateData[taxRate].salesAmount += sale.total_amount || 0;
      taxRateData[taxRate].salesTax += sale.taxAmount || 0;
    });
    
    // Process purchases
    taxData.breakdown.purchases.forEach((purchase: any) => {
      const taxRate = purchase.gst_rate || 0;
      if (!taxRateData[taxRate]) {
        taxRateData[taxRate] = {
          taxRate,
          salesAmount: 0,
          purchasesAmount: 0,
          salesTax: 0,
          purchasesTax: 0,
          netTax: 0
        };
      }
      taxRateData[taxRate].purchasesAmount += purchase.total_amount || 0;
      taxRateData[taxRate].purchasesTax += purchase.taxAmount || 0;
    });
    
    // Calculate net tax for each rate
    Object.values(taxRateData).forEach((data: any) => {
      data.netTax = data.salesTax - data.purchasesTax;
    });

    return Object.values(taxRateData);
  } catch (error) {
    console.error('Error in getTaxRateReport:', error);
    return [];
  }
}

// Expense Reports
async function getExpenseReport(phoneNumber: string, startDate?: string | null, endDate?: string | null) {
  try {
    let query = supabaseServer
      .from('user_cash_transactions')
      .select('*')
      .eq('phone_number', phoneNumber)
      .eq('type', 'expense')
      .order('created_at', { ascending: false });

    if (startDate) {
      query = query.gte('created_at', startDate);
    }
    if (endDate) {
      query = query.lte('created_at', endDate);
    }

    const { data: expenses, error } = await query;

    if (error) {
      console.error('Error fetching expense report:', error);
      return [];
    }

    return expenses || [];
  } catch (error) {
    console.error('Error in getExpenseReport:', error);
    return [];
  }
}

async function getExpenseCategoryReport(phoneNumber: string, startDate?: string | null, endDate?: string | null) {
  try {
    const expensesData = await getExpenseReport(phoneNumber, startDate, endDate);
    
    // Group by category
    const categoryData: Record<string, any> = {};
    
    expensesData.forEach((expense: any) => {
      const category = expense.category || 'Uncategorized';
      if (!categoryData[category]) {
        categoryData[category] = {
          category,
          totalAmount: 0,
          transactionCount: 0,
          averageAmount: 0
        };
      }
      
      categoryData[category].totalAmount += expense.amount || 0;
      categoryData[category].transactionCount += 1;
    });
    
    // Calculate averages
    Object.values(categoryData).forEach((data: any) => {
      data.averageAmount = data.transactionCount > 0 ? data.totalAmount / data.transactionCount : 0;
    });

    return Object.values(categoryData);
  } catch (error) {
    console.error('Error in getExpenseCategoryReport:', error);
    return [];
  }
}

async function getExpenseItemReport(phoneNumber: string, startDate?: string | null, endDate?: string | null) {
  try {
    const expensesData = await getExpenseReport(phoneNumber, startDate, endDate);
    
    // Group by item/description
    const itemData: Record<string, any> = {};
    
    expensesData.forEach((expense: any) => {
      const itemName = expense.name || expense.description || 'Unknown';
      if (!itemData[itemName]) {
        itemData[itemName] = {
          itemName,
          totalAmount: 0,
          transactionCount: 0,
          averageAmount: 0,
          lastTransaction: null
        };
      }
      
      itemData[itemName].totalAmount += expense.amount || 0;
      itemData[itemName].transactionCount += 1;
      
      if (!itemData[itemName].lastTransaction || expense.created_at > itemData[itemName].lastTransaction) {
        itemData[itemName].lastTransaction = expense.created_at;
      }
    });
    
    // Calculate averages
    Object.values(itemData).forEach((data: any) => {
      data.averageAmount = data.transactionCount > 0 ? data.totalAmount / data.transactionCount : 0;
    });

    return Object.values(itemData);
  } catch (error) {
    console.error('Error in getExpenseItemReport:', error);
    return [];
  }
}

// Helper functions
async function getSalesForParty(phoneNumber: string, partyName: string, startDate?: string | null, endDate?: string | null) {
  try {
    let query = supabaseServer
      .from('user_sales')
      .select('*')
      .eq('phone_number', phoneNumber)
      .eq('party_name', partyName);

    if (startDate) {
      query = query.gte('invoice_date', startDate);
    }
    if (endDate) {
      query = query.lte('invoice_date', endDate);
    }

    const { data, error } = await query;
    return error ? [] : (data || []);
  } catch (error) {
    return [];
  }
}

async function getPurchasesForParty(phoneNumber: string, partyName: string, startDate?: string | null, endDate?: string | null) {
  try {
    let query = supabaseServer
      .from('user_purchases')
      .select('*')
      .eq('phone_number', phoneNumber)
      .eq('party_name', partyName);

    if (startDate) {
      query = query.gte('created_at', startDate);
    }
    if (endDate) {
      query = query.lte('created_at', endDate);
    }

    const { data, error } = await query;
    return error ? [] : (data || []);
  } catch (error) {
    return [];
  }
}

async function getSalesForItem(phoneNumber: string, itemName: string, startDate?: string | null, endDate?: string | null) {
  try {
    let query = supabaseServer
      .from('user_sales')
      .select('*')
      .eq('phone_number', phoneNumber);

    if (startDate) {
      query = query.gte('invoice_date', startDate);
    }
    if (endDate) {
      query = query.lte('invoice_date', endDate);
    }

    const { data, error } = await query;
    
    if (error) return [];
    
    // Filter sales that contain the specific item
    return (data || []).filter(sale => {
      if (sale.items) {
        const items = typeof sale.items === 'string' ? JSON.parse(sale.items) : sale.items;
        return items.some((item: any) => item.name === itemName);
      }
      return false;
    });
  } catch (error) {
    return [];
  }
}

async function getPurchasesForItem(phoneNumber: string, itemName: string, startDate?: string | null, endDate?: string | null) {
  try {
    let query = supabaseServer
      .from('user_purchases')
      .select('*')
      .eq('phone_number', phoneNumber);

    if (startDate) {
      query = query.gte('created_at', startDate);
    }
    if (endDate) {
      query = query.lte('created_at', endDate);
    }

    const { data, error } = await query;
    
    if (error) return [];
    
    // Filter purchases that contain the specific item
    return (data || []).filter(purchase => {
      if (purchase.items) {
        const items = typeof purchase.items === 'string' ? JSON.parse(purchase.items) : purchase.items;
        return items.some((item: any) => item.name === itemName);
      }
      return false;
    });
  } catch (error) {
    return [];
  }
}

async function getCashTransactionsData(phoneNumber: string, startDate?: string | null, endDate?: string | null) {
  try {
    let query = supabaseServer
      .from('user_cash_transactions')
      .select('*')
      .eq('phone_number', phoneNumber);

    if (startDate) {
      query = query.gte('created_at', startDate);
    }
    if (endDate) {
      query = query.lte('created_at', endDate);
    }

    const { data, error } = await query;
    return error ? [] : (data || []);
  } catch (error) {
    return [];
  }
}

async function getBankAccountsData(phoneNumber: string) {
  try {
    const { data, error } = await supabaseServer
      .from('user_bank_accounts')
      .select('*')
      .eq('phone_number', phoneNumber);

    return error ? [] : (data || []);
  } catch (error) {
    return [];
  }
}

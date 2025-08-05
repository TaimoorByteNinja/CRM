import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';

export interface ReportData {
  id?: string;
  type: string;
  title: string;
  data: any;
  generatedAt: string;
  dateRange?: {
    startDate: string;
    endDate: string;
  };
}

interface ReportsState {
  reports: { [key: string]: ReportData };
  loading: boolean;
  error: string | null;
  currentReport: ReportData | null;
}

const initialState: ReportsState = {
  reports: {},
  loading: false,
  error: null,
  currentReport: null,
};

// Main report generation thunk
export const generateReport = createAsyncThunk(
  'reports/generate',
  async ({ 
    phoneNumber, 
    reportType, 
    startDate, 
    endDate, 
    title 
  }: { 
    phoneNumber: string; 
    reportType: string; 
    startDate?: string; 
    endDate?: string;
    title: string;
  }, { rejectWithValue }) => {
    try {
      console.log('Generating report:', { phoneNumber, reportType, startDate, endDate });
      
      let url = `/api/business-hub/reports?phone=${encodeURIComponent(phoneNumber)}&type=${reportType}`;
      
      if (startDate) {
        url += `&startDate=${startDate}`;
      }
      if (endDate) {
        url += `&endDate=${endDate}`;
      }

      const response = await fetch(url);

      if (!response.ok) {
        const errorData = await response.json();
        console.error('Failed to generate report:', errorData);
        return rejectWithValue(errorData.error || 'Failed to generate report');
      }

      const data = await response.json();
      console.log('Generated report data:', data);
      
      const report: ReportData = {
        id: `${reportType}-${Date.now()}`,
        type: reportType,
        title,
        data,
        generatedAt: new Date().toISOString(),
        dateRange: startDate && endDate ? { startDate, endDate } : undefined
      };

      return report;
    } catch (error) {
      console.error('Error generating report:', error);
      return rejectWithValue('Failed to generate report');
    }
  }
);

// Specific report generation thunks
export const generateTransactionSummary = createAsyncThunk(
  'reports/generateTransactionSummary',
  async ({ 
    phoneNumber, 
    startDate, 
    endDate 
  }: { 
    phoneNumber: string; 
    startDate?: string; 
    endDate?: string;
  }, { rejectWithValue }) => {
    try {
      console.log('Generating transaction summary:', { phoneNumber, startDate, endDate });
      
      let url = `/api/business-hub/reports?phone=${encodeURIComponent(phoneNumber)}&type=transaction-summary`;
      
      if (startDate) {
        url += `&startDate=${startDate}`;
      }
      if (endDate) {
        url += `&endDate=${endDate}`;
      }

      const response = await fetch(url);

      if (!response.ok) {
        const errorData = await response.json();
        console.error('Failed to generate transaction summary:', errorData);
        return rejectWithValue(errorData.error || 'Failed to generate transaction summary');
      }

      const data = await response.json();
      console.log('Generated transaction summary data:', data);
      
      const report: ReportData = {
        id: `transaction-summary-${Date.now()}`,
        type: 'transaction-summary',
        title: 'Transaction Summary Report',
        data,
        generatedAt: new Date().toISOString(),
        dateRange: startDate && endDate ? { startDate, endDate } : undefined
      };

      return report;
    } catch (error) {
      console.error('Error generating transaction summary:', error);
      return rejectWithValue('Failed to generate transaction summary');
    }
  }
);

export const generateSalesReport = createAsyncThunk(
  'reports/generateSalesReport',
  async ({ 
    phoneNumber, 
    startDate, 
    endDate 
  }: { 
    phoneNumber: string; 
    startDate?: string; 
    endDate?: string;
  }, { rejectWithValue }) => {
    try {
      let url = `/api/business-hub/reports?phone=${encodeURIComponent(phoneNumber)}&type=sales-report`;
      
      if (startDate) url += `&startDate=${startDate}`;
      if (endDate) url += `&endDate=${endDate}`;

      const response = await fetch(url);
      if (!response.ok) {
        const errorData = await response.json();
        return rejectWithValue(errorData.error || 'Failed to generate sales report');
      }

      const data = await response.json();
      
      return {
        id: `sales-report-${Date.now()}`,
        type: 'sales-report',
        title: 'Sales Report',
        data,
        generatedAt: new Date().toISOString(),
        dateRange: startDate && endDate ? { startDate, endDate } : undefined
      };
    } catch (error) {
      return rejectWithValue('Failed to generate sales report');
    }
  }
);

export const generatePurchasesReport = createAsyncThunk(
  'reports/generatePurchasesReport',
  async ({ 
    phoneNumber, 
    startDate, 
    endDate 
  }: { 
    phoneNumber: string; 
    startDate?: string; 
    endDate?: string;
  }, { rejectWithValue }) => {
    try {
      let url = `/api/business-hub/reports?phone=${encodeURIComponent(phoneNumber)}&type=purchases-report`;
      
      if (startDate) url += `&startDate=${startDate}`;
      if (endDate) url += `&endDate=${endDate}`;

      const response = await fetch(url);
      if (!response.ok) {
        const errorData = await response.json();
        return rejectWithValue(errorData.error || 'Failed to generate purchases report');
      }

      const data = await response.json();
      
      return {
        id: `purchases-report-${Date.now()}`,
        type: 'purchases-report',
        title: 'Purchases Report',
        data,
        generatedAt: new Date().toISOString(),
        dateRange: startDate && endDate ? { startDate, endDate } : undefined
      };
    } catch (error) {
      return rejectWithValue('Failed to generate purchases report');
    }
  }
);

export const generatePartyStatement = createAsyncThunk(
  'reports/generatePartyStatement',
  async ({ 
    phoneNumber, 
    startDate, 
    endDate 
  }: { 
    phoneNumber: string; 
    startDate?: string; 
    endDate?: string;
  }, { rejectWithValue }) => {
    try {
      let url = `/api/business-hub/reports?phone=${encodeURIComponent(phoneNumber)}&type=party-statement`;
      
      if (startDate) url += `&startDate=${startDate}`;
      if (endDate) url += `&endDate=${endDate}`;

      const response = await fetch(url);
      if (!response.ok) {
        const errorData = await response.json();
        return rejectWithValue(errorData.error || 'Failed to generate party statement');
      }

      const data = await response.json();
      
      return {
        id: `party-statement-${Date.now()}`,
        type: 'party-statement',
        title: 'Party Statement Report',
        data,
        generatedAt: new Date().toISOString(),
        dateRange: startDate && endDate ? { startDate, endDate } : undefined
      };
    } catch (error) {
      return rejectWithValue('Failed to generate party statement');
    }
  }
);

export const generateCashFlowReport = createAsyncThunk(
  'reports/generateCashFlowReport',
  async ({ 
    phoneNumber, 
    startDate, 
    endDate 
  }: { 
    phoneNumber: string; 
    startDate?: string; 
    endDate?: string;
  }, { rejectWithValue }) => {
    try {
      let url = `/api/business-hub/reports?phone=${encodeURIComponent(phoneNumber)}&type=cash-flow`;
      
      if (startDate) url += `&startDate=${startDate}`;
      if (endDate) url += `&endDate=${endDate}`;

      const response = await fetch(url);
      if (!response.ok) {
        const errorData = await response.json();
        return rejectWithValue(errorData.error || 'Failed to generate cash flow report');
      }

      const data = await response.json();
      
      return {
        id: `cash-flow-${Date.now()}`,
        type: 'cash-flow',
        title: 'Cash Flow Report',
        data,
        generatedAt: new Date().toISOString(),
        dateRange: startDate && endDate ? { startDate, endDate } : undefined
      };
    } catch (error) {
      return rejectWithValue('Failed to generate cash flow report');
    }
  }
);

export const generateProfitLossReport = createAsyncThunk(
  'reports/generateProfitLossReport',
  async ({ 
    phoneNumber, 
    startDate, 
    endDate 
  }: { 
    phoneNumber: string; 
    startDate?: string; 
    endDate?: string;
  }, { rejectWithValue }) => {
    try {
      let url = `/api/business-hub/reports?phone=${encodeURIComponent(phoneNumber)}&type=profit-loss`;
      
      if (startDate) url += `&startDate=${startDate}`;
      if (endDate) url += `&endDate=${endDate}`;

      const response = await fetch(url);
      if (!response.ok) {
        const errorData = await response.json();
        return rejectWithValue(errorData.error || 'Failed to generate profit & loss report');
      }

      const data = await response.json();
      
      return {
        id: `profit-loss-${Date.now()}`,
        type: 'profit-loss',
        title: 'Profit & Loss Report',
        data,
        generatedAt: new Date().toISOString(),
        dateRange: startDate && endDate ? { startDate, endDate } : undefined
      };
    } catch (error) {
      return rejectWithValue('Failed to generate profit & loss report');
    }
  }
);

const reportsSlice = createSlice({
  name: 'reports',
  initialState,
  reducers: {
    clearReports: (state) => {
      state.reports = {};
      state.currentReport = null;
      state.error = null;
    },
    setCurrentReport: (state, action) => {
      state.currentReport = action.payload;
    },
    clearError: (state) => {
      state.error = null;
    },
  },
  extraReducers: (builder) => {
    // Generate Report
    builder
      .addCase(generateReport.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(generateReport.fulfilled, (state, action) => {
        state.loading = false;
        const report = action.payload;
        state.reports[report.id!] = report;
        state.currentReport = report;
      })
      .addCase(generateReport.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      });

    // Transaction Summary
    builder
      .addCase(generateTransactionSummary.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(generateTransactionSummary.fulfilled, (state, action) => {
        state.loading = false;
        const report = action.payload;
        state.reports[report.id!] = report;
        state.currentReport = report;
      })
      .addCase(generateTransactionSummary.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      });

    // Sales Report
    builder
      .addCase(generateSalesReport.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(generateSalesReport.fulfilled, (state, action) => {
        state.loading = false;
        const report = action.payload;
        state.reports[report.id!] = report;
        state.currentReport = report;
      })
      .addCase(generateSalesReport.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      });

    // Purchases Report
    builder
      .addCase(generatePurchasesReport.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(generatePurchasesReport.fulfilled, (state, action) => {
        state.loading = false;
        const report = action.payload;
        state.reports[report.id!] = report;
        state.currentReport = report;
      })
      .addCase(generatePurchasesReport.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      });

    // Party Statement
    builder
      .addCase(generatePartyStatement.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(generatePartyStatement.fulfilled, (state, action) => {
        state.loading = false;
        const report = action.payload;
        state.reports[report.id!] = report;
        state.currentReport = report;
      })
      .addCase(generatePartyStatement.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      });

    // Cash Flow Report
    builder
      .addCase(generateCashFlowReport.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(generateCashFlowReport.fulfilled, (state, action) => {
        state.loading = false;
        const report = action.payload;
        state.reports[report.id!] = report;
        state.currentReport = report;
      })
      .addCase(generateCashFlowReport.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      });

    // Profit & Loss Report
    builder
      .addCase(generateProfitLossReport.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(generateProfitLossReport.fulfilled, (state, action) => {
        state.loading = false;
        const report = action.payload;
        state.reports[report.id!] = report;
        state.currentReport = report;
      })
      .addCase(generateProfitLossReport.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      });
  },
});

export const { clearReports, setCurrentReport, clearError } = reportsSlice.actions;

// Selectors
export const selectReports = (state: any) => state.reports.reports;
export const selectCurrentReport = (state: any) => state.reports.currentReport;
export const selectReportsLoading = (state: any) => state.reports.loading;
export const selectReportsError = (state: any) => state.reports.error;
export const selectReportById = (state: any, reportId: string) => state.reports.reports[reportId];

export default reportsSlice.reducer;

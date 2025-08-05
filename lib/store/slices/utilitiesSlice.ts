import { createSlice, createAsyncThunk, PayloadAction } from '@reduxjs/toolkit';

// Interfaces
export interface ImportItem {
  id?: string;
  itemName: string;
  hsn: string;
  salePrice: number;
  purchasePrice: number;
  openingStock: number;
  minimumStock: number;
  godown: string;
  gstRate: string;
  taxable: string;
  category?: string;
  unit?: string;
  barcode?: string;
}

export interface BarcodeData {
  itemId: string;
  barcode: string;
  itemName: string;
  price: number;
  stock: number;
}

export interface ScannedItem {
  barcode: string;
  itemName: string;
  price: number;
  timestamp: Date;
  stock?: number;
}

export interface VerificationResults {
  totalItems: number;
  missingHSN: number;
  missingCategory: number;
  duplicateEntries: number;
  stockMismatches: number;
  missingTaxFields: number;
  priceInconsistencies: number;
  lowStockItems: number;
  inactiveItems: number;
  totalIssues: number;
}

interface UtilitiesState {
  selectedUtility: string;
  uploadProgress: number;
  isUploading: boolean;
  uploadedFile: File | null;
  importItems: ImportItem[];
  showPreview: boolean;
  barcodeData: BarcodeData[];
  scannedItems: ScannedItem[];
  isScanning: boolean;
  scannerInput: string;
  realTimeItems: ImportItem[];
  showBarcodeDialog: boolean;
  selectedBarcodeItem: BarcodeData | null;
  verificationResults: VerificationResults | null;
  isVerifying: boolean;
  loading: boolean;
  error: string | null;
}

const initialState: UtilitiesState = {
  selectedUtility: 'import-items',
  uploadProgress: 0,
  isUploading: false,
  uploadedFile: null,
  importItems: [],
  showPreview: false,
  barcodeData: [],
  scannedItems: [],
  isScanning: false,
  scannerInput: '',
  realTimeItems: [],
  showBarcodeDialog: false,
  selectedBarcodeItem: null,
  verificationResults: null,
  isVerifying: false,
  loading: false,
  error: null,
};

// Async thunks
export const importItemsToDatabase = createAsyncThunk(
  'utilities/importItemsToDatabase',
  async (items: ImportItem[], { rejectWithValue }) => {
    try {
      const response = await fetch('/api/business-hub/utilities/import-items', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ items }),
      });
      
      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || 'Failed to import items');
      }
      
      const data = await response.json();
      return data;
    } catch (error: any) {
      return rejectWithValue(error.message || 'Failed to import items');
    }
  }
);

export const generateBarcodesAsync = createAsyncThunk(
  'utilities/generateBarcodesAsync',
  async (itemIds: string[], { rejectWithValue }) => {
    try {
      const response = await fetch('/api/business-hub/utilities/barcodes', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ itemIds }),
      });
      
      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || 'Failed to generate barcodes');
      }
      
      const data = await response.json();
      return data.barcodes;
    } catch (error: any) {
      return rejectWithValue(error.message || 'Failed to generate barcodes');
    }
  }
);

export const scanBarcodeAsync = createAsyncThunk(
  'utilities/scanBarcodeAsync',
  async (barcode: string, { rejectWithValue }) => {
    try {
      const response = await fetch(`/api/business-hub/utilities/barcodes?barcode=${encodeURIComponent(barcode)}`);
      
      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || 'Barcode not found');
      }
      
      const data = await response.json();
      return data;
    } catch (error: any) {
      return rejectWithValue(error.message || 'Failed to scan barcode');
    }
  }
);

export const bulkUpdateItemsAsync = createAsyncThunk(
  'utilities/bulkUpdateItemsAsync',
  async (updates: any[], { rejectWithValue }) => {
    try {
      const response = await fetch('/api/business-hub/utilities/bulk-update', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ updates }),
      });
      
      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || 'Failed to update items');
      }
      
      const data = await response.json();
      return data;
    } catch (error: any) {
      return rejectWithValue(error.message || 'Failed to update items');
    }
  }
);

export const verifyDataAsync = createAsyncThunk(
  'utilities/verifyDataAsync',
  async (_, { rejectWithValue }) => {
    try {
      const response = await fetch('/api/business-hub/utilities/verify-data');
      
      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || 'Failed to verify data');
      }
      
      const data = await response.json();
      return data;
    } catch (error: any) {
      return rejectWithValue(error.message || 'Failed to verify data');
    }
  }
);

const utilitiesSlice = createSlice({
  name: 'utilities',
  initialState,
  reducers: {
    setSelectedUtility: (state, action: PayloadAction<string>) => {
      state.selectedUtility = action.payload;
    },
    setUploadProgress: (state, action: PayloadAction<number>) => {
      state.uploadProgress = action.payload;
    },
    setIsUploading: (state, action: PayloadAction<boolean>) => {
      state.isUploading = action.payload;
    },
    setUploadedFile: (state, action: PayloadAction<File | null>) => {
      state.uploadedFile = action.payload;
    },
    setImportItems: (state, action: PayloadAction<ImportItem[]>) => {
      state.importItems = action.payload;
    },
    setShowPreview: (state, action: PayloadAction<boolean>) => {
      state.showPreview = action.payload;
    },
    addToRealTimeItems: (state, action: PayloadAction<ImportItem[]>) => {
      state.realTimeItems = [...state.realTimeItems, ...action.payload];
    },
    setBarcodeData: (state, action: PayloadAction<BarcodeData[]>) => {
      state.barcodeData = action.payload;
    },
    addBarcodeData: (state, action: PayloadAction<BarcodeData>) => {
      const existing = state.barcodeData.find(item => item.itemId === action.payload.itemId);
      if (existing) {
        state.barcodeData = state.barcodeData.map(item => 
          item.itemId === action.payload.itemId ? action.payload : item
        );
      } else {
        state.barcodeData.push(action.payload);
      }
    },
    addScannedItem: (state, action: PayloadAction<ScannedItem>) => {
      state.scannedItems = [action.payload, ...state.scannedItems.slice(0, 9)];
    },
    setIsScanning: (state, action: PayloadAction<boolean>) => {
      state.isScanning = action.payload;
    },
    setScannerInput: (state, action: PayloadAction<string>) => {
      state.scannerInput = action.payload;
    },
    setShowBarcodeDialog: (state, action: PayloadAction<boolean>) => {
      state.showBarcodeDialog = action.payload;
    },
    setSelectedBarcodeItem: (state, action: PayloadAction<BarcodeData | null>) => {
      state.selectedBarcodeItem = action.payload;
    },
    clearError: (state) => {
      state.error = null;
    },
  },
  extraReducers: (builder) => {
    builder
      // Import items
      .addCase(importItemsToDatabase.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(importItemsToDatabase.fulfilled, (state, action) => {
        state.loading = false;
        // Items are already in realTimeItems, this just confirms they're in the database
      })
      .addCase(importItemsToDatabase.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      })
      // Generate barcodes
      .addCase(generateBarcodesAsync.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(generateBarcodesAsync.fulfilled, (state, action) => {
        state.loading = false;
        state.barcodeData = [...state.barcodeData, ...action.payload];
      })
      .addCase(generateBarcodesAsync.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      })
      // Scan barcode
      .addCase(scanBarcodeAsync.fulfilled, (state, action) => {
        const scannedItem: ScannedItem = {
          barcode: action.payload.barcode,
          itemName: action.payload.itemName,
          price: action.payload.price,
          stock: action.payload.stock,
          timestamp: new Date(action.payload.timestamp),
        };
        state.scannedItems = [scannedItem, ...state.scannedItems.slice(0, 9)];
        state.scannerInput = '';
      })
      .addCase(scanBarcodeAsync.rejected, (state, action) => {
        state.error = action.payload as string;
        state.scannerInput = '';
      })
      // Bulk update
      .addCase(bulkUpdateItemsAsync.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(bulkUpdateItemsAsync.fulfilled, (state) => {
        state.loading = false;
      })
      .addCase(bulkUpdateItemsAsync.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      })
      // Verify data
      .addCase(verifyDataAsync.pending, (state) => {
        state.isVerifying = true;
        state.error = null;
      })
      .addCase(verifyDataAsync.fulfilled, (state, action) => {
        state.isVerifying = false;
        state.verificationResults = action.payload;
      })
      .addCase(verifyDataAsync.rejected, (state, action) => {
        state.isVerifying = false;
        state.error = action.payload as string;
      });
  },
});

export const {
  setSelectedUtility,
  setUploadProgress,
  setIsUploading,
  setUploadedFile,
  setImportItems,
  setShowPreview,
  addToRealTimeItems,
  setBarcodeData,
  addBarcodeData,
  addScannedItem,
  setIsScanning,
  setScannerInput,
  setShowBarcodeDialog,
  setSelectedBarcodeItem,
  clearError,
} = utilitiesSlice.actions;

// Selectors
export const selectSelectedUtility = (state: { utilities: UtilitiesState }) => state.utilities.selectedUtility;
export const selectUploadProgress = (state: { utilities: UtilitiesState }) => state.utilities.uploadProgress;
export const selectIsUploading = (state: { utilities: UtilitiesState }) => state.utilities.isUploading;
export const selectImportItems = (state: { utilities: UtilitiesState }) => state.utilities.importItems;
export const selectRealTimeItems = (state: { utilities: UtilitiesState }) => state.utilities.realTimeItems;
export const selectBarcodeData = (state: { utilities: UtilitiesState }) => state.utilities.barcodeData;
export const selectScannedItems = (state: { utilities: UtilitiesState }) => state.utilities.scannedItems;
export const selectVerificationResults = (state: { utilities: UtilitiesState }) => state.utilities.verificationResults;
export const selectUtilitiesLoading = (state: { utilities: UtilitiesState }) => state.utilities.loading;
export const selectUtilitiesError = (state: { utilities: UtilitiesState }) => state.utilities.error;

export default utilitiesSlice.reducer;

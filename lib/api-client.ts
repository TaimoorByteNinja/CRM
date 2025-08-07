// API client that uses Next.js API routes instead of direct Supabase calls
const API_BASE = '/api/business-hub';

// Helper to get current user phone number from Redux store
function getCurrentUserPhone(): string | null {
  if (typeof window === 'undefined') return null;
  
  try {
    // First try localStorage
    const phoneFromStorage = localStorage.getItem('currentUserPhone');
    console.log('📱 API Client getCurrentUserPhone - localStorage phone:', phoneFromStorage);
    if (phoneFromStorage && phoneFromStorage.trim() !== '') {
      console.log('✅ API Client: Using phone from localStorage:', phoneFromStorage);
      return phoneFromStorage;
    }
    
    // Fallback: try to get from Redux store if available
    const reduxStore = (window as any).__REDUX_STORE__;
    if (reduxStore) {
      const state = reduxStore.getState();
      const phoneFromRedux = state?.settings?.general?.phoneNumber;
      console.log('📱 API Client getCurrentUserPhone - Redux phone:', phoneFromRedux);
      if (phoneFromRedux && phoneFromRedux.trim() !== '') {
        // Store it in localStorage for future use
        localStorage.setItem('currentUserPhone', phoneFromRedux);
        console.log('✅ API Client: Using phone from Redux and saved to localStorage:', phoneFromRedux);
        return phoneFromRedux;
      }
    }
    
    console.log('❌ No phone number found in localStorage or Redux');
    return null;
  } catch (error) {
    console.error('❌ Error getting current user phone:', error);
    return null;
  }
}

// Helper to add phone parameter to URL - throws error if no phone available
function addPhoneParam(url: string, phone?: string | null): string {
  const phoneNumber = phone || getCurrentUserPhone();
  console.log('🔗 addPhoneParam called with:', { url, providedPhone: phone, resolvedPhone: phoneNumber });
  
  if (!phoneNumber || phoneNumber.trim() === '') {
    console.error('❌ No phone number available for API call');
    console.log('🔍 localStorage currentUserPhone:', localStorage.getItem('currentUserPhone'));
    console.log('🔍 Redux store available:', typeof (window as any).__REDUX_STORE__ !== 'undefined');
    if (typeof (window as any).__REDUX_STORE__ !== 'undefined') {
      const state = (window as any).__REDUX_STORE__.getState();
      console.log('🔍 Redux settings state:', state?.settings?.general);
    }
    throw new Error('Phone number is required for API calls. Please ensure user is logged in.');
  }
  
  const separator = url.includes('?') ? '&' : '?';
  const finalUrl = `${url}${separator}phone=${encodeURIComponent(phoneNumber)}`;
  console.log('✅ Final API URL:', finalUrl);
  return finalUrl;
}

export const apiClient = {
  // Sales API
  sales: {
    async getAll(phone?: string) {
      const url = addPhoneParam(`${API_BASE}/sales`, phone);
      console.log('🌐 API Client: Fetching sales from URL:', url);
      const response = await fetch(url);
      if (!response.ok) {
        console.error('❌ API Client: Failed to fetch sales:', response.status, response.statusText);
        throw new Error(`Failed to fetch sales: ${response.statusText}`);
      }
      const data = await response.json();
      console.log('✅ API Client: Received sales data:', data);
      return data;
    },

    async getById(id: string) {
      const response = await fetch(`${API_BASE}/sales/${id}`);
      if (!response.ok) {
        throw new Error(`Failed to fetch sale: ${response.statusText}`);
      }
      return response.json();
    },

    async create(saleData: any) {
      // Check if phone is already included in the data
      if (!saleData.phone || saleData.phone.trim() === '') {
        // Fallback to getCurrentUserPhone if not provided
        const phone = getCurrentUserPhone();
        if (!phone || phone.trim() === '') {
          throw new Error('Phone number is required to create sales. Please ensure user is logged in.');
        }
        saleData.phone = phone;
      }
      
      const response = await fetch(`${API_BASE}/sales`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(saleData),
      });
      if (!response.ok) {
        throw new Error(`Failed to create sale: ${response.statusText}`);
      }
      return response.json();
    },

    async update(id: string, updates: any) {
      const phone = getCurrentUserPhone();
      if (!phone || phone.trim() === '') {
        throw new Error('Phone number is required to update sales. Please ensure user is logged in.');
      }
      
      const url = addPhoneParam(`${API_BASE}/sales/${id}`, phone);
      console.log('🔄 API Client: Updating sale at URL:', url, 'with data:', updates);
      
      const response = await fetch(url, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(updates),
      });
      if (!response.ok) {
        console.error('❌ API Client: Failed to update sale:', response.status, response.statusText);
        throw new Error(`Failed to update sale: ${response.statusText}`);
      }
      const data = await response.json();
      console.log('✅ API Client: Sale updated successfully:', data);
      return data;
    },

    async delete(id: string) {
      const phone = getCurrentUserPhone();
      if (!phone || phone.trim() === '') {
        throw new Error('Phone number is required to delete sales. Please ensure user is logged in.');
      }
      
      const url = addPhoneParam(`${API_BASE}/sales/${id}`, phone);
      console.log('🗑️ API Client: Deleting sale at URL:', url);
      
      const response = await fetch(url, {
        method: 'DELETE',
      });
      if (!response.ok) {
        console.error('❌ API Client: Failed to delete sale:', response.status, response.statusText);
        throw new Error(`Failed to delete sale: ${response.statusText}`);
      }
      const data = await response.json();
      console.log('✅ API Client: Sale deleted successfully:', data);
      return data;
    },
  },

  // Items API
  items: {
    async getAll(phone?: string) {
      const url = addPhoneParam(`${API_BASE}/items`, phone);
      console.log('🌐 API Client: Fetching items from URL:', url);
      const response = await fetch(url);
      if (!response.ok) {
        console.error('❌ API Client: Failed to fetch items:', response.status, response.statusText);
        throw new Error(`Failed to fetch items: ${response.statusText}`);
      }
      const data = await response.json();
      console.log('✅ API Client: Received items data:', data);
      return data;
    },

    async getById(id: string) {
      const response = await fetch(`${API_BASE}/items/${id}`);
      if (!response.ok) {
        throw new Error(`Failed to fetch item: ${response.statusText}`);
      }
      return response.json();
    },

    async create(itemData: any) {
      // Check if phone is already included in the data
      if (!itemData.phone || itemData.phone.trim() === '') {
        // Fallback to getCurrentUserPhone if not provided
        const phone = getCurrentUserPhone();
        if (!phone || phone.trim() === '') {
          throw new Error('Phone number is required to create items. Please ensure user is logged in.');
        }
        itemData.phone = phone;
      }
      
      const response = await fetch(`${API_BASE}/items`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(itemData),
      });
      if (!response.ok) {
        throw new Error(`Failed to create item: ${response.statusText}`);
      }
      return response.json();
    },

    async update(id: string, updates: any) {
      const phone = getCurrentUserPhone();
      const response = await fetch(`${API_BASE}/items/${id}`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ ...updates, phone }),
      });
      if (!response.ok) {
        throw new Error(`Failed to update item: ${response.statusText}`);
      }
      return response.json();
    },

    async delete(id: string) {
      const phone = getCurrentUserPhone();
      const response = await fetch(`${API_BASE}/items/${id}`, {
        method: 'DELETE',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ phone }),
      });
      if (!response.ok) {
        throw new Error(`Failed to delete item: ${response.statusText}`);
      }
      return response.json();
    },
  },

  // Purchases API
  purchases: {
    async getAll(phone?: string) {
      const url = addPhoneParam(`${API_BASE}/purchases`, phone);
      const response = await fetch(url);
      if (!response.ok) {
        throw new Error(`Failed to fetch purchases: ${response.statusText}`);
      }
      return response.json();
    },

    async create(purchaseData: any) {
      // Check if phone is already included in the data
      if (!purchaseData.phone || purchaseData.phone.trim() === '') {
        // Fallback to getCurrentUserPhone if not provided
        const phone = getCurrentUserPhone();
        if (!phone || phone.trim() === '') {
          throw new Error('Phone number is required to create purchases. Please ensure user is logged in.');
        }
        purchaseData.phone = phone;
      }
      
      const response = await fetch(`${API_BASE}/purchases`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(purchaseData),
      });
      if (!response.ok) {
        throw new Error(`Failed to create purchase: ${response.statusText}`);
      }
      return response.json();
    },
  },

  // Expenses API
  expenses: {
    async getAll(phone?: string) {
      const url = addPhoneParam(`${API_BASE}/expenses`, phone);
      const response = await fetch(url);
      if (!response.ok) {
        throw new Error(`Failed to fetch expenses: ${response.statusText}`);
      }
      return response.json();
    },

    async create(expenseData: any) {
      // Check if phone is already included in the data
      if (!expenseData.phone || expenseData.phone.trim() === '') {
        // Fallback to getCurrentUserPhone if not provided
        const phone = getCurrentUserPhone();
        if (!phone || phone.trim() === '') {
          throw new Error('Phone number is required to create expenses. Please ensure user is logged in.');
        }
        expenseData.phone = phone;
      }
      
      const response = await fetch(`${API_BASE}/expenses`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(expenseData),
      });
      if (!response.ok) {
        throw new Error(`Failed to create expense: ${response.statusText}`);
      }
      return response.json();
    },
  },

  // Parties API
  parties: {
    async getAll(phone?: string) {
      const url = addPhoneParam(`${API_BASE}/parties`, phone);
      const response = await fetch(url);
      if (!response.ok) {
        throw new Error(`Failed to fetch parties: ${response.statusText}`);
      }
      return response.json();
    },

    async create(partyData: any) {
      // Get phone number
      let phone = partyData.phone;
      if (!phone || phone.trim() === '') {
        // Fallback to getCurrentUserPhone if not provided
        phone = getCurrentUserPhone();
        if (!phone || phone.trim() === '') {
          throw new Error('Phone number is required to create parties. Please ensure user is logged in.');
        }
      }
      
      // Remove phone from body data since it goes in query params
      const { phone: _, ...bodyData } = partyData;
      
      const url = addPhoneParam(`${API_BASE}/parties`, phone);
      const response = await fetch(url, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(bodyData),
      });
      if (!response.ok) {
        throw new Error(`Failed to create party: ${response.statusText}`);
      }
      return response.json();
    },
  },

  // Overview API
  overview: {
    async getMetrics(phone?: string) {
      const url = addPhoneParam(`${API_BASE}/overview`, phone);
      const response = await fetch(url);
      if (!response.ok) {
        throw new Error(`Failed to fetch overview metrics: ${response.statusText}`);
      }
      return response.json();
    },
  },

  // Analytics API
  analytics: {
    async getSalesChart(period: string = 'allTime', phone?: string) {
      const url = addPhoneParam(`${API_BASE}/analytics/sales-chart?period=${period}`, phone);
      const response = await fetch(url);
      if (!response.ok) {
        throw new Error(`Failed to fetch sales chart data: ${response.statusText}`);
      }
      return response.json();
    },

    async getCategoryAnalytics(phone?: string) {
      const url = addPhoneParam(`${API_BASE}/analytics/categories`, phone);
      const response = await fetch(url);
      if (!response.ok) {
        throw new Error(`Failed to fetch category analytics: ${response.statusText}`);
      }
      return response.json();
    },

    async getRevenueTrends(period: string = 'thisMonth', phone?: string) {
      const url = addPhoneParam(`${API_BASE}/analytics/revenue?period=${period}`, phone);
      const response = await fetch(url);
      if (!response.ok) {
        throw new Error(`Failed to fetch revenue trends: ${response.statusText}`);
      }
      return response.json();
    },
  },

  // Recent Transactions API
  recentTransactions: {
    async getRecent(limit: number = 10, phone?: string) {
      const url = addPhoneParam(`${API_BASE}/recent-transactions?limit=${limit}`, phone);
      const response = await fetch(url);
      if (!response.ok) {
        throw new Error(`Failed to fetch recent transactions: ${response.statusText}`);
      }
      return response.json();
    },
  },
};

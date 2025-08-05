import { createSlice, PayloadAction } from '@reduxjs/toolkit'

// Helper function to generate notification titles
const getNotificationTitle = (category: string, type: string): string => {
  const categoryTitles = {
    sale: 'Sales Activity',
    purchase: 'Purchase Activity', 
    expense: 'Expense Activity',
    bank: 'Banking Activity',
    report: 'Report Activity',
    general: 'System Activity'
  }
  
  const typeModifiers = {
    success: '✅',
    error: '❌', 
    warning: '⚠️',
    info: 'ℹ️'
  }
  
  return `${typeModifiers[type as keyof typeof typeModifiers] || ''} ${categoryTitles[category as keyof typeof categoryTitles] || 'Activity'}`
}

interface Notification {
  id: string
  message: string
  type: 'success' | 'error' | 'warning' | 'info'
  show: boolean
  timestamp?: number
  category?: 'sale' | 'purchase' | 'expense' | 'bank' | 'report' | 'general'
  actionUrl?: string
  priority?: 'low' | 'medium' | 'high'
}

interface ActivityNotification {
  id: string
  title: string
  message: string
  category: 'sale' | 'purchase' | 'expense' | 'bank' | 'report' | 'general'
  timestamp: number
  isRead: boolean
  actionUrl?: string
  priority: 'low' | 'medium' | 'high'
  data?: any
}

interface UIState {
  activeTab: string
  searchTerm: string
  sidebarCollapsed: boolean
  dialogs: {
    showPurchaseDialog: boolean
    showNewSaleDialog: boolean
    showEditSaleDialog: boolean
    showViewDialog: boolean
  }
  notifications: Notification[]
  activityNotifications: ActivityNotification[]
  theme: 'light' | 'dark'
}

const initialState: UIState = {
  activeTab: "home",
  searchTerm: "",
  sidebarCollapsed: false,
  dialogs: {
    showPurchaseDialog: false,
    showNewSaleDialog: false,
    showEditSaleDialog: false,
    showViewDialog: false,
  },
  notifications: [],
  activityNotifications: [],
  theme: 'light',
}

const uiSlice = createSlice({
  name: 'ui',
  initialState,
  reducers: {
    setActiveTab: (state, action: PayloadAction<string>) => {
      state.activeTab = action.payload
    },
    setSearchTerm: (state, action: PayloadAction<string>) => {
      state.searchTerm = action.payload
    },
    toggleSidebar: (state) => {
      state.sidebarCollapsed = !state.sidebarCollapsed
    },
    setSidebarCollapsed: (state, action: PayloadAction<boolean>) => {
      state.sidebarCollapsed = action.payload
    },
    setDialogOpen: (state, action: PayloadAction<{ dialog: keyof UIState['dialogs']; open: boolean }>) => {
      state.dialogs[action.payload.dialog] = action.payload.open
    },
    showNotification: (state, action: PayloadAction<{ 
      message: string; 
      type?: 'success' | 'error' | 'warning' | 'info';
      category?: 'sale' | 'purchase' | 'expense' | 'bank' | 'report' | 'general';
      actionUrl?: string;
      priority?: 'low' | 'medium' | 'high';
    }>) => {
      const newNotification: Notification = {
        id: Date.now().toString(),
        message: action.payload.message,
        type: action.payload.type || 'info',
        show: true,
        timestamp: Date.now(),
        category: action.payload.category || 'general',
        actionUrl: action.payload.actionUrl,
        priority: action.payload.priority || 'medium',
      }
      state.notifications.push(newNotification)
      
      // Also add to activity notifications for the bell icon
      const activityNotification: ActivityNotification = {
        id: newNotification.id + '_activity',
        title: getNotificationTitle(action.payload.category || 'general', action.payload.type || 'info'),
        message: action.payload.message,
        category: action.payload.category || 'general',
        timestamp: Date.now(),
        isRead: false,
        actionUrl: action.payload.actionUrl,
        priority: action.payload.priority || 'medium',
      }
      state.activityNotifications.unshift(activityNotification) // Add to beginning
      
      // Keep only last 50 activity notifications
      if (state.activityNotifications.length > 50) {
        state.activityNotifications = state.activityNotifications.slice(0, 50)
      }
    },
    addActivityNotification: (state, action: PayloadAction<{
      title: string;
      message: string;
      category: 'sale' | 'purchase' | 'expense' | 'bank' | 'report' | 'general';
      actionUrl?: string;
      priority?: 'low' | 'medium' | 'high';
      data?: any;
    }>) => {
      const newActivity: ActivityNotification = {
        id: Date.now().toString(),
        title: action.payload.title,
        message: action.payload.message,
        category: action.payload.category,
        timestamp: Date.now(),
        isRead: false,
        actionUrl: action.payload.actionUrl,
        priority: action.payload.priority || 'medium',
        data: action.payload.data,
      }
      state.activityNotifications.unshift(newActivity)
      
      // Keep only last 50 activity notifications
      if (state.activityNotifications.length > 50) {
        state.activityNotifications = state.activityNotifications.slice(0, 50)
      }
    },
    markNotificationAsRead: (state, action: PayloadAction<string>) => {
      const notification = state.activityNotifications.find(n => n.id === action.payload)
      if (notification) {
        notification.isRead = true
      }
    },
    markAllNotificationsAsRead: (state) => {
      state.activityNotifications.forEach(notification => {
        notification.isRead = true
      })
    },
    clearActivityNotifications: (state) => {
      state.activityNotifications = []
    },
    hideNotification: (state, action: PayloadAction<string>) => {
      const notification = state.notifications.find(n => n.id === action.payload)
      if (notification) {
        notification.show = false
      }
    },
    removeNotification: (state, action: PayloadAction<string>) => {
      state.notifications = state.notifications.filter(n => n.id !== action.payload)
    },
    clearNotifications: (state) => {
      state.notifications = []
    },
    setTheme: (state, action: PayloadAction<UIState['theme']>) => {
      state.theme = action.payload
    },
    toggleTheme: (state) => {
      state.theme = state.theme === 'light' ? 'dark' : 'light'
    },
    clearSearch: (state) => {
      state.searchTerm = ""
    },
    resetUI: (state) => {
      state.activeTab = "home"
      state.searchTerm = ""
      state.dialogs = {
        showPurchaseDialog: false,
        showNewSaleDialog: false,
        showEditSaleDialog: false,
        showViewDialog: false,
      }
      state.notifications = []
      state.activityNotifications = []
    },
  },
})

export const {
  setActiveTab,
  setSearchTerm,
  toggleSidebar,
  setSidebarCollapsed,
  setDialogOpen,
  showNotification,
  addActivityNotification,
  markNotificationAsRead,
  markAllNotificationsAsRead,
  clearActivityNotifications,
  hideNotification,
  removeNotification,
  clearNotifications,
  setTheme,
  toggleTheme,
  clearSearch,
  resetUI,
} = uiSlice.actions

// Selectors
export const selectActiveTab = (state: { ui: UIState }) => state.ui.activeTab
export const selectSearchTerm = (state: { ui: UIState }) => state.ui.searchTerm
export const selectSidebarCollapsed = (state: { ui: UIState }) => state.ui.sidebarCollapsed
export const selectDialogs = (state: { ui: UIState }) => state.ui.dialogs
export const selectNotifications = (state: { ui: UIState }) => state.ui.notifications
export const selectActivityNotifications = (state: { ui: UIState }) => state.ui.activityNotifications
export const selectUnreadNotificationCount = (state: { ui: UIState }) => 
  state.ui.activityNotifications.filter(n => !n.isRead).length
export const selectNotificationsByCategory = (category: string) => (state: { ui: UIState }) =>
  state.ui.activityNotifications.filter(n => n.category === category)
export const selectTheme = (state: { ui: UIState }) => state.ui.theme

export default uiSlice.reducer 
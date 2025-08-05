import { Dispatch } from '@reduxjs/toolkit'
import { addActivityNotification } from '@/lib/store/slices/uiSlice'

export type NotificationCategory = 'sale' | 'purchase' | 'expense' | 'bank' | 'report' | 'general'
export type NotificationPriority = 'low' | 'medium' | 'high'

export interface ActivityEvent {
  category: NotificationCategory
  action: string
  entityType: string
  entityName?: string
  amount?: number
  actionUrl?: string
  priority?: NotificationPriority
  data?: any
}

export const generateActivityNotification = (dispatch: Dispatch, event: ActivityEvent) => {
  const { category, action, entityType, entityName, amount, actionUrl, priority = 'medium', data } = event
  
  const getTitle = (): string => {
    const categoryTitles = {
      sale: '💰 Sales Activity',
      purchase: '🛒 Purchase Activity',
      expense: '💸 Expense Activity',
      bank: '🏦 Banking Activity',
      report: '📊 Report Activity',
      general: '📋 General Activity'
    }
    return categoryTitles[category]
  }

  const getMessage = (): string => {
    const actionVerbs = {
      created: 'created',
      updated: 'updated',
      deleted: 'deleted',
      generated: 'generated',
      exported: 'exported',
      printed: 'printed',
      added: 'added',
      removed: 'removed'
    }

    const verb = actionVerbs[action as keyof typeof actionVerbs] || action
    let message = `${entityType} ${verb}`
    
    if (entityName) {
      message += ` (${entityName})`
    }
    
    if (amount !== undefined) {
      message += ` - Amount: ₹${amount.toLocaleString()}`
    }
    
    return message
  }

  dispatch(addActivityNotification({
    title: getTitle(),
    message: getMessage(),
    category,
    actionUrl,
    priority,
    data
  }))
}

// Predefined notification generators for common business events
export const NotificationHelpers = {
  saleCreated: (dispatch: Dispatch, saleData: { invoiceNo: string, amount: number, customerName?: string }) => {
    generateActivityNotification(dispatch, {
      category: 'sale',
      action: 'created',
      entityType: 'Sale Invoice',
      entityName: saleData.invoiceNo,
      amount: saleData.amount,
      actionUrl: '/business-hub/sale',
      priority: 'medium',
      data: saleData
    })
  },

  purchaseCreated: (dispatch: Dispatch, purchaseData: { invoiceNo: string, amount: number, supplierName?: string }) => {
    generateActivityNotification(dispatch, {
      category: 'purchase',
      action: 'created',
      entityType: 'Purchase Order',
      entityName: purchaseData.invoiceNo,
      amount: purchaseData.amount,
      actionUrl: '/business-hub/purchase',
      priority: 'medium',
      data: purchaseData
    })
  },

  expenseAdded: (dispatch: Dispatch, expenseData: { description: string, amount: number, category?: string }) => {
    generateActivityNotification(dispatch, {
      category: 'expense',
      action: 'added',
      entityType: 'Expense',
      entityName: expenseData.description,
      amount: expenseData.amount,
      actionUrl: '/business-hub/purchase',
      priority: 'medium',
      data: expenseData
    })
  },

  bankTransactionAdded: (dispatch: Dispatch, transactionData: { type: string, amount: number, description?: string }) => {
    generateActivityNotification(dispatch, {
      category: 'bank',
      action: 'added',
      entityType: 'Bank Transaction',
      entityName: transactionData.description || transactionData.type,
      amount: transactionData.amount,
      actionUrl: '/business-hub/bank',
      priority: 'low',
      data: transactionData
    })
  },

  reportGenerated: (dispatch: Dispatch, reportData: { type: string, period?: string }) => {
    generateActivityNotification(dispatch, {
      category: 'report',
      action: 'generated',
      entityType: 'Report',
      entityName: `${reportData.type}${reportData.period ? ` (${reportData.period})` : ''}`,
      actionUrl: '/business-hub/reports',
      priority: 'low',
      data: reportData
    })
  },

  lowStockAlert: (dispatch: Dispatch, itemData: { name: string, currentStock: number, minStock: number }) => {
    generateActivityNotification(dispatch, {
      category: 'general',
      action: 'alert',
      entityType: 'Low Stock Alert',
      entityName: `${itemData.name} (${itemData.currentStock}/${itemData.minStock})`,
      actionUrl: '/business-hub/items',
      priority: 'high',
      data: itemData
    })
  },

  targetAchieved: (dispatch: Dispatch, targetData: { type: string, achieved: number, target: number }) => {
    generateActivityNotification(dispatch, {
      category: 'general',
      action: 'achieved',
      entityType: 'Target Achievement',
      entityName: `${targetData.type} target - ${((targetData.achieved / targetData.target) * 100).toFixed(1)}%`,
      actionUrl: '/business-hub/overview',
      priority: 'medium',
      data: targetData
    })
  }
}

export default NotificationHelpers

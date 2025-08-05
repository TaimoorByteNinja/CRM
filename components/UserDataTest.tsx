"use client"

import React, { useState } from 'react'
import { useUserData } from '../hooks/use-user-data'
import { UserDataManager } from '../lib/user-data-manager'
import { useSelector } from 'react-redux'
import { selectAllSales } from '../lib/store/slices/salesSlice'
import { selectAllCustomers } from '../lib/store/slices/customersSlice'
import { selectAllItems } from '../lib/store/slices/itemsSlice'
import { X } from 'lucide-react'

interface UserDataTestProps {
  onClose?: () => void
}

export default function UserDataTest({ onClose }: UserDataTestProps) {
  const [testPhone, setTestPhone] = useState('')
  const [isLoading, setIsLoading] = useState(false)
  const [testResult, setTestResult] = useState('')

  const sales = useSelector(selectAllSales)
  const customers = useSelector(selectAllCustomers)
  const items = useSelector(selectAllItems)

  const { initializeUser, hasExistingData } = useUserData()

  const testUserIsolation = async () => {
    if (!testPhone.trim()) {
      setTestResult('❌ Please enter a phone number')
      return
    }

    setIsLoading(true)
    setTestResult('🔄 Testing user data isolation...')

    try {
      // Step 1: Check if user exists
      const exists = await hasExistingData(testPhone)
      
      // Step 2: Initialize user
      const result = await initializeUser(testPhone)
      
      // Step 3: Check Redux state
      const currentSales = sales.length
      const currentCustomers = customers.length
      const currentItems = items.length

      setTestResult(`
✅ User isolation test completed!
📞 Phone: ${testPhone}
👤 User exists: ${exists ? 'Yes' : 'No (New user)'}
🆕 Is new user: ${result.isNewUser ? 'Yes' : 'No'}
📊 Current data in Redux:
  - Sales: ${currentSales}
  - Customers: ${currentCustomers}  
  - Items: ${currentItems}

${result.isNewUser ? 
  '🎯 Expected: New users should see ZERO data across all sections' : 
  '🎯 Expected: Existing users should see only their previously saved data'
}
      `)

    } catch (error) {
      setTestResult(`❌ Error: ${error instanceof Error ? error.message : 'Unknown error'}`)
    } finally {
      setIsLoading(false)
    }
  }

  const clearAllData = async () => {
    try {
      await UserDataManager.clearUserSession()
      setTestResult('🧹 User session cleared. Redux data should be empty now.')
    } catch (error) {
      setTestResult(`❌ Error clearing data: ${error instanceof Error ? error.message : 'Unknown error'}`)
    }
  }

  return (
    <div className="p-6 bg-white rounded-lg shadow-lg max-w-2xl relative">
      {/* Close button */}
      {onClose && (
        <button
          onClick={onClose}
          className="absolute top-2 right-2 p-1 hover:bg-gray-100 rounded-full transition-colors"
          title="Close"
        >
          <X className="w-4 h-4 text-gray-500" />
        </button>
      )}
      
      <h3 className="text-xl font-bold mb-4">🧪 User Data Isolation Test</h3>
      
      <div className="space-y-4">
        <div>
          <label className="block text-sm font-medium mb-2">
            Test Phone Number (e.g., +923001234567)
          </label>
          <input
            type="text"
            value={testPhone}
            onChange={(e) => setTestPhone(e.target.value)}
            placeholder="+923001234567"
            className="w-full p-2 border rounded focus:ring-2 focus:ring-blue-500"
          />
        </div>
        
        <div className="flex space-x-3">
          <button
            onClick={testUserIsolation}
            disabled={isLoading}
            className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 disabled:opacity-50"
          >
            {isLoading ? '🔄 Testing...' : '🧪 Test User Isolation'}
          </button>
          
          <button
            onClick={clearAllData}
            className="px-4 py-2 bg-red-600 text-white rounded hover:bg-red-700"
          >
            🧹 Clear Session
          </button>
        </div>
        
        {testResult && (
          <div className="p-4 bg-gray-50 rounded border">
            <pre className="whitespace-pre-wrap text-sm">{testResult}</pre>
          </div>
        )}
        
        <div className="mt-6 p-4 bg-blue-50 rounded border">
          <h4 className="font-semibold mb-2">📋 Current Redux State:</h4>
          <div className="text-sm space-y-1">
            <div>💰 Sales: {sales.length} items</div>
            <div>👥 Customers: {customers.length} items</div>
            <div>📦 Items: {items.length} items</div>
          </div>
        </div>
      </div>
    </div>
  )
}

# Supabase Setup Guide for Combined CRM

## 🚀 Complete Setup Instructions

### Step 1: Get Your Service Role Key

1. **Go to your Supabase Dashboard**: https://supabase.com/dashboard
2. **Select your project**: `txpufkxjnxhpnmydwdng`
3. **Navigate to Settings** → **API**
4. **Copy the Service Role Key** (under "Service Role" section)
5. **Replace in `.env` file**:
   ```
   SUPABASE_SERVICE_ROLE_KEY=your_actual_service_role_key_here
   ```

### Step 2: Execute Database Schema

1. **Go to your Supabase Dashboard** → **SQL Editor**
2. **Copy and paste** the entire content from `database/supabase-complete-schema.sql`
3. **Run the query** to create all tables, indexes, triggers, and views

### Step 3: Verify Setup

After completing the above steps, your settings system should work perfectly with:
- ✅ Auto-save functionality
- ✅ Real-time status indicators
- ✅ Complete backend persistence
- ✅ All compilation errors resolved

## 📋 Database Schema Overview

### Core Tables Created:
1. **`settings`** - User preferences and configurations (JSONB format)
2. **`items`** - Product/service catalog with stock management
3. **`parties`** - Customers and suppliers
4. **`sales`** - Sales transactions and invoices
5. **`sale_items`** - Individual items in each sale
6. **`purchases`** - Purchase transactions
7. **`purchase_items`** - Individual items in each purchase
8. **`payments`** - Payment in/out transactions
9. **`expenses`** - Business expense tracking
10. **`bank_accounts`** - Bank account management

### Advanced Features:
- 🔄 **Auto-updating timestamps** via triggers
- 📊 **Automatic stock management** when sales/purchases occur
- 💰 **Real-time party balance updates**
- 🔍 **Optimized indexes** for fast queries
- 📈 **Ready-made views** for reporting
- 🔒 **Optional Row Level Security** (commented out)

### Settings Structure:
```json
{
  "general_settings": {
    "enablePasscode": false,
    "businessCurrency": "Rs",
    "decimalPlaces": 2,
    "selectedCountry": "IN",
    "selectedCurrency": "INR",
    "selectedCurrencySymbol": "₹"
  },
  "transaction_settings": {
    "invoiceNumber": true,
    "addTime": false,
    "cashSaleDefault": false,
    "transactionTax": true,
    "transactionDiscount": true
  },
  "invoice_settings": {
    "layoutTheme": "tally",
    "companyName": "craft CRM",
    "companyLogo": true,
    "paperSize": "A4"
  },
  "party_settings": {
    "partyGrouping": false,
    "enablePaymentReminder": false,
    "sendSMSToParty": false
  },
  "item_settings": {
    "enableItem": true,
    "stockMaintenance": true,
    "showLowStockDialog": true
  },
  "message_settings": {
    "sendSMSToParty": false,
    "messageTemplates": {
      "sales": "Custom message template",
      "purchase": "Custom message template"
    }
  },
  "tax_settings": {
    "taxRates": [
      {"id": "1", "name": "GST 18%", "rate": 18, "type": "percentage"}
    ]
  }
}
```

## 🔧 API Endpoints Available

Your settings system now has these fully functional endpoints:

- **POST** `/api/business-hub/settings/save` - Save all settings
- **GET** `/api/business-hub/settings/load` - Load user settings
- **POST** `/api/business-hub/settings/reset` - Reset to defaults

## 🎯 Integration Status

### ✅ Completed Components:
1. **Redux State Management** - Enhanced `settingsSlice.ts` with comprehensive interfaces
2. **API Routes** - Complete backend integration with Supabase
3. **Settings Manager** - Utility class for settings operations
4. **Custom Hook** - `useSettings` for easy component integration
5. **UI Components** - Fully functional settings page with auto-save
6. **Database Schema** - Complete CRM database with all necessary tables

### 🔄 Auto-Save Features:
- Real-time saving when settings change
- Visual feedback with save status indicators
- Error handling with user notifications
- Optimistic updates for smooth UX

## 🚨 Important Notes

1. **Environment Variables**: Make sure to restart your development server after updating `.env`
2. **Service Role Key**: Keep this key secret and never commit it to version control
3. **Database Permissions**: The schema includes optional RLS policies (commented out)
4. **Testing**: Use the sample data insertion if you want to test with default values

## 🔄 Next Steps

Once you've completed the setup:

1. **Test the Settings Page**: Go to `/business-hub/settings` and try changing values
2. **Verify Auto-Save**: Check that changes are saved automatically
3. **Check Console**: No errors should appear in browser console
4. **Database Verification**: Check your Supabase dashboard to see saved settings

Your settings system is now fully functional with complete backend integration! 🎉

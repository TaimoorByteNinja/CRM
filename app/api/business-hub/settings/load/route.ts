import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
)

export async function GET(request: NextRequest) {
  try {
    // Get user ID from headers or session (you'll need to implement your auth logic)
    const userId = request.headers.get('user-id') || 'default-user'
    
    const { data: settings, error } = await supabase
      .from('settings')
      .select('*')
      .eq('user_id', userId)
      .single()
    
    if (error && error.code !== 'PGRST116') { // PGRST116 is "not found"
      throw new Error(error.message)
    }
    
    if (!settings) {
      // Return default settings if none exist
      return NextResponse.json({ 
        success: true, 
        data: {
          general: null,
          transaction: null,
          invoice: null,
          party: null,
          item: null,
          message: null,
          tax: null
        },
        message: 'No settings found, using defaults' 
      })
    }
    
    return NextResponse.json({ 
      success: true, 
      data: {
        general: settings.general_settings,
        transaction: settings.transaction_settings,
        invoice: settings.invoice_settings,
        party: settings.party_settings,
        item: settings.item_settings,
        message: settings.message_settings,
        tax: settings.tax_settings
      },
      lastSaved: settings.updated_at,
      message: 'Settings loaded successfully' 
    })
    
  } catch (error: any) {
    console.error('Settings load error:', error)
    return NextResponse.json(
      { error: error.message || 'Failed to load settings' },
      { status: 500 }
    )
  }
}

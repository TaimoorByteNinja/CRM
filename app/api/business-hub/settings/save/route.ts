import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
)

export async function POST(request: NextRequest) {
  try {
    const settings = await request.json()
    
    // Get user ID from headers or session (you'll need to implement your auth logic)
    const userId = request.headers.get('user-id') || 'default-user'
    
    // Check if settings exist for this user
    const { data: existingSettings } = await supabase
      .from('settings')
      .select('id')
      .eq('user_id', userId)
      .single()
    
    let result
    if (existingSettings) {
      // Update existing settings
      result = await supabase
        .from('settings')
        .update({
          general_settings: settings.general,
          transaction_settings: settings.transaction,
          invoice_settings: settings.invoice,
          party_settings: settings.party,
          item_settings: settings.item,
          message_settings: settings.message,
          tax_settings: settings.tax,
          updated_at: new Date().toISOString()
        })
        .eq('user_id', userId)
        .select()
        .single()
    } else {
      // Create new settings
      result = await supabase
        .from('settings')
        .insert({
          user_id: userId,
          general_settings: settings.general,
          transaction_settings: settings.transaction,
          invoice_settings: settings.invoice,
          party_settings: settings.party,
          item_settings: settings.item,
          message_settings: settings.message,
          tax_settings: settings.tax,
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString()
        })
        .select()
        .single()
    }
    
    if (result.error) {
      throw new Error(result.error.message)
    }
    
    return NextResponse.json({ 
      success: true, 
      data: result.data,
      message: 'Settings saved successfully' 
    })
    
  } catch (error: any) {
    console.error('Settings save error:', error)
    return NextResponse.json(
      { error: error.message || 'Failed to save settings' },
      { status: 500 }
    )
  }
}

import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
)

export async function POST(request: NextRequest) {
  try {
    // Get user ID from headers or session (you'll need to implement your auth logic)
    const userId = request.headers.get('user-id') || 'default-user'
    
    // Delete existing settings
    const { error } = await supabase
      .from('settings')
      .delete()
      .eq('user_id', userId)
    
    if (error) {
      throw new Error(error.message)
    }
    
    return NextResponse.json({ 
      success: true, 
      message: 'Settings reset to defaults successfully' 
    })
    
  } catch (error: any) {
    console.error('Settings reset error:', error)
    return NextResponse.json(
      { error: error.message || 'Failed to reset settings' },
      { status: 500 }
    )
  }
}

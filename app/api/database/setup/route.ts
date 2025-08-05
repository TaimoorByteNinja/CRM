import { NextRequest, NextResponse } from 'next/server'
import { supabase } from '@/lib/supabaseClient'

export async function GET() {
  try {
    // Test if user_profiles table exists by trying to select from it
    const { data, error } = await supabase
      .from('user_profiles')
      .select('phone_number')
      .limit(1)

    if (error) {
      return NextResponse.json({
        status: 'error',
        message: 'Database tables not found. Please run the schema setup.',
        error: error.message,
        setupInstructions: {
          message: 'Run the SQL schema from supabase-schema.sql in your Supabase dashboard',
          file: 'supabase-schema.sql'
        }
      }, { status: 500 })
    }

    return NextResponse.json({
      status: 'success',
      message: 'Database tables are ready',
      tablesChecked: [
        'user_profiles',
        'user_settings', 
        'user_sales',
        'user_customers',
        'user_parties',
        'user_items'
      ]
    })

  } catch (error) {
    return NextResponse.json({
      status: 'error',
      message: 'Failed to check database setup',
      error: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 })
  }
}

export async function POST() {
  return NextResponse.json({
    message: 'Use GET method to check database setup'
  }, { status: 405 })
}

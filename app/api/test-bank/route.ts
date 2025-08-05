import { NextResponse } from 'next/server';
import { supabase } from '@/lib/supabaseClient';

export async function GET() {
  try {
    console.log('Testing bank accounts table and fetching existing data...');
    
    // First check if table exists and fetch all data
    const { data: allData, error } = await supabase
      .from('user_bank_accounts')
      .select('*')
      .limit(10);

    if (error) {
      console.error('Table test error:', error);
      return NextResponse.json({
        status: 'error',
        message: 'user_bank_accounts table not found or accessible',
        error: error.message,
        setupInstructions: 'Run the SQL schema from supabase-schema.sql in your Supabase dashboard'
      }, { status: 500 });
    }

    console.log('Existing data in database:', allData);

    return NextResponse.json({
      status: 'success',
      message: 'Bank accounts table is accessible',
      tableExists: true,
      totalRecords: allData?.length || 0,
      sampleData: allData || [],
      fieldAnalysis: allData && allData.length > 0 ? {
        fieldsFound: Object.keys(allData[0]),
        sampleRecord: allData[0]
      } : null
    });

  } catch (error) {
    console.error('Test error:', error);
    return NextResponse.json({
      status: 'error',
      message: 'Test failed',
      error: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 });
  }
}

import { NextRequest, NextResponse } from 'next/server'

export async function POST() {
  try {
    // This endpoint can be used to reset user setup for testing
    // In a real app, you might want to add authentication here
    
    return NextResponse.json({
      status: 'success',
      message: 'To reset setup, clear your browser localStorage or Redux store',
      instructions: {
        localStorage: 'localStorage.removeItem("craft-crm-setup-completed")',
        redux: 'Clear phoneNumber from Redux store in DevTools',
        database: 'Use the user data manager to clear user session'
      }
    })

  } catch (error) {
    return NextResponse.json({
      status: 'error',
      message: 'Failed to process reset request',
      error: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 })
  }
}

export async function GET() {
  return NextResponse.json({
    message: 'Use POST method to reset user setup',
    currentEndpoint: '/api/debug/reset-setup'
  })
}

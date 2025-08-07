// Simple Auth Test - No Email Verification
const { createClient } = require('@supabase/supabase-js')
require('dotenv').config({ path: ['.env.local', '.env'] })

async function testAuth() {
  console.log('🔍 Testing Authentication (No Email Verification)...')
  
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
  const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
  
  if (!supabaseUrl || !supabaseAnonKey) {
    console.log('❌ Missing environment variables!')
    return
  }
  
  const supabase = createClient(supabaseUrl, supabaseAnonKey)
  
  // Test signup
  const testEmail = `test${Date.now()}@gmail.com`
  const testPassword = 'TestPassword123!'
  
  console.log('\n📧 Testing signup...')
  const { data: signupData, error: signupError } = await supabase.auth.signUp({
    email: testEmail,
    password: testPassword,
    options: {
      data: {
        first_name: 'Test',
        last_name: 'User'
      }
    }
  })
  
  if (signupError) {
    console.log('❌ Signup error:', signupError.message)
  } else {
    console.log('✅ Signup successful!')
    console.log('User ID:', signupData.user?.id)
    console.log('Email confirmed:', signupData.user?.email_confirmed_at ? 'Yes' : 'No')
  }
  
  // Test login
  console.log('\n🔐 Testing login...')
  const { data: loginData, error: loginError } = await supabase.auth.signInWithPassword({
    email: testEmail,
    password: testPassword
  })
  
  if (loginError) {
    console.log('❌ Login error:', loginError.message)
  } else {
    console.log('✅ Login successful!')
    console.log('Session:', loginData.session ? 'Active' : 'None')
  }
  
  // Test logout
  console.log('\n🚪 Testing logout...')
  const { error: logoutError } = await supabase.auth.signOut()
  
  if (logoutError) {
    console.log('❌ Logout error:', logoutError.message)
  } else {
    console.log('✅ Logout successful!')
  }
  
  console.log('\n✅ All tests completed!')
}

testAuth()

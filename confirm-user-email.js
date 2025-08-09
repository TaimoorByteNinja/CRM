// Script to confirm user emails using Supabase Admin API
const { createClient } = require('@supabase/supabase-js')
require('dotenv').config({ path: ['.env.local', '.env'] })

async function confirmUserEmail(userEmail) {
  console.log('🔍 Confirming email for user:', userEmail)
  
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
  const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY
  
  if (!supabaseUrl || !serviceRoleKey) {
    console.log('❌ Missing environment variables!')
    console.log('Make sure you have:')
    console.log('- NEXT_PUBLIC_SUPABASE_URL')
    console.log('- SUPABASE_SERVICE_ROLE_KEY (not the anon key)')
    return
  }
  
  const supabaseAdmin = createClient(supabaseUrl, serviceRoleKey)
  
  try {
    // First, get the user by email
    const { data: { users }, error: getUserError } = await supabaseAdmin.auth.admin.listUsers()
    
    if (getUserError) {
      console.log('❌ Error getting users:', getUserError.message)
      return
    }
    
    // Find the user by email
    const user = users.find(u => u.email === userEmail)
    
    if (!user) {
      console.log('❌ User not found with email:', userEmail)
      console.log('Available users:')
      users.forEach(u => console.log(`- ${u.email} (confirmed: ${u.email_confirmed_at ? 'Yes' : 'No'})`))
      return
    }
    
    console.log('✅ Found user:', user.email)
    console.log('Current confirmation status:', user.email_confirmed_at ? 'Confirmed' : 'Not confirmed')
    
    if (user.email_confirmed_at) {
      console.log('✅ Email is already confirmed!')
      return
    }
    
    // Confirm the user's email
    const { data, error } = await supabaseAdmin.auth.admin.updateUserById(
      user.id,
      { email_confirm: true }
    )
    
    if (error) {
      console.log('❌ Error confirming email:', error.message)
    } else {
      console.log('✅ Email confirmed successfully!')
      console.log('User can now log in.')
    }
    
  } catch (error) {
    console.log('❌ Unexpected error:', error.message)
  }
}

// Usage examples:
// node confirm-user-email.js "test@example.com"

const userEmail = process.argv[2]

if (!userEmail) {
  console.log('Usage: node confirm-user-email.js "user@example.com"')
  console.log('Example: node confirm-user-email.js "test@gmail.com"')
  process.exit(1)
}

confirmUserEmail(userEmail)


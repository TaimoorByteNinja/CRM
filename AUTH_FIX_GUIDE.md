# Authentication Fix Guide

## Problem Identified

The "Invalid credentials" error occurs because **email confirmation is enabled** in your Supabase project, but users are trying to log in before confirming their email addresses.

## Root Cause

1. User signs up successfully
2. Email confirmation is required but not completed
3. User tries to log in immediately
4. Supabase rejects the login with "Email not confirmed" error
5. The error is displayed as "Invalid credentials"

## Solutions

### Option 1: Disable Email Confirmation (Recommended for Development)

**Steps:**
1. Go to your Supabase Dashboard: https://supabase.com/dashboard
2. Select your project
3. Navigate to **Authentication → Settings**
4. Scroll down to "Email Auth" section
5. **Uncheck** "Enable email confirmations"
6. Click "Save"

**Test the fix:**
```bash
node test-auth-simple.js
```

### Option 2: Confirm Email Manually (For Testing)

If you want to keep email confirmation enabled, you can confirm emails manually:

**Using the provided script:**
```bash
# First, get your service role key from Supabase Dashboard
# Add it to your .env.local file:
# SUPABASE_SERVICE_ROLE_KEY=your_service_role_key

# Then run the confirmation script:
node confirm-user-email.js "user@example.com"
```

**Steps to get service role key:**
1. Go to Supabase Dashboard → Settings → API
2. Copy the "service_role" key (not the anon key)
3. Add it to your `.env.local` file

### Option 3: Check Email for Confirmation Link

1. Check your email inbox (and spam folder)
2. Look for an email from Supabase
3. Click the confirmation link
4. Try logging in again

## Updated Error Messages

The authentication system now provides clearer error messages:

- **Signup**: "Account created successfully! Please check your email and click the confirmation link before logging in."
- **Login with unconfirmed email**: "Please check your email and click the confirmation link before logging in. If you didn't receive the email, check your spam folder or contact support."

## Environment Variables Required

Make sure your `.env.local` file contains:

```env
NEXT_PUBLIC_SUPABASE_URL=your_supabase_project_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
SUPABASE_SERVICE_ROLE_KEY=your_supabase_service_role_key  # Optional, for admin operations
```

## Testing

After implementing any of the solutions:

1. **Test signup and login:**
   ```bash
   node test-auth-simple.js
   ```

2. **Test the web interface:**
   - Visit `http://localhost:3000/login`
   - Try creating an account and logging in

3. **Check browser console** for any additional error messages

## Troubleshooting

### If you still get "Invalid credentials":

1. **Check Supabase Dashboard:**
   - Go to Authentication → Users
   - Verify the user exists
   - Check if email is confirmed

2. **Check environment variables:**
   - Ensure `.env.local` file exists
   - Verify Supabase URL and keys are correct
   - Restart your development server

3. **Check browser console:**
   - Look for network errors
   - Check for JavaScript errors

### Common Issues:

- **"Missing environment variables"**: Check your `.env.local` file
- **"Service role key required"**: Get the service role key from Supabase Dashboard
- **"User not found"**: Verify the email address is correct

## Recommended Approach

For development and testing, **Option 1 (disable email confirmation)** is recommended because:

1. It's the simplest solution
2. It matches the current code expectations
3. It allows immediate testing
4. You can re-enable it later for production

## Next Steps

After fixing the authentication:

1. Test all authentication flows (signup, login, logout)
2. Test protected routes
3. Test social authentication (if enabled)
4. Test password reset functionality


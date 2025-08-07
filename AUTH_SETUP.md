# Supabase Authentication Setup Guide

## Overview
This project now includes a complete Supabase authentication system with the following features:

- **Login/Signup**: Email and password authentication
- **Social Authentication**: Google and GitHub OAuth
- **Password Reset**: Forgot password functionality
- **Protected Routes**: Automatic redirection for unauthenticated users
- **User Profile**: User information display and logout

## Setup Instructions

### 1. Environment Variables
Create a `.env.local` file in your project root with the following variables:

```env
# Supabase Configuration
NEXT_PUBLIC_SUPABASE_URL=your_supabase_project_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key

# Optional: Supabase Service Role Key (for server-side operations)
SUPABASE_SERVICE_ROLE_KEY=your_supabase_service_role_key

# App Configuration
NEXT_PUBLIC_APP_URL=http://localhost:3000
```

### 2. Supabase Project Setup

1. **Create a Supabase Project**:
   - Go to [supabase.com](https://supabase.com)
   - Create a new project
   - Note down your project URL and anon key

2. **Configure Authentication**:
   - In your Supabase dashboard, go to Authentication > Settings
   - Configure your site URL (e.g., `http://localhost:3000`)
   - Add redirect URLs:
     - `http://localhost:3000/auth/callback`
     - `http://localhost:3000/auth/reset-password`

3. **Enable Social Providers** (Optional):
   - Go to Authentication > Providers
   - Enable Google and/or GitHub
   - Configure OAuth credentials

### 3. Database Schema
The authentication system uses Supabase's built-in auth tables. No additional setup is required for basic authentication.

## Features

### Authentication Context
- **Location**: `lib/auth-context.tsx`
- **Purpose**: Manages user state and provides authentication methods
- **Usage**: Wrap your app with `AuthProvider` (already done in `app/layout.tsx`)

### Login/Signup Page
- **Location**: `app/login/page.tsx`
- **Features**:
  - Toggle between login and signup
  - Email/password authentication
  - Social authentication (Google, GitHub)
  - Form validation
  - Error handling

### Password Reset
- **Forgot Password**: `app/auth/forgot-password/page.tsx`
- **Reset Password**: `app/auth/reset-password/page.tsx`
- **Features**: Email-based password reset flow

### Protected Routes
- **Component**: `components/ProtectedRoute.tsx`
- **Usage**: Wrap pages that require authentication
- **Example**:
  ```tsx
  import ProtectedRoute from '@/components/ProtectedRoute'
  
  export default function DashboardPage() {
    return (
      <ProtectedRoute>
        <div>Protected content here</div>
      </ProtectedRoute>
    )
  }
  ```

### User Profile Component
- **Location**: `components/UserProfile.tsx`
- **Features**: User avatar, dropdown menu with logout option

## Usage Examples

### Using the Auth Hook
```tsx
import { useAuth } from '@/lib/auth-context'

export default function MyComponent() {
  const { user, signIn, signOut, loading } = useAuth()
  
  if (loading) return <div>Loading...</div>
  
  return (
    <div>
      {user ? (
        <div>
          <p>Welcome, {user.email}</p>
          <button onClick={signOut}>Logout</button>
        </div>
      ) : (
        <button onClick={() => signIn('test@example.com', 'password')}>
          Login
        </button>
      )}
    </div>
  )
}
```

### Protecting a Route
```tsx
import ProtectedRoute from '@/components/ProtectedRoute'

export default function BusinessHubPage() {
  return (
    <ProtectedRoute>
      <div>Your business dashboard content</div>
    </ProtectedRoute>
  )
}
```

## Testing

1. **Start the development server**:
   ```bash
   npm run dev
   ```

2. **Test the authentication flow**:
   - Visit `http://localhost:3000/login`
   - Try creating an account
   - Test login functionality
   - Test password reset flow

3. **Test protected routes**:
   - Visit `http://localhost:3000/business-hub` without authentication
   - Should redirect to login page
   - After login, should access the protected page

## Troubleshooting

### Common Issues

1. **Environment Variables Not Set**:
   - Ensure `.env.local` file exists with correct Supabase credentials
   - Restart the development server after adding environment variables

2. **OAuth Not Working**:
   - Check redirect URLs in Supabase dashboard
   - Ensure OAuth providers are properly configured

3. **Authentication Errors**:
   - Check browser console for error messages
   - Verify Supabase project settings

### Error Messages

- **"Supabase environment variables are missing"**: Check your `.env.local` file
- **"Invalid login credentials"**: Verify email/password combination
- **"Email not confirmed"**: Check email for confirmation link (if email confirmation is enabled)

## Security Notes

- All authentication is handled server-side by Supabase
- Passwords are never stored in your application
- JWT tokens are automatically managed by Supabase
- Session persistence is handled automatically

## Next Steps

1. **Customize the UI**: Modify the login/signup forms to match your brand
2. **Add User Profiles**: Create additional user data tables in Supabase
3. **Implement Role-Based Access**: Use Supabase RLS (Row Level Security)
4. **Add Email Templates**: Customize authentication emails in Supabase dashboard

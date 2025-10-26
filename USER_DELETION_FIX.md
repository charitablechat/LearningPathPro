# User Deletion Fix Documentation

## Problem Summary

When a user was deleted from the admin dashboard, only the `profiles` table record was removed. The underlying authentication record in Supabase's `auth.users` table remained, preventing that email address from being used for new signups.

## Root Cause

The deletion code was only targeting the `profiles` table:

```typescript
await supabase.from('profiles').delete().eq('id', userId);
```

While the `profiles` table has a foreign key relationship with `auth.users`:

```sql
id uuid PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE
```

The CASCADE delete works in one direction only - when `auth.users` is deleted, it cascades to `profiles`. However, deleting from `profiles` does not affect `auth.users`.

## Solution Implemented

### 1. Edge Function for Secure Deletion

Created a new Edge Function (`delete-user`) that uses the Supabase Admin API to properly delete users from both tables:

**Location:** `supabase/functions/delete-user/index.ts`

**Key Features:**
- Uses `SUPABASE_SERVICE_ROLE_KEY` for admin privileges
- Validates that the requesting user is an admin or super admin
- Prevents users from deleting themselves
- Prevents non-super-admins from deleting super admins
- Uses `supabase.auth.admin.deleteUser()` which removes both auth and profile records

**Security Checks:**
1. ✅ Requires valid authentication token
2. ✅ Verifies user has admin or super_admin role
3. ✅ Prevents self-deletion
4. ✅ Prevents unauthorized deletion of super admins
5. ✅ Uses service role key (server-side only, not exposed to client)

### 2. Updated Admin Dashboard

Modified `AdminDashboard.tsx` to call the Edge Function instead of directly deleting from the database:

**Changes:**
- Calls the Edge Function endpoint with proper authentication
- Passes the session access token in the Authorization header
- Handles errors with user-friendly messages
- Maintains existing UI/UX flow

## How to Delete a User

### From Admin Dashboard

1. Navigate to the Admin Dashboard
2. Go to the "All Users" section
3. Find the user you want to delete
4. Click the "Delete" button
5. Confirm the deletion in the modal

The system will now:
- ✅ Delete the authentication record from `auth.users`
- ✅ Automatically cascade delete the profile and related records
- ✅ Allow the email to be reused for new signups

## Technical Details

### Cascade Deletion Flow

When `supabase.auth.admin.deleteUser()` is called:

1. **auth.users** record is deleted
2. **profiles** record is automatically deleted (ON DELETE CASCADE)
3. All related records cascade delete:
   - **courses** (if user is instructor)
   - **modules** (through course cascade)
   - **lessons** (through module cascade)
   - **enrollments** (user's course enrollments)
   - **lesson_progress** (user's progress records)
   - **organization membership** (if applicable)

### Security Model

```
Client (Admin Dashboard)
    ↓ (calls with user token)
Edge Function (delete-user)
    ↓ (validates permissions)
    ↓ (uses service role key)
Supabase Auth Admin API
    ↓ (deletes from auth.users)
Database CASCADE deletes
    ↓ (removes all related records)
✅ Complete user deletion
```

## Testing Checklist

- [x] Edge Function deployed successfully
- [x] Frontend code updated to call Edge Function
- [x] Build passes without errors
- [ ] Test: Delete a user and verify they're removed from profiles table
- [ ] Test: Verify deleted user's email can be used for new signup
- [ ] Test: Non-admin users cannot delete users
- [ ] Test: Admins cannot delete super admins (unless they're also super admin)
- [ ] Test: Users cannot delete themselves
- [ ] Test: Related records are properly cascade deleted

## Troubleshooting

### Error: "Insufficient permissions"
- Ensure the logged-in user has `role = 'admin'` or `is_super_admin = true`

### Error: "No authorization header"
- Check that the session is valid
- Verify VITE_SUPABASE_URL environment variable is set correctly

### Error: "Failed to delete user"
- Check Edge Function logs in Supabase dashboard
- Verify SUPABASE_SERVICE_ROLE_KEY is configured

### User still exists after deletion
- Wait a few seconds and refresh the page
- Check browser console for errors
- Verify the Edge Function returned success

## Benefits

✅ **True Deletion**: Users are completely removed from the system
✅ **Email Reusability**: Deleted user emails can be used for new signups
✅ **Data Integrity**: All related records are properly cleaned up
✅ **Security**: Service role key never exposed to client
✅ **Audit Trail**: All deletions go through authenticated Edge Function
✅ **Permissions**: Only admins can delete users, with proper checks

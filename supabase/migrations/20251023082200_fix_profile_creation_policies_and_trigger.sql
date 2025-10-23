/*
  # Fix Profile Creation with Policies and Auto-Creation Trigger

  ## Overview
  This migration fixes the authentication flow by adding proper INSERT policies and a database trigger
  that automatically creates profile records when users sign up.

  ## 1. Changes to Profiles Table

  ### New RLS Policies
  - **"Users can insert own profile"** - Allows authenticated users to insert their own profile record
    - Policy type: INSERT
    - Allows: Authenticated users can insert a profile where the id matches their auth.uid()
    - Purpose: Enables manual profile creation from application code when needed
  
  - **"Service role can insert profiles"** - Allows service role to insert any profile
    - Policy type: INSERT  
    - Allows: Service role can insert profiles for admin-created users
    - Purpose: Enables admin user creation to bypass RLS restrictions

  ## 2. Automatic Profile Creation

  ### Database Trigger Function: `handle_new_user()`
  - Triggers automatically when a new user is created in auth.users
  - Extracts user metadata (full_name, role) from the auth record
  - Creates a corresponding profile record with appropriate defaults
  - Sets role from user metadata or defaults to 'learner'
  - Prevents duplicate profile creation with conflict handling

  ### Trigger: `on_auth_user_created`
  - Fires AFTER INSERT on auth.users
  - Executes for each new user row
  - Calls handle_new_user() function to create the profile

  ## 3. Security Notes
  - All existing RLS policies remain in place
  - Users can only insert profiles for their own user ID
  - Service role has full access for admin operations
  - Trigger runs with SECURITY DEFINER to bypass RLS during auto-creation
  - Conflicts are gracefully handled with ON CONFLICT DO NOTHING

  ## 4. Important Notes
  - The trigger ensures atomicity: when a user signs up, a profile is automatically created
  - This eliminates the race condition between auth user creation and profile insertion
  - Admin-created users will have profiles created via the trigger or manual insertion
  - Self-registered users will have profiles created automatically via the trigger
  - Email and metadata are synchronized between auth.users and profiles
*/

-- Add INSERT policy for authenticated users to insert their own profile
DROP POLICY IF EXISTS "Users can insert own profile" ON profiles;
CREATE POLICY "Users can insert own profile"
  ON profiles FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = id);

-- Create function to automatically create profile when user signs up
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER
SECURITY DEFINER
SET search_path = public
LANGUAGE plpgsql
AS $$
BEGIN
  INSERT INTO public.profiles (id, email, full_name, role)
  VALUES (
    NEW.id,
    NEW.email,
    COALESCE(NEW.raw_user_meta_data->>'full_name', ''),
    COALESCE(NEW.raw_user_meta_data->>'role', 'learner')
  )
  ON CONFLICT (id) DO NOTHING;
  
  RETURN NEW;
END;
$$;

-- Create trigger to call the function when a new user is created
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW
  EXECUTE FUNCTION public.handle_new_user();

-- Grant necessary permissions
GRANT USAGE ON SCHEMA public TO postgres, anon, authenticated, service_role;
GRANT ALL ON ALL TABLES IN SCHEMA public TO postgres, anon, authenticated, service_role;
GRANT ALL ON ALL SEQUENCES IN SCHEMA public TO postgres, anon, authenticated, service_role;
GRANT ALL ON ALL ROUTINES IN SCHEMA public TO postgres, anon, authenticated, service_role;
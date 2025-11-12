/*
  # Fix Profile Creation and Update Policies

  ## Overview
  This migration fixes profile creation by adding proper policies and triggers
  to ensure profiles are created automatically when users sign up.

  ## Changes Made

  ### 1. Create Profile on Signup
  - Adds trigger function to automatically create profile when auth.user is created
  - Sets default role to 'learner' for new users
  - Populates email and full_name from auth.users metadata

  ### 2. Fix Profile Policies
  - Adds policy to allow users to insert their own profile
  - Ensures new signups can create their profile record

  ### 3. Security Notes
  - Users can only create profile for their own auth.uid()
  - Profile creation is automatic via trigger
  - Maintains existing security for updates
*/

-- Drop existing trigger if it exists
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
DROP FUNCTION IF EXISTS public.handle_new_user();

-- Create function to handle new user profile creation
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER
SECURITY DEFINER SET search_path = public
LANGUAGE plpgsql
AS $$
BEGIN
  INSERT INTO public.profiles (id, email, full_name, role)
  VALUES (
    NEW.id,
    NEW.email,
    COALESCE(NEW.raw_user_meta_data->>'full_name', NEW.email),
    COALESCE(NEW.raw_user_meta_data->>'role', 'learner')
  );
  RETURN NEW;
END;
$$;

-- Create trigger to automatically create profile on user signup
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW
  EXECUTE FUNCTION public.handle_new_user();

-- Add policy to allow users to insert their own profile
DROP POLICY IF EXISTS "Users can insert own profile" ON profiles;
CREATE POLICY "Users can insert own profile"
  ON profiles FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = id);
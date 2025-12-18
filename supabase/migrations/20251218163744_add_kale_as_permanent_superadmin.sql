/*
  # Add kale@charitablechat.com as Permanent Superadmin

  ## Summary
  This migration adds kale@charitablechat.com as a second permanent superadmin alongside
  mydogkenna@gmail.com. Both users will be automatically promoted on signup and protected
  from demotion.

  ## Changes

  ### 1. Update Auto-Promotion Trigger
  Modifies `auto_set_superadmin_on_signup()` function to check for both superadmin emails:
  - mydogkenna@gmail.com (original)
  - kale@charitablechat.com (new)

  Both users will be automatically promoted to superadmin when they sign up.

  ### 2. Promote Existing User
  If kale@charitablechat.com profile already exists:
  - Set is_super_admin = true
  - Create audit log entry documenting the promotion

  If profile doesn't exist yet, the trigger will handle it on signup.

  ### 3. Update Demotion Protection
  Modifies `demote_from_superadmin()` function to protect both superadmin emails:
  - mydogkenna@gmail.com cannot be demoted
  - kale@charitablechat.com cannot be demoted

  ## Security
  - All changes are audited in superadmin_actions table
  - Both superadmins are permanently protected from demotion
  - Automatic promotion ensures consistent superadmin status

  ## Important Notes
  - Both mydogkenna@gmail.com and kale@charitablechat.com are permanent superadmins
  - This change is versioned and will persist across environments
  - All actions are logged for audit trail
*/

-- Update the auto_set_superadmin_on_signup function to check for both emails
CREATE OR REPLACE FUNCTION auto_set_superadmin_on_signup()
RETURNS TRIGGER AS $$
BEGIN
  -- Check if this is one of the permanent superadmin emails
  IF (NEW.email = 'mydogkenna@gmail.com' OR NEW.email = 'kale@charitablechat.com')
     AND (NEW.is_super_admin IS NULL OR NEW.is_super_admin = false) THEN
    NEW.is_super_admin = true;

    -- Schedule audit log insertion (will happen after INSERT completes)
    PERFORM pg_notify('superadmin_designated', NEW.id::text);
  END IF;

  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Promote kale@charitablechat.com to superadmin if profile already exists
DO $$
DECLARE
  v_profile_id uuid;
  v_email text := 'kale@charitablechat.com';
BEGIN
  -- Find the profile by email
  SELECT id INTO v_profile_id
  FROM profiles
  WHERE email = v_email
  LIMIT 1;

  -- If profile exists and is not already a superadmin, promote them
  IF v_profile_id IS NOT NULL THEN
    -- Check if already a superadmin
    IF NOT EXISTS (SELECT 1 FROM profiles WHERE id = v_profile_id AND is_super_admin = true) THEN
      -- Promote to superadmin
      UPDATE profiles
      SET is_super_admin = true
      WHERE id = v_profile_id;

      -- Log the promotion
      INSERT INTO superadmin_actions (action_type, target_user_id, metadata)
      VALUES (
        'promote_superadmin',
        v_profile_id,
        jsonb_build_object(
          'email', v_email,
          'note', 'Added as permanent superadmin via migration',
          'promoted_at', now()
        )
      );

      RAISE NOTICE 'Successfully promoted % to superadmin', v_email;
    ELSE
      RAISE NOTICE 'User % is already a superadmin', v_email;
    END IF;
  ELSE
    RAISE NOTICE 'Profile for % does not exist yet - will be auto-promoted on signup', v_email;
  END IF;
END $$;

-- Update the demote_from_superadmin function to protect both superadmin emails
CREATE OR REPLACE FUNCTION demote_from_superadmin(target_user_id uuid)
RETURNS jsonb AS $$
DECLARE
  v_current_user_id uuid;
  v_target_email text;
  v_result jsonb;
BEGIN
  -- Get current user
  v_current_user_id := auth.uid();

  -- Check if current user is a superadmin
  IF NOT can_promote_superadmin() THEN
    RETURN jsonb_build_object(
      'success', false,
      'error', 'Only superadmins can demote superadmins'
    );
  END IF;

  -- Get target user email
  SELECT email INTO v_target_email
  FROM profiles
  WHERE id = target_user_id;

  IF v_target_email IS NULL THEN
    RETURN jsonb_build_object(
      'success', false,
      'error', 'Target user not found'
    );
  END IF;

  -- Protect both permanent superadmins from being demoted
  IF v_target_email IN ('mydogkenna@gmail.com', 'kale@charitablechat.com') THEN
    RETURN jsonb_build_object(
      'success', false,
      'error', 'Cannot demote permanent platform superadmins'
    );
  END IF;

  -- Check if target is actually a superadmin
  IF NOT EXISTS (SELECT 1 FROM profiles WHERE id = target_user_id AND is_super_admin = true) THEN
    RETURN jsonb_build_object(
      'success', false,
      'error', 'User is not a superadmin'
    );
  END IF;

  -- Demote the user
  UPDATE profiles
  SET is_super_admin = false
  WHERE id = target_user_id;

  -- Log the action
  INSERT INTO superadmin_actions (action_type, performed_by, target_user_id, metadata)
  VALUES (
    'demote_superadmin',
    v_current_user_id,
    target_user_id,
    jsonb_build_object(
      'target_email', v_target_email,
      'demoted_at', now()
    )
  );

  RETURN jsonb_build_object(
    'success', true,
    'message', 'User successfully demoted from superadmin',
    'user_email', v_target_email
  );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;
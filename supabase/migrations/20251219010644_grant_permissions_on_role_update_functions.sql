/*
  # Grant Execute Permissions on Role Update Functions

  1. Purpose
    - Fix the "change user role" functionality by granting execute permissions
    - Allows authenticated users to call the role update functions
    - The functions themselves handle authorization internally

  2. Functions Affected
    - `update_organization_user_role` - For organization admins to update roles within their org

  3. Security
    - Function is SECURITY DEFINER and validates permissions internally
    - Granting EXECUTE to authenticated users is safe as the function checks:
      - Organization admin status or super admin status
      - Same organization membership
      - Prevention of self-role modification
      - Valid role values

  4. Notes
    - This was the missing piece preventing role changes from working
    - Without this grant, users get permission denied errors when calling the function
*/

-- Grant execute permission on update_organization_user_role function (for org admins)
GRANT EXECUTE ON FUNCTION update_organization_user_role(uuid, text) TO authenticated;
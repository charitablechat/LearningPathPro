/*
  # Add helper function for promo code redemptions

  ## New Functions
  
  ### increment_promo_redemptions
  Function to safely increment promo code redemption count
  - Takes promo_id as parameter
  - Increments redemptions_count by 1
  - Used when a promo code is successfully redeemed
*/

CREATE OR REPLACE FUNCTION increment_promo_redemptions(promo_id uuid)
RETURNS void AS $$
BEGIN
  UPDATE promo_codes
  SET redemptions_count = redemptions_count + 1
  WHERE id = promo_id;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;
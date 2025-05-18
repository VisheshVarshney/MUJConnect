/*
  # Update Superadmin Status

  1. Changes
    - Set is_superadmin to true for specific user
    - Add safety checks to ensure user exists
*/

DO $$ 
BEGIN
  -- Update is_superadmin flag for the specified user
  UPDATE public.users
  SET is_superadmin = true
  WHERE email = 'visheshadmin@ttms.com';

  -- Raise notice if user was not found
  IF NOT FOUND THEN
    RAISE NOTICE 'User with email visheshadmin@ttms.com not found';
  END IF;
END $$;
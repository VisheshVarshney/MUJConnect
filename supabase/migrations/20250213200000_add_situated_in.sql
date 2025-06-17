/*
  # Add Situated In Column to Restaurants

  1. Changes:
    - Add `situated_in` column to restaurants table
    - Set default value for new restaurants
    - Update existing restaurants to be marked as Inside Campus
*/

-- Add situated_in column if it doesn't exist
DO $$ 
BEGIN 
  IF NOT EXISTS (
    SELECT 1 
    FROM information_schema.columns 
    WHERE table_name = 'restaurants' 
    AND column_name = 'situated_in'
  ) THEN
    ALTER TABLE public.restaurants 
    ADD COLUMN situated_in TEXT NOT NULL DEFAULT 'Inside Campus';
  END IF;
END $$;

-- Update existing restaurants to be marked as Inside Campus
UPDATE public.restaurants 
SET situated_in = 'Inside Campus' 
WHERE situated_in IS NULL;
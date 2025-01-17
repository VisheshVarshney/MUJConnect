/*
  # Add email field to profiles

  1. Changes
    - Add email column to profiles table
    - Add trigger to sync email from auth.users
*/

-- Add email column to profiles
ALTER TABLE public.profiles
ADD COLUMN IF NOT EXISTS email TEXT REFERENCES auth.users(email);

-- Create function to sync email
CREATE OR REPLACE FUNCTION public.handle_user_email_change()
RETURNS TRIGGER AS $$
BEGIN
  UPDATE public.profiles
  SET email = NEW.email
  WHERE id = NEW.id;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Create trigger for email sync
DROP TRIGGER IF EXISTS on_auth_user_email_change ON auth.users;
CREATE TRIGGER on_auth_user_email_change
  AFTER INSERT OR UPDATE OF email ON auth.users
  FOR EACH ROW
  EXECUTE FUNCTION public.handle_user_email_change();
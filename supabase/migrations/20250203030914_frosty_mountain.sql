/*
  # Initial TTMS Database Schema

  1. New Tables
    - `users` (staff and admin accounts)
      - `id` (uuid, primary key)
      - `email` (text, unique)
      - `role` (text, either 'admin' or 'staff')
      - `full_name` (text)
      - `active` (boolean)
      - `created_at` (timestamp)
      - `last_login` (timestamp)

    - `vehicle_categories`
      - `id` (uuid, primary key)
      - `name` (text)
      - `base_rate` (numeric)
      - `description` (text)
      - `created_at` (timestamp)
      - `updated_at` (timestamp)

    - `toll_passes`
      - `id` (uuid, primary key)
      - `vehicle_number` (text)
      - `category_id` (uuid, foreign key)
      - `valid_from` (timestamp)
      - `valid_until` (timestamp)
      - `status` (text)
      - `created_by` (uuid, foreign key)
      - `created_at` (timestamp)

    - `transactions`
      - `id` (uuid, primary key)
      - `pass_id` (uuid, foreign key)
      - `amount` (numeric)
      - `processed_by` (uuid, foreign key)
      - `processed_at` (timestamp)
      - `receipt_number` (text, unique)
      - `notes` (text)

  2. Security
    - Enable RLS on all tables
    - Add policies for authenticated users based on roles
*/

-- Users table for staff and admin accounts
CREATE TABLE IF NOT EXISTS users (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  email text UNIQUE NOT NULL,
  role text NOT NULL CHECK (role IN ('admin', 'staff')),
  full_name text NOT NULL,
  active boolean DEFAULT true,
  created_at timestamptz DEFAULT now(),
  last_login timestamptz
);

ALTER TABLE users ENABLE ROW LEVEL SECURITY;

-- Admins can read all users
CREATE POLICY "Admins can read all users"
  ON users
  FOR SELECT
  TO authenticated
  USING (auth.jwt() ->> 'role' = 'admin');

-- Users can read their own data
CREATE POLICY "Users can read own data"
  ON users
  FOR SELECT
  TO authenticated
  USING (auth.uid() = id);

-- Only admins can insert/update users
CREATE POLICY "Admins can insert users"
  ON users
  FOR INSERT
  TO authenticated
  WITH CHECK (auth.jwt() ->> 'role' = 'admin');

CREATE POLICY "Admins can update users"
  ON users
  FOR UPDATE
  TO authenticated
  USING (auth.jwt() ->> 'role' = 'admin');

-- Vehicle Categories table
CREATE TABLE IF NOT EXISTS vehicle_categories (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL UNIQUE,
  base_rate numeric NOT NULL CHECK (base_rate >= 0),
  description text,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

ALTER TABLE vehicle_categories ENABLE ROW LEVEL SECURITY;

-- All authenticated users can read categories
CREATE POLICY "All users can read categories"
  ON vehicle_categories
  FOR SELECT
  TO authenticated
  USING (true);

-- Only admins can modify categories
CREATE POLICY "Admins can modify categories"
  ON vehicle_categories
  FOR ALL
  TO authenticated
  USING (auth.jwt() ->> 'role' = 'admin')
  WITH CHECK (auth.jwt() ->> 'role' = 'admin');

-- Toll Passes table
CREATE TABLE IF NOT EXISTS toll_passes (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  vehicle_number text NOT NULL,
  category_id uuid NOT NULL REFERENCES vehicle_categories(id),
  valid_from timestamptz NOT NULL DEFAULT now(),
  valid_until timestamptz NOT NULL,
  status text NOT NULL CHECK (status IN ('active', 'expired', 'cancelled')),
  created_by uuid NOT NULL REFERENCES users(id),
  created_at timestamptz DEFAULT now(),
  CONSTRAINT valid_date_range CHECK (valid_until > valid_from)
);

ALTER TABLE toll_passes ENABLE ROW LEVEL SECURITY;

-- All authenticated users can read passes
CREATE POLICY "All users can read passes"
  ON toll_passes
  FOR SELECT
  TO authenticated
  USING (true);

-- Staff and admins can create passes
CREATE POLICY "Staff and admins can create passes"
  ON toll_passes
  FOR INSERT
  TO authenticated
  WITH CHECK (
    auth.jwt() ->> 'role' IN ('admin', 'staff')
    AND created_by = auth.uid()
  );

-- Only admins can update passes
CREATE POLICY "Admins can update passes"
  ON toll_passes
  FOR UPDATE
  TO authenticated
  USING (auth.jwt() ->> 'role' = 'admin');

-- Transactions table
CREATE TABLE IF NOT EXISTS transactions (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  pass_id uuid NOT NULL REFERENCES toll_passes(id),
  amount numeric NOT NULL CHECK (amount >= 0),
  processed_by uuid NOT NULL REFERENCES users(id),
  processed_at timestamptz DEFAULT now(),
  receipt_number text UNIQUE NOT NULL,
  notes text,
  CONSTRAINT valid_receipt_number CHECK (receipt_number ~ '^TTMS-\d{8}-\d{6}$')
);

ALTER TABLE transactions ENABLE ROW LEVEL SECURITY;

-- All authenticated users can read transactions
CREATE POLICY "All users can read transactions"
  ON transactions
  FOR SELECT
  TO authenticated
  USING (true);

-- Staff and admins can create transactions
CREATE POLICY "Staff and admins can create transactions"
  ON transactions
  FOR INSERT
  TO authenticated
  WITH CHECK (
    auth.jwt() ->> 'role' IN ('admin', 'staff')
    AND processed_by = auth.uid()
  );

-- Only admins can update transactions
CREATE POLICY "Admins can update transactions"
  ON transactions
  FOR UPDATE
  TO authenticated
  USING (auth.jwt() ->> 'role' = 'admin');

-- Function to generate receipt numbers
CREATE OR REPLACE FUNCTION generate_receipt_number()
RETURNS text
LANGUAGE sql
AS $$
  SELECT 'TTMS-' || 
         to_char(now(), 'YYYYMMDD') || '-' ||
         to_char(floor(random() * 1000000)::integer, 'FM000000')
$$;

-- Add ban_expires_at column to profiles table
ALTER TABLE profiles ADD COLUMN ban_expires_at TIMESTAMP WITH TIME ZONE;

-- Add ban_reason column to profiles table
ALTER TABLE profiles ADD COLUMN ban_reason TEXT;

-- Add is_banned column to profiles table
ALTER TABLE profiles ADD COLUMN is_banned BOOLEAN DEFAULT FALSE;
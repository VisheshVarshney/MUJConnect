/*
  # Restaurant Management System

  1. New Tables
    - `restaurants`
      - `id` (uuid, primary key)
      - `name` (text)
      - `opening_hours` (text)
      - `location` (text)
      - `banner_image` (text)
      - `logo_image` (text)
      - `created_at` (timestamptz)
      - `updated_at` (timestamptz)
    
    - `contact_numbers`
      - `id` (uuid, primary key)
      - `restaurant_id` (uuid, foreign key)
      - `phone_number` (text)
      - `created_at` (timestamptz)
    
    - `menu_items`
      - `id` (uuid, primary key)
      - `restaurant_id` (uuid, foreign key)
      - `name` (text)
      - `description` (text)
      - `price` (decimal)
      - `category` (text)
      - `availability` (boolean)
      - `created_at` (timestamptz)
      - `updated_at` (timestamptz)

  2. Security
    - Enable RLS on all tables
    - Add policies for:
      - Public read access
      - Admin-only write access
*/

-- Create restaurants table
CREATE TABLE IF NOT EXISTS public.restaurants (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  opening_hours TEXT NOT NULL,
  location TEXT NOT NULL,
  banner_image TEXT DEFAULT 'https://images.unsplash.com/photo-1559925393-8be0ec4767c8?w=800&auto=format&fit=crop&q=60&ixlib=rb-4.0.3',
  logo_image TEXT DEFAULT 'https://images.unsplash.com/photo-1586190848861-99aa4a171e90?w=200&auto=format&fit=crop&q=60',
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- Create contact_numbers table
CREATE TABLE IF NOT EXISTS public.contact_numbers (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  restaurant_id UUID REFERENCES public.restaurants(id) ON DELETE CASCADE,
  phone_number TEXT NOT NULL,
  created_at TIMESTAMPTZ DEFAULT now()
);

-- Create menu_items table
CREATE TABLE IF NOT EXISTS public.menu_items (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  restaurant_id UUID REFERENCES public.restaurants(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  description TEXT,
  price DECIMAL(10,2) NOT NULL,
  category TEXT NOT NULL,
  availability BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.restaurants ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.contact_numbers ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.menu_items ENABLE ROW LEVEL SECURITY;

-- Restaurants policies
CREATE POLICY "Restaurants are viewable by everyone"
  ON public.restaurants FOR SELECT
  USING (true);

CREATE POLICY "Only superadmins can insert restaurants"
  ON public.restaurants FOR INSERT
  WITH CHECK (public.is_superadmin(auth.uid()));

CREATE POLICY "Only superadmins can update restaurants"
  ON public.restaurants FOR UPDATE
  USING (public.is_superadmin(auth.uid()));

CREATE POLICY "Only superadmins can delete restaurants"
  ON public.restaurants FOR DELETE
  USING (public.is_superadmin(auth.uid()));

-- Contact numbers policies
CREATE POLICY "Contact numbers are viewable by everyone"
  ON public.contact_numbers FOR SELECT
  USING (true);

CREATE POLICY "Only superadmins can insert contact numbers"
  ON public.contact_numbers FOR INSERT
  WITH CHECK (public.is_superadmin(auth.uid()));

CREATE POLICY "Only superadmins can update contact numbers"
  ON public.contact_numbers FOR UPDATE
  USING (public.is_superadmin(auth.uid()));

CREATE POLICY "Only superadmins can delete contact numbers"
  ON public.contact_numbers FOR DELETE
  USING (public.is_superadmin(auth.uid()));

-- Menu items policies
CREATE POLICY "Menu items are viewable by everyone"
  ON public.menu_items FOR SELECT
  USING (true);

CREATE POLICY "Only superadmins can insert menu items"
  ON public.menu_items FOR INSERT
  WITH CHECK (public.is_superadmin(auth.uid()));

CREATE POLICY "Only superadmins can update menu items"
  ON public.menu_items FOR UPDATE
  USING (public.is_superadmin(auth.uid()));

CREATE POLICY "Only superadmins can delete menu items"
  ON public.menu_items FOR DELETE
  USING (public.is_superadmin(auth.uid()));

-- Create helper functions
CREATE OR REPLACE FUNCTION public.manage_restaurant(
  operation TEXT,
  restaurant_data JSONB DEFAULT NULL,
  target_id UUID DEFAULT NULL
)
RETURNS UUID
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  result_id UUID;
BEGIN
  -- Check if user is superadmin
  IF NOT public.is_superadmin(auth.uid()) THEN
    RAISE EXCEPTION 'Only superadmins can manage restaurants';
  END IF;

  CASE operation
    WHEN 'create' THEN
      INSERT INTO restaurants (
        name,
        opening_hours,
        location,
        banner_image,
        logo_image
      )
      VALUES (
        restaurant_data->>'name',
        restaurant_data->>'opening_hours',
        restaurant_data->>'location',
        COALESCE(restaurant_data->>'banner_image', restaurants.banner_image),
        COALESCE(restaurant_data->>'logo_image', restaurants.logo_image)
      )
      RETURNING id INTO result_id;

    WHEN 'update' THEN
      UPDATE restaurants
      SET
        name = COALESCE(restaurant_data->>'name', name),
        opening_hours = COALESCE(restaurant_data->>'opening_hours', opening_hours),
        location = COALESCE(restaurant_data->>'location', location),
        banner_image = COALESCE(restaurant_data->>'banner_image', banner_image),
        logo_image = COALESCE(restaurant_data->>'logo_image', logo_image),
        updated_at = now()
      WHERE id = target_id
      RETURNING id INTO result_id;

    WHEN 'delete' THEN
      DELETE FROM restaurants
      WHERE id = target_id
      RETURNING id INTO result_id;

    ELSE
      RAISE EXCEPTION 'Invalid operation';
  END CASE;

  RETURN result_id;
END;
$$;
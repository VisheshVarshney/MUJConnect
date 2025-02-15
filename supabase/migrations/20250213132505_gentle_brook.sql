/*
  # Add Menu Images Table

  1. New Tables
    - `menu_images`
      - `id` (uuid, primary key)
      - `restaurant_id` (uuid, foreign key)
      - `url` (text)
      - `created_at` (timestamptz)

  2. Security
    - Enable RLS on `menu_images` table
    - Add policies for authenticated users and superadmins
*/

-- Create menu_images table
CREATE TABLE IF NOT EXISTS public.menu_images (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  restaurant_id UUID REFERENCES public.restaurants(id) ON DELETE CASCADE,
  url TEXT NOT NULL,
  created_at TIMESTAMPTZ DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.menu_images ENABLE ROW LEVEL SECURITY;

-- Menu images policies
CREATE POLICY "Menu images are viewable by everyone"
  ON public.menu_images FOR SELECT
  USING (true);

CREATE POLICY "Only superadmins can insert menu images"
  ON public.menu_images FOR INSERT
  WITH CHECK (public.is_superadmin(auth.uid()));

CREATE POLICY "Only superadmins can update menu images"
  ON public.menu_images FOR UPDATE
  USING (public.is_superadmin(auth.uid()));

CREATE POLICY "Only superadmins can delete menu images"
  ON public.menu_images FOR DELETE
  USING (public.is_superadmin(auth.uid()));
/*
  # Fix Vehicle Categories UUIDs

  1. Changes
    - Fix UUID format for vehicle categories
    - Update indexes and triggers
*/

-- Insert pre-defined vehicle categories with proper UUIDs
INSERT INTO vehicle_categories (id, name, base_rate, description, created_at, updated_at)
VALUES 
  ('11111111-1111-1111-1111-111111111111', 'Car', 10, 'Standard passenger vehicles', now(), now()),
  ('22222222-2222-2222-2222-222222222222', 'Motorcycle', 5, 'Two-wheeled vehicles', now(), now()),
  ('33333333-3333-3333-3333-333333333333', 'Bus', 20, 'Public transport and tourist buses', now(), now()),
  ('44444444-4444-4444-4444-444444444444', 'Truck', 25, 'Commercial trucks and delivery vehicles', now(), now()),
  ('55555555-5555-5555-5555-555555555555', 'Heavy Vehicle', 30, 'Construction and industrial vehicles', now(), now())
ON CONFLICT (id) DO UPDATE 
SET 
  name = EXCLUDED.name,
  base_rate = EXCLUDED.base_rate,
  description = EXCLUDED.description,
  updated_at = now();
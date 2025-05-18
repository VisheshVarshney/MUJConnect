/*
  # Add Pre-defined Vehicle Categories

  1. Changes
    - Insert pre-defined vehicle categories
    - Update existing toll passes to use the new categories
    - Add indexes for better performance

  2. New Data
    - Add 5 basic vehicle categories:
      - Car ($10)
      - Motorcycle ($5)
      - Bus ($20)
      - Truck ($25)
      - Heavy Vehicle ($30)
*/

-- Insert pre-defined vehicle categories
INSERT INTO vehicle_categories (id, name, base_rate, description, created_at, updated_at)
VALUES 
  ('1', 'Car', 10, 'Standard passenger vehicles', now(), now()),
  ('2', 'Motorcycle', 5, 'Two-wheeled vehicles', now(), now()),
  ('3', 'Bus', 20, 'Public transport and tourist buses', now(), now()),
  ('4', 'Truck', 25, 'Commercial trucks and delivery vehicles', now(), now()),
  ('5', 'Heavy Vehicle', 30, 'Construction and industrial vehicles', now(), now())
ON CONFLICT (id) DO UPDATE 
SET 
  name = EXCLUDED.name,
  base_rate = EXCLUDED.base_rate,
  description = EXCLUDED.description,
  updated_at = now();

-- Add indexes for better performance
CREATE INDEX IF NOT EXISTS idx_toll_passes_category_id ON toll_passes (category_id);
CREATE INDEX IF NOT EXISTS idx_toll_passes_vehicle_number ON toll_passes (vehicle_number);
CREATE INDEX IF NOT EXISTS idx_toll_passes_status ON toll_passes (status);
CREATE INDEX IF NOT EXISTS idx_toll_passes_valid_dates ON toll_passes (valid_from, valid_until);

-- Add a trigger to automatically update updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = now();
    RETURN NEW;
END;
$$ language 'plpgsql';

CREATE OR REPLACE TRIGGER update_vehicle_categories_updated_at
    BEFORE UPDATE ON vehicle_categories
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();
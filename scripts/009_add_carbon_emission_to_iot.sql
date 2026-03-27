-- Execute this entirely in your Supabase SQL Editor!

-- 1. Add new columns to iot_data
ALTER TABLE public.iot_data 
ADD COLUMN IF NOT EXISTS carbon_emission NUMERIC,
ADD COLUMN IF NOT EXISTS calculation_method TEXT; -- 'default' or 'custom'

-- 2. Optional: update existing rows to have a calculation_method (e.g., 'default')
-- UPDATE public.iot_data SET calculation_method = 'default' WHERE calculation_method IS NULL;

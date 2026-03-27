-- Create the iot_data table
CREATE TABLE public.iot_data (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  type TEXT NOT NULL CHECK (type IN ('virtual', 'realtime')),
  module TEXT NOT NULL CHECK (module IN ('transport', 'energy')),
  transport_type TEXT,
  frequency TEXT,
  energy_type TEXT,
  value NUMERIC NOT NULL,
  unit TEXT,
  created_at TIMESTAMPTZ DEFAULT now() NOT NULL
);

-- Enable Row Level Security (RLS)
ALTER TABLE public.iot_data ENABLE ROW LEVEL SECURITY;

-- Create Policies
-- Allow authenticated users to insert their own data
CREATE POLICY "Users can insert their own IoT data"
ON public.iot_data
FOR INSERT
TO authenticated
WITH CHECK (auth.uid() = user_id);

-- Allow authenticated users to select their own data
CREATE POLICY "Users can view their own IoT data"
ON public.iot_data
FOR SELECT
TO authenticated
USING (auth.uid() = user_id);

-- Allow authenticated users to update their own data
CREATE POLICY "Users can update their own IoT data"
ON public.iot_data
FOR UPDATE
TO authenticated
USING (auth.uid() = user_id)
WITH CHECK (auth.uid() = user_id);

-- Allow authenticated users to delete their own data
CREATE POLICY "Users can delete their own IoT data"
ON public.iot_data
FOR DELETE
TO authenticated
USING (auth.uid() = user_id);

-- Create an index for faster querying by user_id
CREATE INDEX idx_iot_data_user_id ON public.iot_data(user_id);

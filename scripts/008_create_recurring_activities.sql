-- Execute this entirely in your Supabase SQL Editor!

-- 1. Create the table
CREATE TABLE IF NOT EXISTS public.recurring_activities (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    source_table TEXT NOT NULL, -- 'iot_data' or 'carbon_activities'
    reference_payload JSONB NOT NULL,
    frequency TEXT NOT NULL, -- 'Per Day', 'Per Week', 'Per Month'
    next_run_at TIMESTAMP WITH TIME ZONE NOT NULL,
    is_active BOOLEAN NOT NULL DEFAULT true,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 2. Enable Row Level Security (RLS)
ALTER TABLE public.recurring_activities ENABLE ROW LEVEL SECURITY;

-- 3. Create RLS Policies
CREATE POLICY "Users can view their own recurring activities" 
ON public.recurring_activities FOR SELECT 
USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own recurring activities" 
ON public.recurring_activities FOR INSERT 
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own recurring activities" 
ON public.recurring_activities FOR UPDATE 
USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own recurring activities" 
ON public.recurring_activities FOR DELETE 
USING (auth.uid() = user_id);

-- 4. Enable Supabase Realtime for the table so Dashboards auto-update
BEGIN;
  CREATE PUBLICATION supabase_realtime_recurring;
EXCEPTION WHEN duplicate_object THEN
  -- do nothing
END;
ALTER PUBLICATION supabase_realtime ADD TABLE public.recurring_activities;

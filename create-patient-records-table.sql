-- Create patient_records table
CREATE TABLE IF NOT EXISTS public.patient_records (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    user_id UUID,
    child_name TEXT NOT NULL,
    gender TEXT,
    age_years DECIMAL(5,2),
    weight_kg DECIMAL(8,2) NOT NULL,
    drug_name TEXT NOT NULL,
    dose_range TEXT,
    recommendation TEXT,
    frequency TEXT,
    duration TEXT,
    analysis_notes TEXT,
    ehr_url TEXT,
    lab_url TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create an index on user_id for better query performance
CREATE INDEX IF NOT EXISTS idx_patient_records_user_id ON public.patient_records(user_id);

-- Create an index on child_name for search functionality
CREATE INDEX IF NOT EXISTS idx_patient_records_child_name ON public.patient_records(child_name);

-- Create an index on created_at for sorting
CREATE INDEX IF NOT EXISTS idx_patient_records_created_at ON public.patient_records(created_at);

-- Enable Row Level Security (RLS)
ALTER TABLE public.patient_records ENABLE ROW LEVEL SECURITY;

-- Create a policy that allows all operations for authenticated users
-- Note: You may want to restrict this based on your security requirements
CREATE POLICY "Allow all operations for authenticated users" ON public.patient_records
    FOR ALL USING (auth.role() = 'authenticated');

-- Create a policy for anonymous users (if needed for your app)
CREATE POLICY "Allow all operations for anonymous users" ON public.patient_records
    FOR ALL USING (true);

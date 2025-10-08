# Database Setup Instructions

## Issue Found
The `patient_records` table doesn't exist in your Supabase database, which is causing the save functionality to fail.

## Solution
You need to create the `patient_records` table in your Supabase dashboard.

### Steps to Create the Table:

1. **Go to your Supabase Dashboard**
   - Visit: https://supabase.com/dashboard
   - Select your project: `xyqjesnnhqdzgcsdswgk`

2. **Navigate to SQL Editor**
   - Click on "SQL Editor" in the left sidebar
   - Click "New Query"

3. **Run the Table Creation Script**
   - Copy and paste the contents of `create-patient-records-table.sql` into the SQL editor
   - Click "Run" to execute the script

4. **Verify Table Creation**
   - Go to "Table Editor" in the left sidebar
   - You should see the `patient_records` table listed
   - Click on it to verify the columns are correct

### Alternative: Use Supabase CLI (if you have it installed)
```bash
supabase db reset
# or
supabase migration new create_patient_records_table
# Then copy the SQL content to the migration file and run:
supabase db push
```

## After Creating the Table
Once the table is created, the save functionality should work properly. The app will be able to:
- Save patient records from the Doctor Panel
- Display saved records in the Patient Panel
- View detailed analysis results

## Table Schema
The `patient_records` table includes these columns:
- `id` (UUID, Primary Key)
- `user_id` (UUID, for user association)
- `child_name` (TEXT, required)
- `gender` (TEXT)
- `age_years` (DECIMAL)
- `weight_kg` (DECIMAL, required)
- `drug_name` (TEXT, required)
- `dose_range` (TEXT)
- `recommendation` (TEXT)
- `frequency` (TEXT)
- `duration` (TEXT)
- `analysis_notes` (TEXT, for storing AI analysis)
- `ehr_url` (TEXT, for EHR file URLs)
- `lab_url` (TEXT, for lab file URLs)
- `created_at` (TIMESTAMP)
- `updated_at` (TIMESTAMP)

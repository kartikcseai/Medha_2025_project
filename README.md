
  # Healthcare Web App UI Design

  This is a code bundle for Healthcare Web App UI Design. The original project is available at https://www.figma.com/design/VUcNhT8IHSnje40tnZtKcX/Healthcare-Web-App-UI-Design.

## Running the code

Run `npm i` to install the dependencies.

Run `npm run dev` to start the development server.

## Supabase Setup

Create a `.env` file at the project root with:

```bash
VITE_SUPABASE_URL=your-project-url
VITE_SUPABASE_ANON_KEY=your-anon-key
```

In Supabase:
- Create a Storage bucket named `ehr-reports` (public or signed URLs, per your policy).
- Create a table `patient_records` with columns:
  - `id` uuid primary key default gen_random_uuid()
  - `created_at` timestamp with time zone default now()
  - `user_id` uuid
  - `child_name` text
  - `gender` text
  - `weight_kg` numeric
  - `drug_name` text
  - `ehr_url` text
  - `dose_range` text
  - `recommendation` text
  - `frequency` text
  - `duration` text
  - `analysis_notes` text

RLS (optional, recommended): enable Row Level Security and restrict rows to `auth.uid()`.

### Edge Function: analyze-ehr
Create a Supabase Edge Function named `analyze-ehr` that accepts JSON:

```json
{
  "fileUrl": "https://.../path.pdf",
  "patient": { "childName": "...", "gender": "...", "weight": "...", "drugName": "..." }
}
```

Return JSON like:

```json
{
  "doseResult": {
    "doseRange": "100–200 mg/day",
    "recommendation": "5ml every 8 hours",
    "frequency": "3 times daily",
    "duration": "5-7 days"
  },
  "notes": "EHR reviewed. No contraindications detected."
}
```

You can implement parsing of the PDF, call an LLM (e.g., Gemini), and produce the structured result above.

### Deploy analyze-ehr with Gemini

1) Install Supabase CLI (if not done):
```bash
npm i -g supabase
```

2) Login and link project:
```bash
supabase login
supabase link --project-ref YOUR_PROJECT_REF
```

3) Set Gemini secret (server-side only):
```bash
supabase secrets set GEMINI_API_KEY=YOUR_GEMINI_KEY
```

4) Create/deploy function:
```bash
supabase functions deploy analyze-ehr
```

5) Allow invoking from the app:
```bash
# For development you can allow anon invoke
supabase functions set-config analyze-ehr JWT_VERIFICATION=skip
```

The frontend calls this function via `supabase.functions.invoke('analyze-ehr', { body: { fileUrl?, patient } })`.
  
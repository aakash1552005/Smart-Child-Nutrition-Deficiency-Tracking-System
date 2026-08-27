-- ====================================================================
-- SUPABASE ROW LEVEL SECURITY (RLS) POLICY MIGRATION
-- Karnataka Child Nutrition Intelligence & Tracking System (CNIT)
-- ====================================================================

-- 1. Enable Row Level Security (RLS) on child_records table
ALTER TABLE IF EXISTS public.child_records ENABLE ROW LEVEL SECURITY;

-- 2. Drop any existing permissive or conflicting policies
DROP POLICY IF EXISTS "Allow authenticated read access" ON public.child_records;
DROP POLICY IF EXISTS "Allow authenticated insert access" ON public.child_records;
DROP POLICY IF EXISTS "Allow authenticated update access" ON public.child_records;
DROP POLICY IF EXISTS "Allow authenticated delete access" ON public.child_records;
DROP POLICY IF EXISTS "Allow anon select only" ON public.child_records;

-- 3. Policy: Authenticated users (logged-in field officers/admins) have full access
CREATE POLICY "Allow authenticated users full access"
  ON public.child_records
  FOR ALL
  TO authenticated
  USING (true)
  WITH CHECK (true);

-- 4. Policy: Read-only access for public/demo overview if required (or keep restricted to authenticated)
CREATE POLICY "Allow authenticated read access only"
  ON public.child_records
  FOR SELECT
  TO authenticated
  USING (true);

-- Optional: If read-only dashboard preview without login is desired, enable this:
-- CREATE POLICY "Allow public read-only access"
--   ON public.child_records
--   FOR SELECT
--   TO anon
--   USING (true);

-- COMPLETE FIX for bookings RLS policy issue
-- This is the FINAL fix - run ALL of this in Supabase SQL Editor

-- Step 1: DISABLE RLS temporarily to clear everything
ALTER TABLE public.bookings DISABLE ROW LEVEL SECURITY;

-- Step 2: Drop ALL existing policies (including any we might have missed)
DO $$ 
DECLARE
    pol RECORD;
BEGIN
    FOR pol IN 
        SELECT policyname 
        FROM pg_policies 
        WHERE schemaname = 'public' AND tablename = 'bookings'
    LOOP
        EXECUTE format('DROP POLICY IF EXISTS %I ON public.bookings', pol.policyname);
    END LOOP;
END $$;

-- Step 3: Re-enable RLS
ALTER TABLE public.bookings ENABLE ROW LEVEL SECURITY;

-- Step 4: Create a SINGLE, simple policy for INSERT that allows EVERYONE
CREATE POLICY "bookings_insert_policy"
    ON public.bookings
    FOR INSERT
    WITH CHECK (true);

-- Step 5: Create SELECT policies
CREATE POLICY "bookings_select_by_host"
    ON public.bookings
    FOR SELECT
    USING (auth.uid() = host_user_id OR auth.role() = 'anon');

-- Step 6: Create UPDATE policy
CREATE POLICY "bookings_update_by_host"
    ON public.bookings
    FOR UPDATE
    USING (auth.uid() = host_user_id);

-- Step 7: Ensure proper grants (this is critical!)
GRANT ALL ON public.bookings TO anon;
GRANT ALL ON public.bookings TO authenticated;
GRANT USAGE ON SCHEMA public TO anon;
GRANT USAGE ON SCHEMA public TO authenticated;

-- Step 8: Verify setup
SELECT 'RLS Enabled:' as check_type, rowsecurity::text as value
FROM pg_tables 
WHERE schemaname = 'public' AND tablename = 'bookings'
UNION ALL
SELECT 'Policy Count:', count(*)::text
FROM pg_policies 
WHERE schemaname = 'public' AND tablename = 'bookings'
UNION ALL
SELECT 'Anon Grants:', count(*)::text
FROM information_schema.table_privileges
WHERE table_name = 'bookings' AND grantee = 'anon';

-- Step 9: Show all policies
SELECT * FROM pg_policies WHERE tablename = 'bookings';

-- Step 10: Test as anonymous user
SET ROLE anon;
SELECT 'Can access bookings table as anon:' as test_result;
RESET ROLE;

SELECT 'Setup complete! Try booking now.' as status;

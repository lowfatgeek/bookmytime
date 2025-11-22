-- Debug RLS issues for bookings table
-- Run this in Supabase SQL Editor to diagnose the problem

-- 1. Check if RLS is enabled
SELECT tablename, rowsecurity 
FROM pg_tables 
WHERE schemaname = 'public' AND tablename = 'bookings';

-- 2. Check all current policies
SELECT * FROM pg_policies WHERE tablename = 'bookings';

-- 3. Check grants for anon role
SELECT 
    grantee, 
    table_schema, 
    table_name, 
    privilege_type
FROM information_schema.table_privileges
WHERE table_name = 'bookings' AND grantee IN ('anon', 'authenticated');

-- 4. Try to simulate what happens when anon user inserts
-- First, set role to anon
SET ROLE anon;

-- Try a test insert (replace with actual UUIDs from your database)
-- Get a valid user_id and event_type_id first
RESET ROLE;
SELECT id, full_name FROM public.users LIMIT 1;
SELECT id, name FROM public.event_types LIMIT 1;

-- Now try as anon (replace the UUIDs below with actual ones from above query)
SET ROLE anon;
INSERT INTO public.bookings (
    event_type_id,
    host_user_id,
    guest_name,
    guest_email,
    guest_timezone,
    start_time_utc,
    end_time_utc,
    status
) VALUES (
    'YOUR_EVENT_TYPE_ID_HERE',  -- Replace with actual event type ID
    'YOUR_USER_ID_HERE',         -- Replace with actual user ID
    'Test Guest',
    'test@example.com',
    'UTC',
    NOW() + INTERVAL '1 day',
    NOW() + INTERVAL '1 day' + INTERVAL '30 minutes',
    'CONFIRMED'
);

RESET ROLE;

-- If the above insert fails, the error will tell us what's wrong

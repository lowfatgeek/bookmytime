-- BookMyTime Database Schema
-- This schema implements the complete data model for the scheduling application

-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Create custom types for enums
CREATE TYPE day_of_week AS ENUM ('MONDAY', 'TUESDAY', 'WEDNESDAY', 'THURSDAY', 'FRIDAY', 'SATURDAY', 'SUNDAY');
CREATE TYPE booking_status AS ENUM ('CONFIRMED', 'CANCELLED', 'COMPLETED');
CREATE TYPE notification_type AS ENUM ('CONFIRMATION', 'REMINDER', 'CANCELLATION', 'RESCHEDULE');
CREATE TYPE notification_status AS ENUM ('PENDING', 'SENT', 'FAILED');

-- ============================================================================
-- USERS TABLE (extends Supabase auth.users)
-- ============================================================================
CREATE TABLE public.users (
    id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
    email TEXT UNIQUE NOT NULL,
    full_name TEXT NOT NULL,
    timezone TEXT NOT NULL DEFAULT 'UTC',
    booking_slug TEXT UNIQUE NOT NULL,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Create index on booking_slug for fast lookups
CREATE INDEX idx_users_booking_slug ON public.users(booking_slug);
CREATE INDEX idx_users_email ON public.users(email);

-- ============================================================================
-- EVENT TYPES TABLE
-- ============================================================================
CREATE TABLE public.event_types (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
    name TEXT NOT NULL,
    duration_minutes INTEGER NOT NULL CHECK (duration_minutes >= 15),
    description TEXT,
    location TEXT,
    buffer_before_minutes INTEGER NOT NULL DEFAULT 0 CHECK (buffer_before_minutes >= 0),
    buffer_after_minutes INTEGER NOT NULL DEFAULT 0 CHECK (buffer_after_minutes >= 0),
    is_active BOOLEAN NOT NULL DEFAULT TRUE,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Create indexes for faster queries
CREATE INDEX idx_event_types_user_id ON public.event_types(user_id);
CREATE INDEX idx_event_types_is_active ON public.event_types(is_active);

-- ============================================================================
-- AVAILABILITY TABLE
-- ============================================================================
CREATE TABLE public.availability (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
    day_of_week day_of_week NOT NULL,
    start_time TIME NOT NULL,
    end_time TIME NOT NULL,
    is_active BOOLEAN NOT NULL DEFAULT TRUE,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    CONSTRAINT valid_time_range CHECK (end_time > start_time)
);

-- Create indexes
CREATE INDEX idx_availability_user_id ON public.availability(user_id);
CREATE INDEX idx_availability_day_of_week ON public.availability(day_of_week);
CREATE INDEX idx_availability_is_active ON public.availability(is_active);

-- ============================================================================
-- BOOKINGS TABLE
-- ============================================================================
CREATE TABLE public.bookings (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    event_type_id UUID NOT NULL REFERENCES public.event_types(id) ON DELETE RESTRICT,
    host_user_id UUID NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
    guest_name TEXT NOT NULL,
    guest_email TEXT NOT NULL,
    guest_timezone TEXT NOT NULL,
    start_time_utc TIMESTAMPTZ NOT NULL,
    end_time_utc TIMESTAMPTZ NOT NULL,
    status booking_status NOT NULL DEFAULT 'CONFIRMED',
    cancellation_reason TEXT,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    cancelled_at TIMESTAMPTZ,
    CONSTRAINT valid_booking_time CHECK (end_time_utc > start_time_utc)
);

-- Create indexes for faster queries
CREATE INDEX idx_bookings_event_type_id ON public.bookings(event_type_id);
CREATE INDEX idx_bookings_host_user_id ON public.bookings(host_user_id);
CREATE INDEX idx_bookings_status ON public.bookings(status);
CREATE INDEX idx_bookings_start_time_utc ON public.bookings(start_time_utc);
CREATE INDEX idx_bookings_guest_email ON public.bookings(guest_email);

-- Composite index for finding bookings for a specific host on a specific date
CREATE INDEX idx_bookings_host_date ON public.bookings(host_user_id, start_time_utc);

-- ============================================================================
-- NOTIFICATIONS TABLE
-- ============================================================================
CREATE TABLE public.notifications (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    booking_id UUID NOT NULL REFERENCES public.bookings(id) ON DELETE CASCADE,
    notification_type notification_type NOT NULL,
    recipient_email TEXT NOT NULL,
    status notification_status NOT NULL DEFAULT 'PENDING',
    scheduled_for TIMESTAMPTZ NOT NULL,
    sent_at TIMESTAMPTZ,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Create indexes
CREATE INDEX idx_notifications_booking_id ON public.notifications(booking_id);
CREATE INDEX idx_notifications_status ON public.notifications(status);
CREATE INDEX idx_notifications_scheduled_for ON public.notifications(scheduled_for);

-- ============================================================================
-- FUNCTIONS
-- ============================================================================

-- Function to update updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create triggers for updated_at columns
CREATE TRIGGER update_users_updated_at BEFORE UPDATE ON public.users
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_event_types_updated_at BEFORE UPDATE ON public.event_types
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_availability_updated_at BEFORE UPDATE ON public.availability
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_bookings_updated_at BEFORE UPDATE ON public.bookings
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Function to generate unique booking slug from name
CREATE OR REPLACE FUNCTION generate_booking_slug(name TEXT)
RETURNS TEXT AS $$
DECLARE
    base_slug TEXT;
    final_slug TEXT;
    counter INTEGER := 0;
BEGIN
    -- Convert to lowercase, replace spaces with hyphens, remove special characters
    base_slug := lower(regexp_replace(name, '[^a-zA-Z0-9\s-]', '', 'g'));
    base_slug := regexp_replace(base_slug, '\s+', '-', 'g');
    base_slug := trim(both '-' from base_slug);
    
    final_slug := base_slug;
    
    -- Check if slug exists and add number if needed
    WHILE EXISTS (SELECT 1 FROM public.users WHERE booking_slug = final_slug) LOOP
        counter := counter + 1;
        final_slug := base_slug || '-' || counter;
    END LOOP;
    
    RETURN final_slug;
END;
$$ LANGUAGE plpgsql;

-- Function to handle new user signup (creates profile automatically)
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER 
SECURITY DEFINER SET search_path = public
LANGUAGE plpgsql
AS $$
BEGIN
    INSERT INTO public.users (id, email, full_name, timezone, booking_slug)
    VALUES (
        NEW.id,
        NEW.email,
        COALESCE(NEW.raw_user_meta_data->>'full_name', 'User'),
        COALESCE(NEW.raw_user_meta_data->>'timezone', 'UTC'),
        public.generate_booking_slug(COALESCE(NEW.raw_user_meta_data->>'booking_slug', NEW.raw_user_meta_data->>'full_name', 'user'))
    );
    RETURN NEW;
EXCEPTION
    WHEN OTHERS THEN
        RAISE LOG 'Error in handle_new_user: %', SQLERRM;
        RETURN NEW;
END;
$$;

-- Trigger to automatically create user profile on signup
CREATE TRIGGER on_auth_user_created
    AFTER INSERT ON auth.users
    FOR EACH ROW 
    EXECUTE FUNCTION public.handle_new_user();

-- ============================================================================
-- ROW LEVEL SECURITY (RLS) POLICIES
-- ============================================================================

-- Enable RLS on all tables
ALTER TABLE public.users ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.event_types ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.availability ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.bookings ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.notifications ENABLE ROW LEVEL SECURITY;

-- Users table policies
CREATE POLICY "Users can view their own profile"
    ON public.users FOR SELECT
    USING (auth.uid() = id);

CREATE POLICY "Users can insert their own profile"
    ON public.users FOR INSERT
    WITH CHECK (auth.uid() = id);

CREATE POLICY "Users can update their own profile"
    ON public.users FOR UPDATE
    USING (auth.uid() = id);

CREATE POLICY "Public users viewable by booking slug"
    ON public.users FOR SELECT
    USING (true); -- Allow public read for booking pages

-- Event types policies
CREATE POLICY "Users can view their own event types"
    ON public.event_types FOR SELECT
    USING (auth.uid() = user_id);

CREATE POLICY "Users can create their own event types"
    ON public.event_types FOR INSERT
    WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own event types"
    ON public.event_types FOR UPDATE
    USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own event types"
    ON public.event_types FOR DELETE
    USING (auth.uid() = user_id);

CREATE POLICY "Public can view active event types"
    ON public.event_types FOR SELECT
    USING (is_active = true);

-- Availability policies
CREATE POLICY "Users can view their own availability"
    ON public.availability FOR SELECT
    USING (auth.uid() = user_id);

CREATE POLICY "Users can create their own availability"
    ON public.availability FOR INSERT
    WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own availability"
    ON public.availability FOR UPDATE
    USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own availability"
    ON public.availability FOR DELETE
    USING (auth.uid() = user_id);

CREATE POLICY "Public can view active availability"
    ON public.availability FOR SELECT
    USING (is_active = true);

-- Bookings policies
-- Allow anyone (anon and authenticated) to INSERT bookings
CREATE POLICY "allow_anon_insert_bookings"
    ON public.bookings
    FOR INSERT
    TO anon, authenticated
    WITH CHECK (true);

-- Allow users to view bookings they host
CREATE POLICY "allow_users_view_hosted_bookings"
    ON public.bookings
    FOR SELECT
    TO authenticated
    USING (auth.uid() = host_user_id);

-- Allow users to view bookings by their email
CREATE POLICY "allow_users_view_bookings_by_email"
    ON public.bookings
    FOR SELECT
    TO authenticated
    USING (guest_email = (SELECT email FROM public.users WHERE id = auth.uid()));

-- Allow users to update their hosted bookings
CREATE POLICY "allow_users_update_hosted_bookings"
    ON public.bookings
    FOR UPDATE
    TO authenticated
    USING (auth.uid() = host_user_id);

-- Notifications policies
CREATE POLICY "Users can view notifications for their bookings"
    ON public.notifications FOR SELECT
    USING (
        EXISTS (
            SELECT 1 FROM public.bookings 
            WHERE bookings.id = notifications.booking_id 
            AND bookings.host_user_id = auth.uid()
        )
    );

CREATE POLICY "System can create notifications"
    ON public.notifications FOR INSERT
    WITH CHECK (true); -- Allow system to create notifications

CREATE POLICY "System can update notifications"
    ON public.notifications FOR UPDATE
    USING (true); -- Allow system to update notification status

-- ============================================================================
-- SAMPLE DATA (Optional - comment out for production)
-- ============================================================================

-- This section can be used to create sample data for testing
-- Uncomment if you want to populate sample data

/*
-- Insert sample user (requires auth.users entry first)
INSERT INTO public.users (id, email, full_name, timezone, booking_slug)
VALUES (
    'sample-uuid-here',
    'demo@example.com',
    'Demo User',
    'America/New_York',
    'demo-user'
);

-- Insert sample event type
INSERT INTO public.event_types (user_id, name, duration_minutes, description, location)
VALUES (
    'sample-uuid-here',
    '30-Minute Consultation',
    30,
    'A quick intro call to discuss your needs',
    'Zoom'
);

-- Insert sample availability
INSERT INTO public.availability (user_id, day_of_week, start_time, end_time)
VALUES
    ('sample-uuid-here', 'MONDAY', '09:00', '17:00'),
    ('sample-uuid-here', 'TUESDAY', '09:00', '17:00'),
    ('sample-uuid-here', 'WEDNESDAY', '09:00', '17:00'),
    ('sample-uuid-here', 'THURSDAY', '09:00', '17:00'),
    ('sample-uuid-here', 'FRIDAY', '09:00', '17:00');
*/

-- ============================================================================
-- VIEWS (Helper views for common queries)
-- ============================================================================

-- View for upcoming bookings with event type details
CREATE OR REPLACE VIEW public.upcoming_bookings AS
SELECT 
    b.id,
    b.guest_name,
    b.guest_email,
    b.guest_timezone,
    b.start_time_utc,
    b.end_time_utc,
    b.status,
    b.host_user_id,
    et.name as event_type_name,
    et.duration_minutes,
    et.location,
    u.full_name as host_name,
    u.email as host_email
FROM public.bookings b
JOIN public.event_types et ON b.event_type_id = et.id
JOIN public.users u ON b.host_user_id = u.id
WHERE b.start_time_utc > NOW()
  AND b.status = 'CONFIRMED'
ORDER BY b.start_time_utc ASC;

-- ============================================================================
-- GRANTS (Ensure proper permissions)
-- ============================================================================

-- Grant access to authenticated users
GRANT USAGE ON SCHEMA public TO authenticated;
GRANT ALL ON ALL TABLES IN SCHEMA public TO authenticated;
GRANT ALL ON ALL SEQUENCES IN SCHEMA public TO authenticated;
GRANT EXECUTE ON ALL FUNCTIONS IN SCHEMA public TO authenticated;

-- Grant limited access to anonymous users (for public booking pages)
GRANT USAGE ON SCHEMA public TO anon;
GRANT SELECT ON public.users TO anon;
GRANT SELECT ON public.event_types TO anon;
GRANT SELECT ON public.availability TO anon;
GRANT INSERT ON public.bookings TO anon;
GRANT INSERT ON public.notifications TO anon;

-- ============================================================================
-- COMPLETED
-- ============================================================================
-- Schema creation complete. 
-- Next steps:
-- 1. Run this SQL in your Supabase SQL Editor
-- 2. Configure authentication providers in Supabase dashboard
-- 3. Set up email templates for Supabase Auth
-- 4. Test the schema with sample data

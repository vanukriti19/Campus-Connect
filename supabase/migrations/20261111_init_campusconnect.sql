-- ============================================================================
-- CAMPUSCONNECT: COMPLETE SUPABASE POSTGRESQL MIGRATION SCRIPT
-- ============================================================================

-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- ============================================================================
-- 1. PROFILES TABLE (Extends Supabase auth.users)
-- ============================================================================
CREATE TABLE IF NOT EXISTS public.profiles (
    id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
    full_name TEXT NOT NULL,
    email TEXT NOT NULL UNIQUE,
    roll_no TEXT,
    department TEXT,
    role TEXT NOT NULL DEFAULT 'student' CHECK (role IN ('student', 'admin')),
    created_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now()),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now())
);

CREATE INDEX IF NOT EXISTS idx_profiles_role ON public.profiles(role);
CREATE INDEX IF NOT EXISTS idx_profiles_email ON public.profiles(email);

-- Auto-sync new users from auth.users to public.profiles
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
    INSERT INTO public.profiles (id, full_name, email, roll_no, department, role)
    VALUES (
        new.id,
        COALESCE(new.raw_user_meta_data->>'full_name', split_part(new.email, '@', 1)),
        new.email,
        new.raw_user_meta_data->>'roll_no',
        COALESCE(new.raw_user_meta_data->>'department', 'General'),
        COALESCE(new.raw_user_meta_data->>'role', 'student')
    )
    ON CONFLICT (id) DO UPDATE
    SET full_name = EXCLUDED.full_name,
        email = EXCLUDED.email,
        updated_at = timezone('utc'::text, now());
    RETURN new;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
    AFTER INSERT ON auth.users
    FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- ============================================================================
-- 2. EVENTS TABLE
-- ============================================================================
CREATE TABLE IF NOT EXISTS public.events (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    organizer_id UUID REFERENCES public.profiles(id) ON DELETE SET NULL,
    title TEXT NOT NULL CHECK (char_length(title) >= 3),
    description TEXT NOT NULL,
    category TEXT NOT NULL CHECK (category IN ('Technical', 'Cultural', 'Sports', 'Workshop')),
    venue TEXT NOT NULL,
    is_virtual BOOLEAN NOT NULL DEFAULT false,
    start_time TIMESTAMPTZ NOT NULL,
    end_time TIMESTAMPTZ NOT NULL,
    registration_deadline TIMESTAMPTZ NOT NULL,
    max_capacity INTEGER NOT NULL CHECK (max_capacity > 0),
    registered_count INTEGER NOT NULL DEFAULT 0 CHECK (registered_count >= 0),
    banner_url TEXT NOT NULL,
    organizer_name TEXT NOT NULL,
    organizer_email TEXT NOT NULL,
    status TEXT NOT NULL DEFAULT 'published' CHECK (status IN ('draft', 'published', 'completed', 'cancelled')),
    tags TEXT[] DEFAULT '{}',
    featured BOOLEAN NOT NULL DEFAULT false,
    created_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now()),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now()),
    CONSTRAINT valid_event_dates CHECK (end_time > start_time),
    CONSTRAINT valid_deadline CHECK (registration_deadline <= start_time)
);

CREATE INDEX IF NOT EXISTS idx_events_category ON public.events(category);
CREATE INDEX IF NOT EXISTS idx_events_start_time ON public.events(start_time);
CREATE INDEX IF NOT EXISTS idx_events_status ON public.events(status);
CREATE INDEX IF NOT EXISTS idx_events_featured ON public.events(featured);

-- ============================================================================
-- 3. REGISTRATIONS TABLE
-- ============================================================================
CREATE TABLE IF NOT EXISTS public.registrations (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    event_id UUID NOT NULL REFERENCES public.events(id) ON DELETE CASCADE,
    user_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
    student_name TEXT NOT NULL,
    student_email TEXT NOT NULL,
    student_roll_no TEXT NOT NULL,
    department TEXT NOT NULL,
    ticket_code TEXT NOT NULL UNIQUE,
    status TEXT NOT NULL DEFAULT 'confirmed' CHECK (status IN ('confirmed', 'cancelled', 'waitlist')),
    registered_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now()),
    CONSTRAINT unique_event_user_registration UNIQUE (event_id, user_id)
);

CREATE INDEX IF NOT EXISTS idx_registrations_event_id ON public.registrations(event_id);
CREATE INDEX IF NOT EXISTS idx_registrations_user_id ON public.registrations(user_id);
CREATE INDEX IF NOT EXISTS idx_registrations_student_email ON public.registrations(student_email);

-- ============================================================================
-- 4. BOOKMARKS TABLE
-- ============================================================================
CREATE TABLE IF NOT EXISTS public.bookmarks (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
    event_id UUID NOT NULL REFERENCES public.events(id) ON DELETE CASCADE,
    created_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now()),
    CONSTRAINT unique_user_event_bookmark UNIQUE (user_id, event_id)
);

CREATE INDEX IF NOT EXISTS idx_bookmarks_user_id ON public.bookmarks(user_id);
CREATE INDEX IF NOT EXISTS idx_bookmarks_event_id ON public.bookmarks(event_id);

-- ============================================================================
-- 5. AUTOMATIC REGISTERED_COUNT SYNC TRIGGER
-- ============================================================================
CREATE OR REPLACE FUNCTION public.sync_event_registration_count()
RETURNS TRIGGER AS $$
BEGIN
    IF (TG_OP = 'INSERT' AND NEW.status = 'confirmed') THEN
        UPDATE public.events
        SET registered_count = registered_count + 1,
            updated_at = timezone('utc'::text, now())
        WHERE id = NEW.event_id;
    ELSIF (TG_OP = 'DELETE' AND OLD.status = 'confirmed') THEN
        UPDATE public.events
        SET registered_count = GREATEST(0, registered_count - 1),
            updated_at = timezone('utc'::text, now())
        WHERE id = OLD.event_id;
    ELSIF (TG_OP = 'UPDATE') THEN
        IF (OLD.status = 'confirmed' AND NEW.status = 'cancelled') THEN
            UPDATE public.events
            SET registered_count = GREATEST(0, registered_count - 1),
                updated_at = timezone('utc'::text, now())
            WHERE id = NEW.event_id;
        ELSIF (OLD.status = 'cancelled' AND NEW.status = 'confirmed') THEN
            UPDATE public.events
            SET registered_count = registered_count + 1,
                updated_at = timezone('utc'::text, now())
            WHERE id = NEW.event_id;
        END IF;
    END IF;
    RETURN COALESCE(NEW, OLD);
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

DROP TRIGGER IF EXISTS on_registration_count_change ON public.registrations;
CREATE TRIGGER on_registration_count_change
    AFTER INSERT OR UPDATE OR DELETE ON public.registrations
    FOR EACH ROW EXECUTE FUNCTION public.sync_event_registration_count();

-- ============================================================================
-- 6. SECURITY DEFINER HELPER: IS_ADMIN()
-- ============================================================================
CREATE OR REPLACE FUNCTION public.is_admin()
RETURNS BOOLEAN AS $$
BEGIN
    RETURN EXISTS (
        SELECT 1 FROM public.profiles
        WHERE id = auth.uid() AND role = 'admin'
    );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER STABLE;

-- ============================================================================
-- 7. ATOMIC REGISTRATION RPC (Concurrency Safe with FOR UPDATE lock)
-- ============================================================================
CREATE OR REPLACE FUNCTION public.register_for_event(
    p_event_id UUID,
    p_student_name TEXT,
    p_student_roll_no TEXT,
    p_department TEXT
)
RETURNS JSONB AS $$
DECLARE
    v_user_id UUID := auth.uid();
    v_user_email TEXT;
    v_event RECORD;
    v_ticket_code TEXT;
    v_new_registration RECORD;
BEGIN
    IF v_user_id IS NULL THEN
        RAISE EXCEPTION 'Authentication required to register for an event.';
    END IF;

    SELECT email INTO v_user_email FROM public.profiles WHERE id = v_user_id;

    -- Lock event row to guarantee no race conditions or overbooking
    SELECT * INTO v_event
    FROM public.events
    WHERE id = p_event_id
    FOR UPDATE;

    IF NOT FOUND THEN
        RAISE EXCEPTION 'Event does not exist.';
    END IF;

    IF timezone('utc'::text, now()) > v_event.registration_deadline THEN
        RAISE EXCEPTION 'Registration deadline has passed.';
    END IF;

    IF v_event.registered_count >= v_event.max_capacity THEN
        RAISE EXCEPTION 'Event is completely sold out.';
    END IF;

    IF EXISTS (
        SELECT 1 FROM public.registrations
        WHERE event_id = p_event_id AND user_id = v_user_id
    ) THEN
        RAISE EXCEPTION 'You have already registered for this event.';
    END IF;

    v_ticket_code := 'CC-' || UPPER(SUBSTRING(p_event_id::text FROM 1 FOR 4)) || '-' ||
                     UPPER(SUBSTRING(COALESCE(p_student_roll_no, 'STU') FROM 1 FOR 4)) || '-' ||
                     FLOOR(1000 + RANDOM() * 9000)::text;

    INSERT INTO public.registrations (
        event_id,
        user_id,
        student_name,
        student_email,
        student_roll_no,
        department,
        ticket_code,
        status
    ) VALUES (
        p_event_id,
        v_user_id,
        p_student_name,
        COALESCE(v_user_email, 'student@campus.edu'),
        p_student_roll_no,
        p_department,
        v_ticket_code,
        'confirmed'
    ) RETURNING * INTO v_new_registration;

    RETURN to_jsonb(v_new_registration);
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- ============================================================================
-- 8. ROW LEVEL SECURITY (RLS) POLICIES
-- ============================================================================

-- PROFILES
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Profiles viewable by authenticated users"
ON public.profiles FOR SELECT
TO authenticated
USING (true);

CREATE POLICY "Users update own profile without role elevation"
ON public.profiles FOR UPDATE
TO authenticated
USING (auth.uid() = id)
WITH CHECK (
    auth.uid() = id AND
    role = (SELECT role FROM public.profiles WHERE id = auth.uid())
);

CREATE POLICY "Admins can update any profile"
ON public.profiles FOR UPDATE
TO authenticated
USING (public.is_admin())
WITH CHECK (public.is_admin());

-- EVENTS
ALTER TABLE public.events ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Events readable by everyone"
ON public.events FOR SELECT
USING (status = 'published' OR public.is_admin());

CREATE POLICY "Only admins insert events"
ON public.events FOR INSERT
TO authenticated
WITH CHECK (public.is_admin());

CREATE POLICY "Only admins update events"
ON public.events FOR UPDATE
TO authenticated
USING (public.is_admin())
WITH CHECK (public.is_admin());

CREATE POLICY "Only admins delete events"
ON public.events FOR DELETE
TO authenticated
USING (public.is_admin());

-- REGISTRATIONS
ALTER TABLE public.registrations ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users view own registrations or admin views all"
ON public.registrations FOR SELECT
TO authenticated
USING (auth.uid() = user_id OR public.is_admin());

CREATE POLICY "Users register themselves"
ON public.registrations FOR INSERT
TO authenticated
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users cancel own registration or admin manages"
ON public.registrations FOR DELETE
TO authenticated
USING (auth.uid() = user_id OR public.is_admin());

-- BOOKMARKS
ALTER TABLE public.bookmarks ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users view own bookmarks"
ON public.bookmarks FOR SELECT
TO authenticated
USING (auth.uid() = user_id);

CREATE POLICY "Users insert own bookmarks"
ON public.bookmarks FOR INSERT
TO authenticated
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users delete own bookmarks"
ON public.bookmarks FOR DELETE
TO authenticated
USING (auth.uid() = user_id);

-- Enable Realtime for Events and Registrations
ALTER PUBLICATION supabase_realtime ADD TABLE public.events;
ALTER PUBLICATION supabase_realtime ADD TABLE public.registrations;

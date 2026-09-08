-- ============================================================
-- CamFleet — Initial Schema
-- ============================================================

-- Profiles (extends auth.users)
CREATE TABLE public.profiles (
  id UUID REFERENCES auth.users(id) ON DELETE CASCADE PRIMARY KEY,
  email TEXT NOT NULL,
  full_name TEXT,
  avatar_url TEXT,
  role TEXT NOT NULL DEFAULT 'staff' CHECK (role IN ('manager', 'staff')),
  is_active BOOLEAN NOT NULL DEFAULT false,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Equipment categories
CREATE TABLE public.equipment_categories (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT NOT NULL UNIQUE,
  description TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Locations (storage depots + shooting locations)
CREATE TABLE public.locations (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT NOT NULL,
  description TEXT,
  type TEXT NOT NULL DEFAULT 'storage' CHECK (type IN ('storage', 'shooting', 'both')),
  is_active BOOLEAN NOT NULL DEFAULT true,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Productions
CREATE TABLE public.productions (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT NOT NULL,
  description TEXT,
  location_id UUID REFERENCES public.locations(id) ON DELETE SET NULL,
  start_date DATE,
  end_date DATE,
  is_active BOOLEAN NOT NULL DEFAULT true,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Equipment
CREATE TABLE public.equipment (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  asset_number TEXT NOT NULL UNIQUE,
  name TEXT NOT NULL,
  brand TEXT,
  model TEXT,
  serial_number TEXT,
  category_id UUID REFERENCES public.equipment_categories(id) ON DELETE SET NULL,
  parent_id UUID REFERENCES public.equipment(id) ON DELETE SET NULL,
  current_location_id UUID REFERENCES public.locations(id) ON DELETE SET NULL,
  status TEXT NOT NULL DEFAULT 'available' CHECK (status IN ('available', 'on_loan', 'maintenance', 'retired')),
  notes TEXT,
  image_url TEXT,
  purchase_date DATE,
  purchase_price DECIMAL(10,2),
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX equipment_asset_number_idx ON public.equipment (asset_number);
CREATE INDEX equipment_status_idx ON public.equipment (status);
CREATE INDEX equipment_category_idx ON public.equipment (category_id);
CREATE INDEX equipment_location_idx ON public.equipment (current_location_id);
CREATE INDEX equipment_parent_idx ON public.equipment (parent_id);

-- Loans
CREATE TABLE public.loans (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  equipment_id UUID NOT NULL REFERENCES public.equipment(id) ON DELETE RESTRICT,
  borrower_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE RESTRICT,
  approved_by UUID REFERENCES public.profiles(id) ON DELETE SET NULL,
  from_location_id UUID REFERENCES public.locations(id) ON DELETE SET NULL,
  to_location_id UUID REFERENCES public.locations(id) ON DELETE SET NULL,
  production_id UUID REFERENCES public.productions(id) ON DELETE SET NULL,
  expected_return_date TIMESTAMPTZ,
  actual_return_date TIMESTAMPTZ,
  status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'approved', 'active', 'returned', 'overdue', 'cancelled')),
  notes TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX loans_equipment_idx ON public.loans (equipment_id);
CREATE INDEX loans_borrower_idx ON public.loans (borrower_id);
CREATE INDEX loans_status_idx ON public.loans (status);

-- Invitations
CREATE TABLE public.invitations (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  email TEXT NOT NULL,
  role TEXT NOT NULL DEFAULT 'staff' CHECK (role IN ('manager', 'staff')),
  invited_by UUID REFERENCES public.profiles(id) ON DELETE SET NULL,
  token TEXT NOT NULL UNIQUE DEFAULT encode(gen_random_bytes(32), 'hex'),
  status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'accepted', 'expired')),
  expires_at TIMESTAMPTZ NOT NULL DEFAULT NOW() + INTERVAL '7 days',
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- ============================================================
-- Auto-update updated_at
-- ============================================================
CREATE OR REPLACE FUNCTION update_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER profiles_updated_at BEFORE UPDATE ON public.profiles FOR EACH ROW EXECUTE FUNCTION update_updated_at();
CREATE TRIGGER locations_updated_at BEFORE UPDATE ON public.locations FOR EACH ROW EXECUTE FUNCTION update_updated_at();
CREATE TRIGGER productions_updated_at BEFORE UPDATE ON public.productions FOR EACH ROW EXECUTE FUNCTION update_updated_at();
CREATE TRIGGER equipment_updated_at BEFORE UPDATE ON public.equipment FOR EACH ROW EXECUTE FUNCTION update_updated_at();
CREATE TRIGGER loans_updated_at BEFORE UPDATE ON public.loans FOR EACH ROW EXECUTE FUNCTION update_updated_at();

-- ============================================================
-- Auto-create profile on new Google login
-- ============================================================
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.profiles (id, email, full_name, avatar_url, role, is_active)
  VALUES (
    NEW.id,
    NEW.email,
    NEW.raw_user_meta_data->>'full_name',
    NEW.raw_user_meta_data->>'avatar_url',
    -- First user (alexandre.letendre@radio-canada.ca) gets manager + active
    CASE WHEN NEW.email = 'alexandre.letendre@radio-canada.ca' THEN 'manager' ELSE 'staff' END,
    CASE WHEN NEW.email = 'alexandre.letendre@radio-canada.ca' THEN true ELSE false END
  )
  ON CONFLICT (id) DO NOTHING;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- ============================================================
-- Row Level Security
-- ============================================================
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.equipment_categories ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.locations ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.productions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.equipment ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.loans ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.invitations ENABLE ROW LEVEL SECURITY;

-- Helper: check if current user is an active manager
CREATE OR REPLACE FUNCTION public.is_manager()
RETURNS BOOLEAN AS $$
  SELECT EXISTS (
    SELECT 1 FROM public.profiles
    WHERE id = auth.uid()
    AND role = 'manager'
    AND is_active = true
  );
$$ LANGUAGE sql SECURITY DEFINER STABLE;

-- Helper: check if current user is active (any role)
CREATE OR REPLACE FUNCTION public.is_active_user()
RETURNS BOOLEAN AS $$
  SELECT EXISTS (
    SELECT 1 FROM public.profiles
    WHERE id = auth.uid()
    AND is_active = true
  );
$$ LANGUAGE sql SECURITY DEFINER STABLE;

-- profiles: users see their own, managers see all
CREATE POLICY "profiles_select" ON public.profiles FOR SELECT USING (id = auth.uid() OR public.is_manager());
CREATE POLICY "profiles_update_own" ON public.profiles FOR UPDATE USING (id = auth.uid());
CREATE POLICY "profiles_update_manager" ON public.profiles FOR UPDATE USING (public.is_manager());

-- equipment_categories: active users read, managers write
CREATE POLICY "categories_select" ON public.equipment_categories FOR SELECT USING (public.is_active_user());
CREATE POLICY "categories_insert" ON public.equipment_categories FOR INSERT WITH CHECK (public.is_manager());
CREATE POLICY "categories_update" ON public.equipment_categories FOR UPDATE USING (public.is_manager());
CREATE POLICY "categories_delete" ON public.equipment_categories FOR DELETE USING (public.is_manager());

-- locations: active users read, managers write
CREATE POLICY "locations_select" ON public.locations FOR SELECT USING (public.is_active_user());
CREATE POLICY "locations_insert" ON public.locations FOR INSERT WITH CHECK (public.is_manager());
CREATE POLICY "locations_update" ON public.locations FOR UPDATE USING (public.is_manager());
CREATE POLICY "locations_delete" ON public.locations FOR DELETE USING (public.is_manager());

-- productions: active users read, managers write
CREATE POLICY "productions_select" ON public.productions FOR SELECT USING (public.is_active_user());
CREATE POLICY "productions_insert" ON public.productions FOR INSERT WITH CHECK (public.is_manager());
CREATE POLICY "productions_update" ON public.productions FOR UPDATE USING (public.is_manager());
CREATE POLICY "productions_delete" ON public.productions FOR DELETE USING (public.is_manager());

-- equipment: active users read, managers write
CREATE POLICY "equipment_select" ON public.equipment FOR SELECT USING (public.is_active_user());
CREATE POLICY "equipment_insert" ON public.equipment FOR INSERT WITH CHECK (public.is_manager());
CREATE POLICY "equipment_update" ON public.equipment FOR UPDATE USING (public.is_manager());
CREATE POLICY "equipment_delete" ON public.equipment FOR DELETE USING (public.is_manager());

-- loans: users see their own + managers see all; users can create; managers approve/update
CREATE POLICY "loans_select" ON public.loans FOR SELECT USING (borrower_id = auth.uid() OR public.is_manager());
CREATE POLICY "loans_insert" ON public.loans FOR INSERT WITH CHECK (borrower_id = auth.uid() AND public.is_active_user());
CREATE POLICY "loans_update" ON public.loans FOR UPDATE USING (public.is_manager() OR borrower_id = auth.uid());

-- invitations: managers only
CREATE POLICY "invitations_select" ON public.invitations FOR SELECT USING (public.is_manager());
CREATE POLICY "invitations_insert" ON public.invitations FOR INSERT WITH CHECK (public.is_manager());
CREATE POLICY "invitations_update" ON public.invitations FOR UPDATE USING (public.is_manager());

-- ============================================================
-- Seed: default equipment categories
-- ============================================================
INSERT INTO public.equipment_categories (name, description) VALUES
  ('Caméra', 'Caméras broadcast Sony, Canon, etc.'),
  ('Objectif', 'Objectifs et lentilles'),
  ('Trépied', 'Trépieds et têtes fluides'),
  ('Batterie', 'Batteries et chargeurs'),
  ('Câble', 'Câbles signal, alimentation, fibre'),
  ('Moniteur', 'Moniteurs de contrôle et de mise au point'),
  ('Poignée de zoom', 'Commandes de zoom servo'),
  ('Poignée de focus', 'Commandes de mise au point'),
  ('Viewfinder', 'Viseurs électroniques'),
  ('Steadicam', 'Ensembles steadicam complets'),
  ('Accessoire', 'Accessoires divers');

-- Plastilin şəhəri — ilkin sxem (Mərhələ 3)
-- Baza (skill minimum) + layihəyə məxsus cədvəllər (bax docs/ARCHITECTURE.md §5)

CREATE TABLE IF NOT EXISTS admin_users (
  id UUID PRIMARY KEY,
  email TEXT NOT NULL UNIQUE,
  password_hash TEXT NOT NULL,
  role TEXT NOT NULL DEFAULT 'owner' CHECK (role IN ('owner', 'staff')),
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS customers (
  id UUID PRIMARY KEY,
  phone_e164 TEXT NOT NULL UNIQUE,
  full_name TEXT NOT NULL,
  marketing_consent BOOLEAN NOT NULL DEFAULT false,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS children (
  id UUID PRIMARY KEY,
  customer_id UUID NOT NULL REFERENCES customers(id) ON DELETE CASCADE,
  first_name TEXT NOT NULL,
  birth_year INT,
  allergy_note TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
CREATE INDEX IF NOT EXISTS idx_children_customer ON children(customer_id);

CREATE TABLE IF NOT EXISTS houses (
  id UUID PRIMARY KEY,
  slug TEXT NOT NULL UNIQUE,
  name TEXT NOT NULL,
  color_hex TEXT NOT NULL,
  sort_order INT NOT NULL DEFAULT 0
);

CREATE TABLE IF NOT EXISTS masterclasses (
  id UUID PRIMARY KEY,
  house_id UUID REFERENCES houses(id),
  slug TEXT NOT NULL UNIQUE,
  title TEXT NOT NULL,
  description TEXT,
  age_min INT NOT NULL,
  age_max INT NOT NULL,
  is_published BOOLEAN NOT NULL DEFAULT false,
  is_sample BOOLEAN NOT NULL DEFAULT false,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  CHECK (age_min <= age_max)
);
CREATE INDEX IF NOT EXISTS idx_masterclasses_house ON masterclasses(house_id);

CREATE TABLE IF NOT EXISTS sessions (
  id UUID PRIMARY KEY,
  masterclass_id UUID NOT NULL REFERENCES masterclasses(id) ON DELETE CASCADE,
  starts_at TIMESTAMPTZ NOT NULL,
  capacity INT NOT NULL CHECK (capacity > 0),
  booked INT NOT NULL DEFAULT 0 CHECK (booked >= 0),
  price_azn NUMERIC(8,2) NOT NULL CHECK (price_azn >= 0),
  early_bird_price_azn NUMERIC(8,2),
  early_bird_slots INT NOT NULL DEFAULT 0 CHECK (early_bird_slots >= 0),
  location TEXT NOT NULL,
  status TEXT NOT NULL DEFAULT 'scheduled' CHECK (status IN ('scheduled', 'cancelled', 'completed')),
  CHECK (booked <= capacity)
);
CREATE INDEX IF NOT EXISTS idx_sessions_masterclass ON sessions(masterclass_id);
CREATE INDEX IF NOT EXISTS idx_sessions_starts_at ON sessions(starts_at);

CREATE TABLE IF NOT EXISTS bookings (
  id UUID PRIMARY KEY,
  session_id UUID NOT NULL REFERENCES sessions(id),
  customer_id UUID NOT NULL REFERENCES customers(id),
  seats INT NOT NULL DEFAULT 1 CHECK (seats > 0),
  status TEXT NOT NULL CHECK (status IN ('pending', 'confirmed', 'attended', 'cancelled', 'waitlist')),
  reference TEXT NOT NULL UNIQUE,
  idempotency_key TEXT NOT NULL,
  price_azn NUMERIC(8,2) NOT NULL,
  was_early_bird BOOLEAN NOT NULL DEFAULT false,
  discount_code TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE (session_id, idempotency_key)
);
CREATE INDEX IF NOT EXISTS idx_bookings_session ON bookings(session_id);
CREATE INDEX IF NOT EXISTS idx_bookings_customer ON bookings(customer_id);
CREATE INDEX IF NOT EXISTS idx_bookings_status ON bookings(status);

CREATE TABLE IF NOT EXISTS booking_children (
  booking_id UUID NOT NULL REFERENCES bookings(id) ON DELETE CASCADE,
  child_id UUID NOT NULL REFERENCES children(id),
  PRIMARY KEY (booking_id, child_id)
);

CREATE TABLE IF NOT EXISTS consents (
  id UUID PRIMARY KEY,
  customer_id UUID NOT NULL REFERENCES customers(id) ON DELETE CASCADE,
  policy_version TEXT NOT NULL,
  text_shown TEXT NOT NULL,
  marketing_opt_in BOOLEAN NOT NULL DEFAULT false,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS inquiries (
  id UUID PRIMARY KEY,
  type TEXT NOT NULL CHECK (type IN ('contact', 'birthday', 'instructor-application')),
  name TEXT NOT NULL,
  phone TEXT,
  email TEXT,
  message TEXT,
  -- ad günü üçün: paket, qonaq sayı, tarix (başqa sahələri doldurmayan tiplər üçün NULL qalır)
  birthday_package TEXT,
  birthday_guest_count INT,
  birthday_date DATE,
  status TEXT NOT NULL DEFAULT 'new' CHECK (status IN ('new', 'read', 'replied', 'closed')),
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
CREATE INDEX IF NOT EXISTS idx_inquiries_type ON inquiries(type);

CREATE TABLE IF NOT EXISTS loyalty_stamps (
  customer_id UUID PRIMARY KEY REFERENCES customers(id) ON DELETE CASCADE,
  stamp_count INT NOT NULL DEFAULT 0 CHECK (stamp_count >= 0 AND stamp_count <= 5),
  free_sessions_available INT NOT NULL DEFAULT 0 CHECK (free_sessions_available >= 0),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS discount_codes (
  id UUID PRIMARY KEY,
  code TEXT NOT NULL UNIQUE,
  type TEXT NOT NULL CHECK (type IN ('referral', 'hide-seek', 'manual')),
  owner_customer_id UUID REFERENCES customers(id),
  percent INT NOT NULL CHECK (percent > 0 AND percent <= 100),
  status TEXT NOT NULL DEFAULT 'active' CHECK (status IN ('active', 'redeemed', 'expired')),
  expires_at TIMESTAMPTZ,
  redeemed_by_customer_id UUID REFERENCES customers(id),
  redeemed_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
CREATE INDEX IF NOT EXISTS idx_discount_codes_owner ON discount_codes(owner_customer_id);

CREATE TABLE IF NOT EXISTS gallery_photos (
  id UUID PRIMARY KEY,
  url TEXT NOT NULL,
  house_id UUID REFERENCES houses(id),
  child_label TEXT,
  consent BOOLEAN NOT NULL DEFAULT false,
  is_published BOOLEAN NOT NULL DEFAULT false,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
CREATE INDEX IF NOT EXISTS idx_gallery_house ON gallery_photos(house_id);

CREATE TABLE IF NOT EXISTS instructors (
  id UUID PRIMARY KEY,
  house_id UUID REFERENCES houses(id),
  name TEXT NOT NULL,
  photo_url TEXT,
  bio TEXT,
  experience_note TEXT,
  this_month_programs TEXT,
  is_published BOOLEAN NOT NULL DEFAULT false,
  sort_order INT NOT NULL DEFAULT 0
);

CREATE TABLE IF NOT EXISTS instructor_applications (
  id UUID PRIMARY KEY,
  name TEXT NOT NULL,
  phone TEXT NOT NULL,
  message TEXT,
  status TEXT NOT NULL DEFAULT 'new' CHECK (status IN ('new', 'reviewed', 'closed')),
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS faq_items (
  id UUID PRIMARY KEY,
  tab TEXT NOT NULL,
  question TEXT NOT NULL,
  answer TEXT NOT NULL,
  sort_order INT NOT NULL DEFAULT 0
);
CREATE INDEX IF NOT EXISTS idx_faq_tab ON faq_items(tab);

CREATE TABLE IF NOT EXISTS audit_log (
  id UUID PRIMARY KEY,
  admin_user_id UUID REFERENCES admin_users(id),
  action TEXT NOT NULL,
  target_table TEXT,
  target_id TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS settings (
  key TEXT PRIMARY KEY,
  value TEXT NOT NULL
);

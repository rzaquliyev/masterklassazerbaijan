-- Admin panel (Mərhələ 5) — sessiya cədvəli + bron/müştəri qeydləri + anonimləşdirmə izi

CREATE TABLE IF NOT EXISTS admin_sessions (
  id TEXT PRIMARY KEY,
  admin_user_id UUID NOT NULL REFERENCES admin_users(id) ON DELETE CASCADE,
  csrf_token TEXT NOT NULL,
  expires_at TIMESTAMPTZ NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
CREATE INDEX IF NOT EXISTS idx_admin_sessions_admin_user ON admin_sessions(admin_user_id);
CREATE INDEX IF NOT EXISTS idx_admin_sessions_expires ON admin_sessions(expires_at);

ALTER TABLE bookings ADD COLUMN IF NOT EXISTS admin_notes TEXT;
ALTER TABLE customers ADD COLUMN IF NOT EXISTS admin_notes TEXT;
ALTER TABLE customers ADD COLUMN IF NOT EXISTS anonymized_at TIMESTAMPTZ;

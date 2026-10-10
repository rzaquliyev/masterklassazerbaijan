-- Həftənin tapşırığı (Elanlar lövhəsi) — BRIEF §2/§5
CREATE TABLE IF NOT EXISTS weekly_tasks (
  id UUID PRIMARY KEY,
  week_number INT NOT NULL UNIQUE,
  title TEXT NOT NULL,
  instructions TEXT,
  materials TEXT[] NOT NULL DEFAULT '{}',
  reference_image_url TEXT,
  unlock_date DATE NOT NULL,
  related_masterclass_id UUID REFERENCES masterclasses(id),
  is_published BOOLEAN NOT NULL DEFAULT false,
  is_sample BOOLEAN NOT NULL DEFAULT false,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
CREATE INDEX IF NOT EXISTS idx_weekly_tasks_unlock ON weekly_tasks(unlock_date);

CREATE TABLE IF NOT EXISTS task_participants (
  id UUID PRIMARY KEY,
  task_id UUID NOT NULL REFERENCES weekly_tasks(id) ON DELETE CASCADE,
  customer_id UUID REFERENCES customers(id),
  age_group TEXT NOT NULL CHECK (age_group IN ('4-6', '7-9', '10-12')),
  child_label TEXT,
  instagram_handle TEXT,
  photo_url TEXT,
  consent_public BOOLEAN NOT NULL DEFAULT false,
  is_winner BOOLEAN NOT NULL DEFAULT false,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
CREATE INDEX IF NOT EXISTS idx_task_participants_task ON task_participants(task_id);

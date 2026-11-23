-- Sayt mətnləri və mövsümi bəzək (Mərhələ 8): owner kodsuz dəyişə bilsin deyə
-- ana səhifə başlığı/alt başlığı və footer mətnləri override edilə bilir (boşdursa
-- lüğətdəki defolt mətn göstərilir). Rəng palitrası DESIGN.md-dəki sabit tokenlərlə
-- məhdudlaşır (dizayn istiqaməti dəyişmir) — yalnız "bayram zolağı" rəngi seçilə bilir.

CREATE TABLE IF NOT EXISTS site_texts (
  key TEXT PRIMARY KEY,
  az TEXT,
  ru TEXT,
  en TEXT,
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS site_theme (
  id BOOLEAN PRIMARY KEY DEFAULT true CHECK (id),
  holiday_enabled BOOLEAN NOT NULL DEFAULT false,
  holiday_color_token TEXT NOT NULL DEFAULT 'orange' CHECK (holiday_color_token IN ('orange','blue','sun','green','pink')),
  holiday_text_az TEXT,
  holiday_text_ru TEXT,
  holiday_text_en TEXT,
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

INSERT INTO site_theme (id) VALUES (true) ON CONFLICT (id) DO NOTHING;

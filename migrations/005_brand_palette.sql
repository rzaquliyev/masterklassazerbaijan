-- 005: Brend palitrasının yenilənməsi (2026-11-24, DESIGN.md §1).
-- Yalnız köhnə defolt ev rəngləri yenilənir; admin özü başqa rəng seçibsə toxunulmur.
UPDATE houses SET color_hex = '#CC4B1A' WHERE upper(color_hex) = '#E8682A';
UPDATE houses SET color_hex = '#5BA4E8' WHERE upper(color_hex) = '#6FA8DC';
UPDATE houses SET color_hex = '#FFB830' WHERE upper(color_hex) = '#FFC23D';
UPDATE houses SET color_hex = '#52B788' WHERE upper(color_hex) = '#7BC67E';
UPDATE houses SET color_hex = '#F27A9E' WHERE upper(color_hex) = '#F28AA6';

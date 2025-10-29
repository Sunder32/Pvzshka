-- Update site_configs table to match the config service schema

-- Add missing columns
ALTER TABLE site_configs ADD COLUMN IF NOT EXISTS branding JSONB DEFAULT '{}'::jsonb;
ALTER TABLE site_configs ADD COLUMN IF NOT EXISTS features JSONB DEFAULT '{}'::jsonb;
ALTER TABLE site_configs ADD COLUMN IF NOT EXISTS homepage JSONB DEFAULT '{}'::jsonb;
ALTER TABLE site_configs ADD COLUMN IF NOT EXISTS seo JSONB DEFAULT '{}'::jsonb;
ALTER TABLE site_configs ADD COLUMN IF NOT EXISTS integrations JSONB DEFAULT '{}'::jsonb;
ALTER TABLE site_configs ADD COLUMN IF NOT EXISTS locale JSONB DEFAULT '{"currency": "RUB", "language": "ru", "timezone": "Europe/Moscow"}'::jsonb;
ALTER TABLE site_configs ADD COLUMN IF NOT EXISTS contact_info JSONB DEFAULT '{}'::jsonb;
ALTER TABLE site_configs ADD COLUMN IF NOT EXISTS version INTEGER DEFAULT 1;
ALTER TABLE site_configs ADD COLUMN IF NOT EXISTS is_active BOOLEAN DEFAULT true;

-- Add unique constraint on site_id
ALTER TABLE site_configs DROP CONSTRAINT IF EXISTS site_configs_site_id_unique;
ALTER TABLE site_configs ADD CONSTRAINT site_configs_site_id_unique UNIQUE (site_id);

-- Create index for active configs
CREATE INDEX IF NOT EXISTS idx_site_configs_active ON site_configs(is_active);

COMMENT ON COLUMN site_configs.branding IS 'Branding configuration (logo, colors, fonts)';
COMMENT ON COLUMN site_configs.features IS 'Enabled features (wishlist, reviews, etc)';
COMMENT ON COLUMN site_configs.homepage IS 'Homepage layout and sections';
COMMENT ON COLUMN site_configs.seo IS 'SEO meta tags and settings';
COMMENT ON COLUMN site_configs.integrations IS 'Third-party integrations';
COMMENT ON COLUMN site_configs.locale IS 'Locale settings (currency, language, timezone)';
COMMENT ON COLUMN site_configs.contact_info IS 'Contact information';
COMMENT ON COLUMN site_configs.version IS 'Configuration version for caching';
COMMENT ON COLUMN site_configs.is_active IS 'Whether this configuration is active';

-- Add site_id column to site_configs table
-- This allows storing configs per site instead of per tenant

ALTER TABLE site_configs 
  ADD COLUMN site_id INTEGER;

-- Add foreign key constraint
ALTER TABLE site_configs
  ADD CONSTRAINT site_configs_site_id_fkey 
  FOREIGN KEY (site_id) REFERENCES sites(id) ON DELETE CASCADE;

-- Create index for performance
CREATE INDEX idx_site_configs_site ON site_configs(site_id);

-- Make tenant_id nullable since we'll use site_id instead
ALTER TABLE site_configs ALTER COLUMN tenant_id DROP NOT NULL;

COMMENT ON COLUMN site_configs.site_id IS 'Reference to the site this config belongs to';

-- Create tables for data persistence

-- Site Configurations table (compatible with existing UUID-based tenants)
DROP TABLE IF EXISTS site_configs CASCADE;
CREATE TABLE site_configs (
  id SERIAL PRIMARY KEY,
  tenant_id UUID NOT NULL REFERENCES tenants(id) ON DELETE CASCADE,
  logo TEXT,
  theme JSONB DEFAULT '{"primaryColor": "#0066cc", "secondaryColor": "#ff6600", "fontFamily": "Inter", "borderRadius": 8}',
  layout JSONB DEFAULT '{}',
  status VARCHAR(50) DEFAULT 'draft',
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

CREATE INDEX idx_site_configs_tenant ON site_configs(tenant_id);

-- Support Tickets table (compatible with existing UUID-based tenants and users)
DROP TABLE IF EXISTS support_tickets CASCADE;
CREATE TABLE support_tickets (
  id SERIAL PRIMARY KEY,
  tenant_id UUID REFERENCES tenants(id) ON DELETE CASCADE,
  user_id UUID REFERENCES users(id) ON DELETE CASCADE,
  subject VARCHAR(255) NOT NULL,
  category VARCHAR(50) NOT NULL,
  priority VARCHAR(20) NOT NULL DEFAULT 'medium',
  status VARCHAR(50) NOT NULL DEFAULT 'open',
  description TEXT NOT NULL,
  assigned_to VARCHAR(255),
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

CREATE INDEX idx_support_tickets_tenant ON support_tickets(tenant_id);
CREATE INDEX idx_support_tickets_user ON support_tickets(user_id);
CREATE INDEX idx_support_tickets_status ON support_tickets(status);

-- Ticket Messages table
DROP TABLE IF EXISTS ticket_messages CASCADE;
CREATE TABLE ticket_messages (
  id SERIAL PRIMARY KEY,
  ticket_id INTEGER NOT NULL REFERENCES support_tickets(id) ON DELETE CASCADE,
  author VARCHAR(255) NOT NULL,
  author_type VARCHAR(20) NOT NULL,
  message TEXT NOT NULL,
  created_at TIMESTAMP DEFAULT NOW()
);

CREATE INDEX idx_ticket_messages_ticket ON ticket_messages(ticket_id);

-- Cart Items table (synchronized with backend)
-- Note: cart and cart_items tables already exist from users-schema.sql
-- We just need to ensure they're being used

SELECT 'Tables created successfully' AS status;

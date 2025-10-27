-- Support Tickets Schema

-- Support Tickets table
CREATE TABLE IF NOT EXISTS support_tickets (
  id SERIAL PRIMARY KEY,
  tenant_id INTEGER NOT NULL REFERENCES tenants(id) ON DELETE CASCADE,
  subject VARCHAR(255) NOT NULL,
  category VARCHAR(50) NOT NULL,
  priority VARCHAR(20) NOT NULL DEFAULT 'medium',
  status VARCHAR(50) NOT NULL DEFAULT 'open',
  description TEXT NOT NULL,
  assigned_to VARCHAR(255),
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

-- Ticket Messages table
CREATE TABLE IF NOT EXISTS ticket_messages (
  id SERIAL PRIMARY KEY,
  ticket_id INTEGER NOT NULL REFERENCES support_tickets(id) ON DELETE CASCADE,
  author VARCHAR(255) NOT NULL,
  author_type VARCHAR(20) NOT NULL,
  message TEXT NOT NULL,
  created_at TIMESTAMP DEFAULT NOW()
);

-- Indexes
CREATE INDEX idx_support_tickets_tenant ON support_tickets(tenant_id);
CREATE INDEX idx_support_tickets_status ON support_tickets(status);
CREATE INDEX idx_support_tickets_priority ON support_tickets(priority);
CREATE INDEX idx_ticket_messages_ticket ON ticket_messages(ticket_id);

-- Demo ticket
INSERT INTO support_tickets (tenant_id, subject, category, priority, status, description, assigned_to)
SELECT 
  t.id,
  'Тестовая заявка',
  'technical',
  'medium',
  'open',
  'Это демонстрационная заявка в техническую поддержку',
  NULL
FROM tenants t
WHERE t.subdomain = 'demo'
ON CONFLICT DO NOTHING;

-- Demo message
INSERT INTO ticket_messages (ticket_id, author, author_type, message)
SELECT 
  st.id,
  'Demo Store',
  'tenant',
  'Это демонстрационная заявка в техническую поддержку'
FROM support_tickets st
JOIN tenants t ON t.id = st.tenant_id
WHERE t.subdomain = 'demo' AND st.subject = 'Тестовая заявка'
ON CONFLICT DO NOTHING;

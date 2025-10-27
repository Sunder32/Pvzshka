const express = require('express');
const { Pool } = require('pg');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const cors = require('cors');
require('dotenv').config();

const app = express();
const PORT = process.env.PORT || 8080;

// Database connection
const pool = new Pool({
  connectionString: process.env.DATABASE_URL || 'postgresql://platform:platform123@localhost:5432/marketplace',
});

// Middleware
app.use(cors());
app.use(express.json());

// Health check
app.get('/health', (req, res) => {
  res.json({ status: 'ok' });
});

// Register endpoint
app.post('/api/auth/register', async (req, res) => {
  try {
    const { email, password, name, phone } = req.body;

    // Validate input
    if (!email || !password || !name) {
      return res.status(400).json({ error: 'Email, password and name are required' });
    }

    // Check if user already exists
    const existingUser = await pool.query(
      'SELECT id FROM users WHERE email = $1',
      [email]
    );

    if (existingUser.rows.length > 0) {
      return res.status(409).json({ error: 'User already exists' });
    }

    // Hash password
    const passwordHash = await bcrypt.hash(password, 10);

    // Create user
    const result = await pool.query(
      `INSERT INTO users (email, password_hash, name, phone, role) 
       VALUES ($1, $2, $3, $4, 'customer') 
       RETURNING id, email, name, phone, role, created_at`,
      [email, passwordHash, name, phone || null]
    );

    const user = result.rows[0];

    // Generate JWT token
    const token = jwt.sign(
      { userId: user.id, email: user.email, role: user.role },
      process.env.JWT_SECRET || 'your-secret-key',
      { expiresIn: '7d' }
    );

    res.status(201).json({
      message: 'User registered successfully',
      user: {
        id: user.id,
        email: user.email,
        name: user.name,
        phone: user.phone,
        role: user.role,
      },
      token,
    });
  } catch (error) {
    console.error('Registration error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Login endpoint
app.post('/api/auth/login', async (req, res) => {
  try {
    const { email, password } = req.body;

    // Validate input
    if (!email || !password) {
      return res.status(400).json({ error: 'Email and password are required' });
    }

    // Find user with tenant info
    const result = await pool.query(
      `SELECT u.id, u.email, u.password_hash, u.name, u.phone, u.role, u.is_active, u.tenant_id,
              t.name as tenant_name, t.subdomain, t.custom_domain
       FROM users u
       LEFT JOIN tenants t ON u.tenant_id = t.id
       WHERE u.email = $1`,
      [email]
    );

    if (result.rows.length === 0) {
      return res.status(401).json({ error: 'Invalid email or password' });
    }

    const user = result.rows[0];

    // Check if user is active
    if (!user.is_active) {
      return res.status(403).json({ error: 'Account is disabled' });
    }

    // Verify password
    const isValidPassword = await bcrypt.compare(password, user.password_hash);

    if (!isValidPassword) {
      return res.status(401).json({ error: 'Invalid email or password' });
    }

    // Generate JWT token
    const token = jwt.sign(
      { userId: user.id, email: user.email, role: user.role },
      process.env.JWT_SECRET || 'your-secret-key',
      { expiresIn: '7d' }
    );

    res.json({
      message: 'Login successful',
      user: {
        id: user.id,
        email: user.email,
        name: user.name,
        phone: user.phone,
        role: user.role,
        tenant_id: user.tenant_id,
        tenant_name: user.tenant_name,
        subdomain: user.subdomain,
        custom_domain: user.custom_domain,
      },
      token,
    });
  } catch (error) {
    console.error('Login error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Get current user (protected route)
app.get('/api/auth/me', authenticateToken, async (req, res) => {
  try {
    const result = await pool.query(
      'SELECT id, email, name, phone, role, created_at FROM users WHERE id = $1',
      [req.user.userId]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'User not found' });
    }

    res.json({ user: result.rows[0] });
  } catch (error) {
    console.error('Get user error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Get all tenants (for global admin)
app.get('/api/tenants', authenticateToken, async (req, res) => {
  try {
    const result = await pool.query(
      'SELECT id, name, subdomain, custom_domain, status, tier, country, created_at FROM tenants ORDER BY created_at DESC'
    );

    res.json({ tenants: result.rows });
  } catch (error) {
    console.error('Get tenants error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Create new tenant (for global admin)
app.post('/api/tenants', authenticateToken, async (req, res) => {
  try {
    const { name, subdomain, customDomain, tier, country } = req.body;

    // Validate input
    if (!name || !subdomain) {
      return res.status(400).json({ error: 'Name and subdomain are required' });
    }

    // Check if subdomain already exists
    const existingTenant = await pool.query(
      'SELECT id FROM tenants WHERE subdomain = $1',
      [subdomain]
    );

    if (existingTenant.rows.length > 0) {
      return res.status(409).json({ error: 'Subdomain already exists' });
    }

    // Create tenant
    const result = await pool.query(
      `INSERT INTO tenants (name, subdomain, custom_domain, tier, country, status) 
       VALUES ($1, $2, $3, $4, $5, 'active') 
       RETURNING id, name, subdomain, custom_domain, tier, country, status, created_at`,
      [name, subdomain, customDomain || null, tier || 'free', country || null]
    );

    const tenant = result.rows[0];

    res.status(201).json({
      message: 'Tenant created successfully',
      tenant: {
        id: tenant.id,
        name: tenant.name,
        subdomain: tenant.subdomain,
        customDomain: tenant.custom_domain,
        tier: tenant.tier,
        country: tenant.country,
        status: tenant.status,
        createdAt: tenant.created_at,
      },
    });
  } catch (error) {
    console.error('Create tenant error:', error);
    res.status(500).json({ error: 'Internal server error', details: error.message });
  }
});

// Get all users (for global admin)
app.get('/api/users', authenticateToken, async (req, res) => {
  try {
    const result = await pool.query(`
      SELECT 
        u.id, 
        u.email, 
        u.name, 
        u.role, 
        u.is_active as status,
        u.created_at,
        u.tenant_id,
        t.name as tenant_name
      FROM users u
      LEFT JOIN tenants t ON u.tenant_id = t.id
      ORDER BY u.created_at DESC
    `);

    const users = result.rows.map(user => ({
      id: user.id,
      email: user.email,
      name: user.name,
      role: user.role,
      status: user.status ? 'active' : 'inactive',
      createdAt: user.created_at,
      tenantId: user.tenant_id,
      tenantName: user.tenant_name,
    }));

    res.json({ users });
  } catch (error) {
    console.error('Get users error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Middleware to authenticate JWT token
function authenticateToken(req, res, next) {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1];

  if (!token) {
    return res.status(401).json({ error: 'Access token required' });
  }

  jwt.verify(token, process.env.JWT_SECRET || 'your-secret-key', (err, user) => {
    if (err) {
      return res.status(403).json({ error: 'Invalid or expired token' });
    }
    req.user = user;
    next();
  });
}

// ==================== CART ENDPOINTS ====================

// Get user's cart
app.get('/api/cart', authenticateToken, async (req, res) => {
  try {
    const userId = req.user.userId;

    // Get or create cart for user
    let cart = await pool.query(
      'SELECT id FROM cart WHERE user_id = $1',
      [userId]
    );

    if (cart.rows.length === 0) {
      // Create new cart
      cart = await pool.query(
        'INSERT INTO cart (user_id) VALUES ($1) RETURNING id',
        [userId]
      );
    }

    const cartId = cart.rows[0].id;

    // Get cart items with product details
    const items = await pool.query(
      `SELECT 
        ci.id,
        ci.product_id,
        ci.quantity,
        ci.price,
        p.title as name,
        p.images,
        p.sku
       FROM cart_items ci
       LEFT JOIN products p ON ci.product_id = p.id
       WHERE ci.cart_id = $1`,
      [cartId]
    );

    res.json({ items: items.rows });
  } catch (error) {
    console.error('Get cart error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Add item to cart
app.post('/api/cart/items', authenticateToken, async (req, res) => {
  try {
    const userId = req.user.userId;
    const { productId, quantity = 1, price } = req.body;

    if (!productId || !price) {
      return res.status(400).json({ error: 'Product ID and price are required' });
    }

    // Get or create cart
    let cart = await pool.query(
      'SELECT id FROM cart WHERE user_id = $1',
      [userId]
    );

    if (cart.rows.length === 0) {
      cart = await pool.query(
        'INSERT INTO cart (user_id) VALUES ($1) RETURNING id',
        [userId]
      );
    }

    const cartId = cart.rows[0].id;

    // Check if item already exists in cart
    const existingItem = await pool.query(
      'SELECT id, quantity FROM cart_items WHERE cart_id = $1 AND product_id = $2',
      [cartId, productId]
    );

    let result;
    if (existingItem.rows.length > 0) {
      // Update quantity
      result = await pool.query(
        `UPDATE cart_items 
         SET quantity = quantity + $1, updated_at = NOW() 
         WHERE id = $2 
         RETURNING *`,
        [quantity, existingItem.rows[0].id]
      );
    } else {
      // Add new item
      result = await pool.query(
        `INSERT INTO cart_items (cart_id, product_id, quantity, price) 
         VALUES ($1, $2, $3, $4) 
         RETURNING *`,
        [cartId, productId, quantity, price]
      );
    }

    res.status(201).json({ item: result.rows[0] });
  } catch (error) {
    console.error('Add to cart error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Update cart item quantity
app.put('/api/cart/items/:id', authenticateToken, async (req, res) => {
  try {
    const { id } = req.params;
    const { quantity } = req.body;

    if (quantity === undefined || quantity < 0) {
      return res.status(400).json({ error: 'Valid quantity is required' });
    }

    if (quantity === 0) {
      // Delete item if quantity is 0
      await pool.query('DELETE FROM cart_items WHERE id = $1', [id]);
      return res.json({ message: 'Item removed from cart' });
    }

    const result = await pool.query(
      'UPDATE cart_items SET quantity = $1, updated_at = NOW() WHERE id = $2 RETURNING *',
      [quantity, id]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Cart item not found' });
    }

    res.json({ item: result.rows[0] });
  } catch (error) {
    console.error('Update cart item error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Remove item from cart
app.delete('/api/cart/items/:id', authenticateToken, async (req, res) => {
  try {
    const { id } = req.params;

    const result = await pool.query(
      'DELETE FROM cart_items WHERE id = $1 RETURNING *',
      [id]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Cart item not found' });
    }

    res.json({ message: 'Item removed from cart' });
  } catch (error) {
    console.error('Remove cart item error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Clear cart
app.delete('/api/cart', authenticateToken, async (req, res) => {
  try {
    const userId = req.user.userId;

    const cart = await pool.query(
      'SELECT id FROM cart WHERE user_id = $1',
      [userId]
    );

    if (cart.rows.length > 0) {
      await pool.query('DELETE FROM cart_items WHERE cart_id = $1', [cart.rows[0].id]);
    }

    res.json({ message: 'Cart cleared' });
  } catch (error) {
    console.error('Clear cart error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// ==================== SUPPORT TICKETS ENDPOINTS ====================

// Create support ticket
app.post('/api/support/tickets', authenticateToken, async (req, res) => {
  try {
    const userId = req.user.userId;
    const { subject, category, priority = 'medium', description } = req.body;

    if (!subject || !category || !description) {
      return res.status(400).json({ error: 'Subject, category, and description are required' });
    }

    const result = await pool.query(
      `INSERT INTO support_tickets (user_id, subject, category, priority, description, status) 
       VALUES ($1, $2, $3, $4, $5, 'open') 
       RETURNING *`,
      [userId, subject, category, priority, description]
    );

    res.status(201).json({ ticket: result.rows[0] });
  } catch (error) {
    console.error('Create ticket error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Get user's support tickets
app.get('/api/support/tickets', authenticateToken, async (req, res) => {
  try {
    const userId = req.user.userId;

    const result = await pool.query(
      `SELECT * FROM support_tickets 
       WHERE user_id = $1 
       ORDER BY created_at DESC`,
      [userId]
    );

    res.json({ tickets: result.rows });
  } catch (error) {
    console.error('Get tickets error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Get ticket details with messages
app.get('/api/support/tickets/:id', authenticateToken, async (req, res) => {
  try {
    const { id } = req.params;
    const userId = req.user.userId;

    const ticket = await pool.query(
      'SELECT * FROM support_tickets WHERE id = $1 AND user_id = $2',
      [id, userId]
    );

    if (ticket.rows.length === 0) {
      return res.status(404).json({ error: 'Ticket not found' });
    }

    const messages = await pool.query(
      `SELECT * FROM ticket_messages 
       WHERE ticket_id = $1 
       ORDER BY created_at ASC`,
      [id]
    );

    res.json({ 
      ticket: ticket.rows[0],
      messages: messages.rows 
    });
  } catch (error) {
    console.error('Get ticket details error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Add message to ticket
app.post('/api/support/tickets/:id/messages', authenticateToken, async (req, res) => {
  try {
    const { id } = req.params;
    const { message } = req.body;
    const userId = req.user.userId;

    if (!message) {
      return res.status(400).json({ error: 'Message is required' });
    }

    // Verify ticket belongs to user
    const ticket = await pool.query(
      'SELECT id FROM support_tickets WHERE id = $1 AND user_id = $2',
      [id, userId]
    );

    if (ticket.rows.length === 0) {
      return res.status(404).json({ error: 'Ticket not found' });
    }

    const result = await pool.query(
      `INSERT INTO ticket_messages (ticket_id, author, author_type, message) 
       VALUES ($1, $2, 'customer', $3) 
       RETURNING *`,
      [id, req.user.email, message]
    );

    res.status(201).json({ message: result.rows[0] });
  } catch (error) {
    console.error('Add message error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// ==================== SITE BUILDER ENDPOINTS ====================

// Get site configuration (for tenant admins)
app.get('/api/sites/:tenantId', authenticateToken, async (req, res) => {
  try {
    const { tenantId } = req.params;

    const result = await pool.query(
      'SELECT * FROM site_configs WHERE tenant_id = $1',
      [tenantId]
    );

    if (result.rows.length === 0) {
      // Return default config if none exists
      return res.json({
        config: {
          logo: null,
          theme: {
            primaryColor: '#0066cc',
            secondaryColor: '#ff6600',
            fontFamily: 'Inter',
            borderRadius: 8
          },
          layout: {},
          status: 'draft'
        }
      });
    }

    res.json({ config: result.rows[0] });
  } catch (error) {
    console.error('Get site config error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Save site configuration
app.post('/api/sites/:tenantId', authenticateToken, async (req, res) => {
  try {
    const { tenantId } = req.params;
    const { logo, theme, layout, status = 'draft' } = req.body;

    // Check if config exists
    const existing = await pool.query(
      'SELECT id FROM site_configs WHERE tenant_id = $1',
      [tenantId]
    );

    let result;
    if (existing.rows.length > 0) {
      // Update existing
      result = await pool.query(
        `UPDATE site_configs 
         SET logo = $1, theme = $2, layout = $3, status = $4, updated_at = NOW() 
         WHERE tenant_id = $5 
         RETURNING *`,
        [logo, JSON.stringify(theme), JSON.stringify(layout), status, tenantId]
      );
    } else {
      // Create new
      result = await pool.query(
        `INSERT INTO site_configs (tenant_id, logo, theme, layout, status) 
         VALUES ($1, $2, $3, $4, $5) 
         RETURNING *`,
        [tenantId, logo, JSON.stringify(theme), JSON.stringify(layout), status]
      );
    }

    res.json({ config: result.rows[0] });
  } catch (error) {
    console.error('Save site config error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Publish site (change status to published)
app.post('/api/sites/:tenantId/publish', authenticateToken, async (req, res) => {
  try {
    const { tenantId } = req.params;

    const result = await pool.query(
      `UPDATE site_configs 
       SET status = 'published', updated_at = NOW() 
       WHERE tenant_id = $1 
       RETURNING *`,
      [tenantId]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Site configuration not found' });
    }

    res.json({ config: result.rows[0] });
  } catch (error) {
    console.error('Publish site error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Start server
app.listen(PORT, () => {
  console.log(`🔐 Auth API running on port ${PORT}`);
});

const jwt = require('jsonwebtoken');

const extractTenant = (req, res, next) => {
  // Extract tenant from subdomain or custom domain
  const host = req.get('host');
  const subdomain = host.split('.')[0];
  
  // Or from header
  const tenantId = req.get('x-tenant-id');
  
  if (tenantId) {
    req.tenantId = tenantId;
  } else {
    // In production, you would lookup tenant by subdomain
    req.tenantId = subdomain;
  }
  
  next();
};

const authenticate = (req, res, next) => {
  try {
    const token = req.get('Authorization')?.replace('Bearer ', '');
    
    if (!token) {
      return res.status(401).json({ error: 'No token provided' });
    }

    const decoded = jwt.verify(token, process.env.JWT_SECRET || 'your-secret-key-change-in-production');
    req.userId = decoded.user_id;
    req.userRole = decoded.role;
    req.tenantId = decoded.tenant_id;
    
    next();
  } catch (error) {
    return res.status(401).json({ error: 'Invalid token' });
  }
};

const requireRole = (...roles) => {
  return (req, res, next) => {
    if (!roles.includes(req.userRole)) {
      return res.status(403).json({ error: 'Insufficient permissions' });
    }
    next();
  };
};

module.exports = {
  extractTenant,
  authenticate,
  requireRole,
};

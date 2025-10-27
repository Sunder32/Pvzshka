"""
Tenant middleware for notification-service
Extracts tenant_id from various sources and sets context
"""

from functools import wraps
from flask import request, jsonify, g
from typing import Optional, Tuple


class TenantContext:
    """Thread-local storage for tenant context"""
    
    def __init__(self):
        self.tenant_id: Optional[str] = None
        self.subdomain: Optional[str] = None
        self.has_tenant: bool = False
        self.tenant_info: Optional[dict] = None


def extract_tenant_context() -> Tuple[str, Optional[str], bool]:
    """
    Extract tenant context from request
    Returns: (tenant_id, subdomain, has_tenant)
    """
    tenant_id = None
    subdomain = None
    has_tenant = False

    # 1. Try X-Tenant-ID header (highest priority)
    if 'X-Tenant-ID' in request.headers:
        tenant_id = request.headers.get('X-Tenant-ID')
        has_tenant = True
    # 2. Try X-Tenant header (legacy)
    elif 'X-Tenant' in request.headers:
        tenant_id = request.headers.get('X-Tenant')
        has_tenant = True
    # 3. Extract from subdomain
    elif request.host:
        parts = request.host.split('.')
        if len(parts) > 0:
            subdomain = parts[0]
            tenant_id = subdomain
            has_tenant = True
    # 4. Extract from URL path (e.g., /market/shop1/notifications)
    elif '/market/' in request.path:
        path_parts = request.path.split('/')
        try:
            market_index = path_parts.index('market')
            if market_index + 1 < len(path_parts):
                subdomain = path_parts[market_index + 1]
                tenant_id = subdomain
                has_tenant = True
        except ValueError:
            pass

    # Default to "default" if no tenant context found
    if not tenant_id:
        tenant_id = 'default'

    return tenant_id, subdomain, has_tenant


def tenant_middleware():
    """
    Flask before_request middleware for tenant context
    Sets g.tenant_context with tenant information
    """
    tenant_id, subdomain, has_tenant = extract_tenant_context()
    
    # Create tenant context
    context = TenantContext()
    context.tenant_id = tenant_id
    context.subdomain = subdomain
    context.has_tenant = has_tenant
    context.tenant_info = {
        'id': tenant_id,
        'subdomain': subdomain,
    }
    
    # Store in Flask g object
    g.tenant_context = context
    g.tenant_id = tenant_id
    g.subdomain = subdomain
    g.has_tenant = has_tenant


def require_tenant(f):
    """
    Decorator to require tenant context
    Usage: @require_tenant
    """
    @wraps(f)
    def decorated_function(*args, **kwargs):
        if not hasattr(g, 'tenant_context'):
            return jsonify({
                'error': 'Internal server error',
                'message': 'Tenant context not initialized'
            }), 500
        
        if not g.tenant_context.has_tenant or g.tenant_context.tenant_id == 'default':
            return jsonify({
                'error': 'Bad Request',
                'message': 'Tenant context is required. Please provide X-Tenant-ID header or access via tenant subdomain.'
            }), 400
        
        return f(*args, **kwargs)
    
    return decorated_function


def get_tenant_id() -> str:
    """Get current tenant ID from context"""
    if hasattr(g, 'tenant_id'):
        return g.tenant_id
    return 'default'


def get_subdomain() -> Optional[str]:
    """Get current subdomain from context"""
    if hasattr(g, 'subdomain'):
        return g.subdomain
    return None


def has_tenant_context() -> bool:
    """Check if tenant context exists"""
    if hasattr(g, 'has_tenant'):
        return g.has_tenant
    return False


def get_tenant_context() -> Optional[TenantContext]:
    """Get full tenant context"""
    if hasattr(g, 'tenant_context'):
        return g.tenant_context
    return None

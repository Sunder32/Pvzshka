package com.marketplace.orderservice.middleware;

import jakarta.servlet.*;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.stereotype.Component;

import java.io.IOException;

/**
 * Tenant middleware for extracting and validating tenant context
 */
@Component
public class TenantFilter implements Filter {

    private static final Logger logger = LoggerFactory.getLogger(TenantFilter.class);

    public static final String TENANT_ID_HEADER = "X-Tenant-ID";
    public static final String TENANT_HEADER_LEGACY = "X-Tenant";
    public static final String TENANT_ID_ATTRIBUTE = "tenantId";
    public static final String SUBDOMAIN_ATTRIBUTE = "subdomain";
    public static final String HAS_TENANT_ATTRIBUTE = "hasTenant";
    public static final String DEFAULT_TENANT = "default";

    @Override
    public void doFilter(ServletRequest request, ServletResponse response, FilterChain chain)
            throws IOException, ServletException {

        HttpServletRequest httpRequest = (HttpServletRequest) request;
        HttpServletResponse httpResponse = (HttpServletResponse) response;

        try {
            String tenantId = null;
            String subdomain = null;
            boolean hasTenant = false;

            // 1. Try X-Tenant-ID header (highest priority)
            tenantId = httpRequest.getHeader(TENANT_ID_HEADER);
            if (tenantId != null && !tenantId.isEmpty()) {
                hasTenant = true;
            } 
            // 2. Try X-Tenant header (legacy)
            else {
                tenantId = httpRequest.getHeader(TENANT_HEADER_LEGACY);
                if (tenantId != null && !tenantId.isEmpty()) {
                    hasTenant = true;
                }
            }

            // 3. Extract from subdomain
            if (tenantId == null) {
                String host = httpRequest.getHeader("Host");
                if (host != null && !host.isEmpty()) {
                    String[] parts = host.split("\\.");
                    if (parts.length > 0) {
                        subdomain = parts[0];
                        tenantId = subdomain;
                        hasTenant = true;
                    }
                }
            }

            // 4. Extract from URL path (e.g., /market/shop1/orders)
            if (tenantId == null) {
                String path = httpRequest.getRequestURI();
                if (path.contains("/market/")) {
                    String[] pathParts = path.split("/");
                    for (int i = 0; i < pathParts.length - 1; i++) {
                        if ("market".equals(pathParts[i]) && i + 1 < pathParts.length) {
                            subdomain = pathParts[i + 1];
                            tenantId = subdomain;
                            hasTenant = true;
                            break;
                        }
                    }
                }
            }

            // Default to "default" if no tenant context found
            if (tenantId == null || tenantId.isEmpty()) {
                tenantId = DEFAULT_TENANT;
                hasTenant = false;
            }

            // Set attributes for later use
            httpRequest.setAttribute(TENANT_ID_ATTRIBUTE, tenantId);
            httpRequest.setAttribute(SUBDOMAIN_ATTRIBUTE, subdomain);
            httpRequest.setAttribute(HAS_TENANT_ATTRIBUTE, hasTenant);

            // Store in thread-local for repository layer access
            TenantContext.setTenantId(tenantId);
            TenantContext.setSubdomain(subdomain);
            TenantContext.setHasTenant(hasTenant);

            logger.debug("Tenant context set: tenantId={}, subdomain={}, hasTenant={}", 
                        tenantId, subdomain, hasTenant);

            chain.doFilter(request, response);

        } catch (Exception e) {
            logger.error("Error processing tenant context", e);
            httpResponse.setStatus(HttpServletResponse.SC_INTERNAL_SERVER_ERROR);
            httpResponse.getWriter().write("{\"error\":\"Internal server error\",\"message\":\"Failed to process tenant context\"}");
        } finally {
            // Clear thread-local to prevent memory leaks
            TenantContext.clear();
        }
    }

    @Override
    public void init(FilterConfig filterConfig) throws ServletException {
        logger.info("TenantFilter initialized");
    }

    @Override
    public void destroy() {
        logger.info("TenantFilter destroyed");
    }
}

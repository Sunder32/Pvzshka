package com.marketplace.orderservice.middleware;

/**
 * Thread-local storage for tenant context
 */
public class TenantContext {

    private static final ThreadLocal<String> tenantId = new ThreadLocal<>();
    private static final ThreadLocal<String> subdomain = new ThreadLocal<>();
    private static final ThreadLocal<Boolean> hasTenant = new ThreadLocal<>();

    public static void setTenantId(String id) {
        tenantId.set(id);
    }

    public static String getTenantId() {
        String id = tenantId.get();
        return id != null ? id : "default";
    }

    public static void setSubdomain(String sub) {
        subdomain.set(sub);
    }

    public static String getSubdomain() {
        return subdomain.get();
    }

    public static void setHasTenant(Boolean has) {
        hasTenant.set(has);
    }

    public static Boolean getHasTenant() {
        Boolean has = hasTenant.get();
        return has != null ? has : false;
    }

    public static void clear() {
        tenantId.remove();
        subdomain.remove();
        hasTenant.remove();
    }

    /**
     * Check if tenant context is valid (not default)
     */
    public static boolean isValid() {
        return getHasTenant() && !"default".equals(getTenantId());
    }
}

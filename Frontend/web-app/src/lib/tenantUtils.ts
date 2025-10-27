/**
 * Утилиты для работы с tenant ID в URL
 */

/**
 * Извлечь tenant ID из pathname
 * Поддерживаемые форматы:
 * - /market/[tenantId]
 * - /creator/market/[tenantId]
 * - /?tenant=[tenantId]
 */
export function extractTenantFromPath(pathname: string, searchParams?: URLSearchParams): string | null {
  // Проверяем query параметр
  if (searchParams) {
    const tenantFromQuery = searchParams.get('tenant');
    if (tenantFromQuery) {
      return tenantFromQuery;
    }
  }

  // Паттерны для извлечения tenant из URL
  const patterns = [
    /^\/market\/([^\/]+)/,           // /market/electronics
    /^\/creator\/market\/([^\/]+)/,  // /creator/market/electronics
    /^\/([^\/]+)$/,                  // /electronics (fallback)
  ];

  for (const pattern of patterns) {
    const match = pathname.match(pattern);
    if (match && match[1]) {
      return match[1];
    }
  }

  return null;
}

/**
 * Извлечь tenant ID из subdomain
 * Пример: electronics.myshop.com -> electronics
 */
export function extractTenantFromSubdomain(hostname: string): string | null {
  const parts = hostname.split('.');
  
  // Если только один домен (localhost) или IP адрес
  if (parts.length <= 1 || /^\d+\.\d+\.\d+\.\d+$/.test(hostname)) {
    return null;
  }

  // Если это localhost с портом
  if (hostname.includes('localhost')) {
    return null;
  }

  // Возвращаем первую часть как subdomain
  const subdomain = parts[0];
  
  // Исключаем системные subdomains
  const systemSubdomains = ['www', 'api', 'admin', 'cdn', 'static'];
  if (systemSubdomains.includes(subdomain)) {
    return null;
  }

  return subdomain;
}

/**
 * Получить tenant ID из Request (server-side)
 */
export function getTenantIdFromRequest(
  pathname: string,
  searchParams?: URLSearchParams,
  hostname?: string
): string | null {
  // Приоритет 1: Query параметр
  if (searchParams) {
    const tenantFromQuery = searchParams.get('tenant');
    if (tenantFromQuery) {
      return tenantFromQuery;
    }
  }

  // Приоритет 2: Path
  const tenantFromPath = extractTenantFromPath(pathname, searchParams);
  if (tenantFromPath) {
    return tenantFromPath;
  }

  // Приоритет 3: Subdomain
  if (hostname) {
    const tenantFromSubdomain = extractTenantFromSubdomain(hostname);
    if (tenantFromSubdomain) {
      return tenantFromSubdomain;
    }
  }

  return null;
}

/**
 * Получить tenant ID из window (client-side)
 */
export function getTenantIdFromWindow(): string | null {
  if (typeof window === 'undefined') {
    return null;
  }

  const pathname = window.location.pathname;
  const searchParams = new URLSearchParams(window.location.search);
  const hostname = window.location.hostname;

  return getTenantIdFromRequest(pathname, searchParams, hostname);
}

/**
 * Проверить валидность tenant ID
 */
export function isValidTenantId(tenantId: string | null): boolean {
  if (!tenantId) return false;
  
  // Только латиница, цифры и дефис, длина 1-50 символов
  const pattern = /^[a-z0-9-]{1,50}$/;
  return pattern.test(tenantId);
}

/**
 * Нормализовать tenant ID (lowercase, trim)
 */
export function normalizeTenantId(tenantId: string): string {
  return tenantId.toLowerCase().trim();
}

/**
 * Создать URL для магазина
 */
export function createTenantUrl(tenantId: string, path = '/'): string {
  const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || 'http://localhost:3003';
  const normalizedTenant = normalizeTenantId(tenantId);
  
  // Если используем subdomain
  if (process.env.NEXT_PUBLIC_USE_SUBDOMAIN === 'true') {
    const url = new URL(baseUrl);
    url.hostname = `${normalizedTenant}.${url.hostname}`;
    url.pathname = path;
    return url.toString();
  }
  
  // Если используем path
  return `${baseUrl}/market/${normalizedTenant}${path}`;
}

/**
 * Получить default tenant ID
 */
export function getDefaultTenantId(): string {
  return process.env.NEXT_PUBLIC_DEFAULT_TENANT || 'default';
}

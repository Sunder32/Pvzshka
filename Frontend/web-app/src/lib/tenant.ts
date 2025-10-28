export { getTenantConfig } from './config';

export function getTenantFromHost(): string | null {
  if (typeof window === 'undefined') return null
  
  const host = window.location.hostname
  
  // localhost:3003 -> используем тестовый tenant
  if (host === 'localhost' || host === '127.0.0.1') {
    return 'test' // или ID тенанта
  }
  
  // test.yourplatform.com -> "test"
  const subdomain = host.split('.')[0]
  return subdomain
}

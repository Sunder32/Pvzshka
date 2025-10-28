'use client'

import { useEffect, useState } from 'react'
import DynamicSite from '@/components/DynamicSite'
import { getTenantFromHost } from '@/lib/tenant'

export default function DynamicHomePage() {
  const [subdomain, setSubdomain] = useState<string | null>(null)

  useEffect(() => {
    const tenant = getTenantFromHost()
    if (tenant) {
      setSubdomain(tenant)
    }
  }, [])

  if (!subdomain) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Определение сайта...</p>
        </div>
      </div>
    )
  }

  return <DynamicSite subdomain={subdomain} />
}

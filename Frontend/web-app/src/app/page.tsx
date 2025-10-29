'use client'

import { useEffect, useState } from 'react'
import DynamicSite from '@/components/DynamicSite'

export default function HomePage() {
  const [subdomain, setSubdomain] = useState('demo')

  useEffect(() => {
    // Определение subdomain из URL
    if (typeof window !== 'undefined') {
      const hostname = window.location.hostname
      
      // Проверка на поддомен (например, shop.marketplace.com)
      if (hostname.includes('.')) {
        const parts = hostname.split('.')
        if (parts.length >= 2 && parts[0] !== 'www') {
          setSubdomain(parts[0])
        }
      }
      
      // Для localhost можно использовать query параметр
      const params = new URLSearchParams(window.location.search)
      const siteParam = params.get('site')
      if (siteParam) {
        setSubdomain(siteParam)
      }
    }
  }, [])

  return <DynamicSite subdomain={subdomain} />
}

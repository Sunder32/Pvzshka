'use client'

import DynamicSite from '@/components/DynamicSite'

export default function HomePage() {
  // Для главной страницы используем demo subdomain
  return <DynamicSite subdomain="demo" />
}

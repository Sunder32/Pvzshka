'use client'

import DynamicSite from '@/components/DynamicSite'
import { useParams } from 'next/navigation'

export default function DomainPage() {
  const params = useParams()
  const domain = params.domain as string

  if (!domain) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <p className="text-gray-600">Сайт не найден</p>
      </div>
    )
  }

  return <DynamicSite subdomain={domain} />
}

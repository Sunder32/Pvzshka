'use client'

import React from 'react';
import DynamicSite from '@/components/DynamicSite';
import { useParams } from 'next/navigation';

export default function MarketPage() {
  const params = useParams();
  const subdomain = params?.tenant as string;

  return <DynamicSite subdomain={subdomain || 'demo'} />;
}

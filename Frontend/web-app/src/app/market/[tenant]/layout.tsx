import React from 'react';

interface MarketLayoutProps {
  children: React.ReactNode;
  params: {
    tenant: string;
  };
}

export default function MarketLayout({ children, params }: MarketLayoutProps) {
  // Упрощенный layout - DynamicSite внутри children сам обрабатывает GraphQL
  return (
    <div className="market-layout" data-tenant={params.tenant}>
      <main className="market-content">
        {children}
      </main>
    </div>
  );
}

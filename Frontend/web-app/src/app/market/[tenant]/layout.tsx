import { notFound } from 'next/navigation';
import { getConfigClient } from '@/lib/configClient';
import { ConfigProvider } from '@/lib/ConfigProvider';
import { isValidTenantId, normalizeTenantId } from '@/lib/tenantUtils';
import DynamicHeader from '@/components/market/DynamicHeader';
import DynamicFooter from '@/components/market/DynamicFooter';
import ConfigUpdateNotifier from '@/components/market/ConfigUpdateNotifier';

interface MarketLayoutProps {
  children: React.ReactNode;
  params: {
    tenant: string;
  };
}

export async function generateMetadata({ params }: { params: { tenant: string } }) {
  const tenantId = normalizeTenantId(params.tenant);

  if (!isValidTenantId(tenantId)) {
    return {
      title: 'Магазин не найден',
      description: 'Указанный магазин не существует',
    };
  }

  try {
    const configClient = getConfigClient();
    const config = await configClient.getConfig(tenantId);

    return {
      title: config.seo.title || config.branding.name,
      description: config.seo.description,
      keywords: config.seo.keywords,
      openGraph: {
        title: config.seo.title || config.branding.name,
        description: config.seo.description,
        images: config.seo.ogImage ? [config.seo.ogImage] : [],
        type: 'website',
      },
      twitter: {
        card: 'summary_large_image',
        title: config.seo.title || config.branding.name,
        description: config.seo.description,
        images: config.seo.ogImage ? [config.seo.ogImage] : [],
      },
      icons: {
        icon: config.branding.favicon || '/favicon.ico',
        apple: config.branding.favicon || '/favicon.ico',
      },
    };
  } catch (error) {
    console.error('[MarketLayout] Error generating metadata:', error);
    return {
      title: 'Магазин',
      description: 'Интернет-магазин',
    };
  }
}

export default async function MarketLayout({ children, params }: MarketLayoutProps) {
  const tenantId = normalizeTenantId(params.tenant);

  // Валидация tenant ID
  if (!isValidTenantId(tenantId)) {
    notFound();
  }

  // Загружаем конфиг на сервере
  let initialConfig = null;
  
  try {
    const configClient = getConfigClient();
    initialConfig = await configClient.getConfig(tenantId);
  } catch (error) {
    console.error('[MarketLayout] Error loading config:', error);
    notFound();
  }

  return (
    <ConfigProvider
      tenantId={tenantId}
      initialConfig={initialConfig}
      autoRefresh={true}
      refreshInterval={60000}
    >
      <div className="market-layout" data-tenant={tenantId}>
        <ConfigUpdateNotifier />
        <DynamicHeader />
        
        <main className="market-content">
          {children}
        </main>
        
        <DynamicFooter />
      </div>
    </ConfigProvider>
  );
}

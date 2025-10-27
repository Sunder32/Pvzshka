import React from 'react';
import { getConfigClient } from '@/lib/configClient';
import { normalizeTenantId } from '@/lib/tenantUtils';
import HeroSection from '@/components/market/HeroSection';
import FeaturedProducts from '@/components/market/FeaturedProducts';
import CategoriesSection from '@/components/market/CategoriesSection';

interface MarketPageProps {
  params: {
    tenant: string;
  };
}

export default async function MarketPage({ params }: MarketPageProps) {
  const tenantId = normalizeTenantId(params.tenant);
  
  const configClient = getConfigClient();
  const config = await configClient.getConfig(tenantId);

  return (
    <div className="market-page">
      {/* Hero Section */}
      {config.homepage.hero.enabled && (
        <HeroSection />
      )}

      {/* Categories */}
      {config.homepage.categories.enabled && (
        <CategoriesSection />
      )}

      {/* Featured Products */}
      {config.homepage.featuredProducts.enabled && (
        <FeaturedProducts />
      )}

      {/* Analytics Scripts */}
      {config.integrations.analytics.googleAnalytics && (
        <script
          async
          src={`https://www.googletagmanager.com/gtag/js?id=${config.integrations.analytics.googleAnalytics}`}
        />
      )}
      
      {config.integrations.analytics.yandexMetrika && (
        <script
          dangerouslySetInnerHTML={{
            __html: `
              (function(m,e,t,r,i,k,a){m[i]=m[i]||function(){(m[i].a=m[i].a||[]).push(arguments)};
              m[i].l=1*new Date();k=e.createElement(t),a=e.getElementsByTagName(t)[0],k.async=1,k.src=r,a.parentNode.insertBefore(k,a)})
              (window, document, "script", "https://mc.yandex.ru/metrika/tag.js", "ym");
              ym(${config.integrations.analytics.yandexMetrika}, "init", {
                clickmap:true,
                trackLinks:true,
                accurateTrackBounce:true,
                webvisor:true
              });
            `,
          }}
        />
      )}
    </div>
  );
}

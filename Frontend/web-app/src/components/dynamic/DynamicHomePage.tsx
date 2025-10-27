'use client';

import { PageConfig, SectionConfig } from '@/lib/config';
import { DynamicSection } from './DynamicSection';

interface DynamicHomePageProps {
  config: PageConfig;
}

export function DynamicHomePage({ config }: DynamicHomePageProps) {
  const sortedSections = config.sections
    .filter(section => section.visible)
    .sort((a, b) => a.order - b.order);

  return (
    <div className="container mx-auto px-4 py-6">
      {sortedSections.map((section) => (
        <DynamicSection key={section.id} section={section} />
      ))}
    </div>
  );
}

'use client';

import { SectionConfig } from '@/lib/config';
import { SearchBar } from '../sections/SearchBar';
import { CategoryList } from '../sections/CategoryList';
import { ProductGrid } from '../sections/ProductGrid';
import { HeroBanner } from '../sections/HeroBanner';
import { ProductCarousel } from '../sections/ProductCarousel';

const COMPONENT_MAP: Record<string, React.ComponentType<any>> = {
  'search_bar': SearchBar,
  'category_list': CategoryList,
  'product_grid': ProductGrid,
  'hero_banner': HeroBanner,
  'product_carousel': ProductCarousel,
};

interface DynamicSectionProps {
  section: SectionConfig;
}

export function DynamicSection({ section }: DynamicSectionProps) {
  const Component = COMPONENT_MAP[section.type];

  if (!Component) {
    console.warn(`Component type "${section.type}" not found`);
    return null;
  }

  return <Component {...section.config} />;
}

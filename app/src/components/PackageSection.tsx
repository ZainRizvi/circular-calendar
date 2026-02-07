'use client';

import { ComponentType } from 'react';
import { useScrollAnimation } from '@/hooks/useScrollAnimation';
import {
  DocumentIcon,
  ClockIcon,
  MoonIcon,
  ArrowUpIcon,
  BookIcon,
  LayersIcon,
} from './icons';

interface PackageItem {
  icon: ComponentType;
  title: string;
  description: string;
}

const packageItems: PackageItem[] = [
  {
    icon: DocumentIcon,
    title: 'Printable PDF',
    description: 'High-resolution calendar pages optimized for home printing on standard paper',
  },
  {
    icon: ClockIcon,
    title: '12 Solar Months',
    description: 'Complete Gregorian calendar with all days marked and color-coded',
  },
  {
    icon: MoonIcon,
    title: '12 Islamic Months',
    description: 'Hijri calendar months pre-aligned for the current year',
  },
  {
    icon: ArrowUpIcon,
    title: 'Arrow Marker',
    description: "Printable arrow to mark and move to today's date",
  },
  {
    icon: BookIcon,
    title: 'Assembly Guide',
    description: 'Step-by-step instructions with tips for wall mounting',
  },
  {
    icon: LayersIcon,
    title: 'Event Tags',
    description: 'Blank arrow tags to mark birthdays, Eids, and special occasions',
  },
];

function PackageItemCard({ item }: { item: PackageItem }) {
  const ref = useScrollAnimation();
  const Icon = item.icon;
  return (
    <div className="package-item" ref={ref}>
      <div className="package-item-icon">
        <Icon />
      </div>
      <div>
        <h4>{item.title}</h4>
        <p>{item.description}</p>
      </div>
    </div>
  );
}

export function PackageSection() {
  const headerRef = useScrollAnimation();

  return (
    <section className="package-section">
      <div className="container">
        <div className="package-card">
          <div className="package-header" ref={headerRef}>
            <span className="section-label">What You&apos;ll Receive</span>
            <h2 className="section-title">Everything You Need</h2>
          </div>

          <div className="package-contents">
            {packageItems.map((item, index) => (
              <PackageItemCard key={index} item={item} />
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}

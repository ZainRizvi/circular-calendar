'use client';

import { ReactNode } from 'react';
import { useScrollAnimation } from '@/hooks/useScrollAnimation';

interface Benefit {
  number: string;
  title: string;
  description: ReactNode;
}

const benefits: Benefit[] = [
  {
    number: '01',
    title: 'Answers the "Why" Questions',
    description: (
      <>
        Children don&apos;t just memorize dates—they <em>see</em> why Islamic months cycle
        through the seasons over ~33 years.
      </>
    ),
  },
  {
    number: '02',
    title: 'Builds Calendar Literacy',
    description:
      'Understanding lunar vs solar calendars is foundational knowledge for Islamic studies and world history.',
  },
  {
    number: '03',
    title: 'Daily Engagement',
    description:
      'Moving the "today" arrow becomes a daily ritual. Children naturally learn both date systems through repetition.',
  },
  {
    number: '04',
    title: 'Beautiful Wall Display',
    description:
      'The colorful circular design is eye-catching and sparks curiosity. Visitors always ask about it.',
  },
  {
    number: '05',
    title: 'Perfect for Homeschool',
    description:
      'Integrates Islamic studies with math (degrees, fractions) and science (astronomy, lunar cycles).',
  },
  {
    number: '06',
    title: 'Family Activity',
    description:
      'Assembling the calendar together creates a memorable learning experience and a sense of ownership.',
  },
];

function BenefitItem({ benefit }: { benefit: Benefit }) {
  const ref = useScrollAnimation();
  return (
    <div className="benefit-item" ref={ref}>
      <div className="benefit-number">{benefit.number}</div>
      <div className="benefit-content">
        <h3>{benefit.title}</h3>
        <p>{benefit.description}</p>
      </div>
    </div>
  );
}

export function Benefits() {
  const headerRef = useScrollAnimation();

  return (
    <section className="benefits-section">
      <div className="container">
        <div className="section-header" ref={headerRef}>
          <span className="section-label">Why Families Love It</span>
          <h2 className="section-title">More Than Just a Calendar</h2>
        </div>

        <div className="benefits-grid">
          {benefits.map((benefit) => (
            <BenefitItem key={benefit.number} benefit={benefit} />
          ))}
        </div>
      </div>
    </section>
  );
}

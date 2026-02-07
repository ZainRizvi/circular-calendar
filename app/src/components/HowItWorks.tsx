'use client';

import { ReactNode } from 'react';
import { useScrollAnimation } from '@/hooks/useScrollAnimation';
import { DualRingIcon, GapIcon, AlignIcon, HandsIcon } from './icons';

function AnimatedFeatureCard({
  children,
  className = '',
}: {
  children: ReactNode;
  className?: string;
}) {
  const ref = useScrollAnimation();
  return (
    <div className={`feature-card ${className}`} ref={ref}>
      {children}
    </div>
  );
}

export function HowItWorks() {
  const headerRef = useScrollAnimation();

  return (
    <section id="how-it-works" className="how-section">
      <div className="container">
        <div className="section-header" ref={headerRef}>
          <span className="section-label">The Solution</span>
          <h2 className="section-title">Two Calendars, One Circle, Instant Understanding</h2>
          <p className="section-subtitle">
            When you see both calendars together, everything clicks.
          </p>
        </div>

        <div className="features-grid">
          <AnimatedFeatureCard className="feature-card-large">
            <div className="feature-icon">
              <DualRingIcon />
            </div>
            <div>
              <h3>Dual Ring Design</h3>
              <p>
                The <strong>outer ring</strong> shows all 12 Gregorian months arranged in a
                circle, with January at the top. The <strong>inner ring</strong> shows the 12
                Islamic months, perfectly aligned day-by-day with their Gregorian
                counterparts.
              </p>
            </div>
          </AnimatedFeatureCard>

          <AnimatedFeatureCard>
            <div className="feature-icon feature-icon-gap">
              <GapIcon />
            </div>
            <h3>The Visible Gap</h3>
            <p>
              Because the Islamic year is ~11 days shorter, there&apos;s always a{' '}
              <strong>gap</strong> in the inner circle. This gap is the entire lesson—it
              shows <em>why</em> Islamic months shift earlier each solar year.
            </p>
          </AnimatedFeatureCard>

          <AnimatedFeatureCard>
            <div className="feature-icon feature-icon-align">
              <AlignIcon />
            </div>
            <h3>Day-by-Day Alignment</h3>
            <p>
              Every day on the Islamic calendar lines up with its exact Gregorian date.
              Point to Ramadan 15 and immediately see what solar date it falls on.
            </p>
          </AnimatedFeatureCard>

          <AnimatedFeatureCard>
            <div className="feature-icon feature-icon-hands">
              <HandsIcon />
            </div>
            <h3>Hands-On Learning</h3>
            <p>
              Print, cut, and assemble on your wall. Add an arrow for today&apos;s date.
              Mark birthdays and Islamic holidays. Move the pieces as months pass.
            </p>
          </AnimatedFeatureCard>
        </div>
      </div>
    </section>
  );
}

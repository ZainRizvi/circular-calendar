'use client';

import { useScrollAnimation } from '@/hooks/useScrollAnimation';

export function ProblemSection() {
  const contentRef = useScrollAnimation();
  const visualRef = useScrollAnimation();

  return (
    <section className="problem-section">
      <div className="container">
        <div className="problem-grid">
          <div className="problem-content" ref={contentRef}>
            <span className="section-label">The Challenge</span>
            <h2 className="section-title">&ldquo;When is Ramadan this year?&rdquo;</h2>
            <p className="problem-text">
              Every year, Muslim children ask this question. And every year, explaining why
              Islamic months &ldquo;move&rdquo; through the seasons becomes a mini-lesson in
              astronomy and calendar systems.
            </p>
            <p className="problem-text">
              Traditional calendars show one system or the other—never both together in a
              way that makes the relationship <em>visible</em> and <em>intuitive</em>.
            </p>
          </div>
          <div className="problem-visual" ref={visualRef}>
            <div className="quote-card">
              <blockquote>
                &ldquo;Why is Ramadan starting sooner this year?&rdquo;
              </blockquote>
              <cite>— Every Muslim child, eventually</cite>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

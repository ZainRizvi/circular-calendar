'use client';

import { useScrollAnimation } from '@/hooks/useScrollAnimation';
import { ChevronDownIcon } from './icons';

const faqItems = [
  {
    question: 'What ages is this calendar suitable for?',
    answer:
      "The calendar works well for children ages 5 and up, though even younger children enjoy moving the daily arrow. Older children and adults often discover they understand the calendar systems better after using it. It's truly a multi-generational learning tool.",
  },
  {
    question: 'How big is the assembled calendar?',
    answer:
      "When fully assembled, the calendar forms a circle approximately 24 inches (60 cm) in diameter—perfect for a prominent wall display that's easy to read and interact with daily.",
  },
  {
    question: 'What printer and paper do I need?',
    answer:
      'Any standard home color printer works. The PDF is designed for US Letter size paper (8.5" x 11"), but A4 works too. For best results, use cardstock or laminate the pages for durability—especially if little hands will be moving pieces frequently.',
  },
  {
    question: 'How do I attach it to the wall?',
    answer:
      'We recommend removable mounting putty (like Blu-Tack) so you can easily reposition the Islamic months as they shift throughout the year. Push pins or tape also work, but putty gives you the most flexibility.',
  },
  {
    question: 'Do I need to buy a new calendar every year?',
    answer:
      "The solar calendar months can be reused year after year (except for leap years affecting February). The Islamic months need to be repositioned annually as they shift relative to the solar calendar—that's part of the learning experience. We release an updated alignment guide each year.",
  },
  {
    question: 'What if I make a mistake during assembly?',
    answer:
      'No worries—you can print as many copies as you need. Many families print extras for grandparents or as gifts. The PDF is yours to keep and reprint whenever needed.',
  },
];

function AnimatedSection({ children }: { children: React.ReactNode }) {
  const ref = useScrollAnimation();
  return <div ref={ref}>{children}</div>;
}

export function FAQ() {
  const headerRef = useScrollAnimation();

  return (
    <section className="faq-section">
      <div className="container">
        <div className="section-header" ref={headerRef}>
          <span className="section-label">Questions?</span>
          <h2 className="section-title">Frequently Asked Questions</h2>
        </div>

        <div className="faq-list">
          {faqItems.map((item, index) => (
            <AnimatedSection key={index}>
              <details className="faq-item">
                <summary>
                  <span>{item.question}</span>
                  <span aria-hidden="true">
                    <ChevronDownIcon />
                  </span>
                </summary>
                <div className="faq-answer">
                  <p>{item.answer}</p>
                </div>
              </details>
            </AnimatedSection>
          ))}
        </div>
      </div>
    </section>
  );
}

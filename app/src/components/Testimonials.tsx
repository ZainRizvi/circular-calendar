'use client';

import { useScrollAnimation } from '@/hooks/useScrollAnimation';
import { StarIcon } from './icons';

interface Testimonial {
  quote: string;
  author: string;
  role: string;
}

const testimonials: Testimonial[] = [
  {
    quote:
      'My 7-year-old finally understands why we fast at different times each year. She runs to the calendar every morning to move the arrow.',
    author: 'Fatima H.',
    role: 'Homeschooling mom of 3',
  },
  {
    quote:
      'We use this in our Islamic studies co-op. The visual "gap" concept is something no textbook explanation could match.',
    author: 'Amina K.',
    role: 'Islamic studies teacher',
  },
  {
    quote:
      "Honestly, I learned something too. I never fully grasped why the calendars worked differently until I assembled this with my kids.",
    author: 'Yusuf M.',
    role: 'Father of 4',
  },
];

function Stars() {
  return (
    <div className="testimonial-stars">
      <StarIcon />
      <StarIcon />
      <StarIcon />
      <StarIcon />
      <StarIcon />
    </div>
  );
}

function TestimonialCard({ testimonial }: { testimonial: Testimonial }) {
  const ref = useScrollAnimation();
  return (
    <div className="testimonial-card" ref={ref}>
      <Stars />
      <blockquote>{testimonial.quote}</blockquote>
      <cite>
        <strong>{testimonial.author}</strong>
        <span>{testimonial.role}</span>
      </cite>
    </div>
  );
}

export function Testimonials() {
  const headerRef = useScrollAnimation();

  return (
    <section className="testimonials-section">
      <div className="container">
        <div className="section-header" ref={headerRef}>
          <span className="section-label">From Our Community</span>
          <h2 className="section-title">What Parents Are Saying</h2>
        </div>

        <div className="testimonials-grid">
          {testimonials.map((testimonial, index) => (
            <TestimonialCard key={index} testimonial={testimonial} />
          ))}
        </div>
      </div>
    </section>
  );
}

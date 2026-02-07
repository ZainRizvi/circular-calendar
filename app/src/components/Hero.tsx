import Link from 'next/link';
import { CalendarPreview } from './CalendarPreview';
import { ArrowIcon } from './icons';

export function Hero() {
  return (
    <header className="hero">
      <div className="hero-content">
        <div className="hero-badge">For Muslim Families & Homeschoolers</div>
        <h1 className="hero-title">
          Teach Your Children
          <span className="hero-title-accent">Both Calendars</span>
          Through One Beautiful Circle
        </h1>
        <p className="hero-subtitle">
          A hands-on educational calendar that shows exactly how the Islamic lunar months
          align with the Gregorian solar year—and why Ramadan moves through the seasons.
        </p>
        <div className="hero-cta-group">
          <Link href="#buy" className="btn btn-primary">
            <span>Get Your Calendar</span>
            <ArrowIcon />
          </Link>
          <Link href="#how-it-works" className="btn btn-secondary">
            See How It Works
          </Link>
        </div>
      </div>

      <CalendarPreview />
    </header>
  );
}

'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';

export function Navigation() {
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 100);
    };

    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  return (
    <nav className={`nav ${scrolled ? 'scrolled' : ''}`}>
      <div className="nav-container">
        <Link href="#" className="nav-logo" aria-label="Circle Calendar home">
          <span className="logo-circle" aria-hidden="true"></span>
          Circle Calendar
        </Link>
        <Link href="#buy" className="nav-cta">
          Get the Calendar
        </Link>
      </div>
    </nav>
  );
}

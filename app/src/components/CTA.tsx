'use client';

import { useState } from 'react';
import { ArrowIcon, HeartIcon } from './icons';

export function CTA() {
  const [loading, setLoading] = useState(false);

  const handleDownload = async () => {
    setLoading(true);
    try {
      const response = await fetch('/api/generate');
      if (!response.ok) {
        throw new Error('Failed to generate PDF');
      }
      const blob = await response.blob();
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = 'circle-calendar.pdf';
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
    } catch (error) {
      console.error('Download failed:', error);
      alert('Failed to download the calendar. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <section id="buy" className="cta-section">
      <div className="container">
        <div className="cta-card">
          <div className="cta-content">
            <h2 className="cta-title">
              Ready to Transform How Your Family Understands Time?
            </h2>
            <p className="cta-subtitle">
              Join hundreds of Muslim families using the Circle Calendar for daily learning.
            </p>

            <div className="cta-price">
              <span className="price-label">Pay what you want</span>
              <span className="price-amount">$0+</span>
              <span className="price-details">
                Suggested: $12
                <br />
                Instant PDF download
              </span>
            </div>

            <button
              onClick={handleDownload}
              disabled={loading}
              className="btn btn-primary btn-large"
            >
              <span>{loading ? 'Generating...' : 'Get Your Calendar'}</span>
              {!loading && <ArrowIcon />}
            </button>

            <p className="cta-guarantee">
              <HeartIcon />
              Free for those who need it. Pay what it&apos;s worth to you.
            </p>
          </div>

          <div className="cta-visual">
            <div className="cta-calendar-preview">
              <div className="preview-ring preview-ring-1"></div>
              <div className="preview-ring preview-ring-2"></div>
              <div className="preview-center"></div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

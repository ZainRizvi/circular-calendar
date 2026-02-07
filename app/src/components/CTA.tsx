'use client';

import { useState, useRef, useEffect } from 'react';
import { ArrowIcon, HeartIcon } from './icons';

export function CTA() {
  const [loading, setLoading] = useState(false);
  const isMountedRef = useRef(true);
  const cleanupTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    return () => {
      isMountedRef.current = false;
      if (cleanupTimeoutRef.current !== null) {
        clearTimeout(cleanupTimeoutRef.current);
      }
    };
  }, []);

  const handleDownload = async () => {
    setLoading(true);
    let blobUrl: string | null = null;
    let anchor: HTMLAnchorElement | null = null;

    try {
      const response = await fetch('/api/generate');
      if (!response.ok) {
        const errorData = await response.json().catch(() => ({ error: 'Unknown error' }));
        throw new Error(errorData.error || `Server error: ${response.status}`);
      }

      const blob = await response.blob();
      if (blob.size === 0) {
        throw new Error('Generated PDF is empty');
      }

      blobUrl = URL.createObjectURL(blob);
      anchor = document.createElement('a');
      anchor.href = blobUrl;
      anchor.download = 'circle-calendar.pdf';
      anchor.style.display = 'none';
      document.body.appendChild(anchor);
      anchor.click();

      // Revoke after a delay to ensure download starts
      const urlToRevoke = blobUrl;
      const anchorToRemove = anchor;
      cleanupTimeoutRef.current = setTimeout(() => {
        cleanupTimeoutRef.current = null;
        URL.revokeObjectURL(urlToRevoke);
        if (anchorToRemove.parentNode) {
          document.body.removeChild(anchorToRemove);
        }
      }, 1000);
    } catch (error) {
      console.error('Download failed:', error);
      // Clean up immediately on error
      if (blobUrl) URL.revokeObjectURL(blobUrl);
      if (anchor && anchor.parentNode) {
        document.body.removeChild(anchor);
      }
      alert(
        error instanceof Error
          ? `Failed to download: ${error.message}`
          : 'Failed to download the calendar. Please try again.'
      );
    } finally {
      if (isMountedRef.current) {
        setLoading(false);
      }
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
              aria-label={loading ? 'Generating calendar, please wait' : 'Get your calendar'}
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

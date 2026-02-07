'use client';

import { useEffect, useRef, useState } from 'react';

export function CalendarPreview() {
  const [arrowAngle, setArrowAngle] = useState(-90); // Start at top (January)
  const [isPaused, setIsPaused] = useState(false);
  const targetAngleRef = useRef(-90);
  const animatingRef = useRef(false);

  useEffect(() => {
    const interval = setInterval(() => {
      targetAngleRef.current += 0.5; // Move half a degree
      if (targetAngleRef.current >= 270) {
        targetAngleRef.current = -90; // Reset after full rotation
      }

      if (!animatingRef.current) {
        animatingRef.current = true;

        const animate = () => {
          setArrowAngle((current) => {
            const diff = targetAngleRef.current - current;
            const next = current + diff * 0.1;

            if (Math.abs(diff) > 0.1) {
              requestAnimationFrame(animate);
              return next;
            }
            animatingRef.current = false;
            return next;
          });
        };

        requestAnimationFrame(animate);
      }
    }, 3000);

    return () => clearInterval(interval);
  }, []);

  return (
    <div className="hero-visual">
      <div
        className={`calendar-preview ${isPaused ? 'paused' : ''}`}
        onMouseEnter={() => setIsPaused(true)}
        onMouseLeave={() => setIsPaused(false)}
      >
        <div className="calendar-ring calendar-ring-outer">
          <div
            className="month-segment"
            style={{ '--rotation': '0deg', '--color': '#aebbff' } as React.CSSProperties}
            data-month="Jan"
          ></div>
          <div
            className="month-segment"
            style={{ '--rotation': '30deg', '--color': '#9ce3ff' } as React.CSSProperties}
            data-month="Feb"
          ></div>
          <div
            className="month-segment"
            style={{ '--rotation': '60deg', '--color': '#a1fec5' } as React.CSSProperties}
            data-month="Mar"
          ></div>
          <div
            className="month-segment"
            style={{ '--rotation': '90deg', '--color': '#caff8b' } as React.CSSProperties}
            data-month="Apr"
          ></div>
          <div
            className="month-segment"
            style={{ '--rotation': '120deg', '--color': '#fdff92' } as React.CSSProperties}
            data-month="May"
          ></div>
          <div
            className="month-segment"
            style={{ '--rotation': '150deg', '--color': '#fef087' } as React.CSSProperties}
            data-month="Jun"
          ></div>
          <div
            className="month-segment"
            style={{ '--rotation': '180deg', '--color': '#ffdb8d' } as React.CSSProperties}
            data-month="Jul"
          ></div>
          <div
            className="month-segment"
            style={{ '--rotation': '210deg', '--color': '#ffc08d' } as React.CSSProperties}
            data-month="Aug"
          ></div>
          <div
            className="month-segment"
            style={{ '--rotation': '240deg', '--color': '#ffa290' } as React.CSSProperties}
            data-month="Sep"
          ></div>
          <div
            className="month-segment"
            style={{ '--rotation': '270deg', '--color': '#ff90c0' } as React.CSSProperties}
            data-month="Oct"
          ></div>
          <div
            className="month-segment"
            style={{ '--rotation': '300deg', '--color': '#feabf1' } as React.CSSProperties}
            data-month="Nov"
          ></div>
          <div
            className="month-segment"
            style={{ '--rotation': '330deg', '--color': '#caa8fe' } as React.CSSProperties}
            data-month="Dec"
          ></div>
        </div>
        <div className="calendar-ring calendar-ring-inner">
          <div
            className="islamic-segment"
            style={{ '--rotation': '-15deg', '--color': '#FF9CB1' } as React.CSSProperties}
          ></div>
          <div
            className="islamic-segment"
            style={{ '--rotation': '15deg', '--color': '#FFB99C' } as React.CSSProperties}
          ></div>
          <div
            className="islamic-segment"
            style={{ '--rotation': '45deg', '--color': '#FFEA9C' } as React.CSSProperties}
          ></div>
          <div
            className="islamic-segment"
            style={{ '--rotation': '75deg', '--color': '#E3FF9C' } as React.CSSProperties}
          ></div>
          <div
            className="islamic-segment"
            style={{ '--rotation': '105deg', '--color': '#B1FF9C' } as React.CSSProperties}
          ></div>
          <div
            className="islamic-segment"
            style={{ '--rotation': '135deg', '--color': '#9CFFB8' } as React.CSSProperties}
          ></div>
          <div
            className="islamic-segment"
            style={{ '--rotation': '165deg', '--color': '#9CFFEA' } as React.CSSProperties}
          ></div>
          <div
            className="islamic-segment"
            style={{ '--rotation': '195deg', '--color': '#9CE3FF' } as React.CSSProperties}
          ></div>
          <div
            className="islamic-segment"
            style={{ '--rotation': '225deg', '--color': '#9CB2FF' } as React.CSSProperties}
          ></div>
          <div
            className="islamic-segment"
            style={{ '--rotation': '255deg', '--color': '#B89CFF' } as React.CSSProperties}
          ></div>
          <div
            className="islamic-segment"
            style={{ '--rotation': '285deg', '--color': '#EA9CFF' } as React.CSSProperties}
          ></div>
          {/* Gap representing shorter Islamic year */}
          <div className="calendar-gap"></div>
        </div>
        <div className="calendar-center">
          <span className="calendar-center-text">Today</span>
        </div>
        <div
          className="calendar-arrow"
          style={{ transform: `rotate(${arrowAngle}deg)` }}
        ></div>
      </div>
      <div className="hero-visual-caption">
        <span className="caption-dot caption-dot-solar"></span> Solar Calendar
        <span className="caption-dot caption-dot-islamic"></span> Islamic Calendar
        <span className="caption-dot caption-dot-gap"></span> The Gap
      </div>
    </div>
  );
}

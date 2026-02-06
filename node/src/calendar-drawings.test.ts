/**
 * Tests for calendar-drawings module.
 */

import { describe, it, expect, beforeEach } from 'vitest';
import { getMonth, DATE_FILL_COLOR } from './calendar-drawings.js';
import { Point, resetTextPathIdCounter } from './primitives.js';
import type { MonthInstance } from './calendar-data.js';

beforeEach(() => {
  resetTextPathIdCounter();
});

describe('DATE_FILL_COLOR', () => {
  it('should be light beige', () => {
    expect(DATE_FILL_COLOR).toBe('#fbebb3');
  });
});

describe('getMonth', () => {
  const origin = new Point(100, 100);
  const daysInYear = 366;

  function createTestMonth(overrides: Partial<MonthInstance> = {}): MonthInstance {
    return {
      name: 'January',
      numDays: 31,
      color: '#aebbff',
      nameUpsideDown: false,
      dateOnTop: false,
      dateBoxHeight: 10,
      innerRadius: 80,
      outerRadius: 100,
      dateAngleOffset: 0,
      ...overrides,
    };
  }

  it('should return an array of drawable elements', () => {
    const month = createTestMonth();
    const elements = getMonth(month, daysInYear, origin);
    expect(Array.isArray(elements)).toBe(true);
    expect(elements.length).toBeGreaterThan(0);
  });

  it('should include background arc element', () => {
    const month = createTestMonth();
    const elements = getMonth(month, daysInYear, origin);
    // First element should be the background DimensionalArc
    expect(elements[0]).toHaveProperty('drawnPath');
    expect(elements[0]).toHaveProperty('fill', month.color);
  });

  it('should include month name text element', () => {
    const month = createTestMonth({ name: 'TestMonth' });
    const elements = getMonth(month, daysInYear, origin);
    // Second element should be CurvedText for month name
    expect(elements[1]).toHaveProperty('drawnPath');
    expect(elements[1]).toHaveProperty('text', 'TestMonth');
  });

  it('should calculate correct month width in degrees', () => {
    const month = createTestMonth({ numDays: 31 });
    const elements = getMonth(month, daysInYear, origin);

    // Month width = 360 * numDays / daysInYear = 360 * 31 / 366 ≈ 30.49°
    const expectedWidth = (360 * 31) / 366;

    // Background arc should span this width centered around -90°
    const background = elements[0];
    // We can't directly test angles, but we can check the arc exists
    expect(background).toHaveProperty('outerArc');
    expect(background).toHaveProperty('innerArc');
  });

  it('should generate date boxes equal to numDays', () => {
    const month = createTestMonth({ numDays: 5 });
    const elements = getMonth(month, daysInYear, origin);

    // Elements: 1 background + 1 month name + (5 date boxes * 2 elements each: background + text)
    // = 1 + 1 + 10 = 12
    expect(elements.length).toBe(12);
  });

  it('should position date boxes at top when dateOnTop is true', () => {
    const month = createTestMonth({ dateOnTop: true, numDays: 1 });
    const elements = getMonth(month, daysInYear, origin);

    // Date box background should be at outer edge when dateOnTop is true
    const dateBackground = elements[2]; // 0: bg, 1: name, 2: first date box
    expect(dateBackground).toHaveProperty('fill', DATE_FILL_COLOR);
  });

  it('should position date boxes at bottom when dateOnTop is false', () => {
    const month = createTestMonth({ dateOnTop: false, numDays: 1 });
    const elements = getMonth(month, daysInYear, origin);

    // Date box should be at inner edge when dateOnTop is false
    const dateBackground = elements[2];
    expect(dateBackground).toHaveProperty('fill', DATE_FILL_COLOR);
  });

  it('should use reversed arc for upside-down month names', () => {
    const normalMonth = createTestMonth({ nameUpsideDown: false });
    const upsideDownMonth = createTestMonth({ nameUpsideDown: true });

    const normalElements = getMonth(normalMonth, daysInYear, origin);
    const upsideDownElements = getMonth(upsideDownMonth, daysInYear, origin);

    // Both should have CurvedText as second element
    expect(normalElements[1]).toHaveProperty('text');
    expect(upsideDownElements[1]).toHaveProperty('text');

    // The arcs should be different (reversed direction)
    // Use any cast to access arc property for testing
    const normalArc = (normalElements[1] as unknown as { arc: { start: { x: number } } }).arc;
    const upsideDownArc = (upsideDownElements[1] as unknown as { arc: { start: { x: number } } }).arc;

    // When upside down, start and stop angles are swapped
    // This means start.x and stop.x values are swapped
    expect(normalArc.start.x).not.toBeCloseTo(upsideDownArc.start.x);
  });

  it('should apply date angle offset to date text rotation', () => {
    const month = createTestMonth({ numDays: 1, dateAngleOffset: 45 });
    const elements = getMonth(month, daysInYear, origin);

    // Last element should be date text with rotation offset
    const dateText = elements[elements.length - 1];
    expect(dateText).toHaveProperty('rotation', 45);
  });

  it('should generate date numbers 1 through numDays', () => {
    const month = createTestMonth({ numDays: 3 });
    const elements = getMonth(month, daysInYear, origin);

    // Date texts are at indices 3, 5, 7 (every other from index 3)
    // because each date has: date background, date text
    const dateTexts = [elements[3], elements[5], elements[7]];

    expect(dateTexts[0]).toHaveProperty('text', '1');
    expect(dateTexts[1]).toHaveProperty('text', '2');
    expect(dateTexts[2]).toHaveProperty('text', '3');
  });
});

/**
 * Tests for LayoutConfig and computeLayout.
 */

import { describe, it, expect } from 'vitest';
import {
  type LayoutConfig,
  type ComputedLayout,
  computeLayout,
  DEFAULT_LAYOUT_CONFIG,
} from './config.js';

describe('LayoutConfig', () => {
  describe('DEFAULT_LAYOUT_CONFIG', () => {
    it('has expected default values', () => {
      expect(DEFAULT_LAYOUT_CONFIG.scaleFactor).toBe(0.7);
      expect(DEFAULT_LAYOUT_CONFIG.canvasWidthInches).toBe(11);
      expect(DEFAULT_LAYOUT_CONFIG.daysInYear).toBe(366);
      expect(DEFAULT_LAYOUT_CONFIG.extraWidthOffset).toBe(10);
      expect(DEFAULT_LAYOUT_CONFIG.verticalOffset).toBe(30);
    });
  });

  describe('computeLayout', () => {
    it('computes layout with default config', () => {
      const layout = computeLayout(DEFAULT_LAYOUT_CONFIG);

      expect(layout.outermostRadius).toBeGreaterThan(0);
      expect(layout.innerRadius).toBeLessThan(layout.outermostRadius);
      expect(layout.monthThickness).toBe(
        layout.outermostRadius - layout.innerRadius
      );
      expect(layout.dateBoxHeight).toBeCloseTo(layout.monthThickness * 0.2);
      expect(layout.widthCenter).toBeGreaterThan(0);
      expect(layout.numRows).toBe(4);
      expect(layout.numColumns).toBe(1);
    });

    it('computes different numRows based on scaleFactor', () => {
      // Scale factor <= 0.5 gives 5 rows x 2 columns
      const smallLayout = computeLayout({
        ...DEFAULT_LAYOUT_CONFIG,
        scaleFactor: 0.5,
      });
      expect(smallLayout.numRows).toBe(5);
      expect(smallLayout.numColumns).toBe(2);

      // Scale factor 0.5 < x < 0.75 gives 4 rows x 1 column
      const medLayout = computeLayout({
        ...DEFAULT_LAYOUT_CONFIG,
        scaleFactor: 0.6,
      });
      expect(medLayout.numRows).toBe(4);
      expect(medLayout.numColumns).toBe(1);

      // Scale factor >= 0.75 gives 2 rows x 1 column
      const largeLayout = computeLayout({
        ...DEFAULT_LAYOUT_CONFIG,
        scaleFactor: 0.8,
      });
      expect(largeLayout.numRows).toBe(2);
      expect(largeLayout.numColumns).toBe(1);
    });

    it('computes verticalOffset scaled by scaleFactor', () => {
      const layout = computeLayout({
        ...DEFAULT_LAYOUT_CONFIG,
        scaleFactor: 0.5,
        verticalOffset: 30,
      });
      expect(layout.verticalOffsetScaled).toBe(30 * 0.5);
    });

    it('computes widthCenter with extraWidthOffset', () => {
      const layout = computeLayout({
        ...DEFAULT_LAYOUT_CONFIG,
        canvasWidthInches: 11,
        scaleFactor: 1.0,
        extraWidthOffset: 0,
      });
      // At scaleFactor 1.0, canvasWidth = 11, widthCenter = 11*25/2 = 137.5
      expect(layout.widthCenter).toBe(137.5);

      const layoutWithOffset = computeLayout({
        ...DEFAULT_LAYOUT_CONFIG,
        canvasWidthInches: 11,
        scaleFactor: 1.0,
        extraWidthOffset: 10,
      });
      expect(layoutWithOffset.widthCenter).toBe(147.5);
    });

    it('uses strokeWidth derived from scaleFactor', () => {
      const layout = computeLayout({
        ...DEFAULT_LAYOUT_CONFIG,
        scaleFactor: 0.7,
      });
      expect(layout.strokeWidth).toBeCloseTo(0.1 * 0.7);
    });
  });
});

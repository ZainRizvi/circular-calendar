/**
 * Renderer exports.
 *
 * This module provides different SVG rendering strategies.
 * Each renderer implements the SvgRenderer interface from lib/types.
 */

// Node.js renderer using resvg-js
export * from './resvg-renderer.ts';

// Font loading utilities
export * from './fonts.ts';

// Re-export types for convenience
export type { SvgRenderer, SvgRenderResult } from '../lib/types.ts';

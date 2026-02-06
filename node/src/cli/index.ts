#!/usr/bin/env node
/**
 * CLI entry point for circular calendar generation.
 */

import { parseArgs, getAlignmentFromArgs } from './args.js';
import { runPipeline, cleanupIntermediateFiles } from './pipeline.js';
import { DEFAULT_LAYOUT_CONFIG } from '../lib/index.js';

async function main(): Promise<void> {
  // Parse arguments
  const args = parseArgs(process.argv.slice(2));
  const alignment = getAlignmentFromArgs(args);

  // Run pipeline with default config
  const result = await runPipeline({
    config: DEFAULT_LAYOUT_CONFIG,
    alignment,
    outputDir: 'out',
    verbose: true,
  });

  // Clean up intermediate files
  await cleanupIntermediateFiles(result.intermediateFiles);

  console.log('Done!');
  console.log(`Scale factor: ${DEFAULT_LAYOUT_CONFIG.scaleFactor}`);
}

// Run main if executed directly
const isMain =
  process.argv[1]?.endsWith('cli/index.ts') ||
  process.argv[1]?.endsWith('cli/index.js');

if (isMain) {
  main().catch((err) => {
    console.error('Error:', err);
    process.exit(1);
  });
}

export { main };

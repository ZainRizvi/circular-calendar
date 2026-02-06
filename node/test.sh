#!/bin/bash
set -e

cd "$(dirname "$0")"

echo "=== Running TypeScript type check ==="
npm run typecheck

echo ""
echo "=== Running tests ==="
npm test

echo ""
echo "=== All checks passed! ==="

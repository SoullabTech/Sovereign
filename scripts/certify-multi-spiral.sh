#!/usr/bin/env bash
# scripts/certify-multi-spiral.sh
# Multi-Spiral State Certification (MS1-MS5)
# Runs TypeScript certification tests for multi-spiral hardening

set -euo pipefail

npx tsx scripts/certify-multi-spiral.ts

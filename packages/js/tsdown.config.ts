import { defineConfig } from 'tsdown'

export default defineConfig({
  entry: ['src/index.ts'],
  format: ['esm'],
  dts: true,
  clean: true,
  publint: true,
  // ESM-only package: validate with `pnpm lint:package` (attw --profile esm-only).
  attw: false,
})
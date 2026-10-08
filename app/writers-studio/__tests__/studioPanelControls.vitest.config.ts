import { defineConfig } from 'vitest/config';
import { transformWithOxc } from 'vite';
import { resolve } from 'node:path';

// Scoped test harness for Studio's real React shell; the repo's default Vitest
// command intentionally has no Next.js alias resolution.
export default defineConfig({
  plugins: [{
    name: 'studio-shell-tsx',
    enforce: 'pre',
    async transform(code, id) {
      if (!id.endsWith('.tsx')) return null;
      return transformWithOxc(code, id, { lang: 'tsx', jsx: 'automatic' });
    },
  }],
  resolve: { alias: { '@': resolve(process.cwd()) } },
  test: {
    globals: true,
    environment: 'jsdom',
    include: [
      'app/writers-studio/__tests__/studioPanelControls.test.tsx',
      'app/writers-studio/__tests__/p4r1ProseView.test.ts',
    ],
  },
});

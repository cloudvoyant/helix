import { defineConfig } from 'tsup';

export default defineConfig({
  entry: ['src/index.ts'],
  format: ['esm', 'cjs'],
  dts: true,
  clean: true,
  external: [
    'react',
    'react-dom',
    'react/jsx-runtime',
    '@ark-ui/react',
    '@cloudvoyant/vortex-ui',
    'mermaid',
    'katex',
    'shiki',
    'recharts',
    'manim-web',
    '@tanstack/charts',
    '@phosphor-icons/react',
    '@tanstack/react-virtual',
  ],
});

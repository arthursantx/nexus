/// <reference types="vitest" />
import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

// Publicado no GitHub Pages em https://arthursantx.github.io/nexus/
export default defineConfig({
  base: '/nexus/',
  plugins: [react()],
  test: { environment: 'node' },
});

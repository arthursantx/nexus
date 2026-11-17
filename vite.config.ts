/// <reference types="vitest" />
import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import type { Plugin } from 'vite';

// Política de segurança de conteúdo aplicada só no build publicado (o modo dev do Vite usa scripts inline).
// O GitHub Pages não permite cabeçalhos próprios, então a política vai em <meta>.
// O vlibras.gov.br redireciona os arquivos do widget para a jsDelivr (repositório oficial spbgovbr-vlibras).
const VLIBRAS = 'https://vlibras.gov.br https://*.vlibras.gov.br https://cdn.jsdelivr.net/gh/spbgovbr-vlibras/';
const CSP = [
  "default-src 'self'",
  `script-src 'self' 'wasm-unsafe-eval' ${VLIBRAS}`,
  `style-src 'self' 'unsafe-inline' https://fonts.googleapis.com ${VLIBRAS}`,
  `font-src 'self' data: https://fonts.gstatic.com ${VLIBRAS}`,
  `img-src 'self' data: blob: ${VLIBRAS}`,
  `media-src 'self' blob: ${VLIBRAS}`,
  `connect-src 'self' ${VLIBRAS}`,
  `frame-src ${VLIBRAS}`,
  `worker-src 'self' blob: ${VLIBRAS}`,
  "object-src 'none'",
  "base-uri 'self'",
  "form-action 'self'",
  'upgrade-insecure-requests',
].join('; ');

function seguranca(): Plugin {
  return {
    name: 'nexus-seguranca',
    apply: 'build',
    transformIndexHtml(html) {
      return html.replace(
        '<meta name="viewport"',
        `<meta http-equiv="Content-Security-Policy" content="${CSP}" />\n    <meta name="referrer" content="strict-origin-when-cross-origin" />\n    <meta name="viewport"`,
      );
    },
  };
}

// Publicado no GitHub Pages em https://arthursantx.github.io/nexus/
export default defineConfig({
  base: '/nexus/',
  plugins: [react(), seguranca()],
  test: { environment: 'node' },
});

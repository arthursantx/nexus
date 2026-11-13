import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import App from './App';
import { ProvedorLoja } from './dados/loja';
import './estilos.css';

createRoot(document.getElementById('raiz')!).render(
  <StrictMode>
    <ProvedorLoja>
      <App />
    </ProvedorLoja>
  </StrictMode>,
);

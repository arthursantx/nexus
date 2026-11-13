import { StrictMode, useState } from 'react';
import { createRoot } from 'react-dom/client';
import App from './App';
import { ProvedorLoja } from './dados/loja';
import { aplicarIdioma, idiomaInicial } from './i18n/motor';
import { ContextoIdioma } from './i18n/contexto';
import { aplicarPreferenciasSalvas } from './componentes/Acessibilidade';
import type { Idioma } from './dominio/rotulos';
import './estilos.css';

aplicarIdioma(idiomaInicial());
aplicarPreferenciasSalvas();

function Raiz() {
  const [idioma, setIdioma] = useState<Idioma>(idiomaInicial());
  const trocar = (i: Idioma) => {
    aplicarIdioma(i);
    setIdioma(i);
  };
  return (
    <ContextoIdioma.Provider value={{ idioma, trocar }}>
      <ProvedorLoja>
        <App key={idioma} />
      </ProvedorLoja>
    </ContextoIdioma.Provider>
  );
}

createRoot(document.getElementById('raiz')!).render(
  <StrictMode>
    <Raiz />
  </StrictMode>,
);

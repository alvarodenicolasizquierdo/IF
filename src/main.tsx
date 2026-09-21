// Self-hosted fonts: a client roadshow may run offline or behind a guest
// network that blocks font CDNs, and the console must never fall back mid-demo.
// Manrope and Instrument Serif stand in for Avenga's licensed Haffer and
// Reckless — swap both here and in tailwind.config.js once the licences land.
import '@fontsource/manrope/400.css';
import '@fontsource/manrope/500.css';
import '@fontsource/manrope/600.css';
import '@fontsource/manrope/700.css';
import '@fontsource/manrope/800.css';
import '@fontsource/instrument-serif/400.css';
import '@fontsource/jetbrains-mono/400.css';
import '@fontsource/jetbrains-mono/500.css';
import '@fontsource/jetbrains-mono/700.css';

import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './App';
import { StageRoot } from './stage/StageRoot';
import './index.css';

/*
 * Two surfaces, one build. The console is the presales tool; Stage Mode is the
 * surface the Prague cuts are recorded from. They share this bundle so they
 * cannot drift into looking like two different products, which is the whole
 * reason Stage Mode is not a separate app.
 *
 * The switch is on the hash rather than the path because the console also
 * ships as one file that opens from a USB stick with the network off, and
 * path routing does not survive file://.
 */
const isStage = window.location.hash.startsWith('#/stage');

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>{isStage ? <StageRoot /> : <App />}</React.StrictMode>,
);

// Entering or leaving Stage Mode swaps the whole surface, so it is a reload
// rather than a re-render: the two share tokens but not layout assumptions.
window.addEventListener('hashchange', () => {
  if (window.location.hash.startsWith('#/stage') !== isStage) window.location.reload();
});

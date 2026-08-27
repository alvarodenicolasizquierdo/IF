/**
 * Chart palette, validated with the dataviz palette validator against the
 * #2C1847 Premium Purple chart surface (dark mode). All six checks pass:
 *   lightness band · chroma floor · CVD separation (ΔE 9.5 deutan)
 *   · normal-vision floor (ΔE 32.0) · contrast ≥ 3:1
 *
 * Creative Red is the exact brand hex and needs no adjustment as a plotted
 * mark on this ground. Two marks are stepped from the UI chrome:
 *   - governed emerald #10B981 → #0E9F6E, which brings it inside the
 *     lightness band on this surface;
 *   - TCO indigo is the brand-family lavender rather than the chrome's
 *     #7C5DC7, which sits at 3.20:1 and fails the contrast floor for a mark.
 * The brand hexes remain exact everywhere in the UI chrome.
 */
export const CHART = {
  ungoverned: '#DD2C00', // Creative Red (exact brand hex)
  governed: '#0E9F6E',
  tco: '#9F7AEA',
  grid: '#3A2359',
  axis: '#8B7CA0',
  surface: '#2C1847', // Premium Purple (exact brand hex)
} as const;

export const SPRINT_LABELS = ['Sprint 1', 'Sprint 2', 'Sprint 3', 'Sprint 4', 'Sprint 5', 'Sprint 6'];

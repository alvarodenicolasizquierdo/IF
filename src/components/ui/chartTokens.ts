/**
 * Chart palette, validated with the dataviz palette validator against the
 * #111827 chart surface (dark mode). All six checks pass:
 *   lightness band · chroma floor · CVD separation (ΔE 8.7 deutan)
 *   · normal-vision floor (ΔE 32.7) · contrast ≥ 3:1
 *
 * Note the two deliberate deviations from the UI chrome palette:
 *   - governed emerald is deepened #10B981 → #0E9F6E, which is what brings the
 *     mark inside the lightness band on this surface;
 *   - TCO indigo is #4F46E5 → #6366F1, because #4F46E5 sits at 2.82:1 against
 *     the surface and fails the contrast floor for a plotted mark.
 * The brand hexes remain exact everywhere in the UI chrome; only plotted marks
 * are stepped, which is what the Trust Accent Spectrum reads as anyway.
 */
export const CHART = {
  ungoverned: '#DC2626',
  governed: '#0E9F6E',
  tco: '#6366F1',
  grid: '#1F2937',
  axis: '#6B7280',
  surface: '#111827',
} as const;

export const SPRINT_LABELS = ['Sprint 1', 'Sprint 2', 'Sprint 3', 'Sprint 4', 'Sprint 5', 'Sprint 6'];

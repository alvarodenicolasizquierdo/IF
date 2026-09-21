/**
 * Placeholder property imagery.
 *
 * Standing in for the six licensed photographs, which are an open item owned
 * by Alvaro for 12 September. The constraint they have to satisfy is the
 * reason this exists at all: no recognisable building and no recognisable
 * person anywhere in frame, because a real facade or a real face is a rights
 * question we have no time to answer and a distraction we do not need.
 *
 * Deterministic from the property's hue, so a frame captured today and one
 * captured after a re-render are the same image. Swap the fill for a real
 * photograph and nothing else in the build has to move.
 */
export function Photo({ hue, className, style }: { hue: number; className?: string; style?: React.CSSProperties }) {
  return (
    <div
      className={className}
      style={{
        position: 'relative',
        overflow: 'hidden',
        background: `linear-gradient(170deg,
          hsl(${hue} 38% 74%) 0%,
          hsl(${hue} 34% 58%) 42%,
          hsl(${(hue + 18) % 360} 30% 38%) 100%)`,
        ...style,
      }}
      role="img"
      aria-label="Property photograph"
    >
      {/* Two soft landforms and a light source. Enough to read as a place at
       *  a glance without ever resembling somewhere a person could name. */}
      <div
        style={{
          position: 'absolute', inset: 0,
          background: `radial-gradient(120% 80% at 78% 18%, hsl(${hue} 55% 88% / 0.55) 0%, transparent 55%)`,
        }}
      />
      <div
        style={{
          position: 'absolute', left: '-12%', right: '-12%', bottom: '-18%', height: '58%',
          borderRadius: '50% 50% 0 0 / 100% 100% 0 0',
          background: `hsl(${(hue + 12) % 360} 26% 28% / 0.85)`,
        }}
      />
      <div
        style={{
          position: 'absolute', left: '-30%', right: '38%', bottom: '-24%', height: '46%',
          borderRadius: '50% 50% 0 0 / 100% 100% 0 0',
          background: `hsl(${(hue + 24) % 360} 22% 20% / 0.9)`,
        }}
      />
    </div>
  );
}

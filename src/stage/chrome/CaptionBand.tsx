/**
 * The caption band — TalkTrack 4.5, part four.
 *
 * Captions are burned into the export rather than overlaid by a player, so
 * they cannot desynchronise from the frame. They are never spoken aloud, and
 * that is what buys Petyo the silence: if the frame explains itself he can
 * stop narrating and let a working demo do the work, which is the most
 * confident thing available to him on that stage.
 *
 * Ten words is the ceiling. Past that the band stops being a caption and
 * starts being something the room has to read instead of watching.
 */
export function CaptionBand({ text, visible = true }: { text: string; visible?: boolean }) {
  if (import.meta.env.DEV && text.trim().split(/\s+/).length > 10) {
    console.warn(`Caption over ten words, will not read from row ten: "${text}"`);
  }

  return (
    <div
      className={visible ? 'anim-caption' : undefined}
      style={{
        position: 'absolute',
        left: 0,
        right: 0,
        bottom: 0,
        height: 132,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        background: 'color-mix(in srgb, var(--ink) 92%, transparent)',
        opacity: visible ? 1 : 0,
        // Fades independently of the frame behind it, and by opacity only:
        // a sliding band draws the eye downward at exactly the wrong moment.
        transition: 'opacity 200ms ease-out',
        zIndex: 2,
      }}
      data-testid="caption"
    >
      <p className="t-caption" style={{ color: 'var(--surface)', margin: 0, padding: '0 var(--s-6)', textAlign: 'center' }}>
        {text}
      </p>
    </div>
  );
}

import { CLIENT_CONTEXT } from '@/data/scenario';
import { cx } from './tone';

/**
 * The client's own mark, where the scenario names them.
 *
 * Resolved at build time rather than fetched by URL. That matters for the
 * single-file build: a URL the bundle asks for at runtime is a file that has
 * to sit beside it, and opening the standalone console from a USB stick then
 * throws ERR_FILE_NOT_FOUND for a logo nobody supplied. Through the glob,
 * an absent file is absent at compile time — no request, no error, straight
 * to the client's name in type — and a present one is hashed for the site and
 * inlined into the standalone copy like every other asset.
 *
 * To brand the demo for a client, drop the artwork at
 * `src/assets/client-logo.svg` (or .png). Nothing else to wire.
 */
const candidates = import.meta.glob('../../assets/client-logo.{svg,png,webp}', {
  eager: true,
  query: '?url',
  import: 'default',
});

const LOGO_URL = Object.values(candidates)[0] as string | undefined;

export function ClientLogo({
  className,
  invert = true,
}: {
  className?: string;
  /**
   * The supplied artwork is a dark mark on a transparent ground and this
   * canvas is near-black, so it is flipped to read. Pass false if a client
   * ever provides a light version instead.
   */
  invert?: boolean;
}) {
  if (!LOGO_URL) {
    return (
      <span className="truncate font-mono text-[13px] text-ink-muted" title={CLIENT_CONTEXT.client}>
        {CLIENT_CONTEXT.client}
      </span>
    );
  }

  return (
    <img
      src={LOGO_URL}
      alt={CLIENT_CONTEXT.client}
      className={cx('w-auto object-contain object-left', invert && 'invert', className)}
    />
  );
}

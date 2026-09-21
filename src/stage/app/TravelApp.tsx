import { APP_NAME, PROPERTIES, type FeatureId, type Property } from '../data';
import { Photo } from './Photo';

export type AppScreen = 'search' | 'results' | 'property' | 'confirmation';
export type AppState = 'before' | 'after';

/**
 * The demo application — TalkTrack 4.5, part two.
 *
 * It replaces the billing engine the console runs today, which was too
 * abstract to carry a keynote and, worse, put the talk and the demo on
 * different software. A travel booking site is something everybody in the
 * room has used, which means the change they vote for lands without anybody
 * having to explain what they are looking at.
 *
 * `state` is what shot 3.1 turns on: 'before' is the application in cut one,
 * 'after' carries the feature the room chose. Both render from the same
 * component at the same scale and crop, which is an acceptance criterion —
 * the two exported frames have to overlay exactly or the room cannot see
 * that it is the same screen.
 */
export function TravelApp({
  screen,
  feature,
  state = 'before',
  index = 0,
  priceMode = 'total',
  filtered = false,
}: {
  screen: AppScreen;
  feature: FeatureId;
  state?: AppState;
  /** Which card is on top of the stack. */
  index?: number;
  /** Feature A only. */
  priceMode?: 'total' | 'nightly';
  /** Feature B only. */
  filtered?: boolean;
}) {
  const stack = filtered && state === 'after' && feature === 'B'
    ? PROPERTIES.filter((p) => p.freeCancellation)
    : PROPERTIES;

  return (
    <div style={{ position: 'absolute', inset: 0, background: 'var(--surface)', color: 'var(--ink)' }}>
      <Header />
      {screen === 'search' && <SearchScreen />}
      {screen === 'results' && (
        <ResultsScreen
          stack={stack}
          index={Math.min(index, stack.length - 1)}
          feature={feature}
          state={state}
          priceMode={priceMode}
          filtered={filtered}
        />
      )}
      {screen === 'property' && (
        <PropertyScreen
          property={stack[Math.min(index, stack.length - 1)]}
          feature={feature}
          state={state}
          priceMode={priceMode}
        />
      )}
      {screen === 'confirmation' && <ConfirmationScreen property={stack[Math.min(index, stack.length - 1)]} />}
    </div>
  );
}

/** 120px, carrying the mark and nothing else. An unbranded app reads as a
 *  prototype and quietly undercuts the claim that any of this is real. */
function Header() {
  return (
    <header
      style={{
        position: 'absolute', top: 0, left: 0, right: 0, height: 120,
        display: 'flex', alignItems: 'center', padding: '0 var(--s-6)',
        borderBottom: '1px solid var(--border)', background: 'var(--surface)', zIndex: 2,
      }}
    >
      <span className="t-title" style={{ letterSpacing: '-0.02em' }}>
        {APP_NAME}
      </span>
    </header>
  );
}

function SearchScreen() {
  return (
    <>
      <Photo hue={205} style={{ position: 'absolute', top: 120, left: 0, right: 0, bottom: 0 }} />
      <div
        style={{
          position: 'absolute', top: '52%', left: '50%', transform: 'translate(-50%, -50%)',
          width: 1100, background: 'var(--surface)', borderRadius: 'var(--r-panel)',
          border: '1px solid var(--border)', padding: 'var(--s-4)',
          display: 'flex', alignItems: 'flex-end', gap: 'var(--s-3)',
        }}
      >
        <Field label="Where to" value="Coastal Europe" grow />
        <Field label="Dates" value="4 – 8 Nov" />
        <Field label="Guests" value="2" />
        <button
          type="button"
          className="t-body"
          style={{
            background: 'var(--ink)', color: 'var(--surface)', border: 0,
            borderRadius: 'var(--r-panel)', padding: '22px 44px', fontWeight: 600, cursor: 'pointer',
          }}
        >
          Search
        </button>
      </div>
    </>
  );
}

function Field({ label, value, grow }: { label: string; value: string; grow?: boolean }) {
  return (
    <div style={{ flex: grow ? 1 : undefined }}>
      <div className="t-meta" style={{ marginBottom: 'var(--s-1)' }}>{label}</div>
      <div
        className="t-body"
        style={{
          border: '1px solid var(--border)', borderRadius: 'var(--r-panel)',
          padding: '18px var(--s-3)', minWidth: 180,
        }}
      >
        {value}
      </div>
    </div>
  );
}

/**
 * The card browser. It stays in the baseline rather than being one of the two
 * candidate features, and the reasoning is worth keeping next to the code: a
 * new gesture plus its animation is a large build, a swipe does not read from
 * row ten on a recorded desktop capture, and — the one that actually decided
 * it — a swipe has no governance surface. Nobody believes a card animation
 * needs an approval gate. Pricing does.
 */
function ResultsScreen({
  stack, index, feature, state, priceMode, filtered,
}: {
  stack: Property[]; index: number; feature: FeatureId; state: AppState;
  priceMode: 'total' | 'nightly'; filtered: boolean;
}) {
  const property = stack[index];
  const showFilter = state === 'after' && feature === 'B';

  return (
    <div
      style={{
        position: 'absolute', top: 120, left: 0, right: 0, bottom: 0,
        background: 'var(--panel)',
        display: 'grid', placeItems: 'center',
      }}
    >
      {/*
        * The card is 900px tall and the area below the header is 960, so the
        * filter and the counter cannot sit in flow with it — they would push
        * the card off the frame. They are pinned to the area instead, which
        * also keeps the card landing on identical pixels in the before and
        * after frames, and that overlay is an acceptance criterion.
        */}
      {showFilter && (
        <div
          className="t-body"
          style={{
            position: 'absolute', top: 'var(--s-3)', left: '50%', transform: 'translateX(-50%)',
            border: '1px solid var(--border)', background: filtered ? 'var(--ink)' : 'var(--surface)',
            color: filtered ? 'var(--surface)' : 'var(--ink)',
            borderRadius: 'var(--r-pill)', padding: '10px 32px',
          }}
          data-testid="cancellation-filter"
        >
          Free cancellation only
        </div>
      )}

      <PropertyCard
        property={property}
        feature={feature}
        state={state}
        priceMode={priceMode}
      />

      <div
        className="t-meta"
        style={{ position: 'absolute', bottom: 'var(--s-2)', left: '50%', transform: 'translateX(-50%)' }}
        data-testid="stack-counter"
      >
        {index + 1} of {stack.length}
      </div>
    </div>
  );
}

function PropertyCard({
  property, feature, state, priceMode,
}: { property: Property; feature: FeatureId; state: AppState; priceMode: 'total' | 'nightly' }) {
  const showBadge = state === 'after' && feature === 'B' && property.freeCancellation;
  const showToggle = state === 'after' && feature === 'A';

  return (
    <div
      style={{
        width: 760, height: 900, background: 'var(--surface)',
        border: '1px solid var(--border)', borderRadius: 'var(--r-panel)',
        overflow: 'hidden', display: 'flex', flexDirection: 'column',
      }}
      data-testid="property-card"
    >
      <div style={{ position: 'relative', height: 520, flexShrink: 0 }}>
        <Photo hue={property.hue} style={{ position: 'absolute', inset: 0 }} />
        {showBadge && (
          <div
            className="t-meta"
            style={{
              position: 'absolute', top: 16, left: 16,
              background: 'var(--surface)', border: '1px solid var(--border)',
              borderRadius: 'var(--r-panel)', padding: '10px 20px', color: 'var(--ink)',
            }}
            data-testid="cancellation-badge"
          >
            Free cancellation
          </div>
        )}
      </div>

      <div style={{ padding: 'var(--s-4)', display: 'flex', flexDirection: 'column', gap: 'var(--s-2)', flex: 1 }}>
        <div className="t-title">{property.name}</div>
        <div className="t-meta" style={{ letterSpacing: '0.08em' }}>★★★★☆</div>
        <div className="t-meta">{property.location}</div>
        <div style={{ marginTop: 'auto' }}>
          <PriceBlock property={property} showToggle={showToggle} priceMode={priceMode} />
        </div>
      </div>
    </div>
  );
}

/**
 * Feature A's after-state. The figure cross fades in place and nothing else on
 * the card moves — the point the room has to be able to see is that this is a
 * small, contained change, which is exactly why it was a believable thing to
 * have built inside the elapsed time on the clock.
 */
function PriceBlock({
  property, showToggle, priceMode,
}: { property: Property; showToggle: boolean; priceMode: 'total' | 'nightly' }) {
  const nightly = showToggle && priceMode === 'nightly';

  return (
    <div>
      <div
        className="t-display"
        style={{ transition: 'opacity 200ms ease-out' }}
        key={nightly ? 'nightly' : 'total'}
        data-testid="price"
      >
        €{nightly ? property.nightly : property.total}
        <span className="t-meta" style={{ marginLeft: 'var(--s-2)' }}>
          {nightly ? 'per night' : 'total, 4 nights'}
        </span>
      </div>

      {showToggle && (
        <div
          style={{
            marginTop: 'var(--s-3)', width: 280, display: 'flex',
            border: '1px solid var(--border)', borderRadius: 'var(--r-pill)', overflow: 'hidden',
          }}
          data-testid="price-toggle"
        >
          <Half label="Total" active={!nightly} />
          <Half label="Per night" active={nightly} />
        </div>
      )}
    </div>
  );
}

function Half({ label, active }: { label: string; active: boolean }) {
  return (
    <div
      className="t-meta"
      style={{
        flex: 1, textAlign: 'center', padding: '14px 0',
        background: active ? 'var(--ink)' : 'transparent',
        color: active ? 'var(--surface)' : 'var(--muted)',
        fontWeight: active ? 600 : 400,
      }}
    >
      {label}
    </div>
  );
}

function PropertyScreen({
  property, feature, state, priceMode,
}: { property: Property; feature: FeatureId; state: AppState; priceMode: 'total' | 'nightly' }) {
  return (
    <div style={{ position: 'absolute', top: 120, left: 0, right: 0, bottom: 0, background: 'var(--surface)' }}>
      <Photo hue={property.hue} style={{ position: 'absolute', top: 0, left: 0, right: 0, height: 420 }} />
      <div style={{ position: 'absolute', top: 420, left: 'var(--s-6)', right: 'var(--s-6)', paddingTop: 'var(--s-4)' }}>
        <div className="t-title">{property.name}</div>
        <div className="t-meta" style={{ marginTop: 'var(--s-1)' }}>{property.location}  ·  4 – 8 Nov  ·  2 guests</div>
        <p className="t-body" style={{ maxWidth: 1100, marginTop: 'var(--s-3)' }}>
          A quiet house a short walk from the water, with room for two and a long table for
          breakfast. Kept by the same family for thirty years.
        </p>
        <div style={{ marginTop: 'var(--s-4)', display: 'flex', alignItems: 'flex-end', gap: 'var(--s-5)' }}>
          <PriceBlock
            property={property}
            showToggle={state === 'after' && feature === 'A'}
            priceMode={priceMode}
          />
          <button
            type="button"
            className="t-body"
            style={{
              background: 'var(--ink)', color: 'var(--surface)', border: 0,
              borderRadius: 'var(--r-panel)', padding: '22px 56px', fontWeight: 600, cursor: 'pointer',
            }}
          >
            Book
          </button>
        </div>
      </div>
    </div>
  );
}

function ConfirmationScreen({ property }: { property: Property }) {
  return (
    <div
      style={{
        position: 'absolute', top: 120, left: 0, right: 0, bottom: 0,
        display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center',
        gap: 'var(--s-3)', background: 'var(--panel)',
      }}
    >
      <div className="t-display">Booked</div>
      <div className="t-body">{property.name}, {property.location}</div>
      <div className="t-meta">Reference NB-4471  ·  4 – 8 Nov  ·  2 guests</div>
    </div>
  );
}

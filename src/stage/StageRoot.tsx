import { useEffect, useState } from 'react';
import './tokens.css';

import { ClockHUD } from './chrome/ClockHUD';
import { PhaseRail } from './chrome/PhaseRail';
import { CaptionBand } from './chrome/CaptionBand';
import { ClaimBadge } from './chrome/ClaimBadge';
import { TravelApp, type AppScreen, type AppState } from './app/TravelApp';
import { GatePanel } from './screens/GatePanel';
import { SpecDocument } from './screens/SpecDocument';
import { EvidencePack } from './screens/EvidencePack';
import { ELAPSED, type ClaimState, type FeatureId, type Phase } from './data';

/**
 * Stage Mode — a second surface on the console's codebase, not a second
 * product. Same repository, same fonts, same build; one idea per frame
 * instead of a dashboard.
 *
 * Routing is on the hash rather than the path for one practical reason: the
 * console ships as a single file that has to open from a USB stick with the
 * network off, and path routing does not survive file://. So the spec's
 * /stage/gate is reached here as #/stage/gate.
 *
 * Everything is authored at exactly 1920 by 1080 and scaled to fit whatever
 * it is being previewed in, so a laptop review and the captured frame are the
 * same frame. Capture at 1920 by 1080 and the scale is 1.
 */
export function StageRoot() {
  const route = useHashRoute();
  const params = new URLSearchParams(route.query);

  const feature = (params.get('feature') === 'B' ? 'B' : 'A') as FeatureId;
  const claim = (params.get('claim') ?? 'now') as ClaimState;
  const caption = params.get('caption') ?? '';
  const phase = (params.get('phase') ?? 'build') as Phase;
  const chrome = params.get('chrome') !== 'off';

  /*
   * Not every screen carries every piece of chrome, and the two exceptions are
   * both the spec's own.
   *
   * The application is shown "full bleed, no chrome of any kind" in shot 1.1,
   * and the clock does not start until 1.4 — a rail over the product in the
   * first twenty seconds would answer a question the room has not asked yet.
   *
   * The two document screens drop the rail. A five-phase progress indicator
   * laid over a document the audience is being asked to read competes with the
   * reading, and the phase is not what those frames are about. Everything else
   * persists, the caption and the claim badge included.
   */
  const bare = route.screen === 'app';
  const document_ = route.screen === 'spec' || route.screen === 'pack';

  const scale = useFitScale();

  if (route.screen === 'index') return <StageIndex />;

  const dark = route.screen !== 'spec' && route.screen !== 'pack';

  return (
    <div className="stage" style={{ ['--stage-scale' as string]: scale }}>
      <div className={`stage-frame${dark ? '' : route.screen === 'pack' ? ' stage-frame--panel' : ' stage-frame--light'}`}>
        {route.screen === 'app' && (
          <TravelApp
            screen={(params.get('screen') ?? 'results') as AppScreen}
            feature={feature}
            state={(params.get('app') ?? 'before') as AppState}
            index={Number(params.get('index') ?? 0)}
            priceMode={params.get('price') === 'nightly' ? 'nightly' : 'total'}
            filtered={params.get('filtered') === '1'}
          />
        )}

        {route.screen === 'gate' && (
          <GatePanel state={params.get('state') === 'passed' ? 'passed' : 'refused'} feature={feature} />
        )}

        {route.screen === 'spec' && (
          <div style={{ position: 'absolute', top: 'var(--s-6)', left: 0, right: 0, bottom: 132, display: 'grid', placeItems: 'center' }}>
            <SpecDocument feature={feature} />
          </div>
        )}

        {route.screen === 'pack' && (
          <div
            style={{
              position: 'absolute', top: 'var(--s-6)', left: 0, right: 0, bottom: 132,
              display: 'flex', justifyContent: 'center', overflow: 'hidden',
            }}
          >
            <EvidencePack feature={feature} offset={Number(params.get('offset') ?? 0)} />
          </div>
        )}

        {route.screen === 'clock' && (
          <ClockHUD
            value={Number(params.get('ms') ?? ELAPSED.final)}
            state={(params.get('clock') ?? 'stopped') as 'running' | 'jumping' | 'stopped'}
            from={Number(params.get('from') ?? 0)}
            standalone
            scale={4}
          />
        )}

        {/* Persistent chrome. The claim badge has no exceptions, which is why
         *  it is outside every conditional above. */}
        {chrome && route.screen !== 'clock' && !bare && (
          <>
            {!document_ && <PhaseRail current={phase} tone={dark ? 'dark' : 'light'} />}
            <ClockHUD
              value={Number(params.get('ms') ?? ELAPSED.specReview)}
              state={(params.get('clock') ?? 'running') as 'running' | 'jumping' | 'stopped'}
            />
          </>
        )}
        {chrome && <ClaimBadge state={claim} />}
        {chrome && caption && <CaptionBand text={caption} />}
      </div>
    </div>
  );
}

/** Screens that exist today. The rest of part five follows in build order. */
const BUILT = [
  { hash: '#/stage/app?screen=search&claim=now&caption=A real application', label: 'STAGE-01  The application, search' },
  { hash: '#/stage/app?screen=results&claim=now', label: 'STAGE-01  The card browser' },
  { hash: '#/stage/app?screen=results&app=after&feature=A&price=nightly&claim=building', label: 'STAGE-10  After, feature A' },
  { hash: '#/stage/app?screen=results&app=after&feature=B&filtered=1&claim=building', label: 'STAGE-10  After, feature B' },
  { hash: '#/stage/spec?feature=A&claim=building&caption=The machine wrote this from one sentence', label: 'STAGE-06  The specification' },
  { hash: '#/stage/gate?state=refused&claim=building&caption=Refused: this change does not say which requirement it serves', label: 'STAGE-08  The gate, refused' },
  { hash: '#/stage/gate?state=passed&claim=building&caption=Same change. Now it can prove what it is for.', label: 'STAGE-08  The gate, passed' },
  { hash: '#/stage/pack?feature=A&claim=building&caption=Requirement. Decisions. Checks. Tests. Approvals.', label: 'STAGE-12  The Evidence Pack' },
  { hash: '#/stage/clock?ms=707000&clock=stopped', label: 'STAGE-11  The clock alone' },
];

function StageIndex() {
  return (
    <div className="stage" style={{ position: 'static', background: '#2B2622', minHeight: '100vh', padding: 64, color: '#fff' }}>
      <h1 className="t-title" style={{ margin: 0 }}>Stage Mode</h1>
      <p className="t-body" style={{ color: 'var(--muted)', marginTop: 8 }}>
        Frames are authored at 1920 by 1080. Capture at that size and the scale is 1.
      </p>
      <ul style={{ listStyle: 'none', padding: 0, marginTop: 40, display: 'grid', gap: 12 }}>
        {BUILT.map((s) => (
          <li key={s.hash}>
            <a className="t-body" href={s.hash} style={{ color: '#fff' }}>{s.label}</a>
          </li>
        ))}
      </ul>
    </div>
  );
}

function useHashRoute() {
  const read = () => {
    const raw = window.location.hash.replace(/^#/, '');
    const [path, query = ''] = raw.split('?');
    const seg = path.replace(/^\/stage\/?/, '');
    return { screen: seg || 'index', query };
  };
  const [route, setRoute] = useState(read);
  useEffect(() => {
    const on = () => setRoute(read());
    window.addEventListener('hashchange', on);
    return () => window.removeEventListener('hashchange', on);
  }, []);
  return route;
}

/** Fit 1920x1080 into whatever is showing it, without ever cropping. */
function useFitScale() {
  const [scale, setScale] = useState(1);
  useEffect(() => {
    const fit = () => setScale(Math.min(window.innerWidth / 1920, window.innerHeight / 1080));
    fit();
    window.addEventListener('resize', fit);
    return () => window.removeEventListener('resize', fit);
  }, []);
  return scale;
}

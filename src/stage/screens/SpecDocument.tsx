import { FEATURES, type FeatureId } from '../data';

/**
 * STAGE-06, the specification.
 *
 * The whole claim of shot 2.2 is that a machine wrote this from one sentence
 * and a person can check it. That only survives if it looks like something a
 * person would actually read, so: no monospace, no braces, no field names, no
 * schema, no JSON. Same typeface as everything else in the talk.
 *
 * It is also the first half of a pair. This component and the Evidence Pack
 * share their typographic treatment on purpose — by the time the pack appears
 * in cut three the room has already learned how to read one of these.
 */
export function SpecDocument({ feature, scale = 1 }: { feature: FeatureId; scale?: number }) {
  const f = FEATURES[feature];

  return (
    <div
      style={{
        width: 1240,
        background: 'var(--surface)',
        color: 'var(--ink)',
        border: '1px solid var(--border)',
        borderRadius: 'var(--r-panel)',
        padding: 80,
        transform: scale === 1 ? undefined : `scale(${scale})`,
        transformOrigin: 'center center',
      }}
      data-testid="spec-document"
    >
      <p className="t-meta" style={{ margin: 0, textAlign: 'right' }}>{f.requirement}</p>

      <h1 className="t-title" style={{ margin: '0 0 var(--s-4)' }}>{f.specTitle}</h1>

      <p className="t-body" style={{ margin: 0 }}>{f.specBody}</p>

      <h2 className="t-body" style={{ margin: 'var(--s-5) 0 var(--s-3)', fontWeight: 600 }}>
        This is done when
      </h2>
      <ol style={{ margin: 0, padding: 0, listStyle: 'none' }}>
        {f.doneWhen.map((item, i) => (
          <li
            key={item}
            className="t-body"
            style={{ display: 'flex', gap: 'var(--s-3)', marginBottom: 'var(--s-3)' }}
          >
            <span style={{ color: 'var(--muted)', minWidth: 32 }}>{i + 1}</span>
            <span>{item}</span>
          </li>
        ))}
      </ol>

      <h2 className="t-body" style={{ margin: 'var(--s-5) 0 var(--s-2)', fontWeight: 600 }}>
        This must not break
      </h2>
      <p className="t-body" style={{ margin: 0 }}>{f.mustNotBreak}</p>
    </div>
  );
}

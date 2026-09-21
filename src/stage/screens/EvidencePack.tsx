import { APP_LEGAL_NAME, EVIDENCE_PACK, FEATURES, GATE_COPY, PEOPLE, type FeatureId } from '../data';

/**
 * STAGE-12, the Evidence Pack.
 *
 * Rendered as a document rather than a dashboard, which is the difference
 * between something an auditor can use and something they cannot. Page
 * furniture — running header, page numbers, generous margins — is not
 * decoration here: it is the signal that carries the closing claim, that this
 * is readable without our platform and it leaves with the client.
 *
 * This same component prints. The bound copy on Petyo's lectern and the one
 * scrolling in shot 3.3 have to be visibly the same object, so there is one
 * component and not a screen version plus a print version that drift apart.
 *
 * Section three keeps the refusal, with its written reason. That detail is
 * worth an extra beat on screen: the record keeps what went wrong, not only
 * what went right, and a record that only ever shows success is not evidence.
 */
export function EvidencePack({ feature, offset = 0 }: { feature: FeatureId; offset?: number }) {
  const f = FEATURES[feature];

  return (
    <div
      style={{
        width: 1000,
        transform: `translateY(${-offset}px)`,
        transition: 'transform 600ms linear',
      }}
      data-testid="evidence-pack"
    >
      <Page n={1}>
        <div style={{ paddingTop: 120, textAlign: 'center' }}>
          <p className="t-meta" style={{ margin: 0 }}>{EVIDENCE_PACK.coverLine}</p>
          <h1 className="t-title" style={{ margin: 'var(--s-4) 0 var(--s-3)' }}>Evidence Pack</h1>
          <p className="t-body" style={{ margin: 0 }}>
            {f.requirement}  ·  {APP_LEGAL_NAME}  ·  6 October 2026
          </p>
          <p className="t-body" style={{ margin: 'var(--s-3) 0 0' }}>{f.specTitle}</p>
        </div>
      </Page>

      <Page n={2}>
        <Section n={1} title={EVIDENCE_PACK.sections[0].title} owner={EVIDENCE_PACK.sections[0].owner.name}>
          <p className="t-body" style={{ margin: 0 }}>{f.request}</p>
          <p className="t-meta" style={{ marginTop: 'var(--s-2)' }}>
            {f.requirement}  ·  raised by {f.requester.name}, {f.requester.role}, {f.timestamp}
          </p>
        </Section>

        <Section n={2} title={EVIDENCE_PACK.sections[1].title} owner={EVIDENCE_PACK.sections[1].owner.name}>
          <Row label="Specification written" value="From the request above, at 09:19" />
          <Row label="Read and approved" value={`${PEOPLE.sofia.name}, ${PEOPLE.sofia.role}, 09:24`} />
          <Row label="Scope agreed" value="One repository, one change" />
        </Section>
      </Page>

      <Page n={3}>
        <Section n={3} title={EVIDENCE_PACK.sections[2].title} owner={EVIDENCE_PACK.sections[2].owner.name}>
          {/* The refusal, kept. This is the paragraph worth holding on. */}
          <div
            style={{
              border: '1px solid var(--border)', borderLeft: '8px solid var(--accent)',
              borderRadius: 'var(--r-panel)', padding: 'var(--s-3)',
            }}
          >
            <p className="t-body" style={{ margin: 0, fontWeight: 600 }}>Refused</p>
            <p className="t-body" style={{ margin: 'var(--s-1) 0 0' }}>{GATE_COPY.refused.sentence}</p>
            <p className="t-meta" style={{ marginTop: 'var(--s-2)' }}>{GATE_COPY.refused.lines.join('  ·  ')}</p>
          </div>
          <Row label="Resubmitted with the requirement linked" value="09:51" />
          <Row label="Policy checks" value="No policy broken" />
        </Section>

        <Section n={4} title={EVIDENCE_PACK.sections[3].title} owner={EVIDENCE_PACK.sections[3].owner.name}>
          <Row label="Tests run" value="18 of 18 passed" />
          <Row label="Covering" value={f.mustNotBreak} />
        </Section>
      </Page>

      <Page n={4}>
        <Section n={5} title={EVIDENCE_PACK.sections[4].title} owner={EVIDENCE_PACK.sections[4].owner.name}>
          <Row label={`${GATE_COPY.passed.approver.role}`} value={`${GATE_COPY.passed.approver.name}, ${GATE_COPY.passed.approvedAt}`} />
          <Row label={PEOPLE.daniel.role} value={`${PEOPLE.daniel.name}, 09:58`} />
          <Row label="Released" value="6 October 2026, 09:58" />
        </Section>

        <p className="t-body" style={{ marginTop: 'var(--s-5)', textAlign: 'center' }}>
          {EVIDENCE_PACK.footer}
        </p>
      </Page>
    </div>
  );
}

/** Page furniture is what makes this read as a document rather than a panel. */
function Page({ n, children }: { n: number; children: React.ReactNode }) {
  return (
    <div
      style={{
        background: 'var(--surface)', color: 'var(--ink)',
        border: '1px solid var(--border)',
        // A 1px border rather than a shadow. Shadows read as blur on a
        // projector and cost legibility for nothing.
        padding: '64px 80px 48px',
        marginBottom: 'var(--s-4)',
        minHeight: 1180,
        display: 'flex', flexDirection: 'column',
      }}
    >
      <header
        className="t-meta"
        style={{
          display: 'flex', justifyContent: 'space-between',
          borderBottom: '1px solid var(--border)', paddingBottom: 'var(--s-2)', marginBottom: 'var(--s-4)',
        }}
      >
        <span>Evidence Pack  ·  {APP_LEGAL_NAME}</span>
        <span>6 October 2026</span>
      </header>

      <div style={{ flex: 1 }}>{children}</div>

      <footer className="t-meta" style={{ textAlign: 'center', paddingTop: 'var(--s-3)' }}>{n}</footer>
    </div>
  );
}

function Section({
  n, title, owner, children,
}: { n: number; title: string; owner: string; children: React.ReactNode }) {
  return (
    <section style={{ marginBottom: 'var(--s-5)' }}>
      <h2 className="t-title" style={{ margin: '0 0 var(--s-1)' }}>{n}.  {title}</h2>
      <p className="t-meta" style={{ margin: '0 0 var(--s-3)' }}>{owner}</p>
      {children}
    </section>
  );
}

function Row({ label, value }: { label: string; value: string }) {
  return (
    <div
      className="t-body"
      style={{
        display: 'flex', justifyContent: 'space-between', gap: 'var(--s-4)',
        borderBottom: '1px solid var(--border)', padding: 'var(--s-2) 0',
      }}
    >
      <span style={{ color: 'var(--muted)' }}>{label}</span>
      <span style={{ textAlign: 'right' }}>{value}</span>
    </div>
  );
}

import { SEED_CATALOG } from '../lib/seeds.js';

const MONTHS = ['Jan','Feb','Mar','Apr','May','Jun','Jul','Aug','Sep','Oct','Nov','Dec'];

// Parse "Mar 15–25" style strings into month indices
function parseRange(str) {
  if (!str) return null;
  const monthMap = { Jan:0,Feb:1,Mar:2,Apr:3,May:4,Jun:5,Jul:6,Aug:7,Sep:8,Oct:9,Nov:10,Dec:11 };
  const m = str.match(/([A-Z][a-z]+)/g);
  if (!m) return null;
  if (m.length === 1) return { start: monthMap[m[0]], end: monthMap[m[0]] };
  return { start: monthMap[m[0]], end: monthMap[m[m.length-1]] };
}

const TIMELINE_ENTRIES = SEED_CATALOG.map(s => ({
  name: s.name,
  variety: s.variety,
  type: s.type,
  icon: s.icon,
  indoor: parseRange(s.indoorStart),
  transplant: parseRange(s.transplant),
  direct: parseRange(s.directSow),
  harvest: s.type === 'vegetable'
    ? { start: 5, end: 9 }
    : (s.type === 'flower' ? { start: 6, end: 9 } : null),
}));

function Bar({ range, color, label }) {
  if (!range) return null;
  const left = (range.start / 12) * 100;
  const width = Math.max(((range.end - range.start + 1) / 12) * 100, 7);
  return (
    <div
      title={label}
      style={{
        position: 'absolute',
        left: `${left}%`,
        width: `${width}%`,
        height: 16,
        background: color,
        borderRadius: 4,
        display: 'flex',
        alignItems: 'center',
        overflow: 'hidden',
      }}
    >
      <span style={{ fontSize: '0.6rem', color: '#fff', paddingLeft: 4, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
        {label}
      </span>
    </div>
  );
}

export default function SchedulePage() {
  const currentMonth = new Date().getMonth();
  const vegs = TIMELINE_ENTRIES.filter(e => e.type === 'vegetable');
  const flowers = TIMELINE_ENTRIES.filter(e => e.type === 'flower');

  return (
    <>
      <div className="page-header">
        <div>
          <h2>Planting Schedule</h2>
          <p>2026 season · Zone 6a · Attleboro, MA</p>
        </div>
      </div>

      <div className="page-body">
        {/* Legend */}
        <div style={{ display: 'flex', gap: 20, marginBottom: 24, flexWrap: 'wrap', padding: '12px 18px', background: 'var(--surface)', border: '1px solid var(--border)', borderRadius: 'var(--radius)' }}>
          {[
            { color: '#26547C', label: 'Start Indoors' },
            { color: '#06D6A0', label: 'Transplant / Direct Sow' },
            { color: '#FFD166', label: 'Harvest / Blooming' },
          ].map(l => (
            <div key={l.label} style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
              <div style={{ width: 28, height: 12, background: l.color, borderRadius: 3 }} />
              <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>{l.label}</span>
            </div>
          ))}
          <div style={{ marginLeft: 'auto', fontSize: '0.8rem', color: 'var(--text-muted)' }}>
            Last frost: ~May 25 · First fall frost: ~Oct 15
          </div>
        </div>

        {/* Chart header */}
        <div className="card" style={{ overflow: 'hidden' }}>
          <div style={{ display: 'grid', gridTemplateColumns: '180px 1fr', borderBottom: '2px solid var(--border)' }}>
            <div style={{ padding: '10px 16px', fontSize: '0.7rem', textTransform: 'uppercase', letterSpacing: '0.1em', color: 'var(--text-muted)', fontWeight: 600 }}>
              Plant
            </div>
            <div style={{ position: 'relative' }}>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(12, 1fr)' }}>
                {MONTHS.map((m, i) => (
                  <div key={m} style={{
                    padding: '10px 0',
                    fontSize: '0.7rem',
                    textAlign: 'center',
                    color: i === currentMonth ? 'var(--moss)' : 'var(--text-muted)',
                    fontWeight: i === currentMonth ? 700 : 400,
                    background: i === currentMonth ? 'rgba(38,84,124,0.06)' : '',
                    borderRight: '1px solid var(--border)',
                  }}>
                    {m}
                  </div>
                ))}
              </div>
              {/* Frost markers */}
              <div style={{ position: 'absolute', top: 0, bottom: 0, left: `${(4.8/12)*100}%`, width: 1, background: 'rgba(193,68,14,0.25)', pointerEvents: 'none' }} title="~Last frost May 25" />
              <div style={{ position: 'absolute', top: 0, bottom: 0, left: `${(9.5/12)*100}%`, width: 1, background: 'rgba(193,68,14,0.25)', pointerEvents: 'none' }} title="~First fall frost Oct 15" />
            </div>
          </div>

          {/* Vegetables */}
          <div style={{ padding: '12px 0 4px 16px', fontSize: '0.7rem', textTransform: 'uppercase', letterSpacing: '0.1em', color: 'var(--text-muted)', fontWeight: 600, background: 'var(--surface-tint)' }}>
            🥦 Vegetables
          </div>

          {vegs.map((entry, idx) => (
            <div key={idx} style={{ display: 'grid', gridTemplateColumns: '180px 1fr', borderBottom: '1px solid var(--border)', minHeight: 42 }}>
              <div style={{ padding: '10px 16px', display: 'flex', alignItems: 'center', gap: 7 }}>
                <span style={{ fontSize: '1rem' }}>{entry.icon}</span>
                <div>
                  <div style={{ fontSize: '0.8rem', fontWeight: 500, color: 'var(--soil)' }}>{entry.name}</div>
                  <div style={{ fontSize: '0.68rem', color: 'var(--text-light)' }}>{entry.variety.length > 22 ? entry.variety.slice(0,20)+'…' : entry.variety}</div>
                </div>
              </div>
              <div style={{ position: 'relative', display: 'grid', gridTemplateColumns: 'repeat(12, 1fr)', alignItems: 'center' }}>
                {/* Month columns for background */}
                {MONTHS.map((_, i) => (
                  <div key={i} style={{ height: '100%', borderRight: '1px solid var(--border)', background: i === currentMonth ? 'rgba(38,84,124,0.04)' : '' }} />
                ))}
                <div style={{ position: 'absolute', inset: 0, display: 'flex', flexDirection: 'column', gap: 3, padding: '6px 4px', justifyContent: 'center' }}>
                  <Bar range={entry.indoor} color="#26547C" label="Indoor start" />
                  <Bar range={entry.direct || entry.transplant} color="#06D6A0" label={entry.direct ? 'Direct sow' : 'Transplant'} />
                  <Bar range={entry.harvest} color="#FFD166" label="Harvest window" />
                </div>
              </div>
            </div>
          ))}

          {/* Flowers */}
          <div style={{ padding: '12px 0 4px 16px', fontSize: '0.7rem', textTransform: 'uppercase', letterSpacing: '0.1em', color: 'var(--text-muted)', fontWeight: 600, background: 'var(--surface-tint)' }}>
            🌸 Flowers
          </div>

          {flowers.map((entry, idx) => (
            <div key={idx} style={{ display: 'grid', gridTemplateColumns: '180px 1fr', borderBottom: idx < flowers.length-1 ? '1px solid var(--border)' : 'none', minHeight: 42 }}>
              <div style={{ padding: '10px 16px', display: 'flex', alignItems: 'center', gap: 7 }}>
                <span style={{ fontSize: '1rem' }}>{entry.icon}</span>
                <div>
                  <div style={{ fontSize: '0.8rem', fontWeight: 500, color: 'var(--soil)' }}>{entry.name}</div>
                  <div style={{ fontSize: '0.68rem', color: 'var(--text-light)' }}>{entry.variety.length > 22 ? entry.variety.slice(0,20)+'…' : entry.variety}</div>
                </div>
              </div>
              <div style={{ position: 'relative', display: 'grid', gridTemplateColumns: 'repeat(12, 1fr)', alignItems: 'center' }}>
                {MONTHS.map((_, i) => (
                  <div key={i} style={{ height: '100%', borderRight: '1px solid var(--border)', background: i === currentMonth ? 'rgba(38,84,124,0.04)' : '' }} />
                ))}
                <div style={{ position: 'absolute', inset: 0, display: 'flex', flexDirection: 'column', gap: 3, padding: '6px 4px', justifyContent: 'center' }}>
                  <Bar range={entry.indoor} color="#26547C" label="Indoor start" />
                  <Bar range={entry.direct || entry.transplant} color="#06D6A0" label={entry.direct ? 'Direct sow' : 'Transplant'} />
                  <Bar range={entry.harvest} color="#FFD166" label="Bloom window" />
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Frost annotation */}
        <div style={{ marginTop: 12, fontSize: '0.78rem', color: 'var(--text-light)', display: 'flex', gap: 20 }}>
          <span>❄️ Faint red lines = estimated frost boundaries (May 25 last frost, Oct 15 first frost)</span>
          <span>🟢 Highlighted column = current month</span>
        </div>
      </div>
    </>
  );
}

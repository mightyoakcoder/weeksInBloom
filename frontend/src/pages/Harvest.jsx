import { useState, useEffect } from 'react';
import { Apple, Trash2 } from 'lucide-react';
import { format } from 'date-fns';
import { api } from '../lib/api.js';
import HarvestModal from '../components/HarvestModal.jsx';
import { useToast } from '../hooks/useToast.jsx';

export default function HarvestPage() {
  const [harvests, setHarvests] = useState([]);
  const [plants, setPlants] = useState([]);
  const [loading, setLoading] = useState(true);
  const [harvesting, setHarvesting] = useState(null);
  const [filterPlant, setFilterPlant] = useState('all');
  const toast = useToast();

  const load = async () => {
    try {
      const [h, p] = await Promise.all([api.getAllHarvests(), api.getPlants()]);
      setHarvests(h); setPlants(p);
    } catch (e) { toast(e.message, 'error'); }
    finally { setLoading(false); }
  };

  useEffect(() => { load(); }, []);

  const handleHarvest = async (data) => {
    try {
      await api.logHarvest(data);
      toast('Harvest logged! 🧺');
      setHarvesting(null);
      load();
    } catch (e) { toast(e.message, 'error'); }
  };

  const filtered = harvests.filter(h =>
    filterPlant === 'all' || h.plantId === filterPlant
  );

  // Group by plant for summary
  const byPlant = {};
  harvests.forEach(h => {
    if (!byPlant[h.plantId]) byPlant[h.plantId] = { name: h.plantName?.split(' –')[0] || '?', count: 0, total: 0, unit: h.unit };
    byPlant[h.plantId].count++;
    byPlant[h.plantId].total += h.quantity || 0;
  });

  const readyPlants = plants.filter(p => !['planned','done','seeded'].includes(p.status));

  if (loading) return <div style={{ padding: 40, color: 'var(--text-muted)' }}>Loading…</div>;

  return (
    <>
      <div className="page-header">
        <div>
          <h2>Harvest Log</h2>
          <p>{harvests.length} total harvest event{harvests.length !== 1 ? 's' : ''}</p>
        </div>
        {readyPlants.length > 0 && (
          <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
            {readyPlants.slice(0,4).map(p => (
              <button key={p.id} className="btn btn-secondary btn-sm" onClick={() => setHarvesting(p)}>
                <Apple size={13} /> {p.name}
              </button>
            ))}
            {readyPlants.length > 4 && (
              <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)', alignSelf: 'center' }}>+{readyPlants.length - 4} more</span>
            )}
          </div>
        )}
      </div>

      <div className="page-body">
        {/* Summary cards */}
        {Object.keys(byPlant).length > 0 && (
          <div style={{ marginBottom: 28 }}>
            <h3 style={{ fontSize: '1rem', color: 'var(--soil)', marginBottom: 14, fontFamily: 'var(--font-display)' }}>
              Season Summary
            </h3>
            <div style={{ display: 'flex', gap: 12, flexWrap: 'wrap' }}>
              {Object.entries(byPlant).map(([plantId, data]) => (
                <div key={plantId} className="card" style={{ padding: '14px 18px', minWidth: 150 }}>
                  <div style={{ fontWeight: 600, fontSize: '0.875rem', color: 'var(--soil)' }}>{data.name}</div>
                  <div style={{ fontFamily: 'var(--font-display)', fontSize: '1.5rem', color: 'var(--coral)', marginTop: 4 }}>
                    {data.total > 0 ? data.total : data.count}
                    <span style={{ fontSize: '0.75rem', fontFamily: 'var(--font-body)', color: 'var(--text-muted)', marginLeft: 4 }}>
                      {data.total > 0 ? data.unit : 'events'}
                    </span>
                  </div>
                  <div style={{ fontSize: '0.75rem', color: 'var(--text-light)', marginTop: 2 }}>{data.count} harvest events</div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Filter + log */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 14 }}>
          <h3 style={{ fontSize: '1rem', color: 'var(--soil)', fontFamily: 'var(--font-display)' }}>All Harvest Events</h3>
          <select className="form-input form-select" style={{ width: 'auto' }} value={filterPlant} onChange={e => setFilterPlant(e.target.value)}>
            <option value="all">All plants</option>
            {plants.map(p => <option key={p.id} value={p.id}>{p.name} – {p.variety}</option>)}
          </select>
        </div>

        <div className="card">
          {filtered.length === 0 ? (
            <div className="empty-state" style={{ padding: '48px 24px' }}>
              <span className="emoji">🧺</span>
              <h3>No harvests yet</h3>
              <p>Log your first harvest from the Plants page!</p>
            </div>
          ) : (
            <table style={{ width: '100%', borderCollapse: 'collapse' }}>
              <thead>
                <tr style={{ background: 'var(--parchment)' }}>
                  {['Date', 'Plant', 'Quantity', 'Notes', ''].map(col => (
                    <th key={col} style={{ padding: '10px 16px', textAlign: 'left', fontSize: '0.72rem', textTransform: 'uppercase', letterSpacing: '0.08em', color: 'var(--text-muted)', fontWeight: 500, borderBottom: '1px solid var(--border)' }}>
                      {col}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {filtered.map(h => (
                  <tr key={h.id} style={{ borderBottom: '1px solid var(--border)' }}
                    onMouseEnter={e => e.currentTarget.style.background = 'var(--bg)'}
                    onMouseLeave={e => e.currentTarget.style.background = ''}
                  >
                    <td style={{ padding: '12px 16px', fontSize: '0.875rem', color: 'var(--text-muted)', whiteSpace: 'nowrap' }}>
                      {format(new Date(h.harvestedAt), 'MMM d, yyyy')}
                    </td>
                    <td style={{ padding: '12px 16px', fontWeight: 500, fontSize: '0.875rem' }}>
                      {h.plantName?.split(' –')[0]}
                      <span style={{ fontWeight: 400, color: 'var(--text-muted)', fontSize: '0.8rem' }}>
                        {' '}{h.plantName?.split(' –')[1]}
                      </span>
                    </td>
                    <td style={{ padding: '12px 16px', fontSize: '0.875rem' }}>
                      {h.quantity ? `${h.quantity} ${h.unit}` : '—'}
                    </td>
                    <td style={{ padding: '12px 16px', fontSize: '0.8rem', color: 'var(--text-muted)', maxWidth: 200 }}>
                      {h.notes || '—'}
                    </td>
                    <td style={{ padding: '12px 16px' }}>
                      <button
                        className="btn btn-ghost btn-sm btn-icon"
                        onClick={async () => { await api.deleteHarvestLog(h.id); load(); }}
                      >
                        <Trash2 size={13} style={{ color: 'var(--text-light)' }} />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
      </div>

      {harvesting && <HarvestModal plant={harvesting} onSave={handleHarvest} onClose={() => setHarvesting(null)} />}
    </>
  );
}

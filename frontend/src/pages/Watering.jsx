import { useState, useEffect } from 'react';
import { Droplets, Trash2 } from 'lucide-react';
import { formatDistanceToNow, format } from 'date-fns';
import { api } from '../lib/api.js';
import WaterModal from '../components/WaterModal.jsx';
import { useToast } from '../hooks/useToast.jsx';

export default function WateringPage() {
  const [plants, setPlants] = useState([]);
  const [logs, setLogs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [watering, setWatering] = useState(null);
  const toast = useToast();

  const load = async () => {
    try {
      const [p, l] = await Promise.all([api.getPlants(), api.getRecentWatering()]);
      setPlants(p); setLogs(l);
    } catch (e) { toast(e.message, 'error'); }
    finally { setLoading(false); }
  };

  useEffect(() => { load(); }, []);

  const handleWater = async (data) => {
    try {
      await api.logWatering(data);
      toast('Watering logged! 💧');
      setWatering(null);
      load();
    } catch (e) { toast(e.message, 'error'); }
  };

  const overdueCount = plants.filter(p => {
    if (!p.lastWatered) return true;
    return (Date.now() - new Date(p.lastWatered)) / 86400000 >= (p.wateringFrequency || 3);
  }).length;

  const sortedPlants = [...plants].sort((a, b) => {
    const daysA = a.lastWatered ? (Date.now() - new Date(a.lastWatered)) / 86400000 : 999;
    const daysB = b.lastWatered ? (Date.now() - new Date(b.lastWatered)) / 86400000 : 999;
    const dueA = daysA / (a.wateringFrequency || 3);
    const dueB = daysB / (b.wateringFrequency || 3);
    return dueB - dueA;
  });

  function statusColor(plant) {
    if (!plant.lastWatered) return 'var(--rust)';
    const ratio = ((Date.now() - new Date(plant.lastWatered)) / 86400000) / (plant.wateringFrequency || 3);
    if (ratio < 0.5) return 'var(--sky)';
    if (ratio < 1) return 'var(--sage)';
    if (ratio < 1.5) return 'var(--gold)';
    return 'var(--rust)';
  }

  function statusBar(plant) {
    if (!plant.lastWatered) return 100;
    const ratio = ((Date.now() - new Date(plant.lastWatered)) / 86400000) / (plant.wateringFrequency || 3);
    return Math.min(ratio * 100, 100);
  }

  if (loading) return <div style={{ padding: 40, color: 'var(--text-muted)' }}>Loading…</div>;

  return (
    <>
      <div className="page-header">
        <div>
          <h2>Watering</h2>
          <p>{overdueCount > 0 ? `${overdueCount} plant${overdueCount > 1 ? 's' : ''} need water` : 'All plants are watered!'}</p>
        </div>
      </div>

      <div className="page-body">
        <div className="grid-2">
          {/* Plant watering status */}
          <div>
            <h3 style={{ fontSize: '1rem', color: 'var(--soil)', marginBottom: 14, fontFamily: 'var(--font-display)' }}>
              Plants by Watering Need
            </h3>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
              {sortedPlants.filter(p => !['planned','done'].includes(p.status)).map(p => {
                const pct = statusBar(p);
                const color = statusColor(p);
                const daysSince = p.lastWatered
                  ? Math.round((Date.now() - new Date(p.lastWatered)) / 86400000)
                  : null;
                return (
                  <div key={p.id} className="card" style={{ padding: '14px 16px' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 8 }}>
                      <span>{p.icon || '🌱'}</span>
                      <div style={{ flex: 1 }}>
                        <div style={{ fontWeight: 500, fontSize: '0.875rem' }}>{p.name} <span style={{ fontWeight: 400, color: 'var(--text-muted)' }}>— {p.variety}</span></div>
                        <div style={{ fontSize: '0.75rem', color: 'var(--text-light)' }}>
                          {daysSince === null ? 'Never watered' : `Last: ${daysSince}d ago · every ${p.wateringFrequency || 3}d`}
                        </div>
                      </div>
                      <button
                        className="btn btn-sm"
                        style={{ background: color, color: '#fff', fontSize: '0.75rem' }}
                        onClick={() => setWatering(p)}
                      >
                        <Droplets size={13} /> Water
                      </button>
                    </div>
                    <div style={{ height: 5, background: 'var(--border)', borderRadius: 3, overflow: 'hidden' }}>
                      <div style={{
                        height: '100%',
                        width: `${pct}%`,
                        background: color,
                        borderRadius: 3,
                        transition: 'width 0.4s',
                      }} />
                    </div>
                  </div>
                );
              })}
              {sortedPlants.filter(p => !['planned','done'].includes(p.status)).length === 0 && (
                <div className="empty-state">
                  <span className="emoji">🌱</span>
                  <h3>No active plants</h3>
                  <p>Add plants to start tracking watering.</p>
                </div>
              )}
            </div>
          </div>

          {/* Recent log */}
          <div>
            <h3 style={{ fontSize: '1rem', color: 'var(--soil)', marginBottom: 14, fontFamily: 'var(--font-display)' }}>
              Recent Watering Log
            </h3>
            <div className="card">
              <div style={{ maxHeight: 480, overflowY: 'auto' }}>
                {logs.length === 0 ? (
                  <div className="empty-state" style={{ padding: 32 }}>
                    <span className="emoji">💧</span>
                    <p>No logs yet.</p>
                  </div>
                ) : logs.map(log => (
                  <div key={log.id} style={{ padding: '12px 18px', borderBottom: '1px solid var(--border)', display: 'flex', gap: 12, alignItems: 'flex-start' }}>
                    <Droplets size={16} style={{ color: 'var(--sky)', marginTop: 2, flexShrink: 0 }} />
                    <div style={{ flex: 1 }}>
                      <div style={{ fontWeight: 500, fontSize: '0.875rem' }}>{log.plantName?.split(' –')[0]}</div>
                      <div style={{ fontSize: '0.78rem', color: 'var(--text-light)' }}>
                        {format(new Date(log.wateredAt), 'MMM d, yyyy · h:mm a')}
                      </div>
                      {log.notes && <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginTop: 2 }}>{log.notes}</div>}
                    </div>
                    <button
                      className="btn btn-ghost btn-sm btn-icon"
                      onClick={async () => { await api.deleteWateringLog(log.id); load(); }}
                    >
                      <Trash2 size={13} style={{ color: 'var(--text-light)' }} />
                    </button>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>

      {watering && <WaterModal plant={watering} onSave={handleWater} onClose={() => setWatering(null)} />}
    </>
  );
}

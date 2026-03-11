import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Droplets, Apple, Sprout, AlertTriangle, TrendingUp, Calendar, X, CheckCircle, RotateCcw } from 'lucide-react';
import { formatDistanceToNow, format, isWithinInterval, addDays, parseISO } from 'date-fns';
import { api } from '../lib/api.js';
import WaterModal from '../components/WaterModal.jsx';
import HarvestModal from '../components/HarvestModal.jsx';
import { useToast } from '../hooks/useToast.jsx';

// date ranges are [month(0-indexed), day] inclusive, year 2026
const ALL_TODOS = [
  { id: 'peppers',    emoji: '⚡', text: 'Start peppers indoors',           urgent: true, start: [2,9],  end: [2,15] },
  { id: 'tomatoes',   emoji: '🌱', text: 'Start tomatoes indoors',                        start: [2,15], end: [2,25] },
  { id: 'daisy',      emoji: '🌼', text: 'Start African daisy indoors',                   start: [2,20], end: [3,1]  },
  { id: 'lettuce',    emoji: '🥬', text: 'Start lettuce indoors',                         start: [2,15], end: [3,15] },
  { id: 'poppy',      emoji: '🌕', text: 'Direct sow California poppy',                   start: [3,1],  end: [3,15] },
  { id: 'bachelor',   emoji: '💙', text: 'Direct sow bachelor button',                    start: [3,1],  end: [3,20] },
  { id: 'beets',      emoji: '🟣', text: 'Direct sow beets',                              start: [3,15], end: [4,1]  },
  { id: 'zinnias',    emoji: '🌺', text: 'Start zinnias indoors',                         start: [3,15], end: [3,30] },
  { id: 'cosmos',     emoji: '🌸', text: 'Start cosmos indoors',                          start: [3,15], end: [3,30] },
  { id: 'harden',     emoji: '🪴', text: 'Begin hardening off seedlings',                 start: [4,15], end: [5,15] },
  { id: 'nastur',     emoji: '🍊', text: 'Direct sow nasturtiums',                        start: [4,10], end: [4,25] },
  { id: 'transplant', emoji: '🌿', text: 'Transplant tomatoes & peppers outdoors',        start: [5,20], end: [6,1]  },
  { id: 'squash',     emoji: '🥒', text: 'Direct sow zucchini & cucumber',                start: [5,25], end: [6,1]  },
];

const STORAGE_KEY = 'garden_todos_dismissed';

function isDueThisWeek(todo) {
  const now = new Date();
  const weekEnd = addDays(now, 7);
  const taskStart = new Date(2026, todo.start[0], todo.start[1]);
  const taskEnd   = new Date(2026, todo.end[0],   todo.end[1]);
  // show if the task window overlaps with [today, today+7]
  return taskStart <= weekEnd && taskEnd >= now;
}

function TodoList({ needsWaterCount }) {
  const [dismissed, setDismissed] = useState(() => {
    try { return JSON.parse(localStorage.getItem(STORAGE_KEY) || '[]'); } catch { return []; }
  });

  const dismiss = (id) => {
    const next = [...dismissed, id];
    setDismissed(next);
    localStorage.setItem(STORAGE_KEY, JSON.stringify(next));
  };

  const resetAll = () => {
    setDismissed([]);
    localStorage.removeItem(STORAGE_KEY);
  };

  const dueThisWeek = ALL_TODOS.filter(isDueThisWeek);
  const waterTodo = needsWaterCount > 0
    ? [{ id: 'watering', emoji: '💧', text: `${needsWaterCount} plant(s) need watering`, urgent: true }]
    : [];
  const allItems = [...waterTodo, ...dueThisWeek];
  const visible = allItems.filter(t => !dismissed.includes(t.id));
  const doneCount = dismissed.filter(id => allItems.find(t => t.id === id)).length;

  if (allItems.length === 0) return null;

  return (
    <div className="card" style={{ marginBottom: 28, padding: '20px 24px', background: 'var(--surface-tint)' }}>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 14 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
          <Calendar size={16} style={{ color: 'var(--moss)' }} />
          <h3 style={{ fontSize: '1rem', color: 'var(--soil)' }}>This week</h3>
          {doneCount > 0 && (
            <span style={{ fontSize: '0.75rem', color: 'var(--sage)', fontWeight: 500 }}>
              ✓ {doneCount} done
            </span>
          )}
        </div>
        {doneCount > 0 && (
          <button
            className="btn btn-ghost btn-sm"
            style={{ fontSize: '0.75rem', color: 'var(--text-light)', display: 'flex', alignItems: 'center', gap: 4 }}
            onClick={resetAll}
            title="Restore dismissed tasks"
          >
            <RotateCcw size={12} /> Reset
          </button>
        )}
      </div>
      {visible.length === 0 ? (
        <div style={{ textAlign: 'center', padding: '16px 0', color: 'var(--sage)', fontSize: '0.9rem' }}>
          <CheckCircle size={22} style={{ display: 'block', margin: '0 auto 8px' }} />
          All done this week! 🌱
        </div>
      ) : (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(210px, 1fr))', gap: 10 }}>
          {visible.map((item) => (
            <div key={item.id} style={{
              padding: '10px 12px',
              background: item.urgent ? 'var(--gold-light)' : 'var(--surface)',
              border: `1px solid ${item.urgent ? 'var(--gold)' : 'var(--border)'}`,
              borderRadius: 8,
              fontSize: '0.85rem',
              display: 'flex',
              alignItems: 'center',
              gap: 8,
            }}>
              <span style={{ flexShrink: 0 }}>{item.emoji}</span>
              <span style={{ color: item.urgent ? 'var(--bark)' : 'var(--text-muted)', fontWeight: item.urgent ? 500 : 400, flex: 1, lineHeight: 1.3 }}>
                {item.text}
              </span>
              <button
                onClick={() => dismiss(item.id)}
                title="Mark as done"
                style={{
                  flexShrink: 0, width: 22, height: 22,
                  borderRadius: '50%',
                  border: '1.5px solid var(--border)',
                  background: 'var(--surface)',
                  cursor: 'pointer',
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  color: 'var(--text-light)',
                  transition: 'all 0.15s',
                }}
                onMouseEnter={e => { e.currentTarget.style.background = 'var(--teal)'; e.currentTarget.style.borderColor = 'var(--teal)'; e.currentTarget.style.color = '#fff'; }}
                onMouseLeave={e => { e.currentTarget.style.background = 'var(--surface)'; e.currentTarget.style.borderColor = 'var(--border)'; e.currentTarget.style.color = 'var(--text-light)'; }}
              >
                <X size={11} />
              </button>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

export default function Dashboard() {
  const [plants, setPlants] = useState([]);
  const [waterLogs, setWaterLogs] = useState([]);
  const [harvests, setHarvests] = useState([]);
  const [loading, setLoading] = useState(true);
  const [wateringPlant, setWateringPlant] = useState(null);
  const [harvestingPlant, setHarvestingPlant] = useState(null);
  const toast = useToast();

  const load = async () => {
    try {
      const [p, w, h] = await Promise.all([
        api.getPlants(),
        api.getRecentWatering(),
        api.getAllHarvests(),
      ]);
      setPlants(p); setWaterLogs(w); setHarvests(h);
    } catch (e) { toast(e.message, 'error'); }
    finally { setLoading(false); }
  };

  useEffect(() => { load(); }, []);

  const needsWater = plants.filter(p => {
    if (!p.lastWatered) return true;
    const days = (Date.now() - new Date(p.lastWatered)) / 86400000;
    return days >= (p.wateringFrequency || 3);
  });

  const activeCount = plants.filter(p => !['planned','done'].includes(p.status)).length;
  const harvestTotal = harvests.length;

  const handleWater = async (data) => {
    try {
      await api.logWatering(data);
      toast('Watering logged!');
      setWateringPlant(null);
      load();
    } catch (e) { toast(e.message, 'error'); }
  };

  const handleHarvest = async (data) => {
    try {
      await api.logHarvest(data);
      toast('Harvest logged!');
      setHarvestingPlant(null);
      load();
    } catch (e) { toast(e.message, 'error'); }
  };

  if (loading) return <div style={{ padding: 40, color: 'var(--text-muted)' }}>Loading…</div>;

  const today = format(new Date(), 'EEEE, MMMM d');
  const daysToFrost = Math.max(0, Math.round((new Date('2026-05-25') - new Date()) / 86400000));

  return (
    <>
      <div className="page-header">
        <div>
          <h2>Good morning 🌱</h2>
          <p>{today} · {daysToFrost > 0 ? `~${daysToFrost} days until last frost on May 25, 2026` : 'Past last frost — safe to plant!'}</p>
        </div>
        <Link to="/plants" className="btn btn-primary">
          <Sprout size={16} /> View All Plants
        </Link>
      </div>

      <div className="page-body">
        {/* This week — top of page */}
        <TodoList needsWaterCount={needsWater.length} />

        {/* Stats row */}
        <div className="grid-3" style={{ marginBottom: 28 }}>
          <div className="stat-box" style={{ borderLeft: '3px solid var(--sage)' }}>
            <div className="stat-label">Active Plants</div>
            <div className="stat-value">{activeCount}</div>
            <div className="stat-sub">{plants.length} total</div>
          </div>
          <div className="stat-box" style={{ borderLeft: `3px solid ${needsWater.length > 0 ? 'var(--rust)' : 'var(--sky)'}` }}>
            <div className="stat-label">Need Watering</div>
            <div className="stat-value" style={{ color: needsWater.length > 0 ? 'var(--rust)' : 'var(--sky)' }}>
              {needsWater.length}
            </div>
            <div className="stat-sub">{needsWater.length === 0 ? "All watered!" : "plants overdue"}</div>
          </div>
          <div className="stat-box" style={{ borderLeft: '3px solid var(--rust)' }}>
            <div className="stat-label">Harvests This Season</div>
            <div className="stat-value">{harvestTotal}</div>
            <div className="stat-sub">total logs</div>
          </div>
        </div>

        <div className="grid-2">
          {/* Needs water */}
          <div className="card">
            <div style={{ padding: '16px 20px', borderBottom: '1px solid var(--border)', display: 'flex', alignItems: 'center', gap: 8 }}>
              <AlertTriangle size={16} style={{ color: needsWater.length > 0 ? 'var(--rust)' : 'var(--sage)' }} />
              <h3 style={{ fontSize: '1rem', color: 'var(--sky)' }}>Needs Watering ({needsWater.length})</h3>
            </div>
            <div style={{ padding: '8px 0', maxHeight: 320, overflowY: 'auto' }}>
              {needsWater.length === 0 ? (
                <div className="empty-state" style={{ padding: '32px 16px' }}>
                  <span className="emoji">💧</span>
                  <p>Everything is watered!</p>
                </div>
              ) : needsWater.map(p => (
                <div key={p.id} style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '10px 20px', borderBottom: '1px solid var(--border)' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                    <span>{p.icon || '🌱'}</span>
                    <div>
                      <div style={{ fontWeight: 500, fontSize: '0.875rem' }}>{p.name}</div>
                      <div style={{ fontSize: '0.75rem', color: 'var(--text-light)' }}>
                        {p.lastWatered
                          ? `Last: ${formatDistanceToNow(new Date(p.lastWatered))} ago`
                          : 'Never watered'}
                      </div>
                    </div>
                  </div>
                  <button
                    className="btn btn-sm"
                    style={{ background: 'var(--navy)', color: '#fff' }}
                    onClick={() => setWateringPlant(p)}
                  >
                    <Droplets size={13} /> Water
                  </button>
                </div>
              ))}
            </div>
          </div>

          {/* Recent activity */}
          <div className="card">
            <div style={{ padding: '16px 20px', borderBottom: '1px solid var(--border)', display: 'flex', alignItems: 'center', gap: 8 }}>
              <TrendingUp size={16} style={{ color: 'var(--sage)' }} />
              <h3 style={{ fontSize: '1rem', color: 'var(--sky)' }}>Recent Activity</h3>
            </div>
            <div style={{ padding: '8px 0', maxHeight: 320, overflowY: 'auto' }}>
              {[...waterLogs.slice(0,5).map(l => ({ ...l, _type: 'water' })),
                ...harvests.slice(0,5).map(l => ({ ...l, _type: 'harvest' }))]
                .sort((a,b) => new Date(b.wateredAt || b.harvestedAt) - new Date(a.wateredAt || a.harvestedAt))
                .slice(0,8)
                .map(item => (
                  <div key={item.id} style={{ display: 'flex', alignItems: 'center', gap: 12, padding: '10px 20px', borderBottom: '1px solid var(--border)' }}>
                    <span style={{ fontSize: '1.1rem' }}>
                      {item._type === 'water' ? '💧' : '🧺'}
                    </span>
                    <div style={{ flex: 1 }}>
                      <div style={{ fontSize: '0.85rem', fontWeight: 500 }}>{item.plantName?.split(' –')[0]}</div>
                      <div style={{ fontSize: '0.75rem', color: 'var(--text-light)' }}>
                        {item._type === 'water'
                          ? `Watered ${formatDistanceToNow(new Date(item.wateredAt))} ago`
                          : `Harvested ${item.quantity} ${item.unit} · ${formatDistanceToNow(new Date(item.harvestedAt))} ago`}
                      </div>
                    </div>
                  </div>
                ))}
              {waterLogs.length === 0 && harvests.length === 0 && (
                <div className="empty-state" style={{ padding: '32px 16px' }}>
                  <span className="emoji">📋</span>
                  <p>No activity yet. Start logging!</p>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      {wateringPlant && <WaterModal plant={wateringPlant} onSave={handleWater} onClose={() => setWateringPlant(null)} />}
      {harvestingPlant && <HarvestModal plant={harvestingPlant} onSave={handleHarvest} onClose={() => setHarvestingPlant(null)} />}
    </>
  );
}

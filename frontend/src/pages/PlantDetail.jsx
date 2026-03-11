import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { ArrowLeft, Droplets, Apple, Pencil, Trash2 } from 'lucide-react';
import { formatDistanceToNow, format } from 'date-fns';
import { api } from '../lib/api.js';
import PlantModal from '../components/PlantModal.jsx';
import WaterModal from '../components/WaterModal.jsx';
import HarvestModal from '../components/HarvestModal.jsx';
import { PLANT_STATUSES } from '../lib/seeds.js';
import { useToast } from '../hooks/useToast.jsx';

export default function PlantDetail() {
  const { id } = useParams();
  const nav = useNavigate();
  const toast = useToast();
  const [plant, setPlant] = useState(null);
  const [waterLogs, setWaterLogs] = useState([]);
  const [harvestLogs, setHarvestLogs] = useState([]);
  const [editing, setEditing] = useState(false);
  const [watering, setWatering] = useState(false);
  const [harvesting, setHarvesting] = useState(false);

  const load = async () => {
    try {
      const [p, w, h] = await Promise.all([
        api.getPlant(id),
        api.getWateringLogs(id),
        api.getHarvestLogs(id),
      ]);
      setPlant(p); setWaterLogs(w); setHarvestLogs(h);
    } catch (e) { toast(e.message, 'error'); }
  };

  useEffect(() => { load(); }, [id]);

  const handleSave = async (form) => {
    try {
      await api.updatePlant(id, form);
      toast('Saved!');
      setEditing(false);
      load();
    } catch (e) { toast(e.message, 'error'); }
  };

  const handleDelete = async () => {
    if (!confirm('Delete this plant and all its logs?')) return;
    try {
      await api.deletePlant(id);
      toast('Plant deleted');
      nav('/plants');
    } catch (e) { toast(e.message, 'error'); }
  };

  const handleWater = async (data) => {
    try {
      await api.logWatering(data);
      toast('Watering logged!');
      setWatering(false);
      load();
    } catch (e) { toast(e.message, 'error'); }
  };

  const handleHarvest = async (data) => {
    try {
      await api.logHarvest(data);
      toast('Harvest logged!');
      setHarvesting(false);
      load();
    } catch (e) { toast(e.message, 'error'); }
  };

  if (!plant) return <div style={{ padding: 40, color: 'var(--text-muted)' }}>Loading…</div>;

  const statusObj = PLANT_STATUSES.find(s => s.value === plant.status) || PLANT_STATUSES[0];
  const totalHarvest = harvestLogs.reduce((sum, h) => sum + (h.quantity || 0), 0);

  return (
    <>
      <div className="page-header">
        <div style={{ display: 'flex', alignItems: 'center', gap: 16 }}>
          <button className="btn btn-ghost btn-icon" onClick={() => nav(-1)}>
            <ArrowLeft size={18} />
          </button>
          <div>
            <h2 style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
              <span>{plant.icon}</span> {plant.name}
              <span className={`badge ${statusObj.badge}`} style={{ fontSize: '0.7rem' }}>{statusObj.label}</span>
            </h2>
            <p>{plant.variety}{plant.location && ` · 📍 ${plant.location}`}</p>
          </div>
        </div>
        <div style={{ display: 'flex', gap: 8 }}>
          <button className="btn btn-secondary btn-sm" onClick={() => setEditing(true)}>
            <Pencil size={14} /> Edit
          </button>
          <button className="btn btn-secondary btn-sm" onClick={() => setWatering(true)}>
            <Droplets size={14} /> Log Water
          </button>
          {plant.type === 'vegetable' && (
            <button className="btn btn-secondary btn-sm" onClick={() => setHarvesting(true)}>
              <Apple size={14} /> Log Harvest
            </button>
          )}
          <button className="btn btn-danger btn-sm" onClick={handleDelete}>
            <Trash2 size={14} />
          </button>
        </div>
      </div>

      <div className="page-body">
        <div className="grid-2" style={{ marginBottom: 28 }}>
          <div className="stat-box" style={{ borderLeft: '3px solid var(--sky)' }}>
            <div className="stat-label">Last Watered</div>
            <div className="stat-value" style={{ fontSize: '1.4rem' }}>
              {plant.lastWatered ? formatDistanceToNow(new Date(plant.lastWatered)) + ' ago' : 'Never'}
            </div>
            <div className="stat-sub">Every {plant.wateringFrequency || 3} days</div>
          </div>
          {plant.type === 'vegetable' && (
            <div className="stat-box" style={{ borderLeft: '3px solid var(--rust)' }}>
              <div className="stat-label">Total Harvested</div>
              <div className="stat-value">{totalHarvest || '—'}</div>
              <div className="stat-sub">{harvestLogs.length} harvest events</div>
            </div>
          )}
        </div>

        {/* Milestones */}
        {(plant.seededAt || plant.germinatedAt || plant.transplantedAt) && (
          <div className="card" style={{ padding: '18px 22px', marginBottom: 24 }}>
            <h3 style={{ fontSize: '0.95rem', marginBottom: 14, color: 'var(--soil)' }}>Milestones</h3>
            <div style={{ display: 'flex', gap: 24, flexWrap: 'wrap' }}>
              {plant.seededAt && (
                <div>
                  <div style={{ fontSize: '0.7rem', textTransform: 'uppercase', letterSpacing: '0.08em', color: 'var(--text-light)' }}>Seeded</div>
                  <div style={{ fontWeight: 500, color: 'var(--soil)' }}>{format(new Date(plant.seededAt), 'MMM d, yyyy')}</div>
                </div>
              )}
              {plant.germinatedAt && (
                <div>
                  <div style={{ fontSize: '0.7rem', textTransform: 'uppercase', letterSpacing: '0.08em', color: 'var(--text-light)' }}>Germinated</div>
                  <div style={{ fontWeight: 500, color: 'var(--soil)' }}>{format(new Date(plant.germinatedAt), 'MMM d, yyyy')}</div>
                  {plant.seededAt && (
                    <div style={{ fontSize: '0.75rem', color: 'var(--sage)' }}>
                      {Math.round((new Date(plant.germinatedAt) - new Date(plant.seededAt)) / 86400000)} days to sprout
                    </div>
                  )}
                </div>
              )}
              {plant.transplantedAt && (
                <div>
                  <div style={{ fontSize: '0.7rem', textTransform: 'uppercase', letterSpacing: '0.08em', color: 'var(--text-light)' }}>Transplanted</div>
                  <div style={{ fontWeight: 500, color: 'var(--soil)' }}>{format(new Date(plant.transplantedAt), 'MMM d, yyyy')}</div>
                </div>
              )}
            </div>
          </div>
        )}

        {plant.notes && (
          <div className="card" style={{ padding: '18px 22px', marginBottom: 24, background: 'var(--surface-tint)' }}>
            <h3 style={{ fontSize: '0.95rem', marginBottom: 8, color: 'var(--soil)' }}>Notes</h3>
            <p style={{ color: 'var(--text-muted)', fontSize: '0.9rem', lineHeight: 1.6 }}>{plant.notes}</p>
          </div>
        )}

        <div className="grid-2">
          {/* Watering history */}
          <div className="card">
            <div style={{ padding: '16px 20px', borderBottom: '1px solid var(--border)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <h3 style={{ fontSize: '0.95rem', color: 'var(--soil)', display: 'flex', alignItems: 'center', gap: 6 }}>
                <Droplets size={16} style={{ color: 'var(--sky)' }} /> Watering Log ({waterLogs.length})
              </h3>
            </div>
            <div style={{ maxHeight: 300, overflowY: 'auto' }}>
              {waterLogs.length === 0 ? (
                <div className="empty-state" style={{ padding: '24px 16px' }}>
                  <p>No watering logs yet.</p>
                </div>
              ) : waterLogs.map(log => (
                <div key={log.id} style={{ padding: '10px 20px', borderBottom: '1px solid var(--border)', display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                  <div>
                    <div style={{ fontWeight: 500, fontSize: '0.875rem' }}>
                      {format(new Date(log.wateredAt), 'MMM d, yyyy · h:mm a')}
                    </div>
                    {log.notes && <div style={{ fontSize: '0.75rem', color: 'var(--text-light)', marginTop: 2 }}>{log.notes}</div>}
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

          {/* Harvest history */}
          <div className="card">
            <div style={{ padding: '16px 20px', borderBottom: '1px solid var(--border)' }}>
              <h3 style={{ fontSize: '0.95rem', color: 'var(--soil)', display: 'flex', alignItems: 'center', gap: 6 }}>
                <Apple size={16} style={{ color: 'var(--coral)' }} /> Harvest Log ({harvestLogs.length})
              </h3>
            </div>
            <div style={{ maxHeight: 300, overflowY: 'auto' }}>
              {harvestLogs.length === 0 ? (
                <div className="empty-state" style={{ padding: '24px 16px' }}>
                  <p>{plant.type !== 'vegetable' ? 'Cut flowers? Log a harvest!' : 'No harvests yet.'}</p>
                </div>
              ) : harvestLogs.map(log => (
                <div key={log.id} style={{ padding: '10px 20px', borderBottom: '1px solid var(--border)', display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                  <div>
                    <div style={{ fontWeight: 500, fontSize: '0.875rem' }}>
                      {log.quantity} {log.unit} · {format(new Date(log.harvestedAt), 'MMM d, yyyy')}
                    </div>
                    {log.notes && <div style={{ fontSize: '0.75rem', color: 'var(--text-light)', marginTop: 2 }}>{log.notes}</div>}
                  </div>
                  <button
                    className="btn btn-ghost btn-sm btn-icon"
                    onClick={async () => { await api.deleteHarvestLog(log.id); load(); }}
                  >
                    <Trash2 size={13} style={{ color: 'var(--text-light)' }} />
                  </button>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      {editing && <PlantModal plant={plant} onSave={handleSave} onClose={() => setEditing(false)} />}
      {watering && <WaterModal plant={plant} onSave={handleWater} onClose={() => setWatering(false)} />}
      {harvesting && <HarvestModal plant={plant} onSave={handleHarvest} onClose={() => setHarvesting(false)} />}
    </>
  );
}

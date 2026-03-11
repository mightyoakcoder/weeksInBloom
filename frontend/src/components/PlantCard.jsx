import { formatDistanceToNow } from 'date-fns';
import { Droplets, Apple, MapPin, ChevronRight } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { PLANT_STATUSES } from '../lib/seeds.js';

function waterClass(lastWatered, freq) {
  if (!lastWatered) return 'water-overdue';
  const days = (Date.now() - new Date(lastWatered)) / 86400000;
  if (days < freq * 0.5) return 'water-fresh';
  if (days < freq) return 'water-ok';
  if (days < freq * 1.5) return 'water-due';
  return 'water-overdue';
}

function waterLabel(lastWatered, freq) {
  if (!lastWatered) return 'Never watered';
  const days = (Date.now() - new Date(lastWatered)) / 86400000;
  if (days < freq) return `Watered ${formatDistanceToNow(new Date(lastWatered))} ago`;
  return `Due ${Math.round(days - freq)}d ago`;
}

export default function PlantCard({ plant, onWater, onHarvest }) {
  const navigate = useNavigate();
  const statusObj = PLANT_STATUSES.find(s => s.value === plant.status) || PLANT_STATUSES[0];
  const wClass = waterClass(plant.lastWatered, plant.wateringFrequency || 3);
  const wLabel = waterLabel(plant.lastWatered, plant.wateringFrequency || 3);

  return (
    <div className="card card-hover" style={{ overflow: 'hidden' }}>
      {/* Color accent bar by type */}
      <div style={{
        height: 4,
        background: plant.type === 'flower'
          ? 'linear-gradient(90deg, var(--coral), var(--gold))'
          : 'linear-gradient(90deg, var(--moss), var(--fern))',
      }} />

      <div style={{ padding: '16px 18px' }}>
        <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', gap: 8 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
            <span style={{ fontSize: '1.6rem' }}>{plant.icon || (plant.type === 'flower' ? '🌸' : '🌱')}</span>
            <div>
              <div style={{ fontWeight: 600, fontSize: '0.95rem', color: 'var(--soil)' }}>{plant.name}</div>
              <div style={{ fontSize: '0.78rem', color: 'var(--text-muted)', marginTop: 1 }}>{plant.variety}</div>
            </div>
          </div>
          <span className={`badge ${statusObj.badge}`}>{statusObj.label}</span>
        </div>

        {plant.location && (
          <div style={{ display: 'flex', alignItems: 'center', gap: 5, marginTop: 10, color: 'var(--text-light)', fontSize: '0.78rem' }}>
            <MapPin size={12} />
            {plant.location}
          </div>
        )}

        {/* Watering status */}
        <div style={{ marginTop: 12, padding: '8px 12px', background: 'var(--bg)', borderRadius: 8, display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 6, fontSize: '0.8rem' }}>
            <Droplets size={14} className={wClass} />
            <span className={wClass} style={{ fontWeight: 500 }}>{wLabel}</span>
          </div>
          <button
            className="btn btn-sm"
            style={{ padding: '4px 10px', fontSize: '0.75rem', background: 'var(--navy)', color: '#fff', borderRadius: 6 }}
            onClick={(e) => { e.stopPropagation(); onWater(plant); }}
          >
            Log Water
          </button>
        </div>

        {/* Seeded / transplant dates */}
        {(plant.seededAt || plant.transplantedAt) && (
          <div style={{ marginTop: 10, display: 'flex', gap: 10, flexWrap: 'wrap' }}>
            {plant.seededAt && (
              <span className="tag">🌱 Seeded {new Date(plant.seededAt).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}</span>
            )}
            {plant.germinatedAt && (
              <span className="tag">🌿 Sprouted {new Date(plant.germinatedAt).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}</span>
            )}
            {plant.transplantedAt && (
              <span className="tag">🪴 Transplanted {new Date(plant.transplantedAt).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}</span>
            )}
          </div>
        )}

        {/* Action row */}
        <div style={{ marginTop: 12, display: 'flex', alignItems: 'center', gap: 8 }}>
          {plant.type === 'vegetable' && (
            <button
              className="btn btn-sm btn-secondary"
              style={{ fontSize: '0.78rem' }}
              onClick={(e) => { e.stopPropagation(); onHarvest(plant); }}
            >
              <Apple size={13} /> Harvest
            </button>
          )}
          <button
            className="btn btn-ghost btn-sm"
            style={{ marginLeft: 'auto', display: 'flex', alignItems: 'center', gap: 4 }}
            onClick={() => navigate(`/plants/${plant.id}`)}
          >
            Details <ChevronRight size={14} />
          </button>
        </div>
      </div>
    </div>
  );
}

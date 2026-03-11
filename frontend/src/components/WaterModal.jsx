import { useState } from 'react';
import { Droplets, X } from 'lucide-react';

export default function WaterModal({ plant, onSave, onClose }) {
  const [form, setForm] = useState({
    wateredAt: new Date().toISOString().slice(0, 16),
    notes: '',
  });

  const submit = (e) => {
    e.preventDefault();
    onSave({
      plantId: plant.id,
      plantName: `${plant.name} – ${plant.variety}`,
      location: plant.location || '',
      wateredAt: new Date(form.wateredAt).toISOString(),
      notes: form.notes,
    });
  };

  return (
    <div className="modal-backdrop" onClick={onClose}>
      <div className="modal" style={{ maxWidth: 420 }} onClick={e => e.stopPropagation()}>
        <div className="modal-header">
          <h3 style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
            <Droplets size={20} style={{ color: 'var(--sky)' }} />
            Log Watering
          </h3>
          <button className="btn btn-ghost btn-icon" onClick={onClose}><X size={18} /></button>
        </div>
        <form onSubmit={submit}>
          <div className="modal-body">
            <div style={{ padding: '10px 14px', background: 'var(--surface-tint)', borderRadius: 8, fontSize: '0.875rem', color: 'var(--text-muted)' }}>
              <strong style={{ color: 'var(--soil)' }}>{plant.icon} {plant.name}</strong> — {plant.variety}
              {plant.location && <span style={{ marginLeft: 8, color: 'var(--text-light)' }}>📍 {plant.location}</span>}
            </div>
            <div className="form-group">
              <label className="form-label">Date & Time</label>
              <input
                type="datetime-local"
                className="form-input"
                value={form.wateredAt}
                onChange={e => setForm(f => ({ ...f, wateredAt: e.target.value }))}
                required
              />
            </div>
            <div className="form-group">
              <label className="form-label">Notes (optional)</label>
              <input
                className="form-input"
                placeholder="e.g. Deep soak, used fertilizer…"
                value={form.notes}
                onChange={e => setForm(f => ({ ...f, notes: e.target.value }))}
              />
            </div>
          </div>
          <div className="modal-footer">
            <button type="button" className="btn btn-secondary" onClick={onClose}>Cancel</button>
            <button type="submit" className="btn btn-primary" style={{ background: 'var(--sky)' }}>
              <Droplets size={15} /> Log Watering
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

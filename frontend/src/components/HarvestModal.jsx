import { useState } from 'react';
import { Apple, X } from 'lucide-react';

export default function HarvestModal({ plant, onSave, onClose }) {
  const [form, setForm] = useState({
    harvestedAt: new Date().toISOString().slice(0, 10),
    quantity: '',
    unit: plant?.harvestUnit || 'count',
    notes: '',
  });

  const submit = (e) => {
    e.preventDefault();
    onSave({
      plantId: plant.id,
      plantName: `${plant.name} – ${plant.variety}`,
      quantity: parseFloat(form.quantity) || null,
      unit: form.unit,
      harvestedAt: new Date(form.harvestedAt).toISOString(),
      notes: form.notes,
    });
  };

  return (
    <div className="modal-backdrop" onClick={onClose}>
      <div className="modal" style={{ maxWidth: 420 }} onClick={e => e.stopPropagation()}>
        <div className="modal-header">
          <h3 style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
            <Apple size={20} style={{ color: 'var(--coral)' }} />
            Log Harvest
          </h3>
          <button className="btn btn-ghost btn-icon" onClick={onClose}><X size={18} /></button>
        </div>
        <form onSubmit={submit}>
          <div className="modal-body">
            <div style={{ padding: '10px 14px', background: 'var(--surface-tint)', borderRadius: 8, fontSize: '0.875rem' }}>
              <strong style={{ color: 'var(--soil)' }}>{plant?.icon} {plant?.name}</strong> — {plant?.variety}
            </div>
            <div className="form-group">
              <label className="form-label">Date</label>
              <input
                type="date"
                className="form-input"
                value={form.harvestedAt}
                onChange={e => setForm(f => ({ ...f, harvestedAt: e.target.value }))}
                required
              />
            </div>
            <div className="grid-2">
              <div className="form-group">
                <label className="form-label">Quantity</label>
                <input
                  type="number"
                  step="0.1"
                  min="0"
                  className="form-input"
                  placeholder="0"
                  value={form.quantity}
                  onChange={e => setForm(f => ({ ...f, quantity: e.target.value }))}
                />
              </div>
              <div className="form-group">
                <label className="form-label">Unit</label>
                <select className="form-input form-select" value={form.unit} onChange={e => setForm(f => ({ ...f, unit: e.target.value }))}>
                  <option value="count">Count</option>
                  <option value="lbs">Lbs</option>
                  <option value="oz">Oz</option>
                  <option value="bunch">Bunch</option>
                  <option value="bag">Bag</option>
                </select>
              </div>
            </div>
            <div className="form-group">
              <label className="form-label">Notes (optional)</label>
              <textarea
                className="form-input"
                placeholder="Quality notes, what you made with it…"
                value={form.notes}
                onChange={e => setForm(f => ({ ...f, notes: e.target.value }))}
              />
            </div>
          </div>
          <div className="modal-footer">
            <button type="button" className="btn btn-secondary" onClick={onClose}>Cancel</button>
            <button type="submit" className="btn btn-primary" style={{ background: 'var(--coral)' }}>
              <Apple size={15} /> Log Harvest
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

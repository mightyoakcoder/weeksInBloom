import { useState, useEffect } from 'react';
import { X } from 'lucide-react';
import { SEED_CATALOG, PLANT_STATUSES, LOCATIONS } from '../lib/seeds.js';

const EMPTY = {
  name: '', variety: '', type: 'vegetable', icon: '🌱',
  status: 'planned', location: '', wateringFrequency: 3,
  seededAt: '', germinatedAt: '', transplantedAt: '',
  indoorStart: '', transplant: '', directSow: '', notes: '',
  harvestUnit: 'count',
};

export default function PlantModal({ plant, onSave, onClose }) {
  const [form, setForm] = useState(EMPTY);
  const [seedSearch, setSeedSearch] = useState('');

  useEffect(() => {
    if (plant) setForm({ ...EMPTY, ...plant });
  }, [plant]);

  const set = (k, v) => setForm(f => ({ ...f, [k]: v }));

  const fillFromCatalog = (seed) => {
    setForm(f => ({
      ...f,
      name: seed.name,
      variety: seed.variety,
      type: seed.type,
      icon: seed.icon,
      wateringFrequency: seed.wateringFrequency,
      indoorStart: seed.indoorStart || '',
      transplant: seed.transplant || '',
      directSow: seed.directSow || '',
      notes: seed.notes || '',
      location: seed.location || '',
      harvestUnit: seed.harvestUnit || 'count',
    }));
    setSeedSearch('');
  };

  const submit = (e) => {
    e.preventDefault();
    onSave(form);
  };

  const filtered = SEED_CATALOG.filter(s =>
    s.name.toLowerCase().includes(seedSearch.toLowerCase()) ||
    s.variety.toLowerCase().includes(seedSearch.toLowerCase())
  );

  return (
    <div className="modal-backdrop" onClick={onClose}>
      <div className="modal" onClick={e => e.stopPropagation()}>
        <div className="modal-header">
          <h3>{plant ? 'Edit Plant' : 'Add Plant'}</h3>
          <button className="btn btn-ghost btn-icon" onClick={onClose}><X size={18} /></button>
        </div>

        <form onSubmit={submit}>
          <div className="modal-body">
            {/* Quick-fill from seed catalog */}
            {!plant && (
              <div className="form-group">
                <label className="form-label">Quick-fill from your seed list</label>
                <input
                  className="form-input"
                  placeholder="Search seeds (e.g. tomato, zinnia…)"
                  value={seedSearch}
                  onChange={e => setSeedSearch(e.target.value)}
                />
                {seedSearch && (
                  <div style={{
                    border: '1px solid var(--border)',
                    borderRadius: 'var(--radius-sm)',
                    background: 'var(--surface)',
                    maxHeight: 200,
                    overflowY: 'auto',
                    boxShadow: 'var(--shadow)',
                  }}>
                    {filtered.length === 0 && (
                      <div style={{ padding: '10px 14px', color: 'var(--text-muted)', fontSize: '0.85rem' }}>No matches</div>
                    )}
                    {filtered.map((s, i) => (
                      <button
                        key={i}
                        type="button"
                        style={{
                          display: 'flex', alignItems: 'center', gap: 10,
                          width: '100%', padding: '10px 14px',
                          borderBottom: '1px solid var(--border)',
                          background: 'none', cursor: 'pointer',
                          textAlign: 'left',
                        }}
                        onClick={() => fillFromCatalog(s)}
                        onMouseEnter={e => e.currentTarget.style.background = 'var(--bg)'}
                        onMouseLeave={e => e.currentTarget.style.background = 'none'}
                      >
                        <span>{s.icon}</span>
                        <div>
                          <div style={{ fontWeight: 500, fontSize: '0.875rem' }}>{s.name}</div>
                          <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>{s.variety}</div>
                        </div>
                      </button>
                    ))}
                  </div>
                )}
              </div>
            )}

            <div className="grid-2">
              <div className="form-group">
                <label className="form-label">Plant Name *</label>
                <input className="form-input" required value={form.name} onChange={e => set('name', e.target.value)} placeholder="e.g. Tomato" />
              </div>
              <div className="form-group">
                <label className="form-label">Variety</label>
                <input className="form-input" value={form.variety} onChange={e => set('variety', e.target.value)} placeholder="e.g. Red Cherry" />
              </div>
            </div>

            <div className="grid-2">
              <div className="form-group">
                <label className="form-label">Type</label>
                <select className="form-input form-select" value={form.type} onChange={e => set('type', e.target.value)}>
                  <option value="vegetable">🥦 Vegetable</option>
                  <option value="flower">🌸 Flower</option>
                  <option value="herb">🌿 Herb</option>
                </select>
              </div>
              <div className="form-group">
                <label className="form-label">Status</label>
                <select className="form-input form-select" value={form.status} onChange={e => set('status', e.target.value)}>
                  {PLANT_STATUSES.map(s => (
                    <option key={s.value} value={s.value}>{s.label}</option>
                  ))}
                </select>
              </div>
            </div>

            <div className="grid-2">
              <div className="form-group">
                <label className="form-label">Location</label>
                <select className="form-input form-select" value={form.location} onChange={e => set('location', e.target.value)}>
                  <option value="">Select…</option>
                  {LOCATIONS.map(l => <option key={l} value={l}>{l}</option>)}
                </select>
              </div>
              <div className="form-group">
                <label className="form-label">Watering every (days)</label>
                <input type="number" min={1} max={14} className="form-input" value={form.wateringFrequency} onChange={e => set('wateringFrequency', parseInt(e.target.value))} />
              </div>
            </div>

            <div className="grid-2">
              <div className="form-group">
                <label className="form-label">Seeded On</label>
                <input type="date" className="form-input" value={form.seededAt?.slice(0,10) || ''} onChange={e => set('seededAt', e.target.value ? new Date(e.target.value).toISOString() : '')} />
              </div>
              <div className="form-group">
                <label className="form-label">Germinated On</label>
                <input type="date" className="form-input" value={form.germinatedAt?.slice(0,10) || ''} onChange={e => set('germinatedAt', e.target.value ? new Date(e.target.value).toISOString() : '')} />
              </div>
            </div>

            <div className="grid-2">
              <div className="form-group">
                <label className="form-label">Transplanted On</label>
                <input type="date" className="form-input" value={form.transplantedAt?.slice(0,10) || ''} onChange={e => set('transplantedAt', e.target.value ? new Date(e.target.value).toISOString() : '')} />
              </div>
              <div className="form-group">
                <label className="form-label">Harvest Unit</label>
                <select className="form-input form-select" value={form.harvestUnit} onChange={e => set('harvestUnit', e.target.value)}>
                  <option value="count">Count</option>
                  <option value="lbs">Lbs</option>
                  <option value="oz">Oz</option>
                  <option value="bunch">Bunch</option>
                  <option value="bag">Bag</option>
                </select>
              </div>
            </div>

            <div className="form-group">
              <label className="form-label">Notes</label>
              <textarea className="form-input" value={form.notes} onChange={e => set('notes', e.target.value)} placeholder="Growing tips, observations…" />
            </div>
          </div>

          <div className="modal-footer">
            <button type="button" className="btn btn-secondary" onClick={onClose}>Cancel</button>
            <button type="submit" className="btn btn-primary">
              {plant ? 'Save Changes' : 'Add Plant'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

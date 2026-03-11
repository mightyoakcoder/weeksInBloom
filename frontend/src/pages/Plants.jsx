import { useState, useEffect } from 'react';
import { Plus, Search, Filter } from 'lucide-react';
import { api } from '../lib/api.js';
import PlantCard from '../components/PlantCard.jsx';
import PlantModal from '../components/PlantModal.jsx';
import WaterModal from '../components/WaterModal.jsx';
import HarvestModal from '../components/HarvestModal.jsx';
import { useToast } from '../hooks/useToast.jsx';

export default function PlantsPage() {
  const [plants, setPlants] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showAdd, setShowAdd] = useState(false);
  const [editPlant, setEditPlant] = useState(null);
  const [wateringPlant, setWateringPlant] = useState(null);
  const [harvestingPlant, setHarvestingPlant] = useState(null);
  const [search, setSearch] = useState('');
  const [filterType, setFilterType] = useState('all');
  const [filterStatus, setFilterStatus] = useState('all');
  const toast = useToast();

  const load = async () => {
    try {
      setPlants(await api.getPlants());
    } catch (e) { toast(e.message, 'error'); }
    finally { setLoading(false); }
  };

  useEffect(() => { load(); }, []);

  const handleSave = async (form) => {
    try {
      if (editPlant) {
        await api.updatePlant(editPlant.id, form);
        toast('Plant updated!');
        setEditPlant(null);
      } else {
        await api.createPlant(form);
        toast('Plant added!');
        setShowAdd(false);
      }
      load();
    } catch (e) { toast(e.message, 'error'); }
  };

  const handleWater = async (data) => {
    try {
      await api.logWatering(data);
      toast('Watering logged! 💧');
      setWateringPlant(null);
      load();
    } catch (e) { toast(e.message, 'error'); }
  };

  const handleHarvest = async (data) => {
    try {
      await api.logHarvest(data);
      toast('Harvest logged! 🧺');
      setHarvestingPlant(null);
      load();
    } catch (e) { toast(e.message, 'error'); }
  };

  const filtered = plants.filter(p => {
    if (filterType !== 'all' && p.type !== filterType) return false;
    if (filterStatus !== 'all' && p.status !== filterStatus) return false;
    if (search && !`${p.name} ${p.variety}`.toLowerCase().includes(search.toLowerCase())) return false;
    return true;
  });

  return (
    <>
      <div className="page-header">
        <div>
          <h2>My Plants</h2>
          <p>{plants.length} plant{plants.length !== 1 ? 's' : ''} this season</p>
        </div>
        <button className="btn btn-primary" onClick={() => setShowAdd(true)}>
          <Plus size={16} /> Add Plant
        </button>
      </div>

      <div className="page-body">
        {/* Filters */}
        <div style={{ display: 'flex', gap: 12, marginBottom: 24, flexWrap: 'wrap' }}>
          <div style={{ position: 'relative', flex: 1, minWidth: 200 }}>
            <Search size={15} style={{ position: 'absolute', left: 12, top: '50%', transform: 'translateY(-50%)', color: 'var(--text-light)' }} />
            <input
              className="form-input"
              style={{ paddingLeft: 36 }}
              placeholder="Search plants…"
              value={search}
              onChange={e => setSearch(e.target.value)}
            />
          </div>
          <select className="form-input form-select" style={{ width: 'auto' }} value={filterType} onChange={e => setFilterType(e.target.value)}>
            <option value="all">All Types</option>
            <option value="vegetable">🥦 Vegetables</option>
            <option value="flower">🌸 Flowers</option>
            <option value="herb">🌿 Herbs</option>
          </select>
          <select className="form-input form-select" style={{ width: 'auto' }} value={filterStatus} onChange={e => setFilterStatus(e.target.value)}>
            <option value="all">All Statuses</option>
            <option value="planned">Planned</option>
            <option value="seeded">Seeds Started</option>
            <option value="sprouted">Sprouted</option>
            <option value="indoor">Growing Indoors</option>
            <option value="hardening">Hardening Off</option>
            <option value="outdoor">Outdoors</option>
            <option value="harvesting">Harvesting</option>
            <option value="done">Done</option>
          </select>
        </div>

        {loading ? (
          <div style={{ color: 'var(--text-muted)', padding: 20 }}>Loading plants…</div>
        ) : filtered.length === 0 ? (
          <div className="empty-state">
            <span className="emoji">🌱</span>
            <h3>{plants.length === 0 ? "No plants yet" : "No matches"}</h3>
            <p>{plants.length === 0 ? "Add your first plant to get started!" : "Try adjusting your filters."}</p>
            {plants.length === 0 && (
              <button className="btn btn-primary" style={{ marginTop: 16 }} onClick={() => setShowAdd(true)}>
                <Plus size={16} /> Add First Plant
              </button>
            )}
          </div>
        ) : (
          <div className="grid-auto">
            {filtered.map(p => (
              <PlantCard
                key={p.id}
                plant={p}
                onWater={setWateringPlant}
                onHarvest={setHarvestingPlant}
                onEdit={setEditPlant}
              />
            ))}
          </div>
        )}
      </div>

      {(showAdd || editPlant) && (
        <PlantModal
          plant={editPlant}
          onSave={handleSave}
          onClose={() => { setShowAdd(false); setEditPlant(null); }}
        />
      )}
      {wateringPlant && <WaterModal plant={wateringPlant} onSave={handleWater} onClose={() => setWateringPlant(null)} />}
      {harvestingPlant && <HarvestModal plant={harvestingPlant} onSave={handleHarvest} onClose={() => setHarvestingPlant(null)} />}
    </>
  );
}

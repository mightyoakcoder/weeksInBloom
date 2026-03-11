const BASE = '/api';

async function request(path, options = {}) {
  const res = await fetch(`${BASE}${path}`, {
    headers: { 'Content-Type': 'application/json', ...options.headers },
    ...options,
  });
  if (!res.ok) {
    const err = await res.json().catch(() => ({}));
    throw new Error(err.error || `HTTP ${res.status}`);
  }
  return res.json();
}

export const api = {
  // Plants
  getPlants: () => request('/plants'),
  getPlant: (id) => request(`/plants/${id}`),
  createPlant: (data) => request('/plants', { method: 'POST', body: JSON.stringify(data) }),
  updatePlant: (id, data) => request(`/plants/${id}`, { method: 'PATCH', body: JSON.stringify(data) }),
  deletePlant: (id) => request(`/plants/${id}`, { method: 'DELETE' }),

  // Watering
  getWateringLogs: (plantId) => request(`/watering/plant/${plantId}`),
  getRecentWatering: () => request('/watering/recent'),
  logWatering: (data) => request('/watering', { method: 'POST', body: JSON.stringify(data) }),
  deleteWateringLog: (id) => request(`/watering/${id}`, { method: 'DELETE' }),

  // Harvest
  getHarvestLogs: (plantId) => request(`/harvest/plant/${plantId}`),
  getAllHarvests: () => request('/harvest'),
  logHarvest: (data) => request('/harvest', { method: 'POST', body: JSON.stringify(data) }),
  deleteHarvestLog: (id) => request(`/harvest/${id}`, { method: 'DELETE' }),

  // Photos
  uploadPhoto: async (file, plantId) => {
    const form = new FormData();
    form.append('photo', file);
    form.append('plantId', plantId);
    const res = await fetch(`${BASE}/photos/upload`, { method: 'POST', body: form });
    if (!res.ok) throw new Error('Upload failed');
    return res.json();
  },
};

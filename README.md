# 🌱 Weeks in Bloom

A full-stack garden tracking app built with React + Vite (frontend), Node.js/Express (backend), Firestore (database), and Cloud Storage (photos). Deployable to Cloud Run.

Pre-loaded with your 2026 seed list for Attleboro, MA (Zone 6a).

---

## Features

- **Plant tracker** — add plants with status, location, seeded/germinated/transplanted dates
- **Seed catalog quick-fill** — search your pre-loaded seed list to auto-fill forms
- **Watering log** — log each watering event, see who's overdue with visual progress bars
- **Harvest log** — track quantity + unit, view season summaries per plant
- **Schedule view** — Gantt-style calendar showing indoor start → transplant → harvest for every plant
- **Dashboard** — overdue watering alerts, recent activity feed, week's to-do list
- **Photo uploads** — store plant photos in Cloud Storage

---

## Project Structure

```
weeks-in-bloom/
├── frontend/          # React + Vite
│   └── src/
│       ├── components/  PlantCard, PlantModal, WaterModal, HarvestModal, Sidebar
│       ├── pages/       Dashboard, Plants, PlantDetail, Watering, Harvest, Schedule
│       ├── hooks/       useToast
│       └── lib/         api.js, seeds.js
├── backend/           # Node.js + Express
│   └── src/
│       ├── routes/    plants.js, watering.js, harvest.js, photos.js
│       ├── db.js      Firestore client
│       └── storage.js Cloud Storage client
├── Dockerfile
├── deploy.sh
└── firestore.indexes.json
```

---

## Local Development

### Prerequisites
- Node.js 20+
- A Google Cloud project with Firestore (Native mode) enabled
- A service account key with Firestore + Storage permissions

### Setup

```bash
# 1. Install all dependencies
npm install

# 2. Set up credentials (for local dev)
export GOOGLE_APPLICATION_CREDENTIALS="/path/to/service-account-key.json"
export GOOGLE_CLOUD_PROJECT="your-project-id"
export GCS_BUCKET_NAME="weeks-in-bloom-bucket"

# 3. Deploy Firestore indexes
firebase deploy --only firestore:indexes
# OR via gcloud:
gcloud firestore indexes create --file=firestore.indexes.json

# 4. Run dev servers (frontend on :5173, backend on :8080)
npm run dev
```

The Vite dev server proxies `/api` calls to `localhost:8080` automatically.

---

## Deploy to Cloud Run

```bash
# Set your project
export GOOGLE_CLOUD_PROJECT="your-project-id"

# Make script executable and run
chmod +x deploy.sh
./deploy.sh
```

The script will:
1. Build the Docker image via Cloud Build
2. Create the Cloud Storage bucket
3. Deploy to Cloud Run (no auth required — add IAP if you want auth)

### Manual gcloud deploy (alternative)

```bash
gcloud builds submit --tag gcr.io/YOUR_PROJECT/weeks-in-bloom .

gcloud run deploy weeks-in-bloom \
  --image gcr.io/YOUR_PROJECT/weeks-in-bloom \
  --region us-central1 \
  --allow-unauthenticated \
  --set-env-vars GOOGLE_CLOUD_PROJECT=YOUR_PROJECT,GCS_BUCKET_NAME=weeks-in-bloom-bucket,NODE_ENV=production
```

---

## Firestore Collections

| Collection | Description |
|---|---|
| `plants` | One doc per plant (name, variety, status, dates, etc.) |
| `watering_logs` | Each watering event, linked to plant by `plantId` |
| `harvest_logs` | Each harvest event with quantity + unit |

---

## Environment Variables

| Variable | Description | Default |
|---|---|---|
| `PORT` | HTTP port | `8080` |
| `GOOGLE_CLOUD_PROJECT` | GCP project ID | — |
| `GCS_BUCKET_NAME` | Cloud Storage bucket | `weeks-in-bloom-bucket` |
| `NODE_ENV` | `production` serves static frontend | — |
| `FRONTEND_URL` | CORS origin (dev only) | `http://localhost:5173` |

---

## Customizing Your Seed List

Edit `frontend/src/lib/seeds.js` to update the pre-populated seed catalog, watering frequencies, locations, and harvest units.

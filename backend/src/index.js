import express from 'express';
import cors from 'cors';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';
import plantsRouter from './routes/plants.js';
import wateringRouter from './routes/watering.js';
import harvestRouter from './routes/harvest.js';
import photosRouter from './routes/photos.js';

const app = express();
const PORT = process.env.PORT || 8080;
const __dirname = dirname(fileURLToPath(import.meta.url));
const isProd = process.env.NODE_ENV === 'production';

app.use(cors({
  origin: isProd ? false : (process.env.FRONTEND_URL || 'http://localhost:5173'),
  credentials: true,
}));
app.use(express.json());

app.get('/health', (_, res) => res.json({ status: 'ok' }));

app.use('/api/plants', plantsRouter);
app.use('/api/watering', wateringRouter);
app.use('/api/harvest', harvestRouter);
app.use('/api/photos', photosRouter);

// Serve built frontend in production
// __dirname = /app/src, public is at /app/public
if (isProd) {
  const publicDir = join(__dirname, '../public');
  app.use(express.static(publicDir));
  app.get('*', (req, res) => {
    res.sendFile(join(publicDir, 'index.html'));
  });
}

app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({ error: err.message || 'Internal server error' });
});

app.listen(PORT, () => {
  console.log(`Garden Tracker API running on port ${PORT}`);
});

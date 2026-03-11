import { Router } from 'express';
import { v4 as uuidv4 } from 'uuid';
import db from '../db.js';

const router = Router();
const COL = 'harvest_logs';

// GET all harvests for a plant
router.get('/plant/:plantId', async (req, res, next) => {
  try {
    const snapshot = await db.collection(COL)
      .where('plantId', '==', req.params.plantId)
      .orderBy('harvestedAt', 'desc')
      .get();
    res.json(snapshot.docs.map(d => ({ id: d.id, ...d.data() })));
  } catch (err) { next(err); }
});

// GET all harvests (dashboard / summary)
router.get('/', async (req, res, next) => {
  try {
    const snapshot = await db.collection(COL)
      .orderBy('harvestedAt', 'desc')
      .limit(200)
      .get();
    res.json(snapshot.docs.map(d => ({ id: d.id, ...d.data() })));
  } catch (err) { next(err); }
});

// POST log a harvest
router.post('/', async (req, res, next) => {
  try {
    const id = uuidv4();
    const log = {
      plantId: req.body.plantId,
      plantName: req.body.plantName,
      quantity: req.body.quantity || null,
      unit: req.body.unit || '',        // e.g. "lbs", "count", "bunch"
      harvestedAt: req.body.harvestedAt || new Date().toISOString(),
      notes: req.body.notes || '',
      photoUrl: req.body.photoUrl || null,
      createdAt: new Date().toISOString(),
    };
    await db.collection(COL).doc(id).set(log);

    // Update plant's lastHarvested
    await db.collection('plants').doc(req.body.plantId).update({
      lastHarvested: log.harvestedAt,
      updatedAt: new Date().toISOString(),
    });

    res.status(201).json({ id, ...log });
  } catch (err) { next(err); }
});

// DELETE a harvest log
router.delete('/:id', async (req, res, next) => {
  try {
    await db.collection(COL).doc(req.params.id).delete();
    res.json({ success: true });
  } catch (err) { next(err); }
});

export default router;

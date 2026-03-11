import { Router } from 'express';
import { v4 as uuidv4 } from 'uuid';
import db from '../db.js';

const router = Router();
const COL = 'watering_logs';

// GET logs for a plant
router.get('/plant/:plantId', async (req, res, next) => {
  try {
    const snapshot = await db.collection(COL)
      .where('plantId', '==', req.params.plantId)
      .orderBy('wateredAt', 'desc')
      .limit(50)
      .get();
    res.json(snapshot.docs.map(d => ({ id: d.id, ...d.data() })));
  } catch (err) { next(err); }
});

// GET recent logs across all plants (dashboard)
router.get('/recent', async (req, res, next) => {
  try {
    const snapshot = await db.collection(COL)
      .orderBy('wateredAt', 'desc')
      .limit(100)
      .get();
    res.json(snapshot.docs.map(d => ({ id: d.id, ...d.data() })));
  } catch (err) { next(err); }
});

// POST log a watering event
router.post('/', async (req, res, next) => {
  try {
    const id = uuidv4();
    const log = {
      plantId: req.body.plantId,
      plantName: req.body.plantName,
      location: req.body.location || null,
      wateredAt: req.body.wateredAt || new Date().toISOString(),
      notes: req.body.notes || '',
      createdAt: new Date().toISOString(),
    };
    await db.collection(COL).doc(id).set(log);

    // Update plant's lastWatered field
    await db.collection('plants').doc(req.body.plantId).update({
      lastWatered: log.wateredAt,
      updatedAt: new Date().toISOString(),
    });

    res.status(201).json({ id, ...log });
  } catch (err) { next(err); }
});

// DELETE a watering log
router.delete('/:id', async (req, res, next) => {
  try {
    await db.collection(COL).doc(req.params.id).delete();
    res.json({ success: true });
  } catch (err) { next(err); }
});

export default router;

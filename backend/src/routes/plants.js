import { Router } from 'express';
import { v4 as uuidv4 } from 'uuid';
import db from '../db.js';

const router = Router();
const COL = 'plants';

// GET all plants
router.get('/', async (req, res, next) => {
  try {
    const snapshot = await db.collection(COL).orderBy('createdAt', 'desc').get();
    const plants = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
    res.json(plants);
  } catch (err) { next(err); }
});

// GET single plant
router.get('/:id', async (req, res, next) => {
  try {
    const doc = await db.collection(COL).doc(req.params.id).get();
    if (!doc.exists) return res.status(404).json({ error: 'Not found' });
    res.json({ id: doc.id, ...doc.data() });
  } catch (err) { next(err); }
});

// POST create plant
router.post('/', async (req, res, next) => {
  try {
    const id = uuidv4();
    const now = new Date().toISOString();
    const plant = {
      ...req.body,
      createdAt: now,
      updatedAt: now,
    };
    await db.collection(COL).doc(id).set(plant);
    res.status(201).json({ id, ...plant });
  } catch (err) { next(err); }
});

// PATCH update plant
router.patch('/:id', async (req, res, next) => {
  try {
    const ref = db.collection(COL).doc(req.params.id);
    const updates = { ...req.body, updatedAt: new Date().toISOString() };
    await ref.update(updates);
    const updated = await ref.get();
    res.json({ id: updated.id, ...updated.data() });
  } catch (err) { next(err); }
});

// DELETE plant
router.delete('/:id', async (req, res, next) => {
  try {
    await db.collection(COL).doc(req.params.id).delete();
    res.json({ success: true });
  } catch (err) { next(err); }
});

export default router;

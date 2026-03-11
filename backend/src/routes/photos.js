import { Router } from 'express';
import multer from 'multer';
import { v4 as uuidv4 } from 'uuid';
import { bucket } from '../storage.js';

const router = Router();
const upload = multer({ storage: multer.memoryStorage(), limits: { fileSize: 10 * 1024 * 1024 } });

// POST upload a photo, returns public URL
router.post('/upload', upload.single('photo'), async (req, res, next) => {
  try {
    if (!req.file) return res.status(400).json({ error: 'No file uploaded' });

    const ext = req.file.originalname.split('.').pop();
    const filename = `${req.body.plantId || 'general'}/${uuidv4()}.${ext}`;
    const blob = bucket.file(filename);

    await blob.save(req.file.buffer, {
      contentType: req.file.mimetype,
      resumable: false,
    });

    await blob.makePublic();

    const publicUrl = `https://storage.googleapis.com/${bucket.name}/${filename}`;
    res.json({ url: publicUrl, filename });
  } catch (err) { next(err); }
});

// DELETE a photo from Cloud Storage
router.delete('/', async (req, res, next) => {
  try {
    const { filename } = req.body;
    if (!filename) return res.status(400).json({ error: 'filename required' });
    await bucket.file(filename).delete();
    res.json({ success: true });
  } catch (err) { next(err); }
});

export default router;

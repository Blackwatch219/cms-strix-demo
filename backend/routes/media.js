const express = require('express');
const multer = require('multer');
const path = require('path');
const fs = require('fs');
const db = require('../db');
const { authenticateToken } = require('../middleware/auth');

const router = express.Router();

const uploadsDir = path.join(__dirname, '..', 'uploads');
if (!fs.existsSync(uploadsDir)) {
  fs.mkdirSync(uploadsDir, { recursive: true });
}

const storage = multer.diskStorage({
  destination: (req, file, cb) => cb(null, uploadsDir),
  filename: (req, file, cb) => {
    const uniqueName = Date.now() + '-' + Math.round(Math.random() * 1e9) + path.extname(file.originalname);
    cb(null, uniqueName);
  }
});

const upload = multer({ storage, limits: { fileSize: 10 * 1024 * 1024 } });

router.use(authenticateToken);

router.post('/upload', upload.single('file'), (req, res) => {
  if (!req.file) {
    return res.status(400).json({ error: 'No file provided' });
  }

  const result = db.prepare(`
    INSERT INTO media (filename, original_name, mime_type, size, uploaded_by)
    VALUES (?, ?, ?, ?, ?)
  `).run(req.file.filename, req.file.originalname, req.file.mimetype, req.file.size, req.user.id);

  res.status(201).json({
    id: result.lastInsertRowid,
    url: `/uploads/${req.file.filename}`,
    original_name: req.file.originalname
  });
});

router.get('/', (req, res) => {
  const media = db.prepare('SELECT * FROM media ORDER BY created_at DESC').all();
  res.json(media);
});

router.delete('/:id', (req, res) => {
  const file = db.prepare('SELECT * FROM media WHERE id = ?').get(req.params.id);
  if (!file) {
    return res.status(404).json({ error: 'File not found' });
  }

  const filePath = path.join(uploadsDir, file.filename);
  if (fs.existsSync(filePath)) {
    fs.unlinkSync(filePath);
  }

  db.prepare('DELETE FROM media WHERE id = ?').run(req.params.id);
  res.json({ message: 'File deleted' });
});

module.exports = router;

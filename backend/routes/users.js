const express = require('express');
const db = require('../db');
const { authenticateToken, requireAdmin } = require('../middleware/auth');

const router = express.Router();

router.use(authenticateToken);

router.get('/', requireAdmin, (req, res) => {
  const users = db.prepare('SELECT id, username, email, role, created_at FROM users').all();
  res.json(users);
});

router.get('/:id', (req, res) => {
  const user = db.prepare('SELECT id, username, email, role, created_at FROM users WHERE id = ?').get(req.params.id);
  if (!user) {
    return res.status(404).json({ error: 'User not found' });
  }
  res.json(user);
});

router.put('/:id', requireAdmin, (req, res) => {
  const { role, email } = req.body;

  db.prepare('UPDATE users SET role = ?, email = ? WHERE id = ?')
    .run(role || 'editor', email || null, req.params.id);

  res.json({ message: 'User updated' });
});

router.delete('/:id', requireAdmin, (req, res) => {
  if (Number(req.params.id) === req.user.id) {
    return res.status(400).json({ error: 'Cannot delete your own account' });
  }

  db.prepare('DELETE FROM users WHERE id = ?').run(req.params.id);
  res.json({ message: 'User deleted' });
});

module.exports = router;

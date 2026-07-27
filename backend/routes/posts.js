const express = require('express');
const db = require('../db');
const { authenticateToken } = require('../middleware/auth');

const router = express.Router();

router.use(authenticateToken);

router.get('/', (req, res) => {
  const { status, search, limit = 20, offset = 0 } = req.query;

  let query = `
    SELECT p.*, u.username as author_name
    FROM posts p
    LEFT JOIN users u ON p.author_id = u.id
  `;
  const conditions = [];
  const params = [];

  if (status) {
    conditions.push('p.status = ?');
    params.push(status);
  }

  if (search) {
    conditions.push('(p.title LIKE ? OR p.content LIKE ?)');
    params.push(`%${search}%`, `%${search}%`);
  }

  if (conditions.length > 0) {
    query += ' WHERE ' + conditions.join(' AND ');
  }

  query += ' ORDER BY p.created_at DESC LIMIT ? OFFSET ?';
  params.push(Number(limit), Number(offset));

  const posts = db.prepare(query).all(...params);
  const countRow = db.prepare('SELECT COUNT(*) as total FROM posts').get();

  res.json({ posts, total: countRow.total });
});

router.get('/:id', (req, res) => {
  const post = db.prepare(`
    SELECT p.*, u.username as author_name
    FROM posts p
    LEFT JOIN users u ON p.author_id = u.id
    WHERE p.id = ?
  `).get(req.params.id);

  if (!post) {
    return res.status(404).json({ error: 'Post not found' });
  }
  res.json(post);
});

router.get('/slug/:slug', (req, res) => {
  const post = db.prepare(`
    SELECT p.*, u.username as author_name
    FROM posts p
    LEFT JOIN users u ON p.author_id = u.id
    WHERE p.slug = ?
  `).get(req.params.slug);

  if (!post) {
    return res.status(404).json({ error: 'Post not found' });
  }
  res.json(post);
});

router.post('/', (req, res) => {
  const { title, content, excerpt, status, slug } = req.body;

  if (!title) {
    return res.status(400).json({ error: 'Title is required' });
  }

  const postSlug = slug || title.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '');

  try {
    const result = db.prepare(`
      INSERT INTO posts (title, slug, content, excerpt, author_id, status)
      VALUES (?, ?, ?, ?, ?, ?)
    `).run(title, postSlug, content || '', excerpt || '', req.user.id, status || 'draft');

    res.status(201).json({ id: result.lastInsertRowid, slug: postSlug });
  } catch (err) {
    if (err.message.includes('UNIQUE')) {
      return res.status(409).json({ error: 'A post with this slug already exists' });
    }
    res.status(500).json({ error: 'Failed to create post' });
  }
});

router.put('/:id', (req, res) => {
  const { title, content, excerpt, status, slug } = req.body;
  const post = db.prepare('SELECT * FROM posts WHERE id = ?').get(req.params.id);

  if (!post) {
    return res.status(404).json({ error: 'Post not found' });
  }

  const postSlug = slug || (title ? title.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '') : post.slug);

  db.prepare(`
    UPDATE posts
    SET title = ?, slug = ?, content = ?, excerpt = ?, status = ?, updated_at = CURRENT_TIMESTAMP
    WHERE id = ?
  `).run(
    title || post.title,
    postSlug,
    content !== undefined ? content : post.content,
    excerpt !== undefined ? excerpt : post.excerpt,
    status || post.status,
    req.params.id
  );

  res.json({ message: 'Post updated' });
});

router.delete('/:id', (req, res) => {
  const result = db.prepare('DELETE FROM posts WHERE id = ?').run(req.params.id);
  if (result.changes === 0) {
    return res.status(404).json({ error: 'Post not found' });
  }
  res.json({ message: 'Post deleted' });
});

module.exports = router;

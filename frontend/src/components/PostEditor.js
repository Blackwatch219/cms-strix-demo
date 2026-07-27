import React, { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { postsAPI } from '../api';

function PostEditor() {
  const { id } = useParams();
  const isEditing = Boolean(id);
  const navigate = useNavigate();

  const [form, setForm] = useState({
    title: '', content: '', excerpt: '', status: 'draft', slug: ''
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  useEffect(() => {
    if (isEditing) {
      const fetchPost = async () => {
        try {
          const response = await postsAPI.getById(id);
          const p = response.data;
          setForm({
            title: p.title, content: p.content, excerpt: p.excerpt || '',
            status: p.status, slug: p.slug
          });
        } catch (err) {
          setError('Failed to load post');
        }
      };
      fetchPost();
    }
  }, [id, isEditing]);

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
    setError('');
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    setSuccess('');

    try {
      if (isEditing) {
        await postsAPI.update(id, form);
        setSuccess('Post updated successfully!');
      } else {
        await postsAPI.create(form);
        setSuccess('Post created successfully!');
        navigate('/');
      }
    } catch (err) {
      setError(err.response?.data?.error || 'Failed to save post');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div>
      <div className="page-header">
        <h2>{isEditing ? 'Edit Post' : 'New Post'}</h2>
        <button className="btn btn-sm" onClick={() => navigate('/')}>Back</button>
      </div>
      {error && <div className="error-message">{error}</div>}
      {success && <div className="success-message">{success}</div>}
      <div className="card">
        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <label>Title</label>
            <input type="text" name="title" value={form.title}
              onChange={handleChange} required />
          </div>
          <div className="form-group">
            <label>Slug</label>
            <input type="text" name="slug" value={form.slug}
              onChange={handleChange} placeholder="Auto-generated from title if empty" />
          </div>
          <div className="form-group">
            <label>Excerpt</label>
            <textarea name="excerpt" value={form.excerpt}
              onChange={handleChange} rows={3} placeholder="Brief description..." />
          </div>
          <div className="form-group">
            <label>Content</label>
            <textarea name="content" value={form.content}
              onChange={handleChange} placeholder="Write your post content here..." />
          </div>
          <div className="form-group">
            <label>Status</label>
            <select name="status" value={form.status} onChange={handleChange}>
              <option value="draft">Draft</option>
              <option value="published">Published</option>
            </select>
          </div>
          <button type="submit" className="btn btn-primary" disabled={loading}>
            {loading ? 'Saving...' : (isEditing ? 'Update Post' : 'Create Post')}
          </button>
        </form>
      </div>
    </div>
  );
}

export default PostEditor;

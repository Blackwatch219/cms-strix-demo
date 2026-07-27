import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { postsAPI } from '../api';

function PostList() {
  const [posts, setPosts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const navigate = useNavigate();

  const fetchPosts = async () => {
    try {
      setLoading(true);
      const response = await postsAPI.getAll({ limit: 50 });
      setPosts(response.data.posts);
    } catch (err) {
      setError('Failed to load posts');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchPosts(); }, []);

  const handleDelete = async (id) => {
    if (!window.confirm('Delete this post?')) return;
    try {
      await postsAPI.delete(id);
      setPosts(posts.filter(p => p.id !== id));
    } catch (err) {
      setError('Failed to delete post');
    }
  };

  if (loading) return <p>Loading posts...</p>;

  return (
    <div>
      <div className="page-header">
        <h2>Posts</h2>
        <button className="btn btn-success" onClick={() => navigate('/posts/new')}>
          + New Post
        </button>
      </div>
      {error && <div className="error-message">{error}</div>}
      {posts.length === 0 ? (
        <div className="card"><p>No posts yet. Create your first post!</p></div>
      ) : (
        posts.map(post => (
          <div key={post.id} className="card">
            <h3>{post.title}</h3>
            <div className="card-meta">
              {post.author_name && <span>By {post.author_name} &middot; </span>}
              <span>{new Date(post.created_at).toLocaleDateString()}</span>
              <span className={`status-badge status-${post.status}`} style={{ marginLeft: 12 }}>
                {post.status}
              </span>
            </div>
            {post.excerpt && <p>{post.excerpt}</p>}
            <div className="card-actions">
              <button className="btn btn-sm btn-primary"
                onClick={() => navigate(`/posts/${post.id}/edit`)}>Edit</button>
              <button className="btn btn-sm btn-danger"
                onClick={() => handleDelete(post.id)}>Delete</button>
            </div>
          </div>
        ))
      )}
    </div>
  );
}

export default PostList;

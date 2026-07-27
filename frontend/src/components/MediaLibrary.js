import React, { useState, useEffect, useRef } from 'react';
import { mediaAPI } from '../api';

function MediaLibrary() {
  const [media, setMedia] = useState([]);
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const fileInputRef = useRef(null);

  const fetchMedia = async () => {
    try {
      const response = await mediaAPI.getAll();
      setMedia(response.data);
    } catch (err) {
      setError('Failed to load media');
    }
  };

  useEffect(() => { fetchMedia(); }, []);

  const handleUpload = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    setUploading(true);
    setError('');
    setSuccess('');

    try {
      await mediaAPI.upload(file);
      setSuccess('File uploaded successfully!');
      fetchMedia();
      if (fileInputRef.current) fileInputRef.current.value = '';
    } catch (err) {
      setError(err.response?.data?.error || 'Upload failed');
    } finally {
      setUploading(false);
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Delete this file?')) return;
    try {
      await mediaAPI.delete(id);
      setMedia(media.filter(m => m.id !== id));
    } catch (err) {
      setError('Failed to delete file');
    }
  };

  return (
    <div>
      <div className="page-header">
        <h2>Media Library</h2>
        <div>
          <input type="file" ref={fileInputRef} onChange={handleUpload}
            style={{ display: 'none' }} />
          <button className="btn btn-success" onClick={() => fileInputRef.current?.click()}
            disabled={uploading}>
            {uploading ? 'Uploading...' : '+ Upload'}
          </button>
        </div>
      </div>
      {error && <div className="error-message">{error}</div>}
      {success && <div className="success-message">{success}</div>}
      {media.length === 0 ? (
        <div className="card"><p>No media files yet.</p></div>
      ) : (
        <div className="media-grid">
          {media.map(item => (
            <div key={item.id} className="media-item">
              <div className="media-item-info">
                <p style={{ fontWeight: 500, wordBreak: 'break-all' }}>{item.original_name}</p>
                <p style={{ color: '#888' }}>{(item.size / 1024).toFixed(1)} KB</p>
                <button className="btn btn-sm btn-danger" style={{ marginTop: 4 }}
                  onClick={() => handleDelete(item.id)}>Delete</button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

export default MediaLibrary;

import React, { useState, useEffect } from 'react';
import { usersAPI } from '../api';

function UserManagement() {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const fetchUsers = async () => {
    try {
      setLoading(true);
      const response = await usersAPI.getAll();
      setUsers(response.data);
    } catch (err) {
      setError('Failed to load users');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchUsers(); }, []);

  const handleDelete = async (id, username) => {
    if (!window.confirm(`Delete user "${username}"?`)) return;
    try {
      await usersAPI.delete(id);
      setUsers(users.filter(u => u.id !== id));
    } catch (err) {
      setError(err.response?.data?.error || 'Failed to delete user');
    }
  };

  if (loading) return <p>Loading users...</p>;

  return (
    <div>
      <div className="page-header"><h2>Users</h2></div>
      {error && <div className="error-message">{error}</div>}
      <div className="card">
        <table>
          <thead>
            <tr>
              <th>ID</th><th>Username</th><th>Email</th><th>Role</th><th>Created</th><th></th>
            </tr>
          </thead>
          <tbody>
            {users.map(user => (
              <tr key={user.id}>
                <td>{user.id}</td>
                <td>{user.username}</td>
                <td>{user.email || '-'}</td>
                <td><span className={`status-badge ${user.role === 'admin' ? 'status-published' : 'status-draft'}`}>{user.role}</span></td>
                <td>{new Date(user.created_at).toLocaleDateString()}</td>
                <td>
                  <button className="btn btn-sm btn-danger" onClick={() => handleDelete(user.id, user.username)}>Delete</button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

export default UserManagement;

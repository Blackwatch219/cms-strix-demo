import React, { useState, useEffect } from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import Login from './components/Login';
import Dashboard from './components/Dashboard';
import PostEditor from './components/PostEditor';
import PostList from './components/PostList';
import UserManagement from './components/UserManagement';
import MediaLibrary from './components/MediaLibrary';

function App() {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const storedUser = localStorage.getItem('user');
    const token = localStorage.getItem('token');
    if (storedUser && token) {
      setUser(JSON.parse(storedUser));
    }
    setLoading(false);
  }, []);

  if (loading) return null;

  return (
    <BrowserRouter>
      <Routes>
        <Route path="/login" element={
          user ? <Navigate to="/" /> : <Login onLogin={setUser} />
        } />
        <Route path="/" element={
          !user ? <Navigate to="/login" /> : <Dashboard user={user} onLogout={() => { setUser(null); }} />
        }>
          <Route index element={<PostList />} />
          <Route path="posts/new" element={<PostEditor />} />
          <Route path="posts/:id/edit" element={<PostEditor />} />
          <Route path="users" element={user.role === 'admin' ? <UserManagement /> : <Navigate to="/" />} />
          <Route path="media" element={<MediaLibrary />} />
        </Route>
      </Routes>
    </BrowserRouter>
  );
}

export default App;

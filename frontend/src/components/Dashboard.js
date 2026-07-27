import React from 'react';
import { Outlet, NavLink, useNavigate } from 'react-router-dom';

function Dashboard({ user, onLogout }) {
  const navigate = useNavigate();

  const handleLogout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    onLogout();
    navigate('/login');
  };

  return (
    <div className="dashboard">
      <div className="sidebar">
        <div className="sidebar-header">
          <h2>CMS Panel</h2>
          <span>Logged in as {user.username}</span>
        </div>
        <nav className="sidebar-nav">
          <NavLink to="/" end className={({ isActive }) => isActive ? 'active' : ''}>
            Posts
          </NavLink>
          {user.role === 'admin' && (
            <NavLink to="/users" className={({ isActive }) => isActive ? 'active' : ''}>
              Users
            </NavLink>
          )}
          <NavLink to="/media" className={({ isActive }) => isActive ? 'active' : ''}>
            Media Library
          </NavLink>
        </nav>
        <div className="sidebar-footer">
          <button className="btn btn-sm btn-danger" onClick={handleLogout}>Logout</button>
        </div>
      </div>
      <main className="main-content">
        <Outlet />
      </main>
    </div>
  );
}

export default Dashboard;

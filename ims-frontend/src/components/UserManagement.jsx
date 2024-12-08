import React, { useEffect, useState } from 'react';
import api from '../services/api';
import { useNavigate } from 'react-router-dom';

const UserManagement = () => {
  const [users, setUsers] = useState([]);
  const navigate = useNavigate();

  useEffect(() => {
    fetchUsers();
  }, []);

  const fetchUsers = async () => {
    try {
      const response = await api.get('/users');
      setUsers(response.data);
    } catch (err) {
      console.error('Error fetching users:', err);
    }
  };

  const deleteUser = async (id) => {
    if (window.confirm('Are you sure you want to delete this user?')) {
      try {
        await api.delete(`/users/${id}`);
        fetchUsers(); // Refresh the user list
      } catch (err) {
        console.error('Error deleting user:', err);
      }
    }
  };

  const navigateToCreateUser = () => {
    navigate('/create-user');
  };

  return (
    <div>
      <h2>User Management</h2>
      <button onClick={navigateToCreateUser}>Create User</button>
      <h3>Users</h3>
      <ul>
        {users.map((user) => (
          <li key={user.id}>
            {user.email} ({user.role})
            <button onClick={() => deleteUser(user.id)}>Delete</button>
          </li>
        ))}
      </ul>
    </div>
  );
};

export default UserManagement;

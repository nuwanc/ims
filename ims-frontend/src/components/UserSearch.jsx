import React, { useState, useEffect } from 'react';
import { Box, TextField, Button, Paper, Typography, TableContainer, Table,TableHead, TableBody, TableRow, TableCell } from '@mui/material';
import api from '../services/api';

const UserSearch = () => {
  const [query, setQuery] = useState('');
  const [users, setUsers] = useState([]);
  const [error, setError] = useState('');

  useEffect(() => {
    const fetchUsers = async () => {
      try {
        const response = await api.get('/users');
        setUsers(response.data);
      } catch (err) {
        setError('Error fetching users');
        console.error(err);
      }
    };
    fetchUsers();
  },[]);


  const searchUsers = async () => {
    try {
      const response = await api.get('/users', { params: { role: 'admin', query } });
      setUsers(response.data);
    } catch (err) {
      console.error('Error fetching users:', err);
    }
  };

  const deleteUser = async (id) => {
    if (window.confirm('Are you sure you want to delete this user?')) {
      try {
        await api.delete(`/users/${id}`);
        setUsers((prevUsers) => prevUsers.filter((user) => user.id !== id)); // Update state after deletion
      } catch (err) {
        setError('Error deleting user');
        console.error(err);
      }
    }
  };

  return (
    <Box sx={{ padding: 4 }}>
      <TextField
        label="Search Users"
        variant="outlined"
        fullWidth
        value={query}
        onChange={(e) => setQuery(e.target.value)}
        sx={{ marginBottom: 2 }}
      />
      <Button variant="contained" color="primary" onClick={searchUsers}>
        Search
      </Button>
      {error && <Typography color="error">{error}</Typography>}
      {users.length === 0 ? (
          <Typography>No users found</Typography>
        ) : (
          <TableContainer component={Paper}>
            <Table>
              <TableHead>
                <TableRow>
                  <TableCell><strong>Email</strong></TableCell>
                  <TableCell><strong>Role</strong></TableCell>
                  <TableCell><strong>Actions</strong></TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {users.map((user) => (
                  <TableRow key={user.id}>
                    <TableCell>{user.email}</TableCell>
                    <TableCell>{user.role}</TableCell>
                    <TableCell>
                      <Button
                        variant="outlined"
                        color="error"
                        onClick={() => deleteUser(user.id)}
                      >
                        Delete
                      </Button>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </TableContainer>
        )}
    </Box>
  );
};

export default UserSearch;

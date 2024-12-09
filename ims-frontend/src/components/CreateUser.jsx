import React, { useState } from 'react';
import { Box,
  TextField,
  Button,
  Typography,
  MenuItem,
  Select,
  FormControl,
  InputLabel,
  Alert,
  CircularProgress,
  Paper, AppBar, Toolbar } from '@mui/material';
import api from '../services/api';
import { useNavigate } from 'react-router-dom';

const CreateUser = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [role, setRole] = useState('patient');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      await api.post('/users', { email, password, role });
      navigate('/user-management'); // Redirect to the User Management page
    } catch (err) {
      setError('Error creating user. Please try again.');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleLogout = () => {
    localStorage.clear(); // Clear token and role
    window.location.href = '/'; // Redirect to login page
  };

  const navigateToAdminHome = () => {
    navigate('/admin-dashboard')
  }

  const handleUsersList = () => {
    navigate('/user-management'); // Navigate to the Users List page
  };

  return (
    <>
      <AppBar position="static">
        <Toolbar>
          <Typography variant="h6" component="div" sx={{ flexGrow: 1 }}>
            IMS
          </Typography>

          <Box sx={{ display: 'flex', alignItems: 'center' }}>
          <Button
              color="inherit"
              onClick={navigateToAdminHome}
            >
              Home
            </Button>

            <Button
              color="inherit"
              onClick={handleUsersList}
            >
              Users
            </Button>

            <Button
              color="inherit"
              onClick={handleLogout}
              sx={{ ml: 2 }}
            >
              Logout
            </Button>
          </Box>
        </Toolbar>
      </AppBar>
      <Box
      sx={{
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center',
        minHeight: '100vh',
        backgroundColor: '#f5f5f5',
      }}
    >
      <Paper
        elevation={4}
        sx={{
          padding: 4,
          maxWidth: 400,
          width: '100%',
          textAlign: 'center',
          borderRadius: 2,
        }}
      >
        <Typography variant="h5" component="h1" gutterBottom>
          Create User
        </Typography>
        {error && <Alert severity="error" sx={{ marginBottom: 2 }}>{error}</Alert>}
        <form onSubmit={handleSubmit}>
          <TextField
            label="Email"
            type="email"
            variant="outlined"
            fullWidth
            margin="normal"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
          />
          <TextField
            label="Password"
            type="password"
            variant="outlined"
            fullWidth
            margin="normal"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
          />
          <FormControl fullWidth margin="normal">
            <InputLabel id="role-select-label">Role</InputLabel>
            <Select
              labelId="role-select-label"
              value={role}
              onChange={(e) => setRole(e.target.value)}
              required
            >
              <MenuItem value="patient">Patient</MenuItem>
              <MenuItem value="doctor">Doctor</MenuItem>
              <MenuItem value="medical_staff">Medical Staff</MenuItem>
              <MenuItem value="finance_staff">Finance Staff</MenuItem>
            </Select>
          </FormControl>
          <Box sx={{ marginTop: 2 }}>
            <Button
              type="submit"
              variant="contained"
              color="primary"
              fullWidth
              disabled={loading}
              sx={{ padding: 1 }}
            >
              {loading ? <CircularProgress size={24} /> : 'Create User'}
            </Button>
          </Box>
        </form>
      </Paper>
    </Box>
    </>
  );
};

export default CreateUser;

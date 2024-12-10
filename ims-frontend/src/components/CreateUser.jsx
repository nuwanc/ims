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
  Paper } from '@mui/material';
import api from '../services/api';

const CreateUser = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [role, setRole] = useState('patient');
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      await api.post('/users', { email, password, role });
      setSuccess('User Creation Successful.');
    } catch (err) {
      setError('Error creating user. Please try again.');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <Paper elevation={3} sx={{ padding: 4, marginTop: 3 }}>
        <Typography variant="h5" component="h1" gutterBottom>
          Create User
        </Typography>
        {error && <Alert severity="error" sx={{ marginBottom: 2 }}>{error}</Alert>}
        {success && <Alert severity="success" sx={{ marginBottom: 2 }}>{success}</Alert>}
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
    </>
  );
};

export default CreateUser;

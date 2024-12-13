import React, { useState, useEffect } from 'react';
import {
  Box,
  Typography,
  TextField,
  Button,
  Alert,
  CircularProgress,
} from '@mui/material';
import api from '../services/api';

const TotalPatientsAndCost = () => {
  const [totalPatients, setTotalPatients] = useState(null);
  const [totalCost, setTotalCost] = useState(null);
  const [selectedPatientId, setSelectedPatientId] = useState('');
  const [selectedPatientCost, setSelectedPatientCost] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    const fetchTotalPatients = async () => {
      try {
        const response = await api.get('/stats/patients/total');
        setTotalPatients(response.data.total_patients);
      } catch (err) {
        setError('Error fetching total number of patients.');
      }
    };

    const fetchTotalCost = async () => {
      try {
        const response = await api.get('/stats/invoices/cost');
        setTotalCost(response.data.total_cost);
      } catch (err) {
        setError('Error fetching total cost.');
      }
    };

    fetchTotalPatients();
    fetchTotalCost();
  }, []);

  const fetchPatientCost = async () => {
    if (!selectedPatientId) {
      setError('Please enter a valid patient ID.');
      return;
    }

    setError('');
    setSelectedPatientCost(null);
    setLoading(true);
    try {
      const response = await api.get(`/stats/${selectedPatientId}/cost`);
      setSelectedPatientCost(response.data.total_cost);
    } catch (err) {
      setError('Error fetching total cost for the selected patient.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Box sx={{ padding: 4 }}>
      <Typography variant="h4" gutterBottom>
        Total Patients and Cost
      </Typography>
      {error && <Alert severity="error" sx={{ marginBottom: 2 }}>{error}</Alert>}

      <Typography variant="h6" sx={{ marginBottom: 2 }}>
        Total Patients: {totalPatients !== null ? totalPatients : <CircularProgress size={20} />}
      </Typography>
      <Typography variant="h6" sx={{ marginBottom: 4 }}>
        Total Cost: ${totalCost !== null ? totalCost.toFixed(2) : <CircularProgress size={20} />}
      </Typography>

      <Box sx={{ marginBottom: 4 }}>
        <Typography variant="h6" gutterBottom>
          Get Total Cost for a Patient
        </Typography>
        <TextField
          label="Patient ID"
          variant="outlined"
          value={selectedPatientId}
          onChange={(e) => setSelectedPatientId(e.target.value)}
          sx={{ marginBottom: 2 }}
          fullWidth
        />
        <Button
          variant="contained"
          color="primary"
          onClick={fetchPatientCost}
          disabled={loading}
          fullWidth
        >
          {loading ? 'Loading...' : 'Get Patient Cost'}
        </Button>
        {selectedPatientCost !== null && (
          <Typography variant="h6" sx={{ marginTop: 2 }}>
            Total Cost for Patient {selectedPatientId}: ${selectedPatientCost.toFixed(2)}
          </Typography>
        )}
      </Box>
    </Box>
  );
};

export default TotalPatientsAndCost;

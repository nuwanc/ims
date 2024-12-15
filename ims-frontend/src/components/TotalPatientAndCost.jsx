import React, { useState, useEffect } from 'react';
import {
  Box,
  Typography,
  Alert,
  CircularProgress,
} from '@mui/material';
import PatientSearch from './PatientSearch';
import api from '../services/api';
import PatientCost from './PatientCost';

const TotalPatientsAndCost = () => {
  const [totalPatients, setTotalPatients] = useState(null);
  const [totalCost, setTotalCost] = useState(null);
  const [selectedPatient, setSelectedPatient] = useState(null);
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
        <PatientSearch onSelectPatient={setSelectedPatient} />
        {selectedPatient != null ? <PatientCost patient={selectedPatient}/> : null}
      </Box>
    </Box>
  );
};

export default TotalPatientsAndCost;

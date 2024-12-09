import React, { useState } from 'react';
import { Box, TextField, Button, List, ListItem, ListItemText } from '@mui/material';
import api from '../services/api';

const PatientSearch = ({ onSelectPatient }) => {
  const [query, setQuery] = useState('');
  const [patients, setPatients] = useState([]);

  const searchPatients = async () => {
    try {
      const response = await api.get('/patients', { params: { role: 'patient', query } });
      setPatients(response.data);
    } catch (err) {
      console.error('Error fetching patients:', err);
    }
  };

  return (
    <Box sx={{ padding: 4 }}>
      <TextField
        label="Search Patients"
        variant="outlined"
        fullWidth
        value={query}
        onChange={(e) => setQuery(e.target.value)}
        sx={{ marginBottom: 2 }}
      />
      <Button variant="contained" color="primary" onClick={searchPatients}>
        Search
      </Button>
      <List sx={{ marginTop: 2 }}>
        {patients.map((patient) => (
          <ListItem key={patient.id} button onClick={() => {onSelectPatient(patient); localStorage.setItem('selectedPatient',patient)}}>
            <ListItemText primary={patient.email} secondary={`Role: ${patient.role}`} />
          </ListItem>
        ))}
      </List>
    </Box>
  );
};

export default PatientSearch;

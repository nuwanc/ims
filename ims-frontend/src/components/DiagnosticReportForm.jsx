import React, { useState } from 'react';
import {
  Box,
  TextField,
  Button,
  Typography,
  MenuItem,
  Select,
  FormControl,
  InputLabel,
  Alert,
  Paper,
} from '@mui/material';
import api from '../services/api';

const DiagnosticReportForm = ({ patient, onReportCreated }) => {
  const [type, setType] = useState('xray');
  const [description, setDescription] = useState('');
  const [error, setError] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const response = await api.post('/diagnostic-reports', {
        patient_id: patient.id,
        type,
        description,
      });
      onReportCreated(response.data.report_id); // Pass the report ID to the parent
    } catch (err) {
      setError('Error creating diagnostic report');
      console.error(err);
    }
  };

  return (
    <Paper elevation={3} sx={{ padding: 4, marginTop: 3 }}>
      <Typography variant="h5" gutterBottom>
        Create Diagnostic Report for {patient.email}
      </Typography>
      <form onSubmit={handleSubmit}>
        {/* Type Selector */}
        <FormControl fullWidth margin="normal">
          <InputLabel id="type-select-label">Type</InputLabel>
          <Select
            labelId="type-select-label"
            value={type}
            onChange={(e) => setType(e.target.value)}
            required
          >
            <MenuItem value="xray">X-Ray</MenuItem>
            <MenuItem value="ct">CT Scan</MenuItem>
            <MenuItem value="mri">MRI</MenuItem>
          </Select>
        </FormControl>

        {/* Description Field */}
        <TextField
          label="Description"
          multiline
          rows={4}
          variant="outlined"
          fullWidth
          margin="normal"
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          required
        />

        {/* Error Message */}
        {error && <Alert severity="error" sx={{ marginBottom: 2 }}>{error}</Alert>}

        {/* Submit Button */}
        <Button
          type="submit"
          variant="contained"
          color="primary"
          fullWidth
          sx={{ padding: 1 }}
        >
          Create Report
        </Button>
      </form>
    </Paper>
  );
};

export default DiagnosticReportForm;

import React, { useEffect, useState } from 'react';
import {
  Box,
  Typography,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  Button,
} from '@mui/material';
import { useNavigate } from 'react-router-dom';
import api from '../services/api';

const DoctorViewReports = ({ patient, onSelectPatient }) => {
  const [reports, setReports] = useState([]);
  const [error, setError] = useState('');
  const navigate = useNavigate();

  useEffect(() => {
    const fetchReports = async () => {
      try {
        const response = await api.get(`/patients/${patient.id}/diagnostic-reports`);
        setReports(response.data);
      } catch (err) {
        setError('Error fetching reports');
        console.error(err);
      }
    };

    fetchReports();
  }, [patient.id]);

  const viewReportDetails = (reportId) => {
    navigate(`/report-details/${reportId}`);
  };

  const handleBackToReport = () => {
    onSelectPatient(null);
}

  return (
    <Box sx={{ padding: 4 }}>
      <Typography variant="h4" gutterBottom>
        Diagnostic Reports for {patient.email}
      </Typography>
      {error && <Typography color="error">{error}</Typography>}
      <Button variant="outlined" onClick={handleBackToReport} sx={{ marginBottom: 2 }}>
          Back to Search
      </Button>
      {reports.length === 0 ? (
        <Typography>No reports found</Typography>
      ) : (
        <TableContainer component={Paper}>
          <Table>
            <TableHead>
              <TableRow>
                <TableCell><strong>Type</strong></TableCell>
                <TableCell><strong>Description</strong></TableCell>
                <TableCell><strong>Created At</strong></TableCell>
                <TableCell><strong>Actions</strong></TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {reports.map((report) => (
                <TableRow key={report.id}>
                  <TableCell>{report.type}</TableCell>
                  <TableCell>{report.description}</TableCell>
                  <TableCell>{new Date(report.created_at).toLocaleString()}</TableCell>
                  <TableCell>
                    <Button
                      variant="contained"
                      color="primary"
                      onClick={() => viewReportDetails(report.id)}
                    >
                      View Details
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

export default DoctorViewReports;

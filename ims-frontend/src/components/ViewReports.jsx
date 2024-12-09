import React, { useEffect, useState } from 'react';
import { Box, Button, Typography, AppBar, Toolbar } from '@mui/material';
import { Table, TableBody, TableCell, TableContainer, TableHead, TableRow, Paper } from '@mui/material';
import api from '../services/api';
import { useNavigate } from 'react-router-dom';

const ViewReports = ({ patient }) => {
  const [reports, setReports] = useState([]);
  const [error, setError] = useState('');
  const navigate = useNavigate();
  const [refresh, setRefresh] = useState(false);

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
  }, [patient,refresh]);

  const viewReportDetails = (reportId) => {
    navigate(`/report-details/${reportId}`);
  };

  const handleRefreshReport = () => {
    setRefresh(!refresh)
  }

  return (
    <>
      <Box sx={{ padding: 4 }}>
        <Typography variant="h4" gutterBottom>
            Diagnostic Reports for {patient.email}
        </Typography>
        <Button variant="outlined" onClick={handleRefreshReport} sx={{ marginBottom: 2 }}>
             Refresh
        </Button>
        {error && <Typography color="error">{error}</Typography>}
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
    </>
  );
};

export default ViewReports;

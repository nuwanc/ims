import React, { useEffect, useState } from 'react';
import { Box, Button, Typography } from '@mui/material';
import { Table, TableBody, TableCell, TableContainer, TableHead, TableRow, Paper,Chip } from '@mui/material';
import api from '../services/api';
import { useNavigate } from 'react-router-dom';

const ViewReports = ({ patient, onSelectPatient }) => {
  const [reports, setReports] = useState([]);
  const [error, setError] = useState('');
  const navigate = useNavigate();
  const [refresh, setRefresh] = useState(false);

  useEffect(() => {
    const fetchReports = async () => {
      try {
        const response = await api.get(`/report/patients/${patient.id}/diagnostic-reports`);
        setReports(response.data);
      } catch (err) {
        setError('Error fetching reports');
        console.error(err);
      }
    };
    fetchReports();
  }, [patient,refresh]);

  const viewReportDetails = (reportId) => {
    navigate(`/report/report-details/${reportId}`);
  };

  const handleRefreshReport = () => {
    setRefresh(!refresh)
  }

  return (
    <>
      <Box sx={{ padding: 4 }}>
        <Typography variant="h5" gutterBottom>
            Diagnostic Reports for {patient.email}
        </Typography>
        <Button variant="outlined" onClick={handleRefreshReport} sx={{ marginBottom: 2, marginLeft: 2 }}>
             Refresh
        </Button>
        <Button variant="outlined" onClick={(e)=>onSelectPatient(null)} sx={{ marginBottom: 2, marginLeft: 2 }}>
             Back to Search
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
                      {report.images.length === 0 ? <Chip label="New" color="success" />: null}
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

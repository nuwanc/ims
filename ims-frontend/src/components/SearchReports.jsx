import React, { useState } from 'react';
import {
  Box,
  TextField,
  Button,
  Typography,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  MenuItem,
  Select,
  FormControl,
  InputLabel,
  Alert,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
} from '@mui/material';
import api from '../services/api';

const SearchReports = () => {
  const [reportType, setReportType] = useState('');
  const [patientEmail, setPatientEmail] = useState('');
  const [reports, setReports] = useState([]);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [loading, setLoading] = useState(false);
  const [openDialog, setOpenDialog] = useState(false);
  const [selectedReportId, setSelectedReportId] = useState(null);
  const [price, setPrice] = useState('');

  const handleSearch = async () => {
    setError('');
    setSuccess('');
    setLoading(true);
    try {
      const response = await api.get('/report/search', {
        params: { type: reportType, patient_email: patientEmail },
      });
      setReports(response.data);
    } catch (err) {
      setError('Error fetching reports. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const openInvoiceModal = (reportId) => {
    setSelectedReportId(reportId);
    setOpenDialog(true);
  };

  const closeInvoiceModal = () => {
    setSelectedReportId(null);
    setOpenDialog(false);
    setPrice('');
  };

  const generateInvoice = async () => {
    if (!price || isNaN(price) || Number(price) <= 0) {
      setError('Please enter a valid price.');
      return;
    }

    setError('');
    setSuccess('');
    setLoading(true);
    try {
      await api.post('/invoice/create', { report_id: selectedReportId, cost: Number(price) });
      setSuccess(`Invoice generated successfully for Report ID: ${selectedReportId}`);
      closeInvoiceModal();
    } catch (err) {
      setError('Error generating invoice. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Box sx={{ padding: 4 }}>
      <Typography variant="h5" gutterBottom>
        Search Diagnostic Reports
      </Typography>
      <Box
        component="form"
        sx={{
          display: 'flex',
          flexDirection: 'column',
          gap: 2,
          marginBottom: 4,
        }}
        onSubmit={(e) => {
          e.preventDefault();
          handleSearch();
        }}
      >
        <FormControl fullWidth>
          <InputLabel id="report-type-select-label">Report Type</InputLabel>
          <Select
            labelId="report-type-select-label"
            value={reportType}
            onChange={(e) => setReportType(e.target.value)}
          >
            <MenuItem value="xray">X-Ray</MenuItem>
            <MenuItem value="ct">CT Scan</MenuItem>
            <MenuItem value="mri">MRI</MenuItem>
          </Select>
        </FormControl>
        <TextField
          label="Patient Email"
          type="email"
          value={patientEmail}
          onChange={(e) => setPatientEmail(e.target.value)}
          fullWidth
        />
        <Button type="submit" variant="contained" color="primary" disabled={loading}>
          {loading ? 'Searching...' : 'Search'}
        </Button>
      </Box>
      {error && <Alert severity="error" sx={{ marginBottom: 2 }}>{error}</Alert>}
      {success && <Alert severity="success" sx={{ marginBottom: 2 }}>{success}</Alert>}
      {reports.length > 0 && (
        <TableContainer component={Paper}>
          <Table>
            <TableHead>
              <TableRow>
                <TableCell><strong>Report ID</strong></TableCell>
                <TableCell><strong>Type</strong></TableCell>
                <TableCell><strong>Description</strong></TableCell>
                <TableCell><strong>Created At</strong></TableCell>
                <TableCell><strong>Actions</strong></TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {reports.map((report) => (
                <TableRow key={report.id}>
                  <TableCell>{report.id}</TableCell>
                  <TableCell>{report.type}</TableCell>
                  <TableCell>{report.description}</TableCell>
                  <TableCell>{new Date(report.created_at).toLocaleString()}</TableCell>
                  <TableCell>
                    <Button
                      variant="outlined"
                      color="primary"
                      onClick={() => openInvoiceModal(report.id)}
                    >
                      Generate Invoice
                    </Button>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </TableContainer>
      )}
      {reports.length === 0 && !loading && !error && (
        <Typography>No reports found. Try adjusting your search criteria.</Typography>
      )}

      {/* Invoice Modal */}
      <Dialog open={openDialog} onClose={closeInvoiceModal}>
        <DialogTitle>Generate Invoice</DialogTitle>
        <DialogContent>
          <TextField
            label="Price"
            type="number"
            value={price}
            onChange={(e) => setPrice(e.target.value)}
            fullWidth
            sx={{ marginBottom: 2 }}
          />
        </DialogContent>
        <DialogActions>
          <Button onClick={closeInvoiceModal} color="secondary">
            Cancel
          </Button>
          <Button onClick={generateInvoice} variant="contained" color="primary">
            Generate
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default SearchReports;

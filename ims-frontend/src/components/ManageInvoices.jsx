import React, { useState, useEffect } from 'react';
import {
  Box,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  Typography,
  Button,
  Alert,
} from '@mui/material';
import api from '../services/api';

const ManageInvoices = () => {
  const [invoices, setInvoices] = useState([]);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [loading, setLoading] = useState(false);

  const fetchInvoices = async (status) => {
    setLoading(true);
    setError('');
    setSuccess('');
    try {
      const response = await api.get('/invoices/filter', { params: { status } });
      setInvoices(response.data);
    } catch (err) {
      setError('Error fetching invoices. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const markAsPaid = async (invoiceId) => {
    setError('');
    setSuccess('');
    try {
      await api.patch(`/invoices/${invoiceId}/pay`);
      setSuccess(`Invoice ${invoiceId} marked as paid.`);
      fetchInvoices('Unpaid'); // Refresh the unpaid invoices
    } catch (err) {
      setError('Error marking invoice as paid. Please try again.');
    }
  };

  useEffect(() => {
    fetchInvoices('Unpaid');
  }, []);

  return (
    <Box sx={{ padding: 4 }}>
      <Typography variant="h4" gutterBottom>
        Manage Invoices
      </Typography>
      <Button variant="contained" color="primary" onClick={() => fetchInvoices('Unpaid')} sx={{ marginRight: 2 }}>
        View Unpaid Invoices
      </Button>
      <Button variant="contained" color="secondary" onClick={() => fetchInvoices('Paid')}>
        View Paid Invoices
      </Button>
      {error && <Alert severity="error" sx={{ marginTop: 2 }}>{error}</Alert>}
      {success && <Alert severity="success" sx={{ marginTop: 2 }}>{success}</Alert>}
      {invoices.length > 0 && (
        <TableContainer component={Paper} sx={{ marginTop: 4 }}>
          <Table>
            <TableHead>
              <TableRow>
                <TableCell><strong>Invoice ID</strong></TableCell>
                <TableCell><strong>Report ID</strong></TableCell>
                <TableCell><strong>Patient ID</strong></TableCell>
                <TableCell><strong>Cost</strong></TableCell>
                <TableCell><strong>Status</strong></TableCell>
                <TableCell><strong>Actions</strong></TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {invoices.map((invoice) => (
                <TableRow key={invoice.id}>
                  <TableCell>{invoice.id}</TableCell>
                  <TableCell>{invoice.report_id}</TableCell>
                  <TableCell>{invoice.patient_id}</TableCell>
                  <TableCell>${invoice.cost.toFixed(2)}</TableCell>
                  <TableCell>{invoice.status}</TableCell>
                  <TableCell>
                    {invoice.status === 'Unpaid' && (
                      <Button variant="outlined" color="primary" onClick={() => markAsPaid(invoice.id)}>
                        Mark as Paid
                      </Button>
                    )}
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </TableContainer>
      )}
      {invoices.length === 0 && !loading && (
        <Typography sx={{ marginTop: 4 }}>No invoices found for the selected status.</Typography>
      )}
    </Box>
  );
};

export default ManageInvoices;

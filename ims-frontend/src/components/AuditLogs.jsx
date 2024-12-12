import React, { useState, useEffect } from 'react';
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
  Alert,
  CircularProgress,
  Pagination,
  Button,
  Collapse,
} from '@mui/material';
import { ExpandLess, ExpandMore } from '@mui/icons-material';
import api from '../services/api';

const AuditLogs = () => {
  const [logs, setLogs] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [expandedRow, setExpandedRow] = useState(null);
  const [currentPage, setCurrentPage] = useState(1);
  const logsPerPage = 10;

  useEffect(() => {
    const fetchLogs = async () => {
      setLoading(true);
      setError('');
      try {
        const response = await api.get('/audit-logs');
        setLogs(response.data);
      } catch (err) {
        setError('Error fetching audit logs. Please try again.');
      } finally {
        setLoading(false);
      }
    };

    fetchLogs();
  }, []);

  const handlePageChange = (event, value) => {
    setCurrentPage(value);
  };

  const toggleRowExpansion = (rowId) => {
    setExpandedRow((prev) => (prev === rowId ? null : rowId));
  };

  const paginatedLogs = logs.slice(
    (currentPage - 1) * logsPerPage,
    currentPage * logsPerPage
  );

  return (
    <Box sx={{ padding: 4 }}>
      <Typography variant="h5" gutterBottom>
        Audit Logs
      </Typography>
      {error && <Alert severity="error">{error}</Alert>}
      {loading ? (
        <CircularProgress />
      ) : (
        <>
          <TableContainer component={Paper}>
            <Table>
              <TableHead>
                <TableRow>
                  <TableCell><strong>User ID</strong></TableCell>
                  <TableCell><strong>Action</strong></TableCell>
                  <TableCell><strong>Table</strong></TableCell>
                  <TableCell><strong>Record ID</strong></TableCell>
                  <TableCell><strong>Timestamp</strong></TableCell>
                  <TableCell><strong>Details</strong></TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {paginatedLogs.map((log) => (
                  <React.Fragment key={log.id}>
                    <TableRow>
                      <TableCell>{log.user_id || 'System'}</TableCell>
                      <TableCell>{log.action}</TableCell>
                      <TableCell>{log.table_name}</TableCell>
                      <TableCell>{log.record_id}</TableCell>
                      <TableCell>{new Date(log.timestamp).toLocaleString()}</TableCell>
                      <TableCell>
                        <Button
                          onClick={() => toggleRowExpansion(log.id)}
                          startIcon={expandedRow === log.id ? <ExpandLess /> : <ExpandMore />}
                        >
                          View Details
                        </Button>
                      </TableCell>
                    </TableRow>
                    {expandedRow === log.id && (
                      <TableRow>
                        <TableCell colSpan={6}>
                          <Collapse in={expandedRow === log.id}>
                            <Box sx={{ padding: 2, backgroundColor: '#f9f9f9' }}>
                              <Typography variant="body2">{log.details}</Typography>
                            </Box>
                          </Collapse>
                        </TableCell>
                      </TableRow>
                    )}
                  </React.Fragment>
                ))}
              </TableBody>
            </Table>
          </TableContainer>
          <Pagination
            count={Math.ceil(logs.length / logsPerPage)}
            page={currentPage}
            onChange={handlePageChange}
            sx={{ marginTop: 2 }}
          />
        </>
      )}
    </Box>
  );
};

export default AuditLogs;

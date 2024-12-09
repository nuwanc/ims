import React, {useState, useEffect} from 'react';
import { Box, Button, Typography, AppBar, Toolbar } from '@mui/material';
import { Table, TableBody, TableCell, TableContainer, TableHead, TableRow, Paper } from '@mui/material';
import { useNavigate } from 'react-router-dom';
import api from '../../services/api';

const PatientDashboard = () => {

    const [reports, setReports] = useState([]);
    const [error, setError] = useState('');
    const navigate = useNavigate();

    useEffect(() => {
        const fetchReports = async () => {
            try {
                const response = await api.get('/my-diagnostic-reports');
                setReports(response.data);
            } catch (err) {
                setError('Error fetching reports');
                console.error(err);
            }
        };

        fetchReports();
    }, []);

    const viewReportDetails = (reportId) => {
        navigate(`/report-details/${reportId}`);
    };

    const handleLogout = () => {
        localStorage.clear(); // Clear token and role
        window.location.href = '/'; // Redirect to login page
    };

    return (
        <>
            <AppBar position="static">
                <Toolbar>
                    <Typography variant="h6" component="div" sx={{ flexGrow: 1 }}>
                        IMS
                    </Typography>

                    <Box sx={{ display: 'flex', alignItems: 'center' }}>
                        <Button
                            color="inherit"
                            onClick={handleLogout}
                            sx={{ ml: 2 }}
                        >
                            Logout
                        </Button>
                    </Box>
                </Toolbar>
            </AppBar>
            <Box sx={{ padding: 4 }}>
                <Typography variant="h4" gutterBottom>
                    My Diagnostic Reports
                </Typography>
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

export default PatientDashboard;
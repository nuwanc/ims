import React, {useState, useEffect} from 'react';
import { Box, Button, Table, TableBody, TableCell, TableContainer, TableHead, TableRow, Paper, Typography } from '@mui/material';
import { useNavigate } from 'react-router-dom';
import api from '../services/api';

const PatientReports = () => {
    
    const [reports, setReports] = useState([]);
    const [error, setError] = useState('');
    const navigate = useNavigate();

    useEffect(() => {
        const fetchReports = async () => {
            try {
                const response = await api.get('/report/my-diagnostic-reports');
                setReports(response.data);
            } catch (err) {
                setError('Error fetching reports');
                console.error(err);
            }
        };

        fetchReports();
    }, []);

    const viewReportDetails = (reportId) => {
        navigate(`/report/report-details/${reportId}`);
    };


    return (
        <>
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
    )
}

export default PatientReports;
import React, { useEffect, useState } from 'react';
import { Box, Typography, Grid, Paper, Button, AppBar, Toolbar } from '@mui/material';
import { useParams, useNavigate } from 'react-router-dom';
import api from '../services/api';
import ImageViewer from './ImageViewer';

const ReportDetails = () => {
    const { reportId } = useParams(); // Retrieve report ID from route params
    const [report, setReport] = useState(null);
    const [images, setImages] = useState([]);
    const [error, setError] = useState('');
    const navigate = useNavigate();

    useEffect(() => {
        const fetchReportDetails = async () => {
            try {
                const response = await api.get(`/my-diagnostic-reports/${reportId}`);
                setReport(response.data.report);
                setImages(response.data.images);
            } catch (err) {
                setError('Error fetching report details');
                console.error(err);
            }
        };

        fetchReportDetails();
    }, [reportId]);

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
                <Button variant="outlined" onClick={() => navigate('/patient-dashboard')} sx={{ marginBottom: 2 }}>
                    Back to Reports
                </Button>
                {error && <Typography color="error">{error}</Typography>}
                {report && (
                    <>
                        <Typography variant="h4" gutterBottom>
                            Report Details: {report.type}
                        </Typography>
                        <Typography variant="body1" gutterBottom>
                            <strong>Description:</strong> {report.description}
                        </Typography>
                        <Typography variant="body1" gutterBottom>
                            <strong>Created At:</strong> {new Date(report.created_at).toLocaleString()}
                        </Typography>
                        <Typography variant="h5" sx={{ marginTop: 3, marginBottom: 2 }}>
                            Attached Images
                        </Typography>
                        {images.length === 0 ? (
                            <Typography>No images found</Typography>
                        ) : (
                            <Grid container spacing={2}>
                                {images.map((image) => (
                                    <Grid item xs={12} sm={6} md={4} key={image.id}>
                                        <Paper elevation={3} sx={{ padding: 2 }}>
                                            <Typography variant="body2" gutterBottom>
                                                {image.filename}
                                            </Typography>
                                            <ImageViewer imageId={image.id} />
                                        </Paper>
                                    </Grid>
                                ))}
                            </Grid>
                        )}
                    </>
                )}
            </Box>
        </>

    );
};

export default ReportDetails;

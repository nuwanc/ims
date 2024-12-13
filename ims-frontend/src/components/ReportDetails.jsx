import React, { useEffect, useState } from 'react';
import { Box, Typography, Grid, Paper, Button, AppBar, Toolbar, TextField } from '@mui/material';
import { useParams, useNavigate } from 'react-router-dom';
import api from '../services/api';
import ImageViewer from './ImageViewer';
import UploadImages from './UploadImages';

const ReportDetails = () => {
    const { reportId } = useParams(); // Retrieve report ID from route params
    const [report, setReport] = useState(null);
    const [images, setImages] = useState([]);
    const [error, setError] = useState('');
    const [show, setShow] = useState(false);
    const [diagnosis, setDiagnosis] = useState('');
    const [comment, setComment] = useState('');
    const [success, setSuccess] = useState('');
    const navigate = useNavigate();
    const role = localStorage.getItem('role');

    useEffect(() => {
        const fetchReportDetails = async () => {
            try {
                const response = await api.get(`/report/my-diagnostic-reports/${reportId}`);
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

    const handleCommentSubmit = async (e) => {
        e.preventDefault();
        try {
            await api.post(`/report/diagnostic-reports/${report.id}/add-comment`, {
                diagnosis,
                comment,
            });
            setSuccess('Comment added successfully');
            setDiagnosis('');
            setComment('');
            setShow(false)
        } catch (err) {
            setError('Error adding comment');
            console.error(err);
        }
    };

    const handleBackToReport = () => {
        let role = localStorage.getItem('role');
        if (role == 'patient') {
            navigate('/patient-dashboard')
        } else if (role == 'doctor') {
            navigate('/doctor-dashboard')
        } else if (role == 'medical_staff') {
            navigate('/medical-staff-dashboard')
        }
    }

    const handleShowComments = () => {
        setShow(!show);
    }

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
                <Button variant="outlined" onClick={handleBackToReport} sx={{ marginBottom: 2 }}>
                    Back to Reports
                </Button>
                {role == 'doctor' && <Button variant="outlined" onClick={handleShowComments} sx={{ marginBottom: 2 }}>Add Diagnosis/Comment</Button>}
                {success && <Typography color="success">{success}</Typography>}
                {show && (
                    <Paper elevation={3} sx={{ padding: 4, marginTop: 3 }}>
                        <Typography variant="h5" gutterBottom>
                            Add Diagnosis/Comment for Report: {report.id}
                        </Typography>
                        <form onSubmit={handleCommentSubmit}>
                            <Box sx={{ marginBottom: 2 }}>
                                <TextField
                                    label="Diagnosis"
                                    multiline
                                    rows={4}
                                    variant="outlined"
                                    fullWidth
                                    value={diagnosis}
                                    onChange={(e) => setDiagnosis(e.target.value)}
                                    required
                                />
                            </Box>
                            <Box sx={{ marginBottom: 2 }}>
                                <TextField
                                    label="Comment"
                                    multiline
                                    rows={4}
                                    variant="outlined"
                                    fullWidth
                                    value={comment}
                                    onChange={(e) => setComment(e.target.value)}
                                    required
                                />
                            </Box>
                            <Button
                                type="submit"
                                variant="contained"
                                color="primary"
                                sx={{ padding: 1 }}
                            >
                                Submit
                            </Button>
                        </form>
                    </Paper>
                )}
                {error && <Typography color="error">{error}</Typography>}
                {report && (
                    <>
                        <Typography variant="h5" gutterBottom>
                            Report Details: {report.type}
                        </Typography>
                        <Typography variant="body1" gutterBottom>
                            <strong>Description:</strong> {report.description}
                        </Typography>
                        <Typography variant="body1" gutterBottom>
                            <strong>Created At:</strong> {new Date(report.created_at).toLocaleString()}
                        </Typography>
                        <Box sx={{ marginTop: 4 }}>
                            <Typography variant="h5" gutterBottom>
                                Diagnosis & Comment
                            </Typography>
                            {report.diagnosis ? (
                                <Typography variant="body1" gutterBottom>
                                    <strong>Diagnosis:</strong> {report.diagnosis}
                                </Typography>
                            ) : (
                                <Typography>No diagnosis available</Typography>
                            )}
                            {report.comment ? (
                                <Typography variant="body1" gutterBottom>
                                    <strong>Comment:</strong> {report.comment}
                                </Typography>
                            ) : (
                                <Typography>No comment available</Typography>
                            )}
                            {report.updated_by && (
                                <Typography variant="body2" color="textSecondary">
                                    Last updated by: {report.updated_by} at {new Date(report.updated_at).toLocaleString()}
                                </Typography>
                            )}
                        </Box>
                        <Typography variant="h5" sx={{ marginTop: 3, marginBottom: 2 }}>
                            Attached Images
                        </Typography>
                        {images.length === 0 ? (<>
                            <Typography>No images found</Typography>
                            {role === 'medical_staff' ? <UploadImages reportId={reportId} /> : null}
                            </>
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

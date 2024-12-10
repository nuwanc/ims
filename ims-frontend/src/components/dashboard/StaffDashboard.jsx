import React, { useState } from 'react';
import { Box, Button, Typography, AppBar, Toolbar } from '@mui/material';
import { useNavigate } from 'react-router-dom';
import PatientSearch from '../PatientSearch';
import DiagnosticReportForm from '../DiagnosticReportForm';
import UploadImages from '../UploadImages';
import ViewReports from '../ViewReports';

const StaffDashboard = () => {
    const [selectedPatient, setSelectedPatient] = useState(null);
    const [createdReportId, setCreatedReportId] = useState(null);

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
                {!selectedPatient ? (<PatientSearch onSelectPatient={setSelectedPatient} />) : selectedPatient ? (<ViewReports patient={selectedPatient} onSelectPatient={setSelectedPatient}/>) : null}
                {!createdReportId && selectedPatient ? (<DiagnosticReportForm patient={selectedPatient} onReportCreated={setCreatedReportId} />) : null}
                { createdReportId ? (<UploadImages reportId={createdReportId} />) : null}
            </Box>
        </>
    )
}

export default StaffDashboard;
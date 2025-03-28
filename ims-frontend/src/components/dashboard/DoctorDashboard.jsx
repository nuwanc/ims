import React, { useState } from 'react';
import { Box, Button, Typography, AppBar, Toolbar } from '@mui/material';
import PatientSearch from '../PatientSearch';
import DoctorViewReports from '../DoctorViewReports';
import DiagnosticReportForm from '../DiagnosticReportForm';

const DoctorDashboard = () => {
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
            <Typography component="div" sx={{ flexGrow: 1 }}>Logged in as {localStorage.getItem('email')}</Typography>
          </Box>
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
          Doctor Dashboard
        </Typography>
        {!selectedPatient ? (
          <PatientSearch onSelectPatient={setSelectedPatient} />
        ) : (
          <>
            <DoctorViewReports patient={selectedPatient} onSelectPatient={setSelectedPatient} createdReportId={createdReportId}/>
            <DiagnosticReportForm patient={selectedPatient} onReportCreated={setCreatedReportId} />
          </>
        )}
      </Box>
    </>
  );
};

export default DoctorDashboard;

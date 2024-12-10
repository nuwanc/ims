import React, { useState, useEffect } from 'react';
import { Box, Button, Typography, AppBar, Toolbar } from '@mui/material';
import PatientSearch from '../PatientSearch';
import DoctorViewReports from '../DoctorViewReports';

const DoctorDashboard = () => {
  const [selectedPatient, setSelectedPatient] = useState(null);

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
          Doctor Dashboard
        </Typography>
        {!selectedPatient ? (
          <PatientSearch onSelectPatient={setSelectedPatient} />
        ) : (
          <DoctorViewReports patient={selectedPatient} onSelectPatient={setSelectedPatient}/>
        )}
      </Box>
    </>
  );
};

export default DoctorDashboard;

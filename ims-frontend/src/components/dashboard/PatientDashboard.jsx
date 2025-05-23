import React from 'react';
import { Box, Button, Typography, AppBar, Toolbar } from '@mui/material';
import PatientReports from '../PatientReports';


const PatientDashboard = () => {

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
            <PatientReports />
        </>
    );
};

export default PatientDashboard;
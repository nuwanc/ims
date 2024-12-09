import React from 'react';
import { Box, Button, Typography, AppBar, Toolbar } from '@mui/material';
import { useNavigate } from 'react-router-dom';

const AdminDashboard = () => {
    const navigate = useNavigate();

    const handleUsersList = () => {
        navigate('/user-management'); // Navigate to the Users List page
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
                            onClick={handleUsersList}
                        >
                            Users
                        </Button>

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
                    Admin Dashboard
                </Typography>
            </Box>
        </>
    );
};

export default AdminDashboard;

import React, { useState } from 'react';
import { Box, Button, Typography, AppBar, Toolbar, Tab, Tabs } from '@mui/material';
import SearchReports from '../SearchReports';
import ManageInvoices from '../ManageInvoices';
import TotalPatientsAndCost from '../TotalPatientAndCost';

const FinanceDashboard = () => {
  const handleLogout = () => {
    localStorage.clear(); // Clear token and role
    window.location.href = '/'; // Redirect to login page
  };

  const [activeTab, setActiveTab] = useState(0);

  const handleTabChange = (event, newValue) => {
    setActiveTab(newValue);
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
          Finance Dashboard
        </Typography>
        <Tabs
          value={activeTab}
          onChange={handleTabChange}
          indicatorColor="primary"
          textColor="primary"
          variant="fullWidth"
          sx={{ marginBottom: 4 }}
        >
          <Tab label="Search Reports" />
          <Tab label="Manage Invoices" />
          <Tab label="System Reports" />
        </Tabs>

        {/* Tab Content */}
        {activeTab === 0 && (
          <Box>
            <SearchReports />
          </Box>
        )}
        {activeTab === 1 && (
          <Box>
            <ManageInvoices />
          </Box>
        )}
        {activeTab === 2 && (
          <Box>
            <TotalPatientsAndCost />
          </Box>
        )}
      </Box>
    </>
  );

};

export default FinanceDashboard;
import React, { useState } from 'react';
import {
  Box,
  Typography,
  Tab, Tabs
} from '@mui/material';
import CreateUser from './CreateUser';
import UserSearch from './UserSearch';
import AuditLogs from './AuditLogs';

const UserManagement = () => {
  const [activeTab, setActiveTab] = useState(0);

  const handleTabChange = (event, newValue) => {
    setActiveTab(newValue);
  };


  return (
    <>
      <Box sx={{ padding: 4 }}>
        <Typography variant="h4" gutterBottom>
          Admin Dashboard
        </Typography>
        <Tabs
          value={activeTab}
          onChange={handleTabChange}
          indicatorColor="primary"
          textColor="primary"
          variant="fullWidth"
          sx={{ marginBottom: 4 }}
        >
          <Tab label="Create User" />
          <Tab label="Search User" />
          <Tab label="Audit Logs" />
        </Tabs>

        {/* Tab Content */}
        {activeTab === 0 && (
          <Box>
            <CreateUser />
          </Box>
        )}
        {activeTab === 1 && (
          <Box>
            <UserSearch />
          </Box>
        )}
        {activeTab === 2 && (
          <Box>
            <AuditLogs />
          </Box>
        )}
      </Box>
    </>
  );
};

export default UserManagement;

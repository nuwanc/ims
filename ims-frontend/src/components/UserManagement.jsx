import React, { useEffect, useState } from 'react';
import {
  Box,
  Button,
  Typography,
} from '@mui/material';
import CreateUser from './CreateUser';
import UserSearch from './UserSearch';
import AuditLogs from './AuditLogs';

const UserManagement = () => {
  const [showCreateUser, setShowCreateUser] = useState(false);
  const [showSearchUser, setShowSearchUser] = useState(false);
  const [showAuditLog, setShowAuditLog] = useState(false);


  return (
    <>
      <Box sx={{ padding: 4 }}>
        <Typography variant="h4" gutterBottom>
          User Management
        </Typography>
        <Button variant="outlined" onClick={(e)=>setShowCreateUser(!showCreateUser)} sx={{ marginBottom: 2 , marginLeft: 2}}>
          Create User
        </Button>
        <Button variant="outlined" onClick={(e)=>setShowSearchUser(!showSearchUser)} sx={{ marginBottom: 2 , marginLeft: 2}}>
          Search User
        </Button>
        <Button variant="outlined" onClick={(e)=>setShowAuditLog(!showAuditLog)} sx={{ marginBottom: 2 , marginLeft: 2}}>
          Audit Logs
        </Button>
        { showCreateUser ? <CreateUser/> : null}
        { showSearchUser ? <UserSearch/> : null}
        { showAuditLog ? <AuditLogs/> : null}
      </Box>
    </>
  );
};

export default UserManagement;

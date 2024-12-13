import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import {
  Box,
  Typography
} from '@mui/material';
import Login from './components/Login';
import ProtectedRoute from './components/ProtectedRoute';
import DoctorDashboard from './components/dashboard/DoctorDashboard';
import AdminDashboard from './components/dashboard/AdminDashboard';
import PatientDashboard from './components/dashboard/PatientDashboard';
import ReportDetails from './components/ReportDetails';
import StaffDashboard from './components/dashboard/StaffDashboard';
import FinanceDashboard from './components/dashboard/FinanceDashboard';

const NotFound = () => (
  <Box sx={{ textAlign: 'center', padding: 4 }}>
    <Typography variant="h4" color="error">
      404 - Page Not Found
    </Typography>
    <Typography variant="body1">
      Sorry, the page you are looking for does not exist.
    </Typography>
  </Box>
);


const App = () => {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<Login />} />


        <Route
          path="/admin-dashboard"
          element={
            <ProtectedRoute allowedRoles={['admin']}>
              <AdminDashboard />
            </ProtectedRoute>
          }
        />

        <Route
          path="/patient-dashboard"
          element={
            <ProtectedRoute allowedRoles={['patient']}>
              <PatientDashboard />
            </ProtectedRoute>
          }
        />

        <Route
          path="/doctor-dashboard"
          element={
            <ProtectedRoute allowedRoles={['doctor']}>
              <DoctorDashboard />
            </ProtectedRoute>
          }
        />

        <Route
          path="/finance-dashboard"
          element={
            <ProtectedRoute allowedRoles={['finance_staff']}>
              <FinanceDashboard />
            </ProtectedRoute>
          }
        />

        <Route
          path="/report/report-details/:reportId"
          element={
            <ProtectedRoute allowedRoles={['patient','doctor','medical_staff']}>
              <ReportDetails />
            </ProtectedRoute>
          }
        />

        <Route
          path="/medical-staff-dashboard"
          element={
            <ProtectedRoute allowedRoles={['medical_staff']}>
              <StaffDashboard />
            </ProtectedRoute>
          }
        />
        <Route path="*" element={<NotFound />} />
      </Routes>
    </Router>
  );
};

export default App;

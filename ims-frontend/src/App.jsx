import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Login from './components/Login';
import ProtectedRoute from './components/ProtectedRoute';
import DoctorDashboard from './components/dashboard/DoctorDashboard';
import AdminDashboard from './components/dashboard/AdminDashboard';
import PatientDashboard from './components/dashboard/PatientDashboard';
import ReportDetails from './components/ReportDetails';
import StaffDashboard from './components/dashboard/StaffDashboard';

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
          path="/report-details/:reportId"
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
      </Routes>
    </Router>
  );
};

export default App;

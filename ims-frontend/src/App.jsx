import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Login from './components/Login';
import Dashboard from './components/Dashboard';
import UserManagement from './components/UserManagement';
import CreateUser from './components/CreateUser';
import ProtectedRoute from './components/ProtectedRoute';
import ReportManagement from './components/ReportManagement';
import PatientReports from './components/PatientReports';
import DoctorDashboard from './components/DoctorDashboard';

const App = () => {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<Login />} />
        <Route
          path="/dashboard"
          element={
            <ProtectedRoute>
              <Dashboard />
            </ProtectedRoute>
          }
        />
        <Route
          path="/user-management"
          element={
            <ProtectedRoute allowedRoles={['admin']}>
              <UserManagement />
            </ProtectedRoute>
          }
        />
        <Route
          path="/create-user"
          element={
            <ProtectedRoute allowedRoles={['admin']}>
              <CreateUser />
            </ProtectedRoute>
          }
        />
        <Route
          path="/report-management"
          element={
            <ProtectedRoute allowedRoles={['medical_staff']}>
              <ReportManagement />
            </ProtectedRoute>
          }
        />
         <Route
          path="/doctor-dahsboard"
          element={
            <ProtectedRoute allowedRoles={['doctor']}>
              <DoctorDashboard />
            </ProtectedRoute>
          }
        />
        <Route
          path="/my-reports"
          element={
            <ProtectedRoute allowedRoles={['patient']}>
              <PatientReports />
            </ProtectedRoute>
          }
        />
      </Routes>
    </Router>
  );
};

export default App;

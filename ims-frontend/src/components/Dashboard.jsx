import React from 'react';
import { useNavigate } from 'react-router-dom';

const Dashboard = () => {
  const navigate = useNavigate();
  const role = localStorage.getItem('role'); // Retrieve role from local storage

  const logout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('role');
    window.location.href = '/';
  };

  const navigateToUserManagement = () => {
    navigate('/user-management');
  };

  const navigateToReportManagement = () => {
    navigate('/report-management');
  }

  const navigateToPatientReports = () => {
    navigate('/my-reports')
  }

  const navivateToDoctorDashboard = () => {
    navigate('/doctor-dashboard')
  }

  return (
    <div>
      <h2>Dashboard</h2>
      {role === 'admin' && (
        <button onClick={navigateToUserManagement}>User Management</button>
      )}
      {role === 'medical_staff' && (
        <button onClick={navigateToReportManagement}>Report Management</button>
      )}
      {role === 'patient' && (
        <button onClick={navigateToPatientReports }>My Reports</button>
      )}
      {role === 'doctor' && (
        <button onClick={navivateToDoctorDashboard }>Doctor Dashboard</button>
      )}
      
      <button onClick={logout}>Logout</button>
    </div>
  );
};

export default Dashboard;

import React, { useState } from 'react';
import PatientSearch from './PatientSearch';
import DoctorViewReports from './DoctorViewReports';

const DoctorDashboard = () => {
  const [selectedPatient, setSelectedPatient] = useState(null);

  return (
    <div>
      <h2>Doctor Dashboard</h2>
      {!selectedPatient ? (
        <PatientSearch onSelectPatient={setSelectedPatient} />
      ) : (
        <DoctorViewReports patient={selectedPatient} />
      )}
    </div>
  );
};

export default DoctorDashboard;

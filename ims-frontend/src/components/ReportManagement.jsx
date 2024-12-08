import React, { useState } from 'react';
import PatientSearch from './PatientSearch';
import DiagnosticReportForm from './DiagnosticReportForm';
import UploadImages from './UploadImages';
import ViewReports from './ViewReports';

const ReportManagement = () => {
    const [selectedPatient, setSelectedPatient] = useState(null);
  const [createdReportId, setCreatedReportId] = useState(null);
  const [viewReports, setViewReports] = useState(false);

  return (
    <div>
      <h2>Medical Staff Dashboard</h2>
      {!selectedPatient ? (
        <PatientSearch onSelectPatient={setSelectedPatient} />
      ) : viewReports ? (
        <ViewReports patient={selectedPatient} />
      ) : !createdReportId ? (
        <div>
          <button onClick={() => setViewReports(true)}>View Reports</button>
          <DiagnosticReportForm
            patient={selectedPatient}
            onReportCreated={setCreatedReportId}
          />
        </div>
      ) : (
        <UploadImages reportId={createdReportId} />
      )}
    </div>
  );
};

export default ReportManagement;

import React, { useState } from 'react';
import api from '../services/api';

const DiagnosticReportForm = ({ patient, onReportCreated }) => {
  const [type, setType] = useState('xray');
  const [description, setDescription] = useState('');
  const [error, setError] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const response = await api.post('/diagnostic-reports', {
        patient_id: patient.id,
        type,
        description,
      });
      onReportCreated(response.data.report_id); // Pass the report ID to the parent
    } catch (err) {
      setError('Error creating diagnostic report');
      console.error(err);
    }
  };

  return (
    <div>
      <h3>Create Diagnostic Report for {patient.email}</h3>
      <form onSubmit={handleSubmit}>
        <div>
          <label>Type:</label>
          <select value={type} onChange={(e) => setType(e.target.value)}>
            <option value="xray">X-Ray</option>
            <option value="ct">CT Scan</option>
            <option value="mri">MRI</option>
          </select>
        </div>
        <div>
          <label>Description:</label>
          <textarea
            value={description}
            onChange={(e) => setDescription(e.target.value)}
          />
        </div>
        {error && <p style={{ color: 'red' }}>{error}</p>}
        <button type="submit">Create Report</button>
      </form>
    </div>
  );
};

export default DiagnosticReportForm;

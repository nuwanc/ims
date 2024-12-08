import React, { useState } from 'react';
import api from '../services/api';

const PatientSearch = ({ onSelectPatient }) => {
  const [query, setQuery] = useState('');
  const [patients, setPatients] = useState([]);

  const searchPatients = async () => {
    try {
      const response = await api.get('/patients', {
        params: { role: 'patient', query },
      });
      setPatients(response.data);
    } catch (err) {
      console.error('Error fetching patients:', err);
    }
  };
  
  return (
    <div>
      <h3>Search Patients</h3>
      <input
        type="text"
        value={query}
        onChange={(e) => setQuery(e.target.value)}
        placeholder="Search by name or email"
      />
      <button onClick={searchPatients}>Search</button>
      <ul>
        {patients.map((patient) => (
          <li key={patient.id}>
            {patient.email} - {patient.role}
            <button onClick={() => onSelectPatient(patient)}>Select</button>
          </li>
        ))}
      </ul>
    </div>
  );
};

export default PatientSearch;

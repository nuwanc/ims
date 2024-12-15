import React, { useState, useEffect } from 'react';
import {Typography } from '@mui/material';
import api from '../services/api';

const PatientCost = ({patient})=>{
    const [selectedPatientCost, setSelectedPatientCost] = useState(null);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');

    useEffect(()=>{
        const fetchPatientCost = async () => {        
            setError('');
            setSelectedPatientCost(null);
            setLoading(true);
            try {
              const response = await api.get(`/stats/${patient.id}/cost`);
              setSelectedPatientCost(response.data.total_cost);
            } catch (err) {
              setError('Error fetching total cost for the selected patient.');
            } finally {
              setLoading(false);
            }
        };
        fetchPatientCost();
    },[patient]);

    return (
        <>
            {selectedPatientCost !== null && (
                <Typography variant="h6" sx={{ marginTop: 2 }}>
                    Total Cost for Patient {patient.email}: ${selectedPatientCost.toFixed(2)} 
                </Typography>
            )}
        </>
    );


}

export default PatientCost;
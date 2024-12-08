import React, { useEffect, useState } from 'react';
import api from '../services/api';
import ImageViewer from './ImageViewer';

const PatientReports = () => {
  const [reports, setReports] = useState([]);
  const [error, setError] = useState('');

  useEffect(() => {
    const fetchReports = async () => {
      try {
        const response = await api.get('/my-diagnostic-reports');
        setReports(response.data);
      } catch (err) {
        setError('Error fetching reports');
        console.error(err);
      }
    };

    fetchReports();
  }, []);

  return (
    <div>
      <h2>My Diagnostic Reports</h2>
      {error && <p style={{ color: 'red' }}>{error}</p>}
      {reports.length === 0 ? (
        <p>No reports found</p>
      ) : (
        reports.map((report) => (
          <div key={report.id} style={{ border: '1px solid #ccc', margin: '10px', padding: '10px' }}>
            <h4>Report Type: {report.type}</h4>
            <p>{report.description}</p>
            <p><strong>Created At:</strong> {new Date(report.created_at).toLocaleString()}</p>
            <h5>Images</h5>
            {report.images.length === 0 ? (
              <p>No images attached</p>
            ) : (
              report.images.map((image) => (
                <div key={image.id}>
                  <p>{image.filename}</p>
                  <ImageViewer imageId={image.id} />
                </div>
              ))
            )}
          </div>
        ))
      )}
    </div>
  );
};

export default PatientReports;

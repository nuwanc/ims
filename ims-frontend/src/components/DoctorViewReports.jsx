import React, { useEffect, useState } from 'react';
import api from '../services/api';
import ImageViewer from './ImageViewer';

const DoctorViewReports = ({ patient }) => {
  const [reports, setReports] = useState([]);
  const [error, setError] = useState('');
  const [selectedReport, setSelectedReport] = useState(null);
  const [diagnosis, setDiagnosis] = useState('');
  const [comment, setComment] = useState('');
  const [success, setSuccess] = useState('');

  useEffect(() => {
    const fetchReports = async () => {
      try {
        const response = await api.get(`/patients/${patient.id}/diagnostic-reports`);
        setReports(response.data);
      } catch (err) {
        setError('Error fetching reports');
        console.error(err);
      }
    };

    fetchReports();
  }, [patient]);

  const handleCommentSubmit = async (e) => {
    e.preventDefault();
    try {
      await api.post(`/diagnostic-reports/${selectedReport.id}/add-comment`, {
        diagnosis,
        comment,
      });
      setSuccess('Comment added successfully');
      setDiagnosis('');
      setComment('');
    } catch (err) {
      setError('Error adding comment');
      console.error(err);
    }
  };

  return (
    <div>
      <h3>Diagnostic Reports for {patient.email}</h3>
      {error && <p style={{ color: 'red' }}>{error}</p>}
      {success && <p style={{ color: 'green' }}>{success}</p>}
      {reports.length === 0 ? (
        <p>No reports found</p>
      ) : (
        reports.map((report) => (
          <div key={report.id} style={{ border: '1px solid #ccc', margin: '10px', padding: '10px' }}>
            <h4>Report Type: {report.type}</h4>
            <p>{report.description}</p>
            <p><strong>Diagnosis:</strong> {report.diagnosis || 'None'}</p>
            <p><strong>Comment:</strong> {report.comment || 'None'}</p>
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
            <button onClick={() => setSelectedReport(report)}>Add Diagnosis/Comment</button>
          </div>
        ))
      )}

      {selectedReport && (
        <div style={{ marginTop: '20px' }}>
          <h4>Add Diagnosis/Comment for Report: {selectedReport.id}</h4>
          <form onSubmit={handleCommentSubmit}>
            <div>
              <label>Diagnosis:</label>
              <textarea
                value={diagnosis}
                onChange={(e) => setDiagnosis(e.target.value)}
              />
            </div>
            <div>
              <label>Comment:</label>
              <textarea
                value={comment}
                onChange={(e) => setComment(e.target.value)}
              />
            </div>
            <button type="submit">Submit</button>
          </form>
        </div>
      )}
    </div>
  );
};

export default DoctorViewReports;

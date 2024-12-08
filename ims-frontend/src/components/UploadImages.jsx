import React, { useState } from 'react';
import api from '../services/api';

const UploadImages = ({ reportId }) => {
  const [files, setFiles] = useState([]);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  const handleFileChange = (e) => {
    setFiles(e.target.files);
  };

  const handleUpload = async (e) => {
    e.preventDefault();
    const formData = new FormData();
    for (let i = 0; i < files.length; i++) {
      formData.append('files', files[i]);
    }

    try {
      await api.post(`/diagnostic-reports/${reportId}/images`, formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      });
      setSuccess('Images uploaded successfully');
    } catch (err) {
      setError('Error uploading images');
      console.error(err);
    }
  };

  return (
    <div>
      <h3>Upload Images for Report ID: {reportId}</h3>
      <form onSubmit={handleUpload}>
        <input type="file" multiple onChange={handleFileChange} />
        {error && <p style={{ color: 'red' }}>{error}</p>}
        {success && <p style={{ color: 'green' }}>{success}</p>}
        <button type="submit">Upload Images</button>
      </form>
    </div>
  );
};

export default UploadImages;

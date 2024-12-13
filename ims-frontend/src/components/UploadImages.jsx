import React, { useState } from 'react';
import { Box, Button, Typography, Alert, LinearProgress } from '@mui/material';
import api from '../services/api';

const UploadImages = ({ reportId }) => {
  const [files, setFiles] = useState([]);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [uploading, setUploading] = useState(false);

  const handleFileChange = (e) => {
    setFiles(e.target.files);
  };

  const handleUpload = async (e) => {
    e.preventDefault();
    if (files.length === 0) {
      setError('Please select at least one file to upload.');
      return;
    }

    const formData = new FormData();
    for (let i = 0; i < files.length; i++) {
      formData.append('files', files[i]);
    }

    setError('');
    setSuccess('');
    setUploading(true);

    try {
      await api.post(`/report/diagnostic-reports/${reportId}/images`, formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      });
      setSuccess('Images uploaded successfully.');
      setFiles([]);
    } catch (err) {
      setError('Error uploading images.');
      console.error(err);
    } finally {
      setUploading(false);
    }
  };

  return (
    <Box sx={{ padding: 4 }}>
      <Typography variant="h5" gutterBottom>
        Upload Images for Report ID: {reportId}
      </Typography>
      {error && <Alert severity="error" sx={{ marginBottom: 2 }}>{error}</Alert>}
      {success && <Alert severity="success" sx={{ marginBottom: 2 }}>{success}</Alert>}
      {uploading && <LinearProgress sx={{ marginBottom: 2 }} />}
      <form onSubmit={handleUpload}>
        <input
          type="file"
          multiple
          onChange={handleFileChange}
          style={{ margin: '10px 0' }}
        />
        <Button
          type="submit"
          variant="contained"
          color="primary"
          disabled={uploading}
        >
          {uploading ? 'Uploading...' : 'Upload Images'}
        </Button>
      </form>
    </Box>
  );
};

export default UploadImages;

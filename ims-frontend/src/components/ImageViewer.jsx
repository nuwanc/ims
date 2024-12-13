import React, { useState, useEffect } from 'react';
import api from '../services/api';

const ImageViewer = ({ imageId }) => {
  const [imageSrc, setImageSrc] = useState(null);

  useEffect(() => {
    const fetchImage = async () => {
      try {
        const response = await api.get(`/report/diagnostic-reports/images/${imageId}`, {
          responseType: 'blob', // Ensure we get the binary data
        });
        const imageUrl = URL.createObjectURL(response.data); // Convert blob to object URL
        setImageSrc(imageUrl);
      } catch (err) {
        console.error('Error fetching image:', err);
      }
    };

    fetchImage();
  }, [imageId]);

  if (!imageSrc) {
    return <p>Loading image...</p>;
  }

  return <img src={imageSrc} alt="Diagnostic" style={{ maxWidth: '100%' }} />;
};

export default ImageViewer;

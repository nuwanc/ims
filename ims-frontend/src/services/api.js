import axios from 'axios';

// Create Axios instance
const api = axios.create({
  baseURL: 'http://127.0.0.1:5000', // Replace with your backend URL
});

// Add a request interceptor to include the token
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    // Handle request error
    return Promise.reject(error);
  }
);

// Add a response interceptor to handle unauthorized errors
api.interceptors.response.use(
  (response) => response, // Return response if successful
  (error) => {
    if (error.response) {
      const { status } = error.response;

      // Handle 401 Unauthorized or 403 Forbidden
      if ( status === 403) {
        alert('Your session has expired or you do not have access. Please log in again.');

        // Clear user data from localStorage
        localStorage.removeItem('token');
        localStorage.removeItem('role');

        // Redirect to login page
        window.location.href = '/';
      }
    }

    // Propagate other errors to be handled where the request was made
    return Promise.reject(error);
  }
);

export default api;

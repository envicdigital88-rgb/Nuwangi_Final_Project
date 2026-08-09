import React, { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Box, Typography, Button, Paper } from '@mui/material';

const ForceLogoutPage = () => {
  const navigate = useNavigate();

  useEffect(() => {
    // Clear everything
    localStorage.clear();
    sessionStorage.clear();
  }, []);

  const handleLogin = () => {
    navigate('/login');
  };

  return (
    <Box
      sx={{
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center',
        minHeight: '100vh',
        bgcolor: 'background.default',
      }}
    >
      <Paper sx={{ p: 4, maxWidth: 400, textAlign: 'center' }}>
        <Typography variant="h5" gutterBottom>
          Session Cleared
        </Typography>
        <Typography variant="body1" color="text.secondary" sx={{ mb: 3 }}>
          Your session has been cleared. Please login again.
        </Typography>
        <Button variant="contained" onClick={handleLogin} fullWidth>
          Go to Login
        </Button>
      </Paper>
    </Box>
  );
};

export default ForceLogoutPage;

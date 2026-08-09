import React, { useState } from 'react';
import { Box, Button, Typography, Paper } from '@mui/material';
import apiService from '../services/apiService';

const DebugPage = () => {
  const [result, setResult] = useState('');

  const testDashboard = async () => {
    try {
      const token = localStorage.getItem('admin_token');
      setResult(`Token: ${token ? 'EXISTS' : 'MISSING'}\n\n`);
      
      const data = await apiService.getDashboardStats();
      setResult(prev => prev + `Success!\n${JSON.stringify(data, null, 2)}`);
    } catch (err) {
      setResult(prev => prev + `Error: ${err.message}\n${JSON.stringify(err.response?.data, null, 2)}`);
    }
  };

  return (
    <Box p={3}>
      <Typography variant="h4" gutterBottom>API Debug</Typography>
      <Button variant="contained" onClick={testDashboard}>
        Test Dashboard API
      </Button>
      <Paper sx={{ mt: 2, p: 2 }}>
        <pre>{result}</pre>
      </Paper>
    </Box>
  );
};

export default DebugPage;

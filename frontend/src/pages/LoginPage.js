import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { 
  Box, Typography, TextField, Button, Paper, Alert, 
  CircularProgress, InputAdornment, IconButton, Container
} from '@mui/material';
import { Email, Lock, Visibility, VisibilityOff, Checkroom } from '@mui/icons-material';

const LoginPage = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  
  const { login } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      await login(email, password);
      navigate('/dashboard');
    } catch (err) {
      setError(err.response?.data?.message || 'Login failed. Please check your credentials.');
    } finally {
      setLoading(false);
    }
  };

  const handleClickShowPassword = () => setShowPassword(!showPassword);

  return (
    <Box 
      sx={{
        minHeight: '100vh',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        background: 'linear-gradient(135deg, #0f172a 0%, #1e1b4b 100%)',
        position: 'relative',
        overflow: 'hidden'
      }}
    >
      {/* Abstract Background Elements */}
      <Box sx={{
        position: 'absolute', top: '-10%', left: '-10%', width: '40vw', height: '40vw',
        background: 'radial-gradient(circle, rgba(59,130,246,0.15) 0%, rgba(0,0,0,0) 70%)',
        borderRadius: '50%', zIndex: 0
      }} />
      <Box sx={{
        position: 'absolute', bottom: '-20%', right: '-10%', width: '50vw', height: '50vw',
        background: 'radial-gradient(circle, rgba(139,92,246,0.15) 0%, rgba(0,0,0,0) 70%)',
        borderRadius: '50%', zIndex: 0
      }} />

      <Container maxWidth="sm" sx={{ zIndex: 1 }}>
        <Paper 
          elevation={24} 
          sx={{ 
            p: { xs: 4, md: 6 }, 
            borderRadius: 4,
            bgcolor: 'rgba(30, 41, 59, 0.7)',
            backdropFilter: 'blur(20px)',
            border: '1px solid rgba(255, 255, 255, 0.1)'
          }}
        >
          <Box sx={{ textAlign: 'center', mb: 4 }}>
            <Checkroom sx={{ fontSize: 48, color: '#8b5cf6', mb: 1 }} />
            <Typography variant="h4" fontWeight="bold" sx={{ color: '#fff', mb: 1 }}>
              Virtual Try-On
            </Typography>
            <Typography variant="body1" sx={{ color: '#94a3b8' }}>
              Secure Admin Portal
            </Typography>
          </Box>
          
          {error && (
            <Alert severity="error" sx={{ mb: 3, borderRadius: 2, bgcolor: 'rgba(239, 68, 68, 0.1)', color: '#fca5a5' }}>
              {error}
            </Alert>
          )}
          
          <form onSubmit={handleSubmit}>
            <TextField
              fullWidth
              label="Email Address"
              variant="outlined"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              disabled={loading}
              sx={{ mb: 3 }}
              InputProps={{
                startAdornment: (
                  <InputAdornment position="start">
                    <Email sx={{ color: '#64748b' }} />
                  </InputAdornment>
                ),
                sx: { color: '#f8fafc', bgcolor: 'rgba(15, 23, 42, 0.6)', borderRadius: 2 }
              }}
              InputLabelProps={{ style: { color: '#94a3b8' } }}
            />
            
            <TextField
              fullWidth
              label="Password"
              variant="outlined"
              type={showPassword ? "text" : "password"}
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              disabled={loading}
              sx={{ mb: 4 }}
              InputProps={{
                startAdornment: (
                  <InputAdornment position="start">
                    <Lock sx={{ color: '#64748b' }} />
                  </InputAdornment>
                ),
                endAdornment: (
                  <InputAdornment position="end">
                    <IconButton onClick={handleClickShowPassword} edge="end" sx={{ color: '#64748b' }}>
                      {showPassword ? <VisibilityOff /> : <Visibility />}
                    </IconButton>
                  </InputAdornment>
                ),
                sx: { color: '#f8fafc', bgcolor: 'rgba(15, 23, 42, 0.6)', borderRadius: 2 }
              }}
              InputLabelProps={{ style: { color: '#94a3b8' } }}
            />
            
            <Button 
              type="submit" 
              fullWidth 
              variant="contained" 
              disabled={loading}
              sx={{ 
                py: 1.5, 
                fontSize: '1rem', 
                fontWeight: 'bold',
                borderRadius: 2,
                background: 'linear-gradient(135deg, #3b82f6 0%, #8b5cf6 100%)',
                boxShadow: '0 4px 14px 0 rgba(139, 92, 246, 0.39)',
                '&:hover': {
                  background: 'linear-gradient(135deg, #2563eb 0%, #7c3aed 100%)',
                  boxShadow: '0 6px 20px 0 rgba(139, 92, 246, 0.45)',
                }
              }}
            >
              {loading ? <CircularProgress size={24} sx={{ color: '#fff' }} /> : 'Authenticate securely'}
            </Button>
          </form>
        </Paper>
      </Container>
    </Box>
  );
};

export default LoginPage;

import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Box,
  Container,
  Typography,
  Button,
  Card,
  CardContent,
  Alert,
  Stepper,
  Step,
  StepLabel,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  CircularProgress,
  Divider,
  Chip,
  Grid,
  Paper,
} from '@mui/material';
import { CheckCircle, Person, PhotoCamera, ArrowForward, Save } from '@mui/icons-material';
import { useCustomerAuth } from '../contexts/CustomerAuthContext';
import PhotoMeasurementUpload from '../components/PhotoMeasurementUpload';
import axios from 'axios';

const BodyProfilePage = () => {
  const { customer, bodyProfile: authBodyProfile, refreshBodyProfile } = useCustomerAuth();
  const navigate = useNavigate();
  
  const [activeStep, setActiveStep] = useState(0);
  const [measurements, setMeasurements] = useState({
    height: 165,
    chest: 88,
    waist: 72,
    hips: 95,
    shoulders: 42,
  });
  const [gender, setGender] = useState('female');
  const [saving, setSaving] = useState(false);
  const [saveError, setSaveError] = useState('');
  const [saveSuccess, setSaveSuccess] = useState(false);
  const [showPhotoUpload, setShowPhotoUpload] = useState(false);
  const [isEditing, setIsEditing] = useState(false);

  const steps = ['Choose Input Method', 'Enter Measurements', 'Review & Save'];

  useEffect(() => {
    // Load existing profile if available
    if (authBodyProfile) {
      setMeasurements({
        height: authBodyProfile.heightCm || 165,
        chest: authBodyProfile.chestCm || 88,
        waist: authBodyProfile.waistCm || 72,
        hips: authBodyProfile.hipCm || 95,
        shoulders: authBodyProfile.shoulderWidthCm || 42,
      });
      setGender((authBodyProfile.gender || 'FEMALE').toLowerCase());
      setIsEditing(true);
      setActiveStep(1); // Skip to measurement input if editing
    }
  }, [authBodyProfile]);

  const handlePhotoMeasurementsExtracted = (extractedMeasurements) => {
    setMeasurements({
      height: extractedMeasurements.height,
      chest: extractedMeasurements.chest,
      waist: extractedMeasurements.waist,
      hips: extractedMeasurements.hips,
      shoulders: extractedMeasurements.shoulders || 42,
    });
    setShowPhotoUpload(false);
    setActiveStep(2); // Move to review step
  };

  const handleManualInput = () => {
    setActiveStep(1);
  };

  const handleSaveProfile = async () => {
    if (!customer) {
      setSaveError('Please login to save your profile');
      return;
    }

    setSaving(true);
    setSaveError('');
    setSaveSuccess(false);

    try {
      const profileData = {
        userId: customer.id,
        heightCm: measurements.height,
        chestCm: measurements.chest,
        waistCm: measurements.waist,
        hipCm: measurements.hips,
        shoulderWidthCm: measurements.shoulders,
        gender: gender.toUpperCase(),
      };

      let response;
      if (authBodyProfile?.id) {
        // Update existing profile
        response = await axios.put(
          `http://localhost:8082/api/body-profile/${authBodyProfile.id}`,
          profileData
        );
      } else {
        // Create new profile
        response = await axios.post(
          'http://localhost:8082/api/body-profile/create',
          profileData
        );
      }

      if (refreshBodyProfile) {
        await refreshBodyProfile();
      }
      
      setSaveSuccess(true);
      
      // Redirect to virtual try-on after 2 seconds
      setTimeout(() => {
        navigate('/virtual-tryon');
      }, 2000);
    } catch (error) {
      console.error('Failed to save profile:', error);
      setSaveError(error.response?.data?.message || 'Failed to save profile. Please try again.');
    } finally {
      setSaving(false);
    }
  };

  const handleNext = () => {
    setActiveStep((prevStep) => prevStep + 1);
  };

  const handleBack = () => {
    setActiveStep((prevStep) => prevStep - 1);
  };

  return (
    <Box sx={{ 
      minHeight: '100vh',
      background: 'linear-gradient(135deg, #000000 0%, #1a1a1a 100%)',
      py: 4
    }}>
      <Container maxWidth="lg">
        {/* Header */}
        <Box sx={{ textAlign: 'center', mb: 4 }}>
          <Typography 
            variant="h3" 
            gutterBottom 
            fontWeight="bold"
            sx={{ color: '#ffffff', mb: 1 }}
          >
            {isEditing ? 'Update Your Body Profile' : 'Create Your Body Profile'}
          </Typography>
          <Typography variant="h6" sx={{ color: '#9ca3af', mb: 3 }}>
            Get accurate size recommendations with AI-powered measurements
          </Typography>
          
          <Box sx={{ 
            display: 'inline-flex', 
            gap: 2,
            px: 3,
            py: 1.5,
            bgcolor: 'rgba(147, 51, 234, 0.08)',
            borderRadius: 2,
            border: '1px solid rgba(147, 51, 234, 0.2)',
          }}>
            <Box sx={{ textAlign: 'center' }}>
              <Typography variant="h6" sx={{ color: '#9333ea', fontWeight: '700' }}>84%</Typography>
              <Typography variant="caption" sx={{ color: '#9ca3af' }}>Accuracy</Typography>
            </Box>
            <Divider orientation="vertical" flexItem sx={{ bgcolor: 'rgba(147, 51, 234, 0.2)' }} />
            <Box sx={{ textAlign: 'center' }}>
              <Typography variant="h6" sx={{ color: '#9333ea', fontWeight: '700' }}>AI Powered</Typography>
              <Typography variant="caption" sx={{ color: '#9ca3af' }}>Analysis</Typography>
            </Box>
          </Box>
        </Box>

        {/* Stepper */}
        <Box sx={{ mb: 4 }}>
          <Stepper activeStep={activeStep} alternativeLabel>
            {steps.map((label) => (
              <Step key={label}>
                <StepLabel
                  sx={{
                    '& .MuiStepLabel-label': { color: '#9ca3af' },
                    '& .MuiStepLabel-label.Mui-active': { color: '#9333ea' },
                    '& .MuiStepLabel-label.Mui-completed': { color: '#22c55e' },
                  }}
                >
                  {label}
                </StepLabel>
              </Step>
            ))}
          </Stepper>
        </Box>

        {/* Step Content */}
        <Card sx={{ 
          background: 'linear-gradient(135deg, #1a1a1a 0%, #2a2a2a 100%)',
          border: '1px solid rgba(255,255,255,0.1)',
          borderRadius: 3,
          boxShadow: '0 8px 32px rgba(0,0,0,0.3)',
          mb: 3
        }}>
          <CardContent sx={{ p: 4 }}>
            {saveError && (
              <Alert severity="error" sx={{ mb: 3 }}>
                {saveError}
              </Alert>
            )}

            {saveSuccess && (
              <Alert 
                severity="success" 
                sx={{ 
                  mb: 3,
                  bgcolor: 'rgba(34, 197, 94, 0.1)',
                  border: '1px solid rgba(34, 197, 94, 0.3)',
                }}
              >
                Profile saved successfully! Redirecting to Virtual Try-On...
              </Alert>
            )}

            {/* Step 0: Choose Input Method */}
            {activeStep === 0 && (
              <Box>
                <Typography variant="h5" gutterBottom color="#ffffff" fontWeight="600" sx={{ mb: 3 }}>
                  How would you like to input your measurements?
                </Typography>
                
                <Grid container spacing={3}>
                  {/* Photo Upload Option */}
                  <Grid item xs={12} md={6}>
                    <Paper
                      sx={{
                        p: 4,
                        textAlign: 'center',
                        background: 'rgba(147, 51, 234, 0.05)',
                        border: '2px solid rgba(147, 51, 234, 0.3)',
                        borderRadius: 3,
                        cursor: 'pointer',
                        transition: 'all 0.3s',
                        '&:hover': {
                          background: 'rgba(147, 51, 234, 0.1)',
                          transform: 'translateY(-4px)',
                        }
                      }}
                      onClick={() => setShowPhotoUpload(true)}
                    >
                      <PhotoCamera sx={{ fontSize: 64, color: '#9333ea', mb: 2 }} />
                      <Typography variant="h5" color="#ffffff" fontWeight="600" gutterBottom>
                        Upload Photo
                      </Typography>
                      <Typography variant="body2" color="#9ca3af" sx={{ mb: 2 }}>
                        AI will extract measurements from your photo
                      </Typography>
                      <Chip label="Recommended" color="primary" size="small" />
                    </Paper>
                  </Grid>

                  {/* Manual Input Option */}
                  <Grid item xs={12} md={6}>
                    <Paper
                      sx={{
                        p: 4,
                        textAlign: 'center',
                        background: 'rgba(255, 255, 255, 0.05)',
                        border: '2px solid rgba(255, 255, 255, 0.2)',
                        borderRadius: 3,
                        cursor: 'pointer',
                        transition: 'all 0.3s',
                        '&:hover': {
                          background: 'rgba(255, 255, 255, 0.1)',
                          transform: 'translateY(-4px)',
                        }
                      }}
                      onClick={handleManualInput}
                    >
                      <Person sx={{ fontSize: 64, color: '#ffffff', mb: 2 }} />
                      <Typography variant="h5" color="#ffffff" fontWeight="600" gutterBottom>
                        Manual Input
                      </Typography>
                      <Typography variant="body2" color="#9ca3af" sx={{ mb: 2 }}>
                        Enter your measurements manually
                      </Typography>
                      <Chip label="Alternative" size="small" sx={{ bgcolor: 'rgba(255,255,255,0.1)', color: '#fff' }} />
                    </Paper>
                  </Grid>
                </Grid>

                {showPhotoUpload && (
                  <Box sx={{ mt: 3 }}>
                    <PhotoMeasurementUpload
                      onMeasurementsExtracted={handlePhotoMeasurementsExtracted}
                      onClose={() => setShowPhotoUpload(false)}
                    />
                  </Box>
                )}
              </Box>
            )}

            {/* Step 1: Enter Measurements */}
            {activeStep === 1 && (
              <Box>
                <Typography variant="h5" gutterBottom color="#ffffff" fontWeight="600" sx={{ mb: 3 }}>
                  Enter Your Measurements
                </Typography>

                {/* Gender Selection */}
                <FormControl fullWidth sx={{ mb: 3 }}>
                  <InputLabel sx={{ color: '#888' }}>Gender</InputLabel>
                  <Select
                    value={gender}
                    onChange={(e) => setGender(e.target.value)}
                    label="Gender"
                    sx={{
                      color: '#ffffff',
                      '.MuiOutlinedInput-notchedOutline': { borderColor: '#333' },
                      '&:hover .MuiOutlinedInput-notchedOutline': { borderColor: '#666' },
                      '&.Mui-focused .MuiOutlinedInput-notchedOutline': { borderColor: '#9333ea' },
                    }}
                  >
                    <MenuItem value="female">Female</MenuItem>
                    <MenuItem value="male">Male</MenuItem>
                  </Select>
                </FormControl>

                <Grid container spacing={3}>
                  {/* Measurement Inputs */}
                  <Grid item xs={12}>
                    <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2, maxWidth: 600, mx: 'auto' }}>
                      {/* Height */}
                      <Box>
                        <Typography variant="subtitle2" color="#9ca3af" sx={{ mb: 1 }}>
                          Height (cm)
                        </Typography>
                        <Box sx={{ 
                          bgcolor: '#1a1a1a',
                          border: '2px solid #333',
                          borderRadius: 2,
                          p: 2,
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'space-between',
                        }}>
                          <input
                            type="number"
                            value={measurements.height}
                            onChange={(e) => setMeasurements({ ...measurements, height: parseInt(e.target.value) || 165 })}
                            min={140}
                            max={210}
                            style={{
                              background: 'transparent',
                              border: 'none',
                              color: '#9333ea',
                              fontSize: '1.5rem',
                              fontWeight: 'bold',
                              width: '100px',
                              outline: 'none',
                            }}
                          />
                          <Typography variant="body1" color="#666">cm</Typography>
                        </Box>
                      </Box>

                      {/* Shoulders */}
                      <Box>
                        <Typography variant="subtitle2" color="#9ca3af" sx={{ mb: 1 }}>
                          Shoulders (cm)
                        </Typography>
                        <Box sx={{ 
                          bgcolor: '#1a1a1a',
                          border: '2px solid #333',
                          borderRadius: 2,
                          p: 2,
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'space-between',
                        }}>
                          <input
                            type="number"
                            value={measurements.shoulders}
                            onChange={(e) => setMeasurements({ ...measurements, shoulders: parseInt(e.target.value) || 42 })}
                            min={30}
                            max={60}
                            style={{
                              background: 'transparent',
                              border: 'none',
                              color: '#9333ea',
                              fontSize: '1.5rem',
                              fontWeight: 'bold',
                              width: '100px',
                              outline: 'none',
                            }}
                          />
                          <Typography variant="body1" color="#666">cm</Typography>
                        </Box>
                      </Box>

                      {/* Bust/Chest */}
                      <Box>
                        <Typography variant="subtitle2" color="#9ca3af" sx={{ mb: 1 }}>
                          Bust/Chest (cm)
                        </Typography>
                        <Box sx={{ 
                          bgcolor: '#1a1a1a',
                          border: '2px solid #333',
                          borderRadius: 2,
                          p: 2,
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'space-between',
                        }}>
                          <input
                            type="number"
                            value={measurements.chest}
                            onChange={(e) => setMeasurements({ ...measurements, chest: parseInt(e.target.value) || 88 })}
                            min={70}
                            max={130}
                            style={{
                              background: 'transparent',
                              border: 'none',
                              color: '#9333ea',
                              fontSize: '1.5rem',
                              fontWeight: 'bold',
                              width: '100px',
                              outline: 'none',
                            }}
                          />
                          <Typography variant="body1" color="#666">cm</Typography>
                        </Box>
                      </Box>

                      {/* Waist */}
                      <Box>
                        <Typography variant="subtitle2" color="#9ca3af" sx={{ mb: 1 }}>
                          Waist (cm)
                        </Typography>
                        <Box sx={{ 
                          bgcolor: '#1a1a1a',
                          border: '2px solid #333',
                          borderRadius: 2,
                          p: 2,
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'space-between',
                        }}>
                          <input
                            type="number"
                            value={measurements.waist}
                            onChange={(e) => setMeasurements({ ...measurements, waist: parseInt(e.target.value) || 72 })}
                            min={50}
                            max={110}
                            style={{
                              background: 'transparent',
                              border: 'none',
                              color: '#9333ea',
                              fontSize: '1.5rem',
                              fontWeight: 'bold',
                              width: '100px',
                              outline: 'none',
                            }}
                          />
                          <Typography variant="body1" color="#666">cm</Typography>
                        </Box>
                      </Box>

                      {/* Hips */}
                      <Box>
                        <Typography variant="subtitle2" color="#9ca3af" sx={{ mb: 1 }}>
                          Hips (cm)
                        </Typography>
                        <Box sx={{ 
                          bgcolor: '#1a1a1a',
                          border: '2px solid #333',
                          borderRadius: 2,
                          p: 2,
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'space-between',
                        }}>
                          <input
                            type="number"
                            value={measurements.hips}
                            onChange={(e) => setMeasurements({ ...measurements, hips: parseInt(e.target.value) || 95 })}
                            min={70}
                            max={140}
                            style={{
                              background: 'transparent',
                              border: 'none',
                              color: '#9333ea',
                              fontSize: '1.5rem',
                              fontWeight: 'bold',
                              width: '100px',
                              outline: 'none',
                            }}
                          />
                          <Typography variant="body1" color="#666">cm</Typography>
                        </Box>
                      </Box>
                    </Box>
                  </Grid>
                </Grid>

                <Box sx={{ display: 'flex', justifyContent: 'space-between', mt: 4 }}>
                  <Button
                    onClick={handleBack}
                    sx={{ color: '#9ca3af' }}
                  >
                    Back
                  </Button>
                  <Button
                    variant="contained"
                    onClick={handleNext}
                    endIcon={<ArrowForward />}
                    sx={{
                      bgcolor: '#9333ea',
                      '&:hover': { bgcolor: '#7c3aed' }
                    }}
                  >
                    Continue to Review
                  </Button>
                </Box>
              </Box>
            )}

            {/* Step 2: Review & Save */}
            {activeStep === 2 && (
              <Box>
                <Typography variant="h5" gutterBottom color="#ffffff" fontWeight="600" sx={{ mb: 3 }}>
                  Review Your Profile
                </Typography>

                <Grid container spacing={3}>
                  <Grid item xs={12} md={6}>
                    <Paper sx={{ 
                      p: 3, 
                      bgcolor: '#1a1a1a', 
                      border: '1px solid #333',
                      borderRadius: 2 
                    }}>
                      <Typography variant="h6" color="#ffffff" gutterBottom>
                        Measurements Summary
                      </Typography>
                      <Divider sx={{ my: 2, bgcolor: 'rgba(255,255,255,0.1)' }} />
                      
                      <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
                        <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
                          <Typography color="#9ca3af">Gender:</Typography>
                          <Typography color="#ffffff" fontWeight="600">{gender.toUpperCase()}</Typography>
                        </Box>
                        <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
                          <Typography color="#9ca3af">Height:</Typography>
                          <Typography color="#ffffff" fontWeight="600">{measurements.height} cm</Typography>
                        </Box>
                        <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
                          <Typography color="#9ca3af">Shoulders:</Typography>
                          <Typography color="#ffffff" fontWeight="600">{measurements.shoulders} cm</Typography>
                        </Box>
                        <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
                          <Typography color="#9ca3af">Bust/Chest:</Typography>
                          <Typography color="#ffffff" fontWeight="600">{measurements.chest} cm</Typography>
                        </Box>
                        <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
                          <Typography color="#9ca3af">Waist:</Typography>
                          <Typography color="#ffffff" fontWeight="600">{measurements.waist} cm</Typography>
                        </Box>
                        <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
                          <Typography color="#9ca3af">Hips:</Typography>
                          <Typography color="#ffffff" fontWeight="600">{measurements.hips} cm</Typography>
                        </Box>
                      </Box>
                    </Paper>
                  </Grid>

                  <Grid item xs={12} md={6}>
                    <Paper sx={{ 
                      p: 3, 
                      bgcolor: 'rgba(147, 51, 234, 0.1)', 
                      border: '1px solid rgba(147, 51, 234, 0.3)',
                      borderRadius: 2 
                    }}>
                      <Typography variant="h6" color="#ffffff" gutterBottom>
                        What's Next?
                      </Typography>
                      <Divider sx={{ my: 2, bgcolor: 'rgba(147, 51, 234, 0.3)' }} />
                      
                      <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
                        <Box sx={{ display: 'flex', gap: 2, alignItems: 'start' }}>
                          <CheckCircle sx={{ color: '#22c55e', mt: 0.5 }} />
                          <Box>
                            <Typography color="#ffffff" fontWeight="600">AI Size Recommendations</Typography>
                            <Typography variant="body2" color="#9ca3af">
                              Get personalized size suggestions for every product
                            </Typography>
                          </Box>
                        </Box>
                        <Box sx={{ display: 'flex', gap: 2, alignItems: 'start' }}>
                          <CheckCircle sx={{ color: '#22c55e', mt: 0.5 }} />
                          <Box>
                            <Typography color="#ffffff" fontWeight="600">Virtual Try-On</Typography>
                            <Typography variant="body2" color="#9ca3af">
                              See how clothes look on your body type
                            </Typography>
                          </Box>
                        </Box>
                        <Box sx={{ display: 'flex', gap: 2, alignItems: 'start' }}>
                          <CheckCircle sx={{ color: '#22c55e', mt: 0.5 }} />
                          <Box>
                            <Typography color="#ffffff" fontWeight="600">3D Avatar</Typography>
                            <Typography variant="body2" color="#9ca3af">
                              Create a personalized avatar (optional)
                            </Typography>
                          </Box>
                        </Box>
                      </Box>
                    </Paper>
                  </Grid>
                </Grid>

                <Box sx={{ display: 'flex', justifyContent: 'space-between', mt: 4 }}>
                  <Button
                    onClick={handleBack}
                    sx={{ color: '#9ca3af' }}
                  >
                    Back to Edit
                  </Button>
                  <Button
                    variant="contained"
                    onClick={handleSaveProfile}
                    disabled={saving}
                    startIcon={saving ? <CircularProgress size={20} /> : <Save />}
                    sx={{
                      bgcolor: '#22c55e',
                      color: '#000',
                      fontWeight: 'bold',
                      px: 4,
                      py: 1.5,
                      fontSize: '1.1rem',
                      '&:hover': { bgcolor: '#16a34a' },
                      '&:disabled': { bgcolor: '#333', color: '#666' }
                    }}
                  >
                    {saving ? 'Saving...' : 'Save & Continue'}
                  </Button>
                </Box>
              </Box>
            )}
          </CardContent>
        </Card>
      </Container>
    </Box>
  );
};

export default BodyProfilePage;

import React, { useState, useRef } from 'react';
import {
  Box,
  Button,
  Typography,
  Card,
  CardContent,
  Alert,
  CircularProgress,
  TextField,
  Stepper,
  Step,
  StepLabel,
  Paper,
  Chip,
  IconButton,
} from '@mui/material';
import {
  CloudUpload,
  CheckCircle,
  Height,
  Close,
  AutoAwesome,
} from '@mui/icons-material';
import axios from 'axios';

const PhotoMeasurementUpload = ({ onMeasurementsExtracted, onClose }) => {
  const [activeStep, setActiveStep] = useState(0);
  const [selectedImage, setSelectedImage] = useState(null);
  const [imagePreview, setImagePreview] = useState(null);
  const [height, setHeight] = useState('');
  const [extracting, setExtracting] = useState(false);
  const [error, setError] = useState('');
  const [extractedMeasurements, setExtractedMeasurements] = useState(null);
  const fileInputRef = useRef(null);

  const steps = ['Upload Photo', 'Enter Height', 'Extract Measurements'];

  const handleImageSelect = (event) => {
    const file = event.target.files[0];
    if (file) {
      // Validate file type
      if (!file.type.startsWith('image/')) {
        setError('Please select a valid image file');
        return;
      }

      // Validate file size (max 10MB)
      if (file.size > 10 * 1024 * 1024) {
        setError('Image size should be less than 10MB');
        return;
      }

      setSelectedImage(file);
      setError('');

      // Create preview
      const reader = new FileReader();
      reader.onloadend = () => {
        setImagePreview(reader.result);
      };
      reader.readAsDataURL(file);

      setActiveStep(1);
    }
  };

  const handleHeightSubmit = () => {
    if (!height || height < 100 || height > 250) {
      setError('Please enter a valid height between 100-250 cm');
      return;
    }
    setError('');
    setActiveStep(2);
    extractMeasurements();
  };

  const extractMeasurements = async () => {
    setExtracting(true);
    setError('');

    try {
      // Create FormData for file upload
      const formData = new FormData();
      formData.append('image', selectedImage);
      formData.append('height_cm', height);

      // Call AI service to extract measurements
      const response = await axios.post(
        'http://localhost:5000/api/ai/extract-measurements',
        formData,
        {
          headers: {
            'Content-Type': 'multipart/form-data',
          },
        }
      );

      if (response.data.success) {
        const measurements = response.data.measurements;
        setExtractedMeasurements(measurements);

        // Pass measurements to parent component
        if (onMeasurementsExtracted) {
          onMeasurementsExtracted({
            height: measurements.height_cm,
            chest: measurements.chest_cm,
            waist: measurements.waist_cm,
            hips: measurements.hip_cm,
            confidence: measurements.confidence,
          });
        }
      } else {
        setError(response.data.message || 'Failed to extract measurements');
      }
    } catch (err) {
      console.error('Error extracting measurements:', err);
      setError(
        err.response?.data?.message ||
          'Failed to extract measurements. Please ensure the photo shows your full body clearly.'
      );
    } finally {
      setExtracting(false);
    }
  };

  const handleReset = () => {
    setActiveStep(0);
    setSelectedImage(null);
    setImagePreview(null);
    setHeight('');
    setExtractedMeasurements(null);
    setError('');
  };

  return (
    <Card
      sx={{
        background: 'linear-gradient(135deg, #1a1a1a 0%, #2a2a2a 100%)',
        border: '2px solid rgba(255,255,255,0.2)',
        borderRadius: 4,
        boxShadow: '0 20px 60px rgba(0,0,0,0.5)',
        position: 'relative',
      }}
    >
      {onClose && (
        <IconButton
          onClick={onClose}
          sx={{
            position: 'absolute',
            top: 16,
            right: 16,
            color: '#ffffff',
            bgcolor: 'rgba(255,255,255,0.1)',
            '&:hover': {
              bgcolor: 'rgba(255,255,255,0.2)',
            },
          }}
        >
          <Close />
        </IconButton>
      )}

      <CardContent sx={{ p: 4 }}>
        {/* Header */}
        <Box sx={{ display: 'flex', alignItems: 'center', mb: 3 }}>
          <Box
            sx={{
              bgcolor: '#ffffff',
              borderRadius: 2,
              p: 1.5,
              mr: 2,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
            }}
          >
            <AutoAwesome sx={{ color: '#000000', fontSize: 28 }} />
          </Box>
          <Box>
            <Typography variant="h5" fontWeight="bold" color="#ffffff">
              AI Photo Measurement
            </Typography>
            <Typography variant="caption" color="#888">
              Upload your photo and get instant measurements
            </Typography>
          </Box>
        </Box>

        {/* Stepper */}
        <Stepper activeStep={activeStep} sx={{ mb: 4 }}>
          {steps.map((label) => (
            <Step key={label}>
              <StepLabel
                sx={{
                  '& .MuiStepLabel-label': {
                    color: '#888',
                    '&.Mui-active': { color: '#ffffff' },
                    '&.Mui-completed': { color: '#ffffff' },
                  },
                  '& .MuiStepIcon-root': {
                    color: '#333',
                    '&.Mui-active': { color: '#ffffff' },
                    '&.Mui-completed': { color: '#ffffff' },
                  },
                }}
              >
                {label}
              </StepLabel>
            </Step>
          ))}
        </Stepper>

        {/* Error Alert */}
        {error && (
          <Alert severity="error" sx={{ mb: 3 }}>
            {error}
          </Alert>
        )}

        {/* Step 0: Upload Photo */}
        {activeStep === 0 && (
          <Box>
            <Paper
              sx={{
                p: 4,
                textAlign: 'center',
                bgcolor: 'rgba(255,255,255,0.05)',
                border: '2px dashed rgba(255,255,255,0.2)',
                borderRadius: 3,
                cursor: 'pointer',
                transition: 'all 0.3s',
                '&:hover': {
                  bgcolor: 'rgba(255,255,255,0.08)',
                  borderColor: 'rgba(255,255,255,0.4)',
                },
              }}
              onClick={() => fileInputRef.current?.click()}
            >
              <CloudUpload sx={{ fontSize: 64, color: '#888', mb: 2 }} />
              <Typography variant="h6" color="#ffffff" gutterBottom>
                Upload Full Body Photo
              </Typography>
              <Typography variant="body2" color="#888" sx={{ mb: 2 }}>
                Click to browse or drag and drop
              </Typography>
              <Typography variant="caption" color="#666">
                Supported: JPG, PNG (Max 10MB)
              </Typography>
            </Paper>

            <input
              ref={fileInputRef}
              type="file"
              accept="image/*"
              onChange={handleImageSelect}
              style={{ display: 'none' }}
            />

            {/* Tips */}
            <Alert severity="info" sx={{ mt: 3, bgcolor: 'rgba(33, 150, 243, 0.1)' }}>
              <Typography variant="subtitle2" fontWeight="bold" gutterBottom>
                📸 Photo Tips for Best Results:
              </Typography>
              <Typography variant="body2" component="div">
                • Stand straight with arms slightly away from body
                <br />
                • Wear fitted clothing
                <br />
                • Ensure full body is visible (head to feet)
                <br />
                • Use good lighting and plain background
                <br />• Take photo from 6-8 feet away
              </Typography>
            </Alert>
          </Box>
        )}

        {/* Step 1: Enter Height */}
        {activeStep === 1 && (
          <Box>
            {imagePreview && (
              <Box
                sx={{
                  mb: 3,
                  textAlign: 'center',
                  position: 'relative',
                }}
              >
                <img
                  src={imagePreview}
                  alt="Preview"
                  style={{
                    maxWidth: '100%',
                    maxHeight: '400px',
                    borderRadius: '12px',
                    border: '2px solid rgba(255,255,255,0.2)',
                  }}
                />
                <Chip
                  label="Photo Uploaded"
                  icon={<CheckCircle />}
                  sx={{
                    position: 'absolute',
                    top: 16,
                    right: 16,
                    bgcolor: '#4caf50',
                    color: '#ffffff',
                    fontWeight: 'bold',
                  }}
                />
              </Box>
            )}

            <Box sx={{ mb: 3 }}>
              <Typography variant="h6" color="#ffffff" gutterBottom>
                Enter Your Height
              </Typography>
              <Typography variant="body2" color="#888" sx={{ mb: 2 }}>
                This helps calibrate the AI measurements for accuracy
              </Typography>

              <TextField
                fullWidth
                type="number"
                label="Height (cm)"
                value={height}
                onChange={(e) => setHeight(e.target.value)}
                placeholder="e.g., 170"
                InputProps={{
                  startAdornment: <Height sx={{ color: '#888', mr: 1 }} />,
                }}
                sx={{
                  '& .MuiOutlinedInput-root': {
                    color: '#ffffff',
                    '& fieldset': { borderColor: '#333' },
                    '&:hover fieldset': { borderColor: '#666' },
                    '&.Mui-focused fieldset': { borderColor: '#ffffff' },
                  },
                  '& .MuiInputLabel-root': {
                    color: '#888',
                    '&.Mui-focused': { color: '#ffffff' },
                  },
                }}
              />
            </Box>

            <Box sx={{ display: 'flex', gap: 2 }}>
              <Button
                variant="outlined"
                onClick={handleReset}
                sx={{
                  flex: 1,
                  color: '#ffffff',
                  borderColor: '#333',
                  '&:hover': {
                    borderColor: '#666',
                    bgcolor: 'rgba(255,255,255,0.05)',
                  },
                }}
              >
                Back
              </Button>
              <Button
                variant="contained"
                onClick={handleHeightSubmit}
                disabled={!height}
                sx={{
                  flex: 2,
                  bgcolor: '#ffffff',
                  color: '#000000',
                  fontWeight: 'bold',
                  '&:hover': {
                    bgcolor: '#e0e0e0',
                  },
                  '&:disabled': {
                    bgcolor: '#333',
                    color: '#666',
                  },
                }}
              >
                Extract Measurements
              </Button>
            </Box>
          </Box>
        )}

        {/* Step 2: Extracting/Results */}
        {activeStep === 2 && (
          <Box>
            {extracting ? (
              <Box sx={{ textAlign: 'center', py: 4 }}>
                <CircularProgress size={64} sx={{ color: '#ffffff', mb: 3 }} />
                <Typography variant="h6" color="#ffffff" gutterBottom>
                  Analyzing Your Photo...
                </Typography>
                <Typography variant="body2" color="#888">
                  Our AI is extracting your body measurements
                </Typography>
              </Box>
            ) : extractedMeasurements ? (
              <Box>
                <Alert
                  severity="success"
                  icon={<CheckCircle />}
                  sx={{ mb: 3, bgcolor: 'rgba(76, 175, 80, 0.1)' }}
                >
                  <Typography variant="subtitle2" fontWeight="bold">
                    Measurements Extracted Successfully!
                  </Typography>
                  <Typography variant="caption">
                    Confidence: {Math.round(extractedMeasurements.confidence * 100)}%
                  </Typography>
                </Alert>

                <Paper
                  sx={{
                    p: 3,
                    bgcolor: 'rgba(255,255,255,0.05)',
                    borderRadius: 3,
                    mb: 3,
                  }}
                >
                  <Typography variant="h6" color="#ffffff" gutterBottom>
                    Your Measurements
                  </Typography>

                  <Box sx={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 2, mt: 2 }}>
                    <Box>
                      <Typography variant="caption" color="#888">
                        Height
                      </Typography>
                      <Typography variant="h5" color="#ffffff" fontWeight="bold">
                        {extractedMeasurements.height_cm} cm
                      </Typography>
                    </Box>
                    <Box>
                      <Typography variant="caption" color="#888">
                        Chest
                      </Typography>
                      <Typography variant="h5" color="#ffffff" fontWeight="bold">
                        {extractedMeasurements.chest_cm} cm
                      </Typography>
                    </Box>
                    <Box>
                      <Typography variant="caption" color="#888">
                        Waist
                      </Typography>
                      <Typography variant="h5" color="#ffffff" fontWeight="bold">
                        {extractedMeasurements.waist_cm} cm
                      </Typography>
                    </Box>
                    <Box>
                      <Typography variant="caption" color="#888">
                        Hips
                      </Typography>
                      <Typography variant="h5" color="#ffffff" fontWeight="bold">
                        {extractedMeasurements.hip_cm} cm
                      </Typography>
                    </Box>
                  </Box>

                  {extractedMeasurements.shoulder_width_cm && (
                    <Box sx={{ mt: 2 }}>
                      <Typography variant="caption" color="#888">
                        Shoulder Width
                      </Typography>
                      <Typography variant="h6" color="#ffffff" fontWeight="bold">
                        {extractedMeasurements.shoulder_width_cm} cm
                      </Typography>
                    </Box>
                  )}
                </Paper>

                <Alert severity="info" sx={{ mb: 3 }}>
                  These measurements have been automatically filled in your profile. You can
                  adjust them if needed.
                </Alert>

                <Button
                  fullWidth
                  variant="contained"
                  onClick={onClose}
                  sx={{
                    py: 1.5,
                    bgcolor: '#ffffff',
                    color: '#000000',
                    fontWeight: 'bold',
                    '&:hover': {
                      bgcolor: '#e0e0e0',
                    },
                  }}
                >
                  Continue with These Measurements
                </Button>

                <Button
                  fullWidth
                  variant="outlined"
                  onClick={handleReset}
                  sx={{
                    mt: 2,
                    color: '#ffffff',
                    borderColor: '#333',
                    '&:hover': {
                      borderColor: '#666',
                      bgcolor: 'rgba(255,255,255,0.05)',
                    },
                  }}
                >
                  Try Another Photo
                </Button>
              </Box>
            ) : null}
          </Box>
        )}
      </CardContent>
    </Card>
  );
};

export default PhotoMeasurementUpload;

import React, { useState } from 'react';
import { Container, Box, Typography, Button, Card, CardContent, TextField, Alert, Grid, Chip } from '@mui/material';
import axios from 'axios';

const AITestPage = () => {
  const [chest, setChest] = useState(88);
  const [result, setResult] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const testCases = [
    { chest: 82, waist: 66, hip: 90, height: 160, expected: 'S', label: 'Small Person' },
    { chest: 92, waist: 76, hip: 98, height: 170, expected: 'M', label: 'Medium Person' },
    { chest: 110, waist: 95, hip: 115, height: 175, expected: 'XXL', label: 'Large Person' },
  ];

  const testAI = async (measurements) => {
    setLoading(true);
    setError('');
    setResult(null);

    try {
      const userProfile = {
        measurements: {
          chest_cm: measurements.chest,
          waist_cm: measurements.waist,
          hip_cm: measurements.hip,
          height_cm: measurements.height
        },
        skin_tone: 'medium',
        body_shape: 'rectangle',
        gender: 'female',
        clothing_type: 'shirt',
        occasion: 'casual'
      };

      console.log('Testing with:', userProfile);

      const response = await axios.post(
        'http://localhost:8082/api/ai/complete-recommendations',
        userProfile
      );

      console.log('Response:', response.data);
      setResult({
        measurements,
        response: response.data
      });
    } catch (err) {
      console.error('Error:', err);
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <Container maxWidth="lg" sx={{ py: 4, bgcolor: '#000000', minHeight: '100vh' }}>
      <Typography variant="h3" gutterBottom color="#ffffff" textAlign="center">
        AI Recommendation Test
      </Typography>
      <Typography variant="body1" color="#888" textAlign="center" sx={{ mb: 4 }}>
        Test the AI with different body measurements to see size recommendations change
      </Typography>

      <Grid container spacing={3}>
        {testCases.map((testCase, index) => (
          <Grid item xs={12} md={4} key={index}>
            <Card sx={{ bgcolor: '#1a1a1a', border: '1px solid #333' }}>
              <CardContent>
                <Typography variant="h6" color="#ffffff" gutterBottom>
                  {testCase.label}
                </Typography>
                <Typography variant="body2" color="#888" sx={{ mb: 2 }}>
                  Chest: {testCase.chest}cm<br />
                  Waist: {testCase.waist}cm<br />
                  Hip: {testCase.hip}cm<br />
                  Height: {testCase.height}cm
                </Typography>
                <Chip 
                  label={`Expected: Size ${testCase.expected}`}
                  sx={{ bgcolor: '#333', color: '#ffffff', mb: 2 }}
                />
                <Button
                  variant="contained"
                  fullWidth
                  onClick={() => testAI(testCase)}
                  disabled={loading}
                  sx={{ bgcolor: '#ffffff', color: '#000000' }}
                >
                  Test This Profile
                </Button>
              </CardContent>
            </Card>
          </Grid>
        ))}
      </Grid>

      {error && (
        <Alert severity="error" sx={{ mt: 3, bgcolor: '#1a1a1a', color: '#ffffff', border: '1px solid #ff0000' }}>
          {error}
        </Alert>
      )}

      {result && (
        <Card sx={{ mt: 3, bgcolor: '#1a1a1a', border: '2px solid #ffffff' }}>
          <CardContent>
            <Typography variant="h5" color="#ffffff" gutterBottom>
              AI Recommendation Result
            </Typography>
            
            <Box sx={{ mb: 3 }}>
              <Typography variant="subtitle1" color="#888">
                Input Measurements:
              </Typography>
              <Typography variant="body1" color="#ffffff">
                Chest: {result.measurements.chest}cm, 
                Waist: {result.measurements.waist}cm, 
                Hip: {result.measurements.hip}cm, 
                Height: {result.measurements.height}cm
              </Typography>
            </Box>

            {result.response.size_recommendation && (
              <Box sx={{ bgcolor: '#0a0a0a', p: 3, borderRadius: 2, mb: 2 }}>
                <Typography variant="h4" color="#ffffff" gutterBottom>
                  Recommended Size: {result.response.size_recommendation.recommended_size}
                </Typography>
                <Typography variant="body1" color="#888">
                  Confidence: {result.response.size_recommendation.confidence}%
                </Typography>
                {result.response.size_recommendation.alternatives && (
                  <Box sx={{ mt: 2 }}>
                    <Typography variant="body2" color="#888">Alternatives:</Typography>
                    {result.response.size_recommendation.alternatives.map((alt, i) => (
                      <Chip 
                        key={i}
                        label={`${alt.size} (${alt.probability}%)`}
                        sx={{ bgcolor: '#333', color: '#ffffff', mr: 1, mt: 1 }}
                      />
                    ))}
                  </Box>
                )}
              </Box>
            )}

            <Typography variant="caption" color="#888" sx={{ display: 'block', mt: 2 }}>
              Full Response:
            </Typography>
            <pre style={{ 
              overflow: 'auto', 
              background: '#0a0a0a', 
              padding: 16, 
              borderRadius: 8,
              color: '#888',
              fontSize: '0.8rem'
            }}>
              {JSON.stringify(result.response, null, 2)}
            </pre>
          </CardContent>
        </Card>
      )}
    </Container>
  );
};

export default AITestPage;

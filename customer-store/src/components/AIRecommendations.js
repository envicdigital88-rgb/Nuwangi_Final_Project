import React, { useState, useEffect } from 'react';
import {
  Box,
  Card,
  CardContent,
  Typography,
  Chip,
  CircularProgress,
  Alert,
  Divider,
  Button,
  Accordion,
  AccordionSummary,
  AccordionDetails,
} from '@mui/material';
import {
  ExpandMore,
  CheckCircle,
  Lightbulb,
  Palette,
  Straighten,
  AutoAwesome,
} from '@mui/icons-material';
import axios from 'axios';

const AIRecommendations = ({ bodyProfile, selectedProduct }) => {
  const [recommendations, setRecommendations] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  useEffect(() => {
    if (bodyProfile && selectedProduct) {
      // Fetch recommendations when measurements change
      fetchAIRecommendations();
    }
  }, [bodyProfile?.id, selectedProduct?.id, bodyProfile?.chestCm, bodyProfile?.waistCm, bodyProfile?.hipCm, bodyProfile?.heightCm]);

  const fetchAIRecommendations = async () => {
    setLoading(true);
    setError(null);

    try {
      // Prepare user profile for AI
      const userProfile = {
        measurements: {
          chest_cm: parseFloat(bodyProfile.chestCm || bodyProfile.chest || 88),
          waist_cm: parseFloat(bodyProfile.waistCm || bodyProfile.waist || 72),
          hip_cm: parseFloat(bodyProfile.hipCm || bodyProfile.hips || bodyProfile.hip || 95),
          height_cm: parseFloat(bodyProfile.heightCm || bodyProfile.height || 165),
        },
        skin_tone: (bodyProfile.skinTone || 'medium').toLowerCase(),
        body_shape: (bodyProfile.bodyShape || 'rectangle').toLowerCase(),
        gender: (bodyProfile.gender || 'female').toLowerCase(),
        clothing_type: (selectedProduct.category?.toLowerCase() || selectedProduct.name?.toLowerCase().includes('shirt') ? 'shirt' : 
                       selectedProduct.name?.toLowerCase().includes('pant') || selectedProduct.name?.toLowerCase().includes('jean') ? 'pants' : 'shirt'),
        occasion: 'casual',
      };

      console.log('🤖 Fetching AI recommendations with profile:', userProfile);

      // Call AI service through Java backend
      const response = await axios.post(
        'http://localhost:8082/api/ai/complete-recommendations',
        userProfile,
        { timeout: 10000 }
      );

      console.log('✅ AI Response:', response.data);

      if (response.data.success) {
        setRecommendations(response.data);
      } else {
        console.error('❌ AI returned success=false:', response.data);
        setError('AI recommendations not available');
      }
    } catch (err) {
      console.error('❌ AI recommendations error:', err);
      console.error('Error details:', err.response?.data || err.message);
      setError('AI service temporarily unavailable. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  if (!bodyProfile || !selectedProduct) {
    return (
      <Card>
        <CardContent>
          <Typography variant="body2" color="text.secondary" align="center">
            Create your profile and select a product to get AI recommendations
          </Typography>
        </CardContent>
      </Card>
    );
  }

  if (loading) {
    return (
      <Card>
        <CardContent sx={{ textAlign: 'center', py: 4 }}>
          <CircularProgress size={40} />
          <Typography variant="body2" sx={{ mt: 2 }}>
            AI is analyzing your profile...
          </Typography>
        </CardContent>
      </Card>
    );
  }

  if (error) {
    return (
      <Card>
        <CardContent>
          <Alert severity="info" sx={{ mb: 2 }}>
            {error}
          </Alert>
          <Button variant="outlined" size="small" onClick={fetchAIRecommendations} fullWidth>
            Retry
          </Button>
        </CardContent>
      </Card>
    );
  }

  if (!recommendations) {
    return null;
  }

  const sizeRec = recommendations.size_recommendation || {};
  const colorRec = recommendations.color_recommendations || {};
  const styleRec = recommendations.style_recommendations || {};

  return (
    <Card>
      <CardContent>
        <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 2 }}>
          <Box sx={{ display: 'flex', alignItems: 'center' }}>
            <AutoAwesome sx={{ color: 'primary.main', mr: 1 }} />
            <Typography variant="h6" fontWeight="bold">
              AI Recommendations
            </Typography>
          </Box>
          <Button 
            size="small" 
            variant="outlined" 
            onClick={fetchAIRecommendations}
            disabled={loading}
          >
            Refresh
          </Button>
        </Box>

        {/* Show profile data being used */}
        <Alert severity="info" sx={{ mb: 2, fontSize: '0.75rem' }}>
          <Typography variant="caption" display="block">
            <strong>Your Profile:</strong> {bodyProfile.gender || 'female'} • 
            Height: {bodyProfile.heightCm || bodyProfile.height || 165}cm • 
            Chest: {bodyProfile.chestCm || bodyProfile.chest || 88}cm • 
            Waist: {bodyProfile.waistCm || bodyProfile.waist || 72}cm • 
            Hip: {bodyProfile.hipCm || bodyProfile.hips || bodyProfile.hip || 95}cm
          </Typography>
          <Typography variant="caption" display="block">
            Body Shape: {bodyProfile.bodyShape || 'rectangle'} • 
            Skin Tone: {bodyProfile.skinTone || 'medium'}
          </Typography>
        </Alert>

        {/* Size Recommendation */}
        <Accordion defaultExpanded>
          <AccordionSummary expandIcon={<ExpandMore />}>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
              <Straighten fontSize="small" color="primary" />
              <Typography fontWeight="bold">Perfect Size</Typography>
            </Box>
          </AccordionSummary>
          <AccordionDetails>
            <Box>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 1 }}>
                <Chip
                  label={sizeRec.recommended_size || 'M'}
                  color="primary"
                  size="large"
                  sx={{ fontSize: '1.2rem', fontWeight: 'bold', px: 2 }}
                />
                <Typography variant="caption" color="text.secondary">
                  {sizeRec.confidence || 85}% confident
                </Typography>
              </Box>

              {sizeRec.alternatives && sizeRec.alternatives.length > 0 && (
                <Box sx={{ mt: 2 }}>
                  <Typography variant="caption" color="text.secondary" gutterBottom>
                    Alternative sizes:
                  </Typography>
                  <Box sx={{ display: 'flex', gap: 0.5, mt: 0.5 }}>
                    {sizeRec.alternatives.map((alt, idx) => (
                      <Chip
                        key={idx}
                        label={alt.size}
                        size="small"
                        variant="outlined"
                      />
                    ))}
                  </Box>
                </Box>
              )}

              {sizeRec.fit_notes && sizeRec.fit_notes.length > 0 && (
                <Box sx={{ mt: 2 }}>
                  {sizeRec.fit_notes.map((note, idx) => (
                    <Typography key={idx} variant="caption" display="block" color="text.secondary">
                      • {note}
                    </Typography>
                  ))}
                </Box>
              )}
            </Box>
          </AccordionDetails>
        </Accordion>

        {/* Color Recommendations */}
        <Accordion>
          <AccordionSummary expandIcon={<ExpandMore />}>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
              <Palette fontSize="small" color="primary" />
              <Typography fontWeight="bold">Best Colors</Typography>
            </Box>
          </AccordionSummary>
          <AccordionDetails>
            <Box>
              <Typography variant="caption" color="text.secondary" gutterBottom>
                Colors that suit your {colorRec.skin_tone || 'medium'} skin tone:
              </Typography>

              {colorRec.best_colors && colorRec.best_colors.length > 0 && (
                <Box sx={{ mt: 1.5 }}>
                  <Typography variant="caption" fontWeight="bold" display="block" sx={{ mb: 0.5 }}>
                    Perfect matches:
                  </Typography>
                  <Box sx={{ display: 'flex', gap: 0.75, flexWrap: 'wrap' }}>
                    {colorRec.best_colors.slice(0, 5).map((color, idx) => (
                      <Box
                        key={idx}
                        sx={{
                          display: 'flex',
                          alignItems: 'center',
                          gap: 0.5,
                          bgcolor: 'background.default',
                          px: 1,
                          py: 0.5,
                          borderRadius: 1,
                        }}
                      >
                        <Box
                          sx={{
                            width: 20,
                            height: 20,
                            bgcolor: color.hex,
                            borderRadius: '50%',
                            border: '1px solid',
                            borderColor: 'divider',
                          }}
                        />
                        <Typography variant="caption">{color.name}</Typography>
                        <CheckCircle sx={{ fontSize: 14, color: 'success.main' }} />
                      </Box>
                    ))}
                  </Box>
                </Box>
              )}

              {colorRec.good_colors && colorRec.good_colors.length > 0 && (
                <Box sx={{ mt: 1.5 }}>
                  <Typography variant="caption" fontWeight="bold" display="block" sx={{ mb: 0.5 }}>
                    Also good:
                  </Typography>
                  <Box sx={{ display: 'flex', gap: 0.5, flexWrap: 'wrap' }}>
                    {colorRec.good_colors.slice(0, 4).map((color, idx) => (
                      <Chip
                        key={idx}
                        label={color.name}
                        size="small"
                        variant="outlined"
                      />
                    ))}
                  </Box>
                </Box>
              )}
            </Box>
          </AccordionDetails>
        </Accordion>

        {/* Style Tips */}
        <Accordion>
          <AccordionSummary expandIcon={<ExpandMore />}>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
              <Lightbulb fontSize="small" color="primary" />
              <Typography fontWeight="bold">Style Tips</Typography>
            </Box>
          </AccordionSummary>
          <AccordionDetails>
            <Box>
              <Typography variant="caption" color="text.secondary" gutterBottom>
                For your {styleRec.body_shape || 'body'} shape:
              </Typography>

              {styleRec.recommended_styles && styleRec.recommended_styles.length > 0 && (
                <Box sx={{ mt: 1.5 }}>
                  <Typography variant="caption" fontWeight="bold" display="block" sx={{ mb: 0.5 }}>
                    Recommended styles:
                  </Typography>
                  <Box sx={{ display: 'flex', gap: 0.5, flexWrap: 'wrap' }}>
                    {styleRec.recommended_styles.map((style, idx) => (
                      <Chip
                        key={idx}
                        label={style}
                        size="small"
                        color="primary"
                        variant="outlined"
                      />
                    ))}
                  </Box>
                </Box>
              )}

              {styleRec.tips && styleRec.tips.length > 0 && (
                <Box sx={{ mt: 2, bgcolor: 'primary.light', p: 1.5, borderRadius: 1 }}>
                  {styleRec.tips.map((tip, idx) => (
                    <Typography key={idx} variant="caption" display="block" sx={{ mb: 0.5 }}>
                      {tip}
                    </Typography>
                  ))}
                </Box>
              )}
            </Box>
          </AccordionDetails>
        </Accordion>

        <Divider sx={{ my: 2 }} />

        <Box sx={{ textAlign: 'center' }}>
          <Typography variant="caption" color="text.secondary">
            Powered by AI • {sizeRec.confidence || 85}% accuracy
          </Typography>
        </Box>
      </CardContent>
    </Card>
  );
};

export default AIRecommendations;

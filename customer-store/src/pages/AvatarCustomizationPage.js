import React, { useState } from 'react';
import {
  Container, Grid, Typography, Box, Button, Card, CardContent,
  FormControl, InputLabel, Select, MenuItem, Alert, CircularProgress
} from '@mui/material';
import { useNavigate } from 'react-router-dom';
import { useCustomerAuth } from '../contexts/CustomerAuthContext';
import Model3DViewer from '../components/Model3DViewer';
import axios from 'axios';

const AvatarCustomizationPage = () => {
  const { customer, bodyProfile, refreshBodyProfile } = useCustomerAuth();
  const navigate = useNavigate();
  const modelViewerRef = React.useRef();
  
  const [customization, setCustomization] = useState({
    skinTone: bodyProfile?.skinTone || 'medium',
    hairColor: bodyProfile?.hairColor || 'brown',
    hairStyle: bodyProfile?.hairStyle || 'short',
    eyeColor: bodyProfile?.eyeColor || 'brown',
    faceShape: 'oval',
    bodyShape: bodyProfile?.bodyShape || 'athletic'
  });
  
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);
  const [avatarUrl, setAvatarUrl] = useState(null);
  const [previewMode, setPreviewMode] = useState(false);
  const [aiDescription, setAiDescription] = useState('');

  // Load saved avatar preferences from body profile
  React.useEffect(() => {
    // Refresh body profile from backend when component mounts
    if (customer && refreshBodyProfile) {
      refreshBodyProfile();
    }
  }, [customer]);

  React.useEffect(() => {
    if (bodyProfile) {
      setCustomization({
        skinTone: bodyProfile.skinTone || 'medium',
        hairColor: bodyProfile.hairColor || 'brown',
        hairStyle: bodyProfile.hairStyle || 'short',
        eyeColor: bodyProfile.eyeColor || 'brown',
        faceShape: 'oval',
        bodyShape: bodyProfile.bodyShape || 'athletic'
      });
      
      // Load avatar model if it exists
      if (bodyProfile.avatarModelUrl) {
        setAvatarUrl(bodyProfile.avatarModelUrl);
        setPreviewMode(true);
        
        // Apply saved colors to the model after it loads
        setTimeout(() => {
          if (modelViewerRef.current) {
            // Apply skin tone
            const skinTones = [
              { value: 'light', color: '#FFE0BD' },
              { value: 'medium', color: '#D4A574' },
              { value: 'tan', color: '#C68642' },
              { value: 'dark', color: '#8D5524' }
            ];
            const savedSkinTone = skinTones.find(t => t.value === bodyProfile.skinTone);
            if (savedSkinTone && modelViewerRef.current.changeColor) {
              modelViewerRef.current.changeColor(savedSkinTone.color);
            }
            
            // Apply hair color
            const hairColors = [
              { value: 'black', color: '#000000' },
              { value: 'brown', color: '#654321' },
              { value: 'blonde', color: '#FAF0BE' },
              { value: 'red', color: '#8B0000' },
              { value: 'gray', color: '#808080' }
            ];
            const savedHairColor = hairColors.find(h => h.value === bodyProfile.hairColor);
            if (savedHairColor && modelViewerRef.current.changeHairColor) {
              modelViewerRef.current.changeHairColor(savedHairColor.color);
            }
          }
        }, 2000);
      }
    }
  }, [bodyProfile]);

  const skinTones = [
    { value: 'light', label: 'Light', color: '#FFE0BD' },
    { value: 'medium', label: 'Medium', color: '#D4A574' },
    { value: 'tan', label: 'Tan', color: '#C68642' },
    { value: 'dark', label: 'Dark', color: '#8D5524' }
  ];

  const hairColors = [
    { value: 'black', label: 'Black', color: '#000000' },
    { value: 'brown', label: 'Brown', color: '#654321' },
    { value: 'blonde', label: 'Blonde', color: '#FAF0BE' },
    { value: 'red', label: 'Red', color: '#8B0000' },
    { value: 'gray', label: 'Gray', color: '#808080' }
  ];

  const hairStyles = bodyProfile?.gender === 'FEMALE' 
    ? [
        { value: 'short', label: 'Short (Pixie)' },
        { value: 'medium', label: 'Medium (Bob)' },
        { value: 'long', label: 'Long (Flowing)' },
        { value: 'ponytail', label: 'Ponytail' }
      ]
    : [
        { value: 'short', label: 'Short' },
        { value: 'medium', label: 'Medium' },
        { value: 'long', label: 'Long' },
        { value: 'bald', label: 'Bald' }
      ];

  const eyeColors = [
    { value: 'brown', label: 'Brown', color: '#654321' },
    { value: 'blue', label: 'Blue', color: '#4169E1' },
    { value: 'green', label: 'Green', color: '#228B22' },
    { value: 'hazel', label: 'Hazel', color: '#8E7618' },
    { value: 'gray', label: 'Gray', color: '#708090' }
  ];

  // Apply customization to the 3D model in real-time
  const applyCustomizationToModel = (field, value) => {
    if (modelViewerRef.current && avatarUrl) {
      // Get the color based on the field
      let colorToApply = null;
      
      if (field === 'skinTone') {
        const tone = skinTones.find(t => t.value === value);
        colorToApply = tone?.color;
        if (colorToApply) {
          modelViewerRef.current.changeColor(colorToApply);
        }
      } else if (field === 'hairColor') {
        const hair = hairColors.find(h => h.value === value);
        colorToApply = hair?.color;
        if (colorToApply && modelViewerRef.current.changeHairColor) {
          modelViewerRef.current.changeHairColor(colorToApply);
        }
      } else if (field === 'eyeColor') {
        // Eye color would need specific mesh targeting
        const eye = eyeColors.find(e => e.value === value);
        colorToApply = eye?.color;
      } else if (field === 'hairStyle') {
        // Hair style change - reload with new hair model
        handlePreview();
      }
    }
  };

  const handleChange = (field, value) => {
    setCustomization(prev => ({ ...prev, [field]: value }));
    
    // Apply changes to model in real-time if in preview mode
    if (previewMode && avatarUrl) {
      applyCustomizationToModel(field, value);
    }
  };

  const handlePreview = async () => {
    if (!customer || !bodyProfile) {
      setError('Please create your body profile first');
      return;
    }

    setLoading(true);
    setError('');
    setSuccess(false);
    
    try {
      const response = await axios.post('http://localhost:8082/api/avatar/generate', {
        userId: customer.id,
        ...customization
      });
      
      console.log('Avatar generated:', response.data);
      setAvatarUrl(response.data.avatarModelUrl);
      setPreviewMode(true);
      
      // Set AI description if available
      if (response.data.avatarConfiguration) {
        try {
          const config = JSON.parse(response.data.avatarConfiguration);
          if (config.aiRecommendations && config.aiRecommendations.description) {
            setAiDescription(config.aiRecommendations.description);
          }
        } catch (e) {
          console.log('Could not parse avatar configuration');
        }
      }
      
      // Apply initial customization after model loads
      setTimeout(() => {
        const skinTone = skinTones.find(t => t.value === customization.skinTone);
        if (skinTone && modelViewerRef.current) {
          modelViewerRef.current.changeColor(skinTone.color);
        }
        
        const hairColor = hairColors.find(h => h.value === customization.hairColor);
        if (hairColor && modelViewerRef.current && modelViewerRef.current.changeHairColor) {
          modelViewerRef.current.changeHairColor(hairColor.color);
        }
      }, 2000);
      
    } catch (err) {
      console.error('Avatar generation error:', err);
      setError(err.response?.data?.message || 'Failed to generate avatar');
    } finally {
      setLoading(false);
    }
  };

  const handleGenerate = async () => {
    if (!customer || !bodyProfile) {
      setError('Please create your body profile first');
      return;
    }

    setLoading(true);
    setError('');
    setSuccess(false);
    
    try {
      const response = await axios.post('http://localhost:8082/api/avatar/generate', {
        userId: customer.id,
        ...customization
      });
      
      console.log('Avatar saved:', response.data);
      setSuccess(true);
      
      // Refresh body profile to get updated avatar preferences
      if (refreshBodyProfile) {
        await refreshBodyProfile();
      }
      
      // Wait a moment for the state to update, then redirect
      setTimeout(() => {
        navigate('/virtual-tryon');
      }, 1500);
    } catch (err) {
      console.error('Avatar save error:', err);
      setError(err.response?.data?.message || 'Failed to save avatar');
    } finally {
      setLoading(false);
    }
  };

  const handleGoToTryOn = async () => {
    // Force refresh profile before navigating
    if (refreshBodyProfile) {
      await refreshBodyProfile();
    }
    navigate('/virtual-tryon');
  };

  if (!customer) {
    return (
      <Container maxWidth="md" sx={{ py: 4 }}>
        <Alert severity="warning">Please login to customize your avatar</Alert>
      </Container>
    );
  }

  if (!bodyProfile) {
    return (
      <Container maxWidth="md" sx={{ py: 4 }}>
        <Alert severity="info">
          Please create your body profile first to generate an avatar
        </Alert>
      </Container>
    );
  }

  return (
    <Container maxWidth="lg" sx={{ py: 4 }}>
      <Typography variant="h4" fontWeight="bold" gutterBottom textAlign="center">
        Customize Your Avatar
      </Typography>
      <Typography variant="body1" color="text.secondary" textAlign="center" paragraph>
        Create a personalized 3D avatar based on your body measurements
      </Typography>

      {error && <Alert severity="error" sx={{ mb: 3 }}>{error}</Alert>}
      {success && (
        <Alert severity="success" sx={{ mb: 3 }}>
          Avatar saved successfully! Redirecting to Virtual Try-On...
        </Alert>
      )}

      <Grid container spacing={4}>
        {/* Preview Section */}
        <Grid item xs={12} md={6}>
          <Card elevation={3}>
            <CardContent sx={{ p: 3 }}>
              <Typography variant="h6" gutterBottom fontWeight="bold">Avatar Preview</Typography>
              <Box
                sx={{
                  height: 500,
                  bgcolor: '#1a1a1a',
                  borderRadius: 2,
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  position: 'relative',
                  overflow: 'hidden',
                  border: '2px solid #333'
                }}
              >
                {avatarUrl ? (
                  <Box sx={{ width: '100%', height: '100%' }}>
                    <Model3DViewer 
                      ref={modelViewerRef}
                      modelUrl={avatarUrl} 
                      hairModelUrl="http://localhost:8082/api/models/hair"
                      width="100%" 
                      height={500}
                      showColorPicker={false}
                      productCategory="avatar"
                      autoRotate={true}
                      initialSkinTone={customization.skinTone}
                      initialHairColor={customization.hairColor}
                      initialEyeColor={customization.eyeColor}
                      applyAvatarCustomization={true}
                    />
                  </Box>
                ) : (
                  <Box textAlign="center" p={3}>
                    <Typography variant="h6" color="text.secondary" gutterBottom>
                      {bodyProfile.gender === 'FEMALE' ? '♀ Female' : '♂ Male'} Avatar
                    </Typography>
                    <Typography variant="body2" color="text.secondary" paragraph>
                      Customize your avatar and click "Preview Avatar" to see your 3D model
                    </Typography>
                    <Typography variant="caption" color="text.secondary" display="block">
                      Height: {bodyProfile.heightCm}cm | Chest: {bodyProfile.chestCm}cm
                    </Typography>
                    <Typography variant="caption" color="text.secondary">
                      Waist: {bodyProfile.waistCm}cm | Hip: {bodyProfile.hipCm}cm
                    </Typography>
                  </Box>
                )}
              </Box>
              
              {previewMode && (
                <Box sx={{ mt: 2 }}>
                  <Alert severity="info" sx={{ fontSize: '0.875rem' }}>
                    💡 Change options to see real-time updates on your avatar
                  </Alert>
                  {aiDescription && (
                    <Alert severity="success" sx={{ mt: 1, fontSize: '0.875rem' }}>
                      🤖 AI: {aiDescription}
                    </Alert>
                  )}
                </Box>
              )}
            </CardContent>
          </Card>
        </Grid>

        {/* Customization Options */}
        <Grid item xs={12} md={6}>
          <Card elevation={3}>
            <CardContent sx={{ p: 3 }}>
              <Typography variant="h6" gutterBottom fontWeight="bold">Customization Options</Typography>
              
              <Alert severity="info" sx={{ mb: 2, fontSize: '0.875rem' }}>
                Creating {bodyProfile.gender === 'FEMALE' ? 'Female' : 'Male'} Avatar based on your profile
              </Alert>
              
              {(bodyProfile.skinTone || bodyProfile.hairColor || bodyProfile.eyeColor) && (
                <Alert severity="success" sx={{ mb: 2, fontSize: '0.875rem' }}>
                  ✅ Loaded your saved avatar preferences
                  <Box sx={{ mt: 1, display: 'flex', gap: 1, alignItems: 'center', flexWrap: 'wrap' }}>
                    {bodyProfile.skinTone && (
                      <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
                        <Typography variant="caption">Skin:</Typography>
                        <Box sx={{ 
                          width: 16, 
                          height: 16, 
                          borderRadius: '50%',
                          bgcolor: bodyProfile.skinTone === 'light' ? '#FFE0BD' :
                                   bodyProfile.skinTone === 'medium' ? '#D4A574' :
                                   bodyProfile.skinTone === 'tan' ? '#C68642' : '#8D5524',
                          border: '1px solid #999'
                        }} />
                      </Box>
                    )}
                    {bodyProfile.hairColor && (
                      <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
                        <Typography variant="caption">Hair:</Typography>
                        <Box sx={{ 
                          width: 16, 
                          height: 16, 
                          borderRadius: '50%',
                          bgcolor: bodyProfile.hairColor === 'black' ? '#000000' :
                                   bodyProfile.hairColor === 'brown' ? '#654321' :
                                   bodyProfile.hairColor === 'blonde' ? '#FAF0BE' :
                                   bodyProfile.hairColor === 'red' ? '#8B0000' : '#808080',
                          border: '1px solid #999'
                        }} />
                      </Box>
                    )}
                    {bodyProfile.eyeColor && (
                      <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
                        <Typography variant="caption">Eyes:</Typography>
                        <Box sx={{ 
                          width: 16, 
                          height: 16, 
                          borderRadius: '50%',
                          bgcolor: bodyProfile.eyeColor === 'brown' ? '#654321' :
                                   bodyProfile.eyeColor === 'blue' ? '#4169E1' :
                                   bodyProfile.eyeColor === 'green' ? '#228B22' :
                                   bodyProfile.eyeColor === 'hazel' ? '#8E7618' : '#708090',
                          border: '1px solid #999'
                        }} />
                      </Box>
                    )}
                  </Box>
                </Alert>
              )}
              
              {previewMode && (
                <Alert severity="success" sx={{ mb: 2, fontSize: '0.875rem' }}>
                  ✨ Preview Mode Active - Changes apply instantly!
                </Alert>
              )}
              
              <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2.5 }}>
                {/* Skin Tone */}
                <FormControl fullWidth size="small">
                  <InputLabel>Skin Tone</InputLabel>
                  <Select
                    value={customization.skinTone}
                    label="Skin Tone"
                    onChange={(e) => handleChange('skinTone', e.target.value)}
                  >
                    {skinTones.map(tone => (
                      <MenuItem key={tone.value} value={tone.value}>
                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                          <Box sx={{ width: 20, height: 20, bgcolor: tone.color, borderRadius: 1, border: '1px solid #ccc' }} />
                          {tone.label}
                        </Box>
                      </MenuItem>
                    ))}
                  </Select>
                </FormControl>

                {/* Hair Color */}
                <FormControl fullWidth size="small">
                  <InputLabel>Hair Color</InputLabel>
                  <Select
                    value={customization.hairColor}
                    label="Hair Color"
                    onChange={(e) => handleChange('hairColor', e.target.value)}
                  >
                    {hairColors.map(color => (
                      <MenuItem key={color.value} value={color.value}>
                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                          <Box sx={{ width: 20, height: 20, bgcolor: color.color, borderRadius: 1, border: '1px solid #ccc' }} />
                          {color.label}
                        </Box>
                      </MenuItem>
                    ))}
                  </Select>
                </FormControl>

                {/* Hair Style */}
                <FormControl fullWidth size="small">
                  <InputLabel>Hair Style</InputLabel>
                  <Select
                    value={customization.hairStyle}
                    label="Hair Style"
                    onChange={(e) => handleChange('hairStyle', e.target.value)}
                  >
                    {hairStyles.map(style => (
                      <MenuItem key={style.value} value={style.value}>{style.label}</MenuItem>
                    ))}
                  </Select>
                </FormControl>

                {/* Eye Color */}
                <FormControl fullWidth size="small">
                  <InputLabel>Eye Color</InputLabel>
                  <Select
                    value={customization.eyeColor}
                    label="Eye Color"
                    onChange={(e) => handleChange('eyeColor', e.target.value)}
                  >
                    {eyeColors.map(color => (
                      <MenuItem key={color.value} value={color.value}>
                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                          <Box sx={{ width: 20, height: 20, bgcolor: color.color, borderRadius: '50%', border: '1px solid #ccc' }} />
                          {color.label}
                        </Box>
                      </MenuItem>
                    ))}
                  </Select>
                </FormControl>

                <Button
                  variant="contained"
                  size="large"
                  fullWidth
                  onClick={previewMode ? handleGenerate : handlePreview}
                  disabled={loading}
                  color={previewMode ? "success" : "primary"}
                  sx={{ mt: 1, py: 1.5, fontWeight: 'bold' }}
                >
                  {loading ? <CircularProgress size={24} /> : (previewMode ? 'Save Avatar' : 'Preview Avatar')}
                </Button>
                
                {previewMode && (
                  <Typography variant="caption" color="text.secondary" textAlign="center" sx={{ mt: -1 }}>
                    Adjust the options above to customize your avatar in real-time
                  </Typography>
                )}
              </Box>
            </CardContent>
          </Card>
        </Grid>
      </Grid>
    </Container>
  );
};

export default AvatarCustomizationPage;

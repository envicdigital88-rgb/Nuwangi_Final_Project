import React from 'react';
import { Box, Typography, Slider } from '@mui/material';
import Model3DViewer from './Model3DViewer';

const BodyMeasurementVisual = ({ measurements, onMeasurementChange, gender = 'female', avatarUrl }) => {
  const measurementConfig = [
    {
      key: 'shoulders',
      label: 'Shoulders',
      icon: '↔️',
      min: 30,
      max: 60,
      unit: 'cm',
      color: '#9333ea',
    },
    {
      key: 'chest',
      label: 'Bust/Chest',
      icon: '👔',
      min: 70,
      max: 130,
      unit: 'cm',
      color: '#9333ea',
    },
    {
      key: 'waist',
      label: 'Waist',
      icon: '⌛',
      min: 50,
      max: 110,
      unit: 'cm',
      color: '#9333ea',
    },
    {
      key: 'hips',
      label: 'Hips',
      icon: '🔄',
      min: 70,
      max: 140,
      unit: 'cm',
      color: '#9333ea',
    },
    {
      key: 'height',
      label: 'Height',
      icon: '📏',
      min: 140,
      max: 210,
      unit: 'cm',
      color: '#9333ea',
    },
  ];

  return (
    <Box
      sx={{
        display: 'flex',
        flexDirection: { xs: 'column', md: 'row' },
        gap: 1.5,
        p: 0,
        bgcolor: 'transparent',
        minHeight: 350,
        maxWidth: '100%',
      }}
    >
      {/* Debug: Show avatar URL status */}
      {console.log('BodyMeasurementVisual - avatarUrl:', avatarUrl)}
      
      {/* Left Side - Avatar with Measurement Lines */}
      <Box
        sx={{
          flex: { xs: '1', md: '0 0 200px' },
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          position: 'relative',
          bgcolor: '#0a0a0a',
          borderRadius: 2,
          border: '1px solid #333',
          overflow: 'hidden',
          minHeight: 350,
          maxHeight: 350,
        }}
      >
        {/* Avatar Image */}
        <Box
          sx={{
            position: 'relative',
            width: '100%',
            height: '100%',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            p: 1,
          }}
        >
          {avatarUrl ? (
            /* Use 3D Model Viewer for avatar */
            <Model3DViewer
              modelUrl={avatarUrl}
              width="100%"
              height={350}
              productCategory="avatar"
              showColorPicker={false}
              autoRotate={true}
            />
          ) : (
            /* Attractive Avatar Placeholder - Show when no avatar created */
            <Box
              sx={{
                width: '100%',
                height: '100%',
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                justifyContent: 'center',
                background: 'radial-gradient(circle at center, #1a1a1a 0%, #0a0a0a 100%)',
                position: 'relative',
                overflow: 'hidden',
              }}
            >
              {/* Animated gradient background */}
              <Box
                sx={{
                  position: 'absolute',
                  top: '50%',
                  left: '50%',
                  transform: 'translate(-50%, -50%)',
                  width: '200px',
                  height: '200px',
                  background: 'radial-gradient(circle, rgba(147, 51, 234, 0.15) 0%, transparent 70%)',
                  borderRadius: '50%',
                  animation: 'pulse 3s ease-in-out infinite',
                  '@keyframes pulse': {
                    '0%, 100%': {
                      transform: 'translate(-50%, -50%) scale(1)',
                      opacity: 0.5,
                    },
                    '50%': {
                      transform: 'translate(-50%, -50%) scale(1.2)',
                      opacity: 0.3,
                    },
                  },
                }}
              />
              
              {/* Stylized human figure */}
              <Box
                sx={{
                  position: 'relative',
                  zIndex: 1,
                  mb: 3,
                }}
              >
                <svg
                  width="120"
                  height="220"
                  viewBox="0 0 120 220"
                  fill="none"
                  xmlns="http://www.w3.org/2000/svg"
                >
                  {/* Modern minimalist figure */}
                  {/* Head */}
                  <circle cx="60" cy="25" r="18" fill="url(#headGradient)" opacity="0.8" />
                  {/* Body */}
                  <path
                    d="M 45 50 Q 45 45 50 45 L 70 45 Q 75 45 75 50 L 75 120 Q 75 125 70 125 L 50 125 Q 45 125 45 120 Z"
                    fill="url(#bodyGradient)"
                    opacity="0.8"
                  />
                  {/* Arms */}
                  <path
                    d="M 50 55 Q 35 60 30 75 L 28 85 Q 32 88 35 85 L 42 70 Q 45 65 48 60"
                    fill="url(#armGradient)"
                    opacity="0.7"
                  />
                  <path
                    d="M 70 55 Q 85 60 90 75 L 92 85 Q 88 88 85 85 L 78 70 Q 75 65 72 60"
                    fill="url(#armGradient)"
                    opacity="0.7"
                  />
                  {/* Legs */}
                  <path
                    d="M 52 125 L 48 180 Q 48 185 52 185 L 54 185 Q 58 185 58 180 L 58 125"
                    fill="url(#legGradient)"
                    opacity="0.8"
                  />
                  <path
                    d="M 68 125 L 72 180 Q 72 185 68 185 L 66 185 Q 62 185 62 180 L 62 125"
                    fill="url(#legGradient)"
                    opacity="0.8"
                  />
                  
                  {/* Gradients */}
                  <defs>
                    <linearGradient id="headGradient" x1="0%" y1="0%" x2="0%" y2="100%">
                      <stop offset="0%" stopColor="#9333ea" stopOpacity="0.8" />
                      <stop offset="100%" stopColor="#7c3aed" stopOpacity="0.6" />
                    </linearGradient>
                    <linearGradient id="bodyGradient" x1="0%" y1="0%" x2="0%" y2="100%">
                      <stop offset="0%" stopColor="#7c3aed" stopOpacity="0.7" />
                      <stop offset="100%" stopColor="#6d28d9" stopOpacity="0.5" />
                    </linearGradient>
                    <linearGradient id="armGradient" x1="0%" y1="0%" x2="0%" y2="100%">
                      <stop offset="0%" stopColor="#7c3aed" stopOpacity="0.6" />
                      <stop offset="100%" stopColor="#6d28d9" stopOpacity="0.4" />
                    </linearGradient>
                    <linearGradient id="legGradient" x1="0%" y1="0%" x2="0%" y2="100%">
                      <stop offset="0%" stopColor="#6d28d9" stopOpacity="0.7" />
                      <stop offset="100%" stopColor="#5b21b6" stopOpacity="0.5" />
                    </linearGradient>
                  </defs>
                </svg>
              </Box>

              {/* Text content */}
              <Box sx={{ textAlign: 'center', px: 2, zIndex: 1 }}>
                <Typography 
                  variant="body2" 
                  sx={{ 
                    color: '#ffffff', 
                    fontWeight: 600,
                    fontSize: '0.875rem',
                    mb: 0.5,
                    letterSpacing: '0.5px'
                  }}
                >
                  Create Your Avatar
                </Typography>
                <Typography 
                  variant="caption" 
                  sx={{ 
                    color: '#9ca3af', 
                    fontSize: '0.7rem',
                    lineHeight: 1.4,
                    display: 'block'
                  }}
                >
                  Personalize your 3D model
                </Typography>
                <Box
                  sx={{
                    mt: 2,
                    px: 2.5,
                    py: 1,
                    bgcolor: 'rgba(147, 51, 234, 0.15)',
                    border: '1px solid rgba(147, 51, 234, 0.3)',
                    borderRadius: 1.5,
                    display: 'inline-block',
                  }}
                >
                  <Typography 
                    variant="caption" 
                    sx={{ 
                      color: '#c084fc', 
                      fontSize: '0.65rem',
                      fontWeight: 500,
                    }}
                  >
                    Go to Avatar Customization →
                  </Typography>
                </Box>
              </Box>
            </Box>
          )}

          {/* Measurement indicator lines */}
          <Box
            sx={{
              position: 'absolute',
              top: 0,
              left: 0,
              right: 0,
              bottom: 0,
              pointerEvents: 'none',
            }}
          >
            {/* Shoulders line */}
            <Box
              sx={{
                position: 'absolute',
                top: '15%',
                left: '10%',
                right: '10%',
                height: '1px',
                bgcolor: '#9333ea',
                opacity: 0.4,
                '&::before': {
                  content: '"↔"',
                  position: 'absolute',
                  right: -16,
                  top: -8,
                  fontSize: '12px',
                  color: '#9333ea',
                },
              }}
            />
            {/* Chest line */}
            <Box
              sx={{
                position: 'absolute',
                top: '30%',
                left: '15%',
                right: '15%',
                height: '1px',
                bgcolor: '#9333ea',
                opacity: 0.4,
              }}
            />
            {/* Waist line */}
            <Box
              sx={{
                position: 'absolute',
                top: '45%',
                left: '20%',
                right: '20%',
                height: '1px',
                bgcolor: '#9333ea',
                opacity: 0.4,
              }}
            />
            {/* Hips line */}
            <Box
              sx={{
                position: 'absolute',
                top: '55%',
                left: '15%',
                right: '15%',
                height: '1px',
                bgcolor: '#9333ea',
                opacity: 0.4,
              }}
            />
          </Box>
        </Box>

        <Typography
          variant="caption"
          sx={{
            position: 'absolute',
            bottom: 8,
            color: '#666',
            fontSize: '0.65rem',
          }}
        >
          Measurement Reference
        </Typography>
      </Box>

      {/* Right Side - Measurement Sliders */}
      <Box sx={{ flex: 1, display: 'flex', flexDirection: 'column', gap: 1.2, maxWidth: '100%' }}>
        {measurementConfig.map((config) => (
          <Box
            key={config.key}
            sx={{
              bgcolor: '#1a1a1a',
              borderRadius: 1.5,
              p: 1.5,
              border: '1px solid #333',
              transition: 'all 0.3s',
              '&:hover': {
                borderColor: '#9333ea',
                bgcolor: '#1f1f1f',
              },
            }}
          >
            <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 0.8 }}>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                <Box
                  sx={{
                    width: 28,
                    height: 28,
                    borderRadius: 1,
                    bgcolor: '#9333ea15',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    fontSize: '14px',
                  }}
                >
                  {config.icon}
                </Box>
                <Typography variant="body2" fontWeight="600" color="#ffffff" sx={{ fontSize: '0.85rem' }}>
                  {config.label}
                </Typography>
              </Box>
              <Typography
                variant="h6"
                sx={{
                  color: '#9333ea',
                  fontWeight: 'bold',
                  fontSize: '0.95rem',
                  minWidth: '60px',
                  textAlign: 'right',
                }}
              >
                {measurements[config.key]} {config.unit}
              </Typography>
            </Box>

            <Slider
              value={measurements[config.key]}
              onChange={(_, value) => onMeasurementChange(config.key, value)}
              min={config.min}
              max={config.max}
              valueLabelDisplay="auto"
              sx={{
                color: config.color,
                height: 4,
                '& .MuiSlider-thumb': {
                  width: 16,
                  height: 16,
                  bgcolor: config.color,
                  border: '2px solid #000',
                  '&:hover, &.Mui-focusVisible': {
                    boxShadow: `0 0 0 5px ${config.color}33`,
                  },
                },
                '& .MuiSlider-track': {
                  height: 4,
                  borderRadius: 2,
                  border: 'none',
                },
                '& .MuiSlider-rail': {
                  height: 4,
                  borderRadius: 2,
                  bgcolor: '#333',
                  opacity: 1,
                },
                '& .MuiSlider-valueLabel': {
                  bgcolor: config.color,
                  borderRadius: 1,
                  fontSize: '0.65rem',
                  fontWeight: 'bold',
                },
              }}
            />
            <Box sx={{ display: 'flex', justifyContent: 'space-between', mt: 0.3 }}>
              <Typography variant="caption" color="#666" fontSize="0.6rem">
                {config.min}
              </Typography>
              <Typography variant="caption" color="#666" fontSize="0.6rem">
                {config.max}
              </Typography>
            </Box>
          </Box>
        ))}
      </Box>
    </Box>
  );
};

export default BodyMeasurementVisual;

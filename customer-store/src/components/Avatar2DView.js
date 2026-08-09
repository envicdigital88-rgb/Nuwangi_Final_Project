import React, { useState, useEffect } from 'react';
import { Box, IconButton, ToggleButton, ToggleButtonGroup, Typography, Alert } from '@mui/material';
import { ThreeDRotation, ViewInAr, Refresh } from '@mui/icons-material';

const Avatar2DView = ({ bodyProfile, product, selectedColor = 'White', onViewChange }) => {
  const [view, setView] = useState('2d'); // '2d' or '3d'
  const [avatarPose, setAvatarPose] = useState('front'); // 'front', 'side', 'back'

  // Generate 2D avatar based on body profile
  const generateAvatar2D = () => {
    const gender = bodyProfile?.gender?.toLowerCase() || 'female';
    const skinTone = bodyProfile?.skinTone || 'medium';
    const hairColor = bodyProfile?.hairColor || 'brown';
    const eyeColor = bodyProfile?.eyeColor || 'brown';
    const height = bodyProfile?.heightCm || 170;
    const bodyShape = bodyProfile?.bodyShape || 'athletic';

    // Skin tone colors
    const skinColors = {
      light: '#FFE0BD',
      medium: '#D4A574',
      tan: '#C68642',
      dark: '#8D5524'
    };

    // Hair color mapping
    const hairColors = {
      black: '#000000',
      brown: '#654321',
      blonde: '#FAF0BE',
      red: '#8B0000',
      gray: '#808080'
    };

    // Eye color mapping
    const eyeColors = {
      brown: '#654321',
      blue: '#4169E1',
      green: '#228B22',
      hazel: '#8E7618',
      gray: '#708090'
    };

    const skinColor = skinColors[skinTone] || skinColors.medium;
    const hairColorHex = hairColors[hairColor] || hairColors.brown;
    const eyeColorHex = eyeColors[eyeColor] || eyeColors.brown;

    // Calculate proportions
    const scale = height / 170; // Normalize to 170cm
    const baseWidth = gender === 'male' ? 80 : 70;
    const baseHeight = 200;

    console.log('=== AVATAR 2D GENERATION ===');
    console.log('Body Profile:', bodyProfile);
    console.log('Gender:', gender);
    console.log('Skin Color:', skinColor);
    console.log('Hair Color:', hairColorHex);
    console.log('Eye Color:', eyeColorHex);

    return {
      skinColor,
      hairColor: hairColorHex,
      eyeColor: eyeColorHex,
      width: baseWidth * scale,
      height: baseHeight * scale,
      gender,
      bodyShape
    };
  };

  const avatar = generateAvatar2D();

  // Product overlay positioning based on category
  const getProductOverlay = () => {
    if (!product) return null;

    const productName = product.name?.toLowerCase() || '';
    const category = product.category?.toLowerCase() || '';

    // Determine product type
    let productType = 'shirt';
    if (productName.includes('jean') || productName.includes('pant') || category.includes('pant')) {
      productType = 'pants';
    } else if (productName.includes('dress') || category.includes('dress')) {
      productType = 'dress';
    } else if (productName.includes('suit') || productName.includes('blazer')) {
      productType = 'suit';
    }

    // Color mapping
    const colorMap = {
      'White': '#FFFFFF',
      'Black': '#000000',
      'Red': '#DC143C',
      'Blue': '#4169E1',
      'Navy': '#000080',
      'Green': '#228B22',
      'Yellow': '#FFD700',
      'Pink': '#FF69B4',
      'Purple': '#9370DB',
      'Orange': '#FF8C00',
      'Gray': '#808080',
      'Brown': '#8B4513',
    };

    const productColor = colorMap[selectedColor] || colorMap[product.color] || '#CCCCCC';

    return {
      type: productType,
      color: productColor,
      name: product.name
    };
  };

  const productOverlay = getProductOverlay();

  const handleViewChange = (event, newView) => {
    if (newView !== null) {
      setView(newView);
      if (onViewChange) {
        onViewChange(newView);
      }
    }
  };

  const handlePoseChange = () => {
    const poses = ['front', 'side', 'back'];
    const currentIndex = poses.indexOf(avatarPose);
    const nextIndex = (currentIndex + 1) % poses.length;
    setAvatarPose(poses[nextIndex]);
  };

  return (
    <Box sx={{ position: 'relative', width: '100%', height: '100%', bgcolor: '#f5f5f5' }}>
      {/* Show message if no body profile */}
      {!bodyProfile && (
        <Box sx={{ position: 'absolute', top: 80, left: '50%', transform: 'translateX(-50%)', zIndex: 20, textAlign: 'center' }}>
          <Alert severity="info" sx={{ boxShadow: 3 }}>
            <Typography variant="body2" fontWeight="bold">
              Using Default Avatar
            </Typography>
            <Typography variant="caption">
              Create your body profile for a personalized avatar
            </Typography>
          </Alert>
        </Box>
      )}

      {/* View Toggle */}
      <Box sx={{ position: 'absolute', top: 16, left: 16, zIndex: 10 }}>
        <ToggleButtonGroup
          value={view}
          exclusive
          onChange={handleViewChange}
          size="small"
          sx={{ bgcolor: 'white', boxShadow: 2 }}
        >
          <ToggleButton value="2d">
            <ViewInAr sx={{ mr: 0.5 }} fontSize="small" />
            2D View
          </ToggleButton>
          <ToggleButton value="3d">
            <ThreeDRotation sx={{ mr: 0.5 }} fontSize="small" />
            3D View
          </ToggleButton>
        </ToggleButtonGroup>
      </Box>

      {/* Pose Rotation Button */}
      <Box sx={{ position: 'absolute', top: 16, right: 16, zIndex: 10 }}>
        <IconButton 
          onClick={handlePoseChange}
          sx={{ bgcolor: 'white', boxShadow: 2, '&:hover': { bgcolor: 'white' } }}
        >
          <Refresh />
        </IconButton>
      </Box>

      {/* Pose Indicator */}
      <Box sx={{ position: 'absolute', top: 70, right: 16, zIndex: 10 }}>
        <Typography 
          variant="caption" 
          sx={{ 
            bgcolor: 'white', 
            px: 1.5, 
            py: 0.5, 
            borderRadius: 1,
            boxShadow: 2,
            textTransform: 'capitalize',
            fontWeight: 'bold'
          }}
        >
          {avatarPose} View
        </Typography>
      </Box>

      {/* 2D Avatar Canvas */}
      <Box
        sx={{
          width: '100%',
          height: '100%',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          position: 'relative',
        }}
      >
        <svg
          width="300"
          height="500"
          viewBox="0 0 300 500"
          style={{ maxWidth: '100%', maxHeight: '100%' }}
        >
          {/* Avatar Body */}
          {avatarPose === 'front' && (
            <>
              {/* Head */}
              <ellipse
                cx="150"
                cy="60"
                rx="35"
                ry="40"
                fill={avatar.skinColor}
                stroke="#333"
                strokeWidth="2"
              />
              
              {/* Hair */}
              <ellipse
                cx="150"
                cy="40"
                rx="38"
                ry="25"
                fill={avatar.hairColor}
                stroke="#333"
                strokeWidth="1"
              />

              {/* Eyes */}
              <circle cx="140" cy="60" r="3" fill={avatar.eyeColor} />
              <circle cx="160" cy="60" r="3" fill={avatar.eyeColor} />

              {/* Smile */}
              <path
                d="M 140 70 Q 150 75 160 70"
                stroke="#333"
                strokeWidth="2"
                fill="none"
              />

              {/* Neck */}
              <rect
                x="140"
                y="95"
                width="20"
                height="15"
                fill={avatar.skinColor}
                stroke="#333"
                strokeWidth="2"
              />

              {/* Torso (Body) */}
              <path
                d={avatar.gender === 'male' 
                  ? "M 120 110 L 120 250 L 180 250 L 180 110 Z"
                  : avatar.bodyShape === 'hourglass'
                  ? "M 125 110 L 115 180 L 120 250 L 180 250 L 185 180 L 175 110 Z"
                  : avatar.bodyShape === 'pear'
                  ? "M 130 110 L 115 180 L 110 250 L 190 250 L 185 180 L 170 110 Z"
                  : "M 125 110 L 120 250 L 180 250 L 175 110 Z"
                }
                fill={avatar.skinColor}
                stroke="#333"
                strokeWidth="2"
              />

              {/* Product Overlay - Shirt/Top */}
              {productOverlay && (productOverlay.type === 'shirt' || productOverlay.type === 'suit') && (
                <>
                  <path
                    d={avatar.gender === 'male'
                      ? "M 120 110 L 120 200 L 180 200 L 180 110 Z"
                      : "M 125 110 L 115 180 L 120 200 L 180 200 L 185 180 L 175 110 Z"
                    }
                    fill={productOverlay.color}
                    stroke="#333"
                    strokeWidth="2"
                    opacity="0.9"
                  />
                  {/* Collar */}
                  <path
                    d="M 135 110 L 140 120 L 160 120 L 165 110"
                    fill="white"
                    stroke="#333"
                    strokeWidth="1"
                  />
                  {/* Buttons */}
                  <circle cx="150" cy="135" r="3" fill="#444" />
                  <circle cx="150" cy="155" r="3" fill="#444" />
                  <circle cx="150" cy="175" r="3" fill="#444" />
                </>
              )}

              {/* Product Overlay - Pants */}
              {productOverlay && productOverlay.type === 'pants' && (
                <>
                  {/* Left Leg */}
                  <path
                    d="M 120 250 L 125 400 L 145 400 L 150 250 Z"
                    fill={productOverlay.color}
                    stroke="#333"
                    strokeWidth="2"
                    opacity="0.9"
                  />
                  {/* Right Leg */}
                  <path
                    d="M 150 250 L 155 400 L 175 400 L 180 250 Z"
                    fill={productOverlay.color}
                    stroke="#333"
                    strokeWidth="2"
                    opacity="0.9"
                  />
                  {/* Belt */}
                  <rect
                    x="120"
                    y="245"
                    width="60"
                    height="8"
                    fill="#654321"
                    stroke="#333"
                    strokeWidth="1"
                  />
                </>
              )}

              {/* Product Overlay - Dress */}
              {productOverlay && productOverlay.type === 'dress' && (
                <>
                  <path
                    d="M 125 110 L 100 400 L 200 400 L 175 110 Z"
                    fill={productOverlay.color}
                    stroke="#333"
                    strokeWidth="2"
                    opacity="0.9"
                  />
                  {/* Dress details */}
                  <path
                    d="M 135 110 L 140 120 L 160 120 L 165 110"
                    fill="white"
                    stroke="#333"
                    strokeWidth="1"
                  />
                </>
              )}

              {/* Arms */}
              <rect
                x="90"
                y="120"
                width="15"
                height="100"
                fill={productOverlay && (productOverlay.type === 'shirt' || productOverlay.type === 'suit') 
                  ? productOverlay.color : avatar.skinColor}
                stroke="#333"
                strokeWidth="2"
                rx="5"
              />
              <rect
                x="195"
                y="120"
                width="15"
                height="100"
                fill={productOverlay && (productOverlay.type === 'shirt' || productOverlay.type === 'suit') 
                  ? productOverlay.color : avatar.skinColor}
                stroke="#333"
                strokeWidth="2"
                rx="5"
              />

              {/* Hands */}
              <circle cx="97" cy="225" r="10" fill={avatar.skinColor} stroke="#333" strokeWidth="2" />
              <circle cx="203" cy="225" r="10" fill={avatar.skinColor} stroke="#333" strokeWidth="2" />

              {/* Legs (if no pants) */}
              {(!productOverlay || productOverlay.type !== 'pants') && (
                <>
                  <rect
                    x="125"
                    y="250"
                    width="20"
                    height="150"
                    fill={avatar.skinColor}
                    stroke="#333"
                    strokeWidth="2"
                    rx="5"
                  />
                  <rect
                    x="155"
                    y="250"
                    width="20"
                    height="150"
                    fill={avatar.skinColor}
                    stroke="#333"
                    strokeWidth="2"
                    rx="5"
                  />
                </>
              )}

              {/* Feet */}
              <ellipse cx="135" cy="410" rx="15" ry="8" fill="#333" />
              <ellipse cx="165" cy="410" rx="15" ry="8" fill="#333" />
            </>
          )}

          {/* Side View */}
          {avatarPose === 'side' && (
            <>
              {/* Head */}
              <ellipse cx="150" cy="60" rx="30" ry="40" fill={avatar.skinColor} stroke="#333" strokeWidth="2" />
              
              {/* Hair */}
              <path
                d="M 130 40 Q 150 30 170 50 L 165 70 Q 150 60 135 70 Z"
                fill={avatar.hairColor}
                stroke="#333"
                strokeWidth="1"
              />

              {/* Eye */}
              <circle cx="160" cy="60" r="3" fill={avatar.eyeColor} />

              {/* Nose */}
              <path d="M 175 60 L 180 65 L 175 70" stroke="#333" strokeWidth="2" fill="none" />

              {/* Body */}
              <path
                d="M 140 100 L 135 250 L 165 250 L 160 100 Z"
                fill={avatar.skinColor}
                stroke="#333"
                strokeWidth="2"
              />

              {/* Product Overlay */}
              {productOverlay && productOverlay.type === 'shirt' && (
                <path
                  d="M 140 100 L 135 200 L 165 200 L 160 100 Z"
                  fill={productOverlay.color}
                  stroke="#333"
                  strokeWidth="2"
                  opacity="0.9"
                />
              )}

              {/* Arm */}
              <rect x="130" y="120" width="12" height="90" fill={avatar.skinColor} stroke="#333" strokeWidth="2" rx="5" />

              {/* Leg */}
              <rect x="140" y="250" width="18" height="150" fill={avatar.skinColor} stroke="#333" strokeWidth="2" rx="5" />
              
              {/* Foot */}
              <ellipse cx="149" cy="410" rx="20" ry="8" fill="#333" />
            </>
          )}

          {/* Back View */}
          {avatarPose === 'back' && (
            <>
              {/* Head */}
              <ellipse cx="150" cy="60" rx="35" ry="40" fill={avatar.skinColor} stroke="#333" strokeWidth="2" />
              
              {/* Hair */}
              <ellipse
                cx="150"
                cy="50"
                rx="38"
                ry="30"
                fill={avatar.hairColor}
                stroke="#333"
                strokeWidth="1"
              />

              {/* Body */}
              <path
                d="M 120 110 L 120 250 L 180 250 L 180 110 Z"
                fill={avatar.skinColor}
                stroke="#333"
                strokeWidth="2"
              />

              {/* Product Overlay - Back */}
              {productOverlay && productOverlay.type === 'shirt' && (
                <path
                  d="M 120 110 L 120 200 L 180 200 L 180 110 Z"
                  fill={productOverlay.color}
                  stroke="#333"
                  strokeWidth="2"
                  opacity="0.9"
                />
              )}

              {/* Arms */}
              <rect x="90" y="120" width="15" height="100" fill={avatar.skinColor} stroke="#333" strokeWidth="2" rx="5" />
              <rect x="195" y="120" width="15" height="100" fill={avatar.skinColor} stroke="#333" strokeWidth="2" rx="5" />

              {/* Legs */}
              <rect x="125" y="250" width="20" height="150" fill={avatar.skinColor} stroke="#333" strokeWidth="2" rx="5" />
              <rect x="155" y="250" width="20" height="150" fill={avatar.skinColor} stroke="#333" strokeWidth="2" rx="5" />

              {/* Feet */}
              <ellipse cx="135" cy="410" rx="15" ry="8" fill="#333" />
              <ellipse cx="165" cy="410" rx="15" ry="8" fill="#333" />
            </>
          )}
        </svg>
      </Box>

      {/* Product Label */}
      {productOverlay && (
        <Box
          sx={{
            position: 'absolute',
            bottom: 16,
            left: '50%',
            transform: 'translateX(-50%)',
            bgcolor: 'white',
            px: 2,
            py: 1,
            borderRadius: 2,
            boxShadow: 3,
            textAlign: 'center',
            minWidth: 200
          }}
        >
          <Typography variant="subtitle2" fontWeight="bold">
            {productOverlay.name}
          </Typography>
          <Typography variant="caption" color="text.secondary">
            Color: {selectedColor}
          </Typography>
        </Box>
      )}
    </Box>
  );
};

export default Avatar2DView;

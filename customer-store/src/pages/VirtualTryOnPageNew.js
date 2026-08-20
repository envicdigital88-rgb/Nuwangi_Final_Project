import React, { useState, useEffect, useRef, useCallback } from 'react';
import { useNavigate, useLocation, useSearchParams } from 'react-router-dom';
import {
  Box,
  Container,
  Typography,
  Button,
  Grid,
  Card,
  CardContent,
  CardMedia,
  Alert,
  Chip,
  Divider,
} from '@mui/material';
import { CheckCircle, Person, Straighten, Lock, ArrowForward } from '@mui/icons-material';
import AIRecommendations from '../components/AIRecommendations';
import FitBadge from '../components/FitBadge';
import Model3DViewer from '../components/Model3DViewer';
import { productsAPI } from '../services/apiService';
import { useCustomerAuth } from '../contexts/CustomerAuthContext';
import axios from 'axios';

// ── Color Swatch Helper ───────────────────────────────────────────────────────
const getColorHex = (colorName) => {
  const map = {
    red: '#e53e3e', blue: '#3182ce', green: '#38a169', yellow: '#d69e2e',
    orange: '#dd6b20', purple: '#805ad5', pink: '#d53f8c', white: '#ffffff',
    black: '#1a1a1a', gray: '#718096', grey: '#718096', brown: '#744210',
    navy: '#1a365d', beige: '#f5f0e8', cream: '#fffdd0', maroon: '#800000',
    teal: '#2c7a7b', cyan: '#00b5d8', magenta: '#b83280', gold: '#b7791f',
    silver: '#a0aec0', lavender: '#9f7aea', mint: '#38b2ac', coral: '#fc8181',
    indigo: '#4c51bf', violet: '#6b46c1', lime: '#84cc16', rose: '#f43f5e',
  };
  return map[colorName.toLowerCase().trim()] || '#888888';
};

const ColorSwatches = ({ colorStr }) => {
  if (!colorStr) return null;
  const colors = colorStr.split(',').map(c => c.trim()).filter(Boolean);
  if (colors.length === 0) return null;
  return (
    <Box sx={{ display: 'flex', gap: 0.6, mt: 0.75, mb: 0.5, flexWrap: 'wrap' }}>
      {colors.map((color, i) => (
        <Box
          key={i}
          title={color}
          sx={{
            width: 14,
            height: 14,
            borderRadius: '50%',
            bgcolor: getColorHex(color),
            border: color.toLowerCase().trim() === 'white' ? '1px solid #555' : '1px solid rgba(255,255,255,0.25)',
            flexShrink: 0,
          }}
        />
      ))}
    </Box>
  );
};

// ── LazyModel3DViewer ─────────────────────────────────────────────────────────
// Only mounts the WebGL context when the card is visible in the viewport.
// Browsers allow only ~8-16 WebGL contexts simultaneously. Rendering all product
// cards at once exhausts this limit, causing other viewers to go white/blank.
const LazyModel3DViewer = ({ modelUrl, height, width, productColor, productCategory, imageUrl }) => {
  const containerRef = useRef(null);
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    const el = containerRef.current;
    if (!el) return;
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setIsVisible(true);
          observer.disconnect(); // once visible, stay rendered (don't unmount on scroll out)
        }
      },
      { threshold: 0.1, rootMargin: '80px' }
    );
    observer.observe(el);
    return () => observer.disconnect();
  }, []);

  return (
    <div ref={containerRef} style={{ width: '100%', height }}>
      {isVisible ? (
        <Model3DViewer
          modelUrl={modelUrl}
          height={height}
          width={width}
          productColor={productColor}
          productCategory={productCategory}
          showColorPicker={false}
          autoRotate={false}
        />
      ) : (
        <div style={{
          width: '100%',
          height,
          background: 'radial-gradient(circle, #2a2a2a 0%, #0a0a0a 100%)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          overflow: 'hidden',
        }}>
          {imageUrl
            ? <img src={imageUrl} alt="product" style={{ maxHeight: '100%', maxWidth: '100%', objectFit: 'contain', opacity: 0.75 }} />
            : <div style={{ color: '#555', fontSize: 13 }}>3D View</div>
          }
        </div>
      )}
    </div>
  );
};
// ─────────────────────────────────────────────────────────────────────────────

const VirtualTryOnPageNew = () => {
  const { customer, bodyProfile: authBodyProfile, refreshBodyProfile } = useCustomerAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [searchParams] = useSearchParams();
  
  // Profile state
  const [bodyProfile, setBodyProfile] = useState(null);
  const [measurements, setMeasurements] = useState({
    height: 165,
    chest: 88,
    waist: 72,
    hips: 95,
    shoulders: 42,
  });

  // Pagination state to prevent WebGL context crash
  const [currentPage, setCurrentPage] = useState(1);
  const productsPerPage = 4; // Safest limit (4 grid + 1 avatar + 1 product viewer = 6 contexts)
  const [gender, setGender] = useState('female');

  // Products state
  const [products, setProducts] = useState([]);
  const [selectedProduct, setSelectedProduct] = useState(null);
  const [productFitScores, setProductFitScores] = useState({});
  const [selectedColor, setSelectedColor] = useState(null);
  const avatarViewerRef = useRef(null);  // For avatar 3D viewer
  const productViewerRef = useRef(null); // For product 3D viewer

  // Check workflow requirements
  const hasProfile = authBodyProfile && authBodyProfile.id;
  const hasAvatar = authBodyProfile && authBodyProfile.avatarModelUrl;
  const canTryOn = hasProfile && hasAvatar;

  useEffect(() => {
    loadProducts();
    
    // Force refresh body profile when page loads to get latest avatar data
    if (customer && refreshBodyProfile) {
      console.log('VirtualTryOnPageNew: Forcing profile refresh on mount...');
      refreshBodyProfile().then((updatedProfile) => {
        if (updatedProfile) {
          console.log('VirtualTryOnPageNew: Profile refreshed on mount:', {
            avatarUrl: updatedProfile.avatarModelUrl,
            skinTone: updatedProfile.skinTone,
            hairColor: updatedProfile.hairColor
          });
        }
      });
    }
  }, [customer, refreshBodyProfile]);

  useEffect(() => {
    // Redirect to profile creation if no profile exists
    if (customer && !authBodyProfile) {
      console.log('VirtualTryOnPageNew: No body profile, redirecting to profile creation');
      navigate('/profile/body');
      return;
    }
    
    // Load profile data if available
    if (authBodyProfile) {
      console.log('VirtualTryOnPageNew: Body profile loaded:', {
        id: authBodyProfile.id,
        gender: authBodyProfile.gender,
        avatarUrl: authBodyProfile.avatarModelUrl,
        skinTone: authBodyProfile.skinTone,
        hairColor: authBodyProfile.hairColor,
        eyeColor: authBodyProfile.eyeColor
      });
      loadProfile();
    }
  }, [authBodyProfile, customer, navigate]);

  // Separate effect for forcing profile refresh on mount
  useEffect(() => {
    if (customer && refreshBodyProfile && !authBodyProfile?.avatarModelUrl) {
      console.log('VirtualTryOnPageNew: Avatar not found, forcing body profile refresh from backend...');
      refreshBodyProfile().then((updatedProfile) => {
        if (updatedProfile) {
          console.log('VirtualTryOnPageNew: Body profile refreshed:', {
            avatarUrl: updatedProfile.avatarModelUrl,
            skinTone: updatedProfile.skinTone,
            hairColor: updatedProfile.hairColor
          });
          // Force re-render by updating local state
          setBodyProfile(updatedProfile);
        }
      });
    }
  }, [customer, refreshBodyProfile]); // Only depend on customer and refreshBodyProfile

  const loadProducts = async () => {
    try {
      const response = await productsAPI.getAllProducts();
      const productData = response.data?.content || response.data || [];
      setProducts(Array.isArray(productData) ? productData : []);
    } catch (error) {
      console.error('Failed to load products:', error);
    }
  };

  const loadProfile = () => {
    // Use backend profile if available
    if (authBodyProfile) {
      console.log('VirtualTryOnPageNew: Loading profile with avatar:', authBodyProfile.avatarModelUrl);
      setBodyProfile(authBodyProfile);
      setMeasurements({
        height: authBodyProfile.heightCm || 165,
        chest: authBodyProfile.chestCm || 88,
        waist: authBodyProfile.waistCm || 72,
        hips: authBodyProfile.hipCm || 95,
        shoulders: authBodyProfile.shoulderWidthCm || 42,
      });
      setGender((authBodyProfile.gender || 'FEMALE').toLowerCase());
      
      // Calculate fit scores when profile loads
      calculateFitScores();
    } else {
      console.log('VirtualTryOnPageNew: No authBodyProfile available');
    }
  };

  const calculateFitScores = async () => {
    if (products.length === 0) return;
    
    const fitScores = {};

    try {
      for (const product of products) {
        // Parse product size chart if available
        let productSizeChart = null;
        if (product.sizeChart) {
          try {
            productSizeChart = JSON.parse(product.sizeChart);
          } catch (e) {
            console.warn('Failed to parse size chart for product:', product.id);
          }
        }

        // Calculate fit score with product-specific size chart
        const fitResponse = await axios.post(
          'http://localhost:5000/api/ai/calculate-fit',
          {
            measurements: {
              chest_cm: measurements.chest,
              waist_cm: measurements.waist,
              hip_cm: measurements.hips
            },
            product_size_chart: productSizeChart,
            clothing_type: product.category?.toLowerCase() || 'shirt'
          }
        );

        fitScores[product.id] = {
          fit_score: fitResponse.data.fit_details.fit_score,
          fit_level: fitResponse.data.fit_details.fit_level,
          recommended_size: fitResponse.data.fit_details.best_size,
          chest_fit: fitResponse.data.fit_details.chest_fit,
          waist_fit: fitResponse.data.fit_details.waist_fit,
          hip_fit: fitResponse.data.fit_details.hip_fit
        };
      }

      setProductFitScores(fitScores);
    } catch (error) {
      console.error('Error calculating fit scores:', error);
    }
  };

  const handleSelectProduct = (product) => {
    // Enforce workflow: profile and avatar required before trying on clothes
    if (!canTryOn) {
      return;
    }
    
    setSelectedProduct(product);
    // Set default color to first available color
    if (product.color) {
      const colors = product.color.split(',').map(c => c.trim());
      setSelectedColor(colors[0]);
    }
    
    // Automatically scroll to the virtual try-on viewer at the top
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };
  
  const handleColorChange = (color) => {
    console.log('Color change requested:', color);
    setSelectedColor(color);
    
    const colorMap = {
      'White': 0xFFFFFF, 'Black': 0x000000, 'Red': 0xDC143C, 'Blue': 0x4169E1,
      'Navy': 0x000080, 'Green': 0x228B22, 'Yellow': 0xFFD700, 'Pink': 0xFF69B4,
      'Purple': 0x9370DB, 'Orange': 0xFF8C00, 'Gray': 0x808080, 'Grey': 0x808080,
      'Brown': 0x8B4513, 'Beige': 0xF5F5DC, 'Cream': 0xFFFDD0, 'Maroon': 0x800000,
      'Cyan': 0x00CED1, 'Teal': 0x008080, 'Olive': 0x808000, 'Gold': 0xFFD700,
      'Silver': 0xC0C0C0, 'Lavender': 0xE6E6FA, 'Peach': 0xFFDAB9,
    };
    // Case-insensitive lookup
    const key = Object.keys(colorMap).find(k => k.toLowerCase() === (color || '').toLowerCase().trim());
    const hexColor = key ? colorMap[key] : (color && color.startsWith('#') ? parseInt(color.replace('#',''), 16) : 0xCCCCCC);

    // Update product 3D viewer colour
    if (productViewerRef.current && productViewerRef.current.changeColor) {
      console.log('Changing product viewer color to:', color, 'hex:', hexColor.toString(16));
      productViewerRef.current.changeColor(hexColor);
    }

    // ALSO update the avatar viewer clothing colour immediately
    if (avatarViewerRef.current) {
      if (avatarViewerRef.current.changeClothingColor) {
        console.log('Changing avatar clothing color to:', color, 'hex:', hexColor.toString(16));
        avatarViewerRef.current.changeClothingColor(hexColor);
      } else if (avatarViewerRef.current.changeColor) {
        avatarViewerRef.current.changeColor(hexColor);
      }
    }
  };


  return (
    <Box sx={{ 
      minHeight: '100vh',
      background: 'linear-gradient(135deg, #000000 0%, #1a1a1a 100%)',
      py: { xs: 2, sm: 3, md: 4 }
    }}>
      <Container maxWidth="xl" sx={{ px: { xs: 2, sm: 3, md: 4 } }}>
        {/* Hero Section */}
        <Box sx={{ textAlign: 'center', mb: { xs: 3, sm: 4, md: 5 } }}>
          <Typography 
            variant="h2" 
            gutterBottom 
            fontWeight="bold"
            sx={{ 
              color: '#ffffff',
              mb: 1.5,
              fontSize: { xs: '1.75rem', sm: '2.5rem', md: '2.75rem' },
              letterSpacing: '-0.5px',
            }}
          >
            Virtual Try-On
          </Typography>
          <Typography 
            variant="h6" 
            sx={{ 
              color: '#9ca3af',
              mb: 3,
              fontWeight: 400,
              fontSize: { xs: '0.9rem', sm: '1rem', md: '1.1rem' }
            }}
          >
            Find Your Perfect Fit with Precision Measurement
          </Typography>
          <Box sx={{ 
            display: 'inline-flex', 
            flexDirection: { xs: 'column', sm: 'row' },
            gap: { xs: 1.5, sm: 2.5 },
            mt: 2,
            px: { xs: 2, sm: 3 },
            py: { xs: 1, sm: 1.2 },
            bgcolor: 'rgba(147, 51, 234, 0.08)',
            borderRadius: 2,
            border: '1px solid rgba(147, 51, 234, 0.2)',
            width: { xs: '100%', sm: 'auto' },
            maxWidth: { xs: '300px', sm: 'none' }
          }}>
            <Box sx={{ textAlign: 'center' }}>
              <Typography variant="h6" sx={{ color: '#9333ea', fontWeight: '700', fontSize: { xs: '1rem', md: '1.15rem' } }}>84%</Typography>
              <Typography variant="caption" sx={{ color: '#9ca3af', fontSize: { xs: '0.7rem', md: '0.75rem' } }}>Accuracy</Typography>
            </Box>
            <Divider orientation="vertical" flexItem sx={{ bgcolor: 'rgba(147, 51, 234, 0.2)', display: { xs: 'none', sm: 'block' } }} />
            <Box sx={{ textAlign: 'center' }}>
              <Typography variant="h6" sx={{ color: '#9333ea', fontWeight: '700', fontSize: { xs: '1rem', md: '1.15rem' } }}>500+</Typography>
              <Typography variant="caption" sx={{ color: '#9ca3af', fontSize: { xs: '0.7rem', md: '0.75rem' } }}>Data Points</Typography>
            </Box>
            <Divider orientation="vertical" flexItem sx={{ bgcolor: 'rgba(147, 51, 234, 0.2)', display: { xs: 'none', sm: 'block' } }} />
            <Box sx={{ textAlign: 'center' }}>
              <Typography variant="h6" sx={{ color: '#9333ea', fontWeight: '700', fontSize: { xs: '1rem', md: '1.15rem' } }}>3D</Typography>
              <Typography variant="caption" sx={{ color: '#9ca3af', fontSize: { xs: '0.7rem', md: '0.75rem' } }}>Models</Typography>
            </Box>
          </Box>
        </Box>

      <Grid container spacing={{ xs: 2, sm: 2, md: 3 }} sx={{ maxWidth: '100%', margin: '0 auto' }}>
        {/* Left: Profile Display (Read-only) */}
        <Grid item xs={12} lg={4}>
          <Card sx={{ 
            background: 'linear-gradient(135deg, #1a1a1a 0%, #2a2a2a 100%)',
            border: '1px solid rgba(255,255,255,0.1)',
            borderRadius: 3,
            boxShadow: '0 8px 32px rgba(0,0,0,0.3)',
            position: { xs: 'relative', lg: 'sticky' },
            top: { xs: 0, lg: 20 },
            mb: { xs: 2, lg: 0 },
            maxWidth: '100%'
          }}>
            <CardContent sx={{ p: { xs: 2, sm: 2.5 } }}>
              <Box sx={{ mb: 2.5 }}>
                <Typography variant="h5" fontWeight="600" color="#ffffff" sx={{ fontSize: { xs: '1rem', sm: '1.2rem' }, mb: 0.5 }}>
                  Your Profile
                </Typography>
                <Typography variant="body2" color="#9ca3af" sx={{ fontSize: { xs: '0.75rem', sm: '0.8rem' } }}>
                  Personalized size recommendations
                </Typography>
              </Box>

              {bodyProfile && (
                <Alert 
                  severity="success" 
                  icon={<CheckCircle />}
                  sx={{ 
                    mb: 2,
                    bgcolor: 'rgba(34, 197, 94, 0.1)',
                    border: '1px solid rgba(34, 197, 94, 0.3)',
                    '& .MuiAlert-icon': { color: '#22c55e' }
                  }}
                >
                  Profile Active
                </Alert>
              )}

              {/* Avatar Display Section */}
              {(() => {
                // Use both local state and auth context, prioritizing the most recent
                const currentProfile = bodyProfile || authBodyProfile;
                const avatarUrl = currentProfile?.avatarModelUrl;
                const skinTone = currentProfile?.skinTone;
                const hairColor = currentProfile?.hairColor;
                const eyeColor = currentProfile?.eyeColor;
                const hairStyle = currentProfile?.hairStyle;
                
                console.log('VirtualTryOnPageNew Avatar Display:', {
                  hasBodyProfile: !!bodyProfile,
                  hasAuthBodyProfile: !!authBodyProfile,
                  currentProfile: !!currentProfile,
                  avatarUrl,
                  skinTone,
                  hairColor,
                  eyeColor,
                  hairStyle
                });
                
                if (!avatarUrl) {
                  console.log('VirtualTryOnPageNew: No avatar URL, showing create avatar prompt');
                  return (
                    <Box sx={{ mb: 2.5 }}>
                      <Typography variant="subtitle2" color="#9ca3af" sx={{ mb: 1.5, fontSize: '0.8rem', fontWeight: '600' }}>
                        Your Avatar
                      </Typography>
                      <Box
                        sx={{
                          width: '100%',
                          height: 200,
                          bgcolor: '#0a0a0a',
                          borderRadius: 2,
                          border: '2px dashed #333',
                          display: 'flex',
                          flexDirection: 'column',
                          alignItems: 'center',
                          justifyContent: 'center',
                          gap: 2,
                        }}
                      >
                        <Box
                          sx={{
                            width: 60,
                            height: 60,
                            borderRadius: '50%',
                            bgcolor: 'rgba(147, 51, 234, 0.1)',
                            border: '2px solid rgba(147, 51, 234, 0.3)',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            fontSize: '24px'
                          }}
                        >
                          👤
                        </Box>
                        <Typography variant="body2" color="#9ca3af" textAlign="center">
                          No avatar created yet
                        </Typography>
                        <Typography variant="caption" color="#666" textAlign="center">
                          Create your avatar to see it here
                        </Typography>
                      </Box>
                    </Box>
                  );
                }
                
                console.log('VirtualTryOnPageNew: Rendering avatar with URL:', avatarUrl);
                
                // Key based on avatar properties + selected product ID only.
                // Do NOT include selectedColor here — we update colour imperatively via
                // avatarViewerRef.changeColor() to avoid destroying the 3D scene on every click.
                const avatarKey = `${avatarUrl}-${skinTone}-${hairColor}-${eyeColor}-${hairStyle}-${selectedProduct?.id || 'none'}`;

                
                const clothingUrl = selectedProduct?.model3dUrl 
                  ? (selectedProduct.model3dUrl.startsWith('http') 
                      ? selectedProduct.model3dUrl 
                      : `http://localhost:8082${selectedProduct.model3dUrl}`)
                  : null;

                const activeColor = selectedColor || (selectedProduct?.color ? selectedProduct.color.split(',')[0].trim() : 'White');

                return (
                  <Box sx={{ mb: 2.5 }}>
                    <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 1.5 }}>
                      <Typography variant="subtitle2" color="#9ca3af" sx={{ fontSize: '0.8rem', fontWeight: '600' }}>
                        {selectedProduct ? `✨ Avatar Wearing: ${selectedProduct.name}` : 'Your Avatar'}
                      </Typography>
                      {selectedProduct && (
                        <Chip
                          label={activeColor}
                          size="small"
                          sx={{ bgcolor: '#22c55e', color: '#000000', fontWeight: 'bold', fontSize: '0.7rem', height: 20 }}
                        />
                      )}
                    </Box>
                    <Box
                      sx={{
                        width: '100%',
                        height: 400,
                        bgcolor: '#0a0a0a',
                        borderRadius: 2,
                        border: selectedProduct ? '2px solid #22c55e' : '1px solid #333',
                        overflow: 'hidden',
                        position: 'relative',
                      }}
                    >
                      <Model3DViewer
                        key={avatarKey} // Force re-render when any avatar property or selected product changes
                        ref={avatarViewerRef}
                        modelUrl={avatarUrl}
                        clothingModelUrl={clothingUrl}
                        width="100%"
                        height={400}
                        productCategory={selectedProduct ? `${selectedProduct.category || ''} ${selectedProduct.name || ''} ${selectedProduct.brand || ''}`.trim() : 'avatar'}
                        productColor={activeColor}
                        showColorPicker={false}
                        showControls={false}
                        autoRotate={true}
                        initialSkinTone={skinTone}
                        initialHairColor={hairColor}
                        initialEyeColor={eyeColor}
                        applyAvatarCustomization={true}
                      />
                    </Box>
                    <Box sx={{ mt: 1, display: 'flex', gap: 1, alignItems: 'center', justifyContent: 'center', flexWrap: 'wrap' }}>
                      {skinTone && (
                        <Box sx={{ 
                          px: 1.5, 
                          py: 0.5, 
                          bgcolor: 'rgba(147, 51, 234, 0.1)',
                          borderRadius: 1,
                          border: '1px solid rgba(147, 51, 234, 0.2)',
                          display: 'flex',
                          alignItems: 'center',
                          gap: 0.5
                        }}>
                          <Box sx={{ 
                            width: 12, 
                            height: 12, 
                            borderRadius: '50%',
                            bgcolor: skinTone === 'light' ? '#FFE0BD' :
                                     skinTone === 'medium' ? '#D4A574' :
                                     skinTone === 'tan' ? '#C68642' : '#8D5524',
                            border: '1px solid #666'
                          }} />
                          <Typography variant="caption" sx={{ color: '#9ca3af', fontSize: '0.65rem' }}>
                            {skinTone.charAt(0).toUpperCase() + skinTone.slice(1)} Skin
                          </Typography>
                        </Box>
                      )}
                      {hairColor && (
                        <Box sx={{ 
                          px: 1.5, 
                          py: 0.5, 
                          bgcolor: 'rgba(147, 51, 234, 0.1)',
                          borderRadius: 1,
                          border: '1px solid rgba(147, 51, 234, 0.2)',
                          display: 'flex',
                          alignItems: 'center',
                          gap: 0.5
                        }}>
                          <Box sx={{ 
                            width: 12, 
                            height: 12, 
                            borderRadius: '50%',
                            bgcolor: hairColor === 'black' ? '#000000' :
                                     hairColor === 'brown' ? '#654321' :
                                     hairColor === 'blonde' ? '#FAF0BE' :
                                     hairColor === 'red' ? '#8B0000' : '#808080',
                            border: '1px solid #666'
                          }} />
                          <Typography variant="caption" sx={{ color: '#9ca3af', fontSize: '0.65rem' }}>
                            {hairColor.charAt(0).toUpperCase() + hairColor.slice(1)} Hair
                          </Typography>
                        </Box>
                      )}
                      {hairStyle && (
                        <Box sx={{ 
                          px: 1.5, 
                          py: 0.5, 
                          bgcolor: 'rgba(147, 51, 234, 0.1)',
                          borderRadius: 1,
                          border: '1px solid rgba(147, 51, 234, 0.2)',
                        }}>
                          <Typography variant="caption" sx={{ color: '#9ca3af', fontSize: '0.65rem' }}>
                            {hairStyle.charAt(0).toUpperCase() + hairStyle.slice(1)} Style
                          </Typography>
                        </Box>
                      )}
                    </Box>
                    <Typography variant="caption" color="#666" sx={{ display: 'block', textAlign: 'center', mt: 0.5, fontSize: '0.65rem' }}>
                      Your personalized 3D avatar
                    </Typography>
                  </Box>
                );
              })()}

              {/* Measurements Display (Read-only) */}
              <Box sx={{ mb: 2.5 }}>
                <Typography variant="subtitle2" color="#9ca3af" sx={{ mb: 1.5, fontSize: '0.8rem', fontWeight: '600' }}>
                  Body Measurements
                </Typography>
                
                <Box sx={{ 
                  display: 'flex', 
                  flexDirection: 'column',
                  gap: 1.5,
                  bgcolor: '#0a0a0a',
                  borderRadius: 2,
                  p: 2,
                  border: '1px solid #333'
                }}>
                  <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <Typography variant="body2" color="#9ca3af">Gender:</Typography>
                    <Typography variant="body2" color="#ffffff" fontWeight="600">{gender.toUpperCase()}</Typography>
                  </Box>
                  <Divider sx={{ bgcolor: 'rgba(255,255,255,0.1)' }} />
                  <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <Typography variant="body2" color="#9ca3af">Height:</Typography>
                    <Typography variant="body2" color="#9333ea" fontWeight="700">{measurements.height} cm</Typography>
                  </Box>
                  <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <Typography variant="body2" color="#9ca3af">Shoulders:</Typography>
                    <Typography variant="body2" color="#9333ea" fontWeight="700">{measurements.shoulders} cm</Typography>
                  </Box>
                  <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <Typography variant="body2" color="#9ca3af">Bust/Chest:</Typography>
                    <Typography variant="body2" color="#9333ea" fontWeight="700">{measurements.chest} cm</Typography>
                  </Box>
                  <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <Typography variant="body2" color="#9ca3af">Waist:</Typography>
                    <Typography variant="body2" color="#9333ea" fontWeight="700">{measurements.waist} cm</Typography>
                  </Box>
                  <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <Typography variant="body2" color="#9ca3af">Hips:</Typography>
                    <Typography variant="body2" color="#9333ea" fontWeight="700">{measurements.hips} cm</Typography>
                  </Box>
                </Box>
              </Box>

              {/* Edit Profile Button */}
              <Button
                fullWidth
                variant="outlined"
                size="medium"
                startIcon={<Person />}
                onClick={() => navigate('/profile/body')}
                sx={{
                  mb: 1.5,
                  py: 1.2,
                  fontSize: '0.875rem',
                  fontWeight: '600',
                  color: '#9333ea',
                  borderColor: '#9333ea',
                  borderWidth: 1.5,
                  textTransform: 'none',
                  borderRadius: 2,
                  '&:hover': {
                    borderColor: '#7c3aed',
                    borderWidth: 1.5,
                    bgcolor: 'rgba(147, 51, 234, 0.08)',
                  },
                }}
              >
                Edit Profile
              </Button>

              {/* Create/Edit Avatar Button */}
              <Button
                fullWidth
                variant="contained"
                size="medium"
                onClick={() => navigate('/avatar/customize')}
                sx={{
                  mb: 1,
                  py: 1.2,
                  fontSize: '0.875rem',
                  fontWeight: '600',
                  bgcolor: (bodyProfile?.avatarModelUrl || authBodyProfile?.avatarModelUrl) ? '#7c3aed' : '#22c55e',
                  color: '#ffffff',
                  textTransform: 'none',
                  borderRadius: 2,
                  '&:hover': {
                    bgcolor: (bodyProfile?.avatarModelUrl || authBodyProfile?.avatarModelUrl) ? '#6d28d9' : '#16a34a',
                  },
                }}
              >
                {(bodyProfile?.avatarModelUrl || authBodyProfile?.avatarModelUrl) ? 'Customize Avatar' : 'Create Avatar'}
              </Button>

              {/* Refresh Avatar Button */}
              <Button
                fullWidth
                variant="outlined"
                size="small"
                onClick={async () => {
                  console.log('Manual avatar refresh requested...');
                  if (refreshBodyProfile) {
                    const updatedProfile = await refreshBodyProfile();
                    if (updatedProfile) {
                      setBodyProfile(updatedProfile);
                      console.log('Avatar refreshed:', updatedProfile.avatarModelUrl);
                    }
                  }
                }}
                sx={{
                  py: 0.8,
                  fontSize: '0.75rem',
                  fontWeight: '500',
                  color: '#9ca3af',
                  borderColor: '#333',
                  textTransform: 'none',
                  borderRadius: 1,
                  '&:hover': {
                    borderColor: '#666',
                    bgcolor: 'rgba(255,255,255,0.05)',
                  },
                }}
              >
                🔄 Refresh Avatar
              </Button>

              {bodyProfile && (
                <Typography variant="caption" color="text.secondary" sx={{ mt: 1.5, display: 'block', textAlign: 'center', fontSize: '0.7rem' }}>
                  Profile ID: {bodyProfile.id?.toString().substring(0, 8)}...
                </Typography>
              )}
            </CardContent>
          </Card>
        </Grid>

        {/* Center: Product Display */}
        <Grid item xs={12} lg={4}>
          {selectedProduct ? (
            <Card sx={{ 
              height: '100%',
              background: 'linear-gradient(135deg, #1a1a1a 0%, #2a2a2a 100%)',
              border: '2px solid #ffffff',
              borderRadius: 4,
              boxShadow: '0 20px 60px rgba(255,255,255,0.1)',
              transition: 'all 0.3s',
              overflow: 'hidden',
              mb: { xs: 2, lg: 0 }
            }}>
              <Box sx={{ 
                position: 'relative', 
                height: { xs: 300, sm: 400, md: 450 }, 
                background: 'radial-gradient(circle, #2a2a2a 0%, #0a0a0a 100%)', 
                overflow: 'hidden' 
              }}>
                {selectedProduct.model3dUrl ? (
                  <Box sx={{ 
                    height: '100%',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    background: 'radial-gradient(circle, #1a1a1a 0%, #000000 100%)'
                  }}>
                    <Model3DViewer 
                      key={`${selectedProduct.id}-${selectedColor}`}
                      ref={productViewerRef}
                      modelUrl={`http://localhost:8082${selectedProduct.model3dUrl}`}
                      height={450}
                      width="100%"
                      productColor={selectedColor || selectedProduct.color?.split(',')[0]?.trim() || 'White'}
                      productCategory={selectedProduct.category}
                      showColorPicker={true}
                      autoRotate={true}
                    />
                  </Box>
                ) : (
                  <CardMedia
                    component="img"
                    height="450"
                    image={selectedProduct.imageUrl || selectedProduct.image}
                    alt={selectedProduct.name}
                    sx={{ objectFit: 'contain', bgcolor: '#0a0a0a' }}
                  />
                )}
                <Chip 
                  label="SELECTED" 
                  sx={{ 
                    position: 'absolute', 
                    top: { xs: 10, sm: 20 }, 
                    right: { xs: 10, sm: 20 },
                    fontWeight: 'bold',
                    bgcolor: '#ffffff',
                    color: '#000000',
                    zIndex: 10,
                    fontSize: { xs: '0.7rem', sm: '0.9rem' },
                    px: { xs: 1.5, sm: 2 },
                    py: { xs: 2, sm: 2.5 }
                  }} 
                />
              </Box>
              <CardContent sx={{ p: { xs: 2, sm: 3, md: 4 } }}>
                <Typography variant="h4" gutterBottom fontWeight="bold" color="#ffffff" sx={{ fontSize: { xs: '1.5rem', sm: '2rem', md: '2.125rem' } }}>
                  {selectedProduct.name}
                </Typography>
                <Box sx={{ display: 'flex', gap: 1, mb: 3, flexWrap: 'wrap' }}>
                  <Chip 
                    label={selectedProduct.brand} 
                    size="medium" 
                    sx={{ 
                      bgcolor: 'rgba(255,255,255,0.1)',
                      color: '#ffffff',
                      border: '1px solid rgba(255,255,255,0.2)',
                      fontWeight: 'bold',
                      fontSize: { xs: '0.7rem', sm: '0.8125rem' }
                    }} 
                  />
                  {selectedProduct.material && (
                    <Chip 
                      label={selectedProduct.material} 
                      size="medium" 
                      sx={{ 
                        bgcolor: 'rgba(255,255,255,0.1)',
                        color: '#ffffff',
                        border: '1px solid rgba(255,255,255,0.2)',
                        fontSize: { xs: '0.7rem', sm: '0.8125rem' }
                      }} 
                    />
                  )}
                  {selectedProduct.color && (
                    <Chip 
                      label={selectedProduct.color} 
                      size="medium" 
                      sx={{ 
                        bgcolor: 'rgba(255,255,255,0.1)',
                        color: '#ffffff',
                        border: '1px solid rgba(255,255,255,0.2)',
                        fontSize: { xs: '0.7rem', sm: '0.8125rem' }
                      }} 
                    />
                  )}
                </Box>
                
                {/* Available Colors Section */}
                {selectedProduct.color && (
                  <Box sx={{ mb: 3 }}>
                    <Typography variant="subtitle2" color="#888" sx={{ mb: 1.5, fontSize: { xs: '0.8rem', sm: '0.875rem' } }}>
                      Available Colors
                    </Typography>
                    <Box sx={{ display: 'flex', gap: { xs: 1, sm: 1.5 }, flexWrap: 'wrap' }}>
                      {selectedProduct.color.split(',').map((color, index) => {
                        const trimmedColor = color.trim();
                        const isSelected = selectedColor === trimmedColor;
                        return (
                          <Box
                            key={index}
                            onClick={() => handleColorChange(trimmedColor)}
                            sx={{
                              display: 'flex',
                              flexDirection: 'column',
                              alignItems: 'center',
                              cursor: 'pointer',
                              transition: 'transform 0.2s',
                              '&:hover': {
                                transform: 'scale(1.05)',
                              }
                            }}
                          >
                            <Box
                              sx={{
                                width: { xs: 40, sm: 50 },
                                height: { xs: 40, sm: 50 },
                                bgcolor: trimmedColor.toLowerCase(),
                                borderRadius: 2,
                                border: isSelected ? '3px solid #ffffff' : '2px solid rgba(255,255,255,0.3)',
                                boxShadow: isSelected ? '0 4px 12px rgba(255,255,255,0.3)' : '0 2px 8px rgba(0,0,0,0.3)',
                                mb: 0.5
                              }}
                            />
                            <Typography 
                              variant="caption" 
                              color={isSelected ? '#ffffff' : '#888'}
                              fontWeight={isSelected ? 'bold' : 'normal'}
                              sx={{ fontSize: { xs: '0.65rem', sm: '0.75rem' } }}
                            >
                              {trimmedColor}
                            </Typography>
                          </Box>
                        );
                      })}
                    </Box>
                  </Box>
                )}
                
                <Typography variant="h3" sx={{ mb: 2, fontWeight: 'bold', color: '#ffffff', fontSize: { xs: '2rem', sm: '2.5rem', md: '3rem' } }}>
                  ${selectedProduct.price}
                </Typography>
                <Typography variant="body1" color="#b0b0b0" sx={{ lineHeight: 1.8, fontSize: { xs: '0.9rem', sm: '1rem' } }}>
                  {selectedProduct.description}
                </Typography>
              </CardContent>
            </Card>
          ) : (
            <Card sx={{ 
              height: '100%', 
              display: 'flex', 
              alignItems: 'center', 
              justifyContent: 'center',
              background: 'linear-gradient(135deg, #1a1a1a 0%, #2a2a2a 100%)',
              border: '1px solid rgba(255,255,255,0.1)',
              borderRadius: 4,
              mb: { xs: 2, lg: 0 }
            }}>
              <CardContent sx={{ textAlign: 'center', p: { xs: 3, sm: 4, md: 6 } }}>
                <Box sx={{ 
                  width: { xs: 80, sm: 100, md: 120 },
                  height: { xs: 80, sm: 100, md: 120 },
                  borderRadius: '50%',
                  bgcolor: 'rgba(255,255,255,0.05)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  margin: '0 auto',
                  mb: 3
                }}>
                  <Straighten sx={{ fontSize: { xs: 40, sm: 50, md: 60 }, color: '#666' }} />
                </Box>
                <Typography variant="h5" color="#ffffff" gutterBottom fontWeight="bold" sx={{ fontSize: { xs: '1.2rem', sm: '1.5rem' } }}>
                  Select a Product
                </Typography>
                <Typography variant="body2" color="#888" sx={{ fontSize: { xs: '0.8rem', sm: '0.875rem' } }}>
                  Choose from our collection below to see AI-powered recommendations
                </Typography>
              </CardContent>
            </Card>
          )}
        </Grid>

        {/* Right: AI Recommendations */}
        <Grid item xs={12} lg={4}>
          {bodyProfile && selectedProduct ? (
            <AIRecommendations
              bodyProfile={{
                ...bodyProfile,
                chestCm: measurements.chest,
                waistCm: measurements.waist,
                hipCm: measurements.hips,
                heightCm: measurements.height,
                shoulderWidthCm: measurements.shoulders,
              }}
              selectedProduct={selectedProduct}
            />
          ) : (
            <Card sx={{ 
              background: 'linear-gradient(135deg, #1a1a1a 0%, #2a2a2a 100%)',
              border: '1px solid rgba(255,255,255,0.1)',
              borderRadius: 4,
              height: '100%',
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              justifyContent: 'center',
              minHeight: { xs: '400px', md: '500px' }
            }}>
              <CardContent sx={{ p: { xs: 3, sm: 4 }, textAlign: 'center', width: '100%' }}>
                {/* Dancing GIF */}
                <Box
                  sx={{
                    width: { xs: '200px', sm: '250px' },
                    height: { xs: '200px', sm: '250px' },
                    margin: '0 auto',
                    mb: 3,
                    borderRadius: '50%',
                    overflow: 'hidden',
                    border: '3px solid rgba(255,255,255,0.2)',
                    boxShadow: '0 10px 40px rgba(0,0,0,0.5)',
                    animation: 'float 4s ease-in-out infinite',
                    '@keyframes float': {
                      '0%, 100%': { transform: 'translateY(0px)' },
                      '50%': { transform: 'translateY(-15px)' },
                    },
                  }}
                >
                  <img
                    src="/dance-animation.gif"
                    alt="Get AI Recommendations"
                    style={{
                      width: '100%',
                      height: '100%',
                      objectFit: 'cover',
                    }}
                    onError={(e) => {
                      e.target.style.display = 'none';
                      e.target.parentElement.innerHTML = '<div style="color: white; display: flex; align-items: center; justify-content: center; height: 100%; font-size: 60px;">🤖</div>';
                    }}
                  />
                </Box>

                <Typography variant="h5" color="#ffffff" gutterBottom fontWeight="bold" sx={{ mb: 2 }}>
                  {!bodyProfile
                    ? 'Get AI-Powered Recommendations'
                    : 'Select a Product'}
                </Typography>
                <Typography variant="body1" color="#888" sx={{ mb: 3, lineHeight: 1.6 }}>
                  {!bodyProfile
                    ? 'Save your profile to unlock personalized size recommendations with 84% accuracy'
                    : 'Choose a product from our collection to see AI-powered fit analysis'}
                </Typography>
                
                {!bodyProfile && (
                  <Box sx={{ 
                    display: 'flex', 
                    gap: 2, 
                    justifyContent: 'center',
                    flexWrap: 'wrap',
                    mt: 2
                  }}>
                    <Chip 
                      label="84% Accuracy" 
                      size="small" 
                      sx={{ 
                        bgcolor: 'rgba(255,255,255,0.1)', 
                        color: 'white',
                        border: '1px solid rgba(255,255,255,0.2)'
                      }} 
                    />
                    <Chip 
                      label="AI Powered" 
                      size="small" 
                      sx={{ 
                        bgcolor: 'rgba(255,255,255,0.1)', 
                        color: 'white',
                        border: '1px solid rgba(255,255,255,0.2)'
                      }} 
                    />
                    <Chip 
                      label="Smart Fit" 
                      size="small" 
                      sx={{ 
                        bgcolor: 'rgba(255,255,255,0.1)', 
                        color: 'white',
                        border: '1px solid rgba(255,255,255,0.2)'
                      }} 
                    />
                  </Box>
                )}
              </CardContent>
            </Card>
          )}
        </Grid>
      </Grid>

      {/* Products Grid */}
      <Box sx={{ mt: 6 }}>
        <Card sx={{ 
          background: 'linear-gradient(135deg, #1a1a1a 0%, #2a2a2a 100%)',
          border: '1px solid rgba(255,255,255,0.1)',
          borderRadius: 4,
          p: { xs: 2, sm: 3, md: 4 },
          boxShadow: '0 8px 32px rgba(0,0,0,0.3)'
        }}>
          <Box sx={{ 
            display: 'flex', 
            flexDirection: { xs: 'column', sm: 'row' },
            justifyContent: 'space-between', 
            alignItems: { xs: 'flex-start', sm: 'center' }, 
            mb: { xs: 3, sm: 4 },
            gap: { xs: 2, sm: 0 }
          }}>
            <Box>
              <Typography variant="h4" fontWeight="bold" color="#ffffff" sx={{ 
                mb: 1, 
                fontSize: { xs: '1.5rem', sm: '2rem', md: '2.125rem' },
                animation: 'fadeInLeft 0.8s ease-out',
                '@keyframes fadeInLeft': {
                  '0%': {
                    opacity: 0,
                    transform: 'translateX(-30px)',
                  },
                  '100%': {
                    opacity: 1,
                    transform: 'translateX(0)',
                  },
                },
              }}>
                Our Collection
              </Typography>
              <Typography variant="body2" color="#888" sx={{ fontSize: { xs: '0.8rem', sm: '0.875rem' } }}>
                {bodyProfile ? 'Sorted by best fit for you' : 'Browse our products'}
              </Typography>
            </Box>
            {bodyProfile && (
              <Chip 
                label="AI Sorted" 
                sx={{ 
                  bgcolor: 'rgba(255,255,255,0.1)',
                  color: '#ffffff',
                  fontWeight: 'bold',
                  px: { xs: 1.5, sm: 2 },
                  py: { xs: 2, sm: 2.5 },
                  fontSize: { xs: '0.7rem', sm: '0.8125rem' }
                }}
              />
            )}
          </Box>

          {/* Workflow Enforcement: Show steps required before trying on clothes */}
          {(!hasProfile || !hasAvatar) && (
            <Alert 
              severity="warning"
              sx={{ 
                mb: 4,
                bgcolor: 'rgba(255, 193, 7, 0.1)',
                border: '1px solid rgba(255, 193, 7, 0.3)',
                borderRadius: 3,
                p: 3
              }}
            >
              <Typography variant="h6" fontWeight="bold" color="#ffc107" sx={{ mb: 2 }}>
                <Lock sx={{ mr: 1, verticalAlign: 'middle' }} />
                Complete These Steps to Try On Clothes
              </Typography>
              
              <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
                {/* Step 1: Profile */}
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                  {hasProfile ? (
                    <CheckCircle sx={{ color: '#22c55e', fontSize: 32 }} />
                  ) : (
                    <Box sx={{ 
                      width: 32, 
                      height: 32, 
                      borderRadius: '50%', 
                      border: '2px solid #ffc107',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      color: '#ffc107',
                      fontWeight: 'bold'
                    }}>1</Box>
                  )}
                  <Box sx={{ flex: 1 }}>
                    <Typography variant="body1" fontWeight="bold" color={hasProfile ? '#22c55e' : '#ffc107'}>
                      {hasProfile ? '✓ Profile Created' : '1. Create Your Profile'}
                    </Typography>
                    <Typography variant="body2" color="#888">
                      {hasProfile ? 'Your measurements are saved' : 'Enter your measurements or upload a photo above'}
                    </Typography>
                  </Box>
                </Box>

                {/* Step 2: Avatar */}
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                  {hasAvatar ? (
                    <CheckCircle sx={{ color: '#22c55e', fontSize: 32 }} />
                  ) : (
                    <Box sx={{ 
                      width: 32, 
                      height: 32, 
                      borderRadius: '50%', 
                      border: '2px solid #ffc107',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      color: '#ffc107',
                      fontWeight: 'bold'
                    }}>2</Box>
                  )}
                  <Box sx={{ flex: 1 }}>
                    <Typography variant="body1" fontWeight="bold" color={hasAvatar ? '#22c55e' : '#ffc107'}>
                      {hasAvatar ? '✓ Avatar Created' : '2. Create Your Avatar'}
                    </Typography>
                    <Typography variant="body2" color="#888">
                      {hasAvatar ? 'Your 3D avatar is ready' : 'Customize your avatar appearance'}
                    </Typography>
                  </Box>
                  {hasProfile && !hasAvatar && (
                    <Button
                      variant="contained"
                      startIcon={<ArrowForward />}
                      onClick={() => navigate('/avatar/customize')}
                      sx={{
                        bgcolor: '#ffc107',
                        color: '#000',
                        fontWeight: 'bold',
                        '&:hover': {
                          bgcolor: '#ffb300'
                        }
                      }}
                    >
                      Create Avatar
                    </Button>
                  )}
                </Box>

                {/* Step 3: Try On */}
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                  {canTryOn ? (
                    <CheckCircle sx={{ color: '#22c55e', fontSize: 32 }} />
                  ) : (
                    <Box sx={{ 
                      width: 32, 
                      height: 32, 
                      borderRadius: '50%', 
                      border: '2px solid #888',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      color: '#888',
                      fontWeight: 'bold'
                    }}>3</Box>
                  )}
                  <Box sx={{ flex: 1 }}>
                    <Typography variant="body1" fontWeight="bold" color={canTryOn ? '#22c55e' : '#888'}>
                      {canTryOn ? '✓ Ready to Try On!' : '3. Try On Clothes'}
                    </Typography>
                    <Typography variant="body2" color="#888">
                      {canTryOn ? 'Select any product below' : 'Complete steps 1 & 2 first'}
                    </Typography>
                  </Box>
                </Box>
              </Box>
            </Alert>
          )}
          
          <Grid container spacing={{ xs: 1.5, sm: 2 }}>
            {products
              .sort((a, b) => {
                // Sort by fit score if available
                const fitA = productFitScores[a.id]?.fit_score || 0;
                const fitB = productFitScores[b.id]?.fit_score || 0;
                return fitB - fitA;
              })
              .slice((currentPage - 1) * productsPerPage, currentPage * productsPerPage)
              .map((product) => {
                const fitData = productFitScores[product.id];
                
                return (
              <Grid item xs={6} sm={6} md={4} lg={3} key={product.id}>
                <Card
                  sx={{
                    cursor: canTryOn ? 'pointer' : 'not-allowed',
                    transition: 'all 0.3s',
                    background: '#0a0a0a',
                    border: selectedProduct?.id === product.id ? '2px solid #ffffff' : '1px solid #333',
                    borderRadius: 2,
                    position: 'relative',
                    opacity: canTryOn ? 1 : 0.5,
                    filter: canTryOn ? 'none' : 'grayscale(100%)',
                    '&:hover': canTryOn ? {
                      transform: 'translateY(-8px)',
                      borderColor: '#ffffff',
                    } : {},
                  }}
                  onClick={() => canTryOn && handleSelectProduct(product)}
                >
                  {/* Lock overlay when workflow not complete */}
                  {!canTryOn && (
                    <Box sx={{
                      position: 'absolute',
                      top: 0,
                      left: 0,
                      right: 0,
                      bottom: 0,
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      bgcolor: 'rgba(0, 0, 0, 0.7)',
                      zIndex: 20,
                      borderRadius: 2
                    }}>
                      <Lock sx={{ fontSize: 48, color: '#ffc107' }} />
                    </Box>
                  )}
                  {/* Fit Badge Overlay */}
                  {fitData && (
                    <Box sx={{
                      position: 'absolute',
                      top: { xs: 4, sm: 8 },
                      left: { xs: 4, sm: 8 },
                      zIndex: 10
                    }}>
                      <FitBadge 
                        fitScore={fitData.fit_score} 
                        fitLevel={fitData.fit_level}
                        size="small"
                      />
                    </Box>
                  )}
                  
                  <Box sx={{ 
                    position: 'relative', 
                    height: { xs: 280, sm: 320, md: 380 }, 
                    background: 'radial-gradient(circle, #2a2a2a 0%, #0a0a0a 100%)'
                  }}>
                    {product.model3dUrl ? (
                      <Model3DViewer
                        modelUrl={`http://localhost:8082${product.model3dUrl}`}
                        height={380}
                        width="100%"
                        productColor={product.color?.split(',')[0]?.trim() || 'White'}
                        productCategory={product.category}
                        showColorPicker={false}
                        autoRotate={false}
                      />
                    ) : (
                      <CardMedia
                        component="img"
                        height="380"
                        image={product.imageUrl || product.image}
                        alt={product.name}
                        sx={{ objectFit: 'contain', bgcolor: '#000000' }}
                      />
                    )}
                    {selectedProduct?.id === product.id && (
                      <Box sx={{
                        position: 'absolute',
                        top: { xs: 4, sm: 8 },
                        right: { xs: 4, sm: 8 },
                        bgcolor: '#ffffff',
                        color: '#000000',
                        borderRadius: '50%',
                        width: { xs: 24, sm: 32 },
                        height: { xs: 24, sm: 32 },
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        fontWeight: 'bold',
                        zIndex: 10,
                        fontSize: { xs: '0.8rem', sm: '1rem' }
                      }}>
                        ✓
                      </Box>
                    )}
                  </Box>
                  <CardContent sx={{ p: { xs: 1.5, sm: 2 } }}>
                    <Typography variant="subtitle1" fontWeight="bold" noWrap color="#ffffff" sx={{ fontSize: { xs: '0.9rem', sm: '1rem' } }}>
                      {product.name}
                    </Typography>
                    <Typography variant="body2" color="#888" noWrap sx={{ fontSize: { xs: '0.75rem', sm: '0.875rem' } }}>
                      {product.brand}
                    </Typography>

                    {/* Color Swatches — auto-displayed from product.color field */}
                    <ColorSwatches colorStr={product.color} />
                    
                    {fitData && (
                      <Box sx={{ mt: 1, mb: 1 }}>
                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5, mb: 0.5, flexWrap: 'wrap' }}>
                          <Chip 
                            label={`Size ${fitData.recommended_size}`}
                            size="small"
                            sx={{
                              bgcolor: '#ffffff',
                              color: '#000000',
                              fontWeight: 'bold',
                              fontSize: { xs: '0.65rem', sm: '0.75rem' },
                              height: { xs: 20, sm: 24 }
                            }}
                          />
                          <Chip 
                            label={`${Math.round(fitData.fit_score)}% fit`}
                            size="small"
                            sx={{
                              bgcolor: '#333',
                              color: '#ffffff',
                              fontWeight: 'bold',
                              fontSize: { xs: '0.65rem', sm: '0.75rem' },
                              height: { xs: 20, sm: 24 }
                            }}
                          />
                        </Box>
                      </Box>
                    )}
                    
                    <Typography variant="h6" sx={{ mt: 1, fontWeight: 'bold', color: '#ffffff', fontSize: { xs: '1rem', sm: '1.25rem' } }}>
                      ${product.price}
                    </Typography>
                  </CardContent>
                </Card>
              </Grid>
            )})}
          </Grid>

          {/* Pagination Controls */}
          {products.length > productsPerPage && (
            <Box sx={{ display: 'flex', justifyContent: 'center', mt: 4, gap: 2 }}>
              <Button
                variant="outlined"
                disabled={currentPage === 1}
                onClick={() => setCurrentPage(prev => Math.max(1, prev - 1))}
                sx={{ color: '#fff', borderColor: '#333' }}
              >
                Previous Page
              </Button>
              <Typography sx={{ color: '#aaa', alignSelf: 'center' }}>
                Page {currentPage} of {Math.ceil(products.length / productsPerPage)}
              </Typography>
              <Button
                variant="outlined"
                disabled={currentPage === Math.ceil(products.length / productsPerPage)}
                onClick={() => setCurrentPage(prev => Math.min(Math.ceil(products.length / productsPerPage), prev + 1))}
                sx={{ color: '#fff', borderColor: '#333' }}
              >
                Next Page
              </Button>
            </Box>
          )}
        </Card>
      </Box>
    </Container>
    </Box>
  );
};

export default VirtualTryOnPageNew;

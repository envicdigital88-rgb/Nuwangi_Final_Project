import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import {
  Container, Grid, Typography, Box, Button, Card, CardContent,
  Chip, CircularProgress, Alert, Divider, Snackbar
} from '@mui/material';
import {
  ShoppingCart, Favorite, Share, CheckCircle, LocalShipping
} from '@mui/icons-material';
import axios from 'axios';
import { useCustomerAuth } from '../contexts/CustomerAuthContext';
import { useCart } from '../contexts/CartContext';
import Model3DViewer from '../components/Model3DViewer';

const ProductDetailPage = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { customer, bodyProfile } = useCustomerAuth();
  const { addToCart, isInCart } = useCart();
  
  const [product, setProduct] = useState(null);
  const [sizeRecommendation, setSizeRecommendation] = useState(null);
  const [loading, setLoading] = useState(true);
  const [loadingSize, setLoadingSize] = useState(false);
  const [error, setError] = useState('');
  const [selectedSize, setSelectedSize] = useState('');
  const [snackbar, setSnackbar] = useState({ open: false, message: '' });

  const sizes = ['XS', 'S', 'M', 'L', 'XL', 'XXL'];

  useEffect(() => {
    fetchProduct();
  }, [id]);

  useEffect(() => {
    if (product && customer && bodyProfile) {
      fetchSizeRecommendation();
    }
  }, [product, customer, bodyProfile]);

  const fetchProduct = async () => {
    try {
      const response = await axios.get(`http://localhost:8082/api/products/${id}`);
      setProduct(response.data);
    } catch (err) {
      setError('Failed to load product details');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const fetchSizeRecommendation = async () => {
    setLoadingSize(true);
    try {
      const response = await axios.post('http://localhost:8082/api/size-recommendation', {
        userId: customer.id,
        productId: id
      });
      setSizeRecommendation(response.data);
      setSelectedSize(response.data.recommendedSize);
    } catch (err) {
      console.error('Size recommendation failed:', err);
    } finally {
      setLoadingSize(false);
    }
  };

  const handleTryOn = () => {
    if (!customer) {
      navigate('/login');
      return;
    }
    navigate('/virtual-tryon', { state: { product } });
  };

  const handleAddToCart = () => {
    if (!selectedSize) {
      setSnackbar({ open: true, message: 'Please select a size first' });
      return;
    }

    addToCart(product, selectedSize, 1);
    setSnackbar({ open: true, message: `Added ${product.name} (${selectedSize}) to cart!` });
  };

  const handleBuyNow = () => {
    if (!selectedSize) {
      setSnackbar({ open: true, message: 'Please select a size first' });
      return;
    }

    addToCart(product, selectedSize, 1);
    navigate('/cart');
  };

  const handleCloseSnackbar = () => {
    setSnackbar({ ...snackbar, open: false });
  };

  if (loading) {
    return (
      <Box 
        display="flex" 
        justifyContent="center" 
        alignItems="center" 
        minHeight="60vh"
        sx={{ bgcolor: '#000000' }}
      >
        <CircularProgress size={60} sx={{ color: '#ffffff' }} />
      </Box>
    );
  }

  if (error || !product) {
    return (
      <Container maxWidth="lg" sx={{ py: 4, bgcolor: '#000000', minHeight: '100vh' }}>
        <Alert 
          severity="error"
          sx={{
            bgcolor: 'rgba(211, 47, 47, 0.1)',
            border: '1px solid rgba(211, 47, 47, 0.3)',
            color: '#ffffff',
            '& .MuiAlert-icon': {
              color: '#f44336'
            }
          }}
        >
          {error || 'Product not found'}
        </Alert>
      </Container>
    );
  }

  return (
    <Container maxWidth="lg" sx={{ py: 4, bgcolor: '#000000', minHeight: '100vh' }}>
      <Grid container spacing={4}>
        {/* 3D Model Viewer */}
        <Grid item xs={12} md={6}>
          <Card sx={{ 
            bgcolor: '#1a1a1a',
            border: '1px solid #333',
            borderRadius: 4,
            overflow: 'hidden'
          }}>
            <Box sx={{ 
              height: 500, 
              bgcolor: '#000',
              background: 'radial-gradient(circle, #1a1a1a 0%, #000000 100%)'
            }}>
              {product.model3dUrl ? (
                <Model3DViewer 
                  modelUrl={`http://localhost:8082${product.model3dUrl}`}
                  height={500}
                  width="100%"
                  productColor={product.color?.split(',')[0]?.trim() || 'White'}
                  productCategory={product.category}
                  showColorPicker={true}
                  autoRotate={true}
                />
              ) : (
                <Box display="flex" alignItems="center" justifyContent="center" height="100%">
                  <Typography sx={{ color: '#888' }}>No 3D model available</Typography>
                </Box>
              )}
            </Box>
          </Card>
        </Grid>

        {/* Product Details */}
        <Grid item xs={12} md={6}>
          <Box>
            <Typography variant="h4" fontWeight="bold" gutterBottom sx={{ 
              color: '#ffffff',
              animation: 'slideInRight 0.8s ease-out',
              '@keyframes slideInRight': {
                '0%': {
                  opacity: 0,
                  transform: 'translateX(50px)',
                },
                '100%': {
                  opacity: 1,
                  transform: 'translateX(0)',
                },
              },
            }}>
              {product.name}
            </Typography>
            
            <Typography variant="h5" fontWeight="bold" sx={{ mb: 2, color: '#ffffff' }}>
              ${product.price}
            </Typography>

            <Box sx={{ mb: 3 }}>
              <Chip 
                label={product.brand} 
                sx={{ 
                  mr: 1,
                  bgcolor: 'rgba(255,255,255,0.1)',
                  color: '#ffffff',
                  border: '1px solid rgba(255,255,255,0.2)'
                }} 
              />
              <Chip 
                label={product.material} 
                sx={{ 
                  mr: 1,
                  bgcolor: 'rgba(255,255,255,0.05)',
                  color: '#888',
                  border: '1px solid #333'
                }} 
              />
              <Chip 
                label={product.color} 
                sx={{ 
                  bgcolor: 'rgba(255,255,255,0.05)',
                  color: '#888',
                  border: '1px solid #333'
                }} 
              />
            </Box>

            <Typography variant="body1" paragraph sx={{ color: '#b0b0b0', lineHeight: 1.8 }}>
              {product.description}
            </Typography>

            <Divider sx={{ my: 3, bgcolor: '#333' }} />

            {/* Size Recommendation */}
            {customer && bodyProfile ? (
              <Card sx={{ 
                mb: 3, 
                bgcolor: 'rgba(33, 150, 243, 0.1)', 
                border: '1px solid rgba(33, 150, 243, 0.3)',
                borderRadius: 2
              }}>
                <CardContent>
                  <Typography variant="h6" gutterBottom sx={{ display: 'flex', alignItems: 'center', color: '#ffffff' }}>
                    <CheckCircle sx={{ mr: 1, color: '#4caf50' }} />
                    Size Recommendation
                  </Typography>
                  
                  {loadingSize ? (
                    <Box display="flex" alignItems="center" gap={2}>
                      <CircularProgress size={20} sx={{ color: '#ffffff' }} />
                      <Typography variant="body2" sx={{ color: '#b0b0b0' }}>Analyzing your measurements...</Typography>
                    </Box>
                  ) : sizeRecommendation ? (
                    <>
                      <Typography variant="h4" fontWeight="bold" sx={{ my: 1, color: '#ffffff' }}>
                        {sizeRecommendation.recommendedSize}
                      </Typography>
                      <Typography variant="body2" paragraph sx={{ color: '#b0b0b0' }}>
                        {sizeRecommendation.explanation}
                      </Typography>
                      <Typography variant="caption" sx={{ color: '#888' }}>
                        Confidence: {sizeRecommendation.confidence}
                      </Typography>
                      {sizeRecommendation.alternativeSizes && (
                        <Box sx={{ mt: 1 }}>
                          <Typography variant="caption" sx={{ color: '#888' }}>
                            Alternative sizes: {sizeRecommendation.alternativeSizes.join(', ')}
                          </Typography>
                        </Box>
                      )}
                    </>
                  ) : (
                    <Typography variant="body2" sx={{ color: '#b0b0b0' }}>
                      Create a body profile to get personalized size recommendations
                    </Typography>
                  )}
                </CardContent>
              </Card>
            ) : (
              <Alert 
                severity="info" 
                sx={{ 
                  mb: 3,
                  bgcolor: 'rgba(33, 150, 243, 0.1)',
                  border: '1px solid rgba(33, 150, 243, 0.3)',
                  color: '#ffffff',
                  '& .MuiAlert-icon': {
                    color: '#2196f3'
                  }
                }}
              >
                <Typography variant="body2">
                  {!customer ? 'Login to get personalized size recommendations' : 'Create your body profile to get size recommendations'}
                </Typography>
              </Alert>
            )}

            {/* Size Selection */}
            <Box sx={{ mb: 3 }}>
              <Typography variant="subtitle1" fontWeight="bold" gutterBottom sx={{ color: '#ffffff' }}>
                Select Size
              </Typography>
              <Box sx={{ display: 'flex', gap: 1, flexWrap: 'wrap' }}>
                {sizes.map((size) => (
                  <Button
                    key={size}
                    variant={selectedSize === size ? 'contained' : 'outlined'}
                    onClick={() => setSelectedSize(size)}
                    sx={{ 
                      minWidth: 60,
                      ...(selectedSize === size ? {
                        bgcolor: '#ffffff',
                        color: '#000000',
                        '&:hover': {
                          bgcolor: '#e0e0e0'
                        }
                      } : {
                        borderColor: '#666',
                        color: '#ffffff',
                        '&:hover': {
                          borderColor: '#ffffff',
                          bgcolor: 'rgba(255,255,255,0.05)'
                        }
                      })
                    }}
                  >
                    {size}
                  </Button>
                ))}
              </Box>
            </Box>

            {/* Action Buttons */}
            <Box sx={{ display: 'flex', gap: 2, mb: 3, flexDirection: { xs: 'column', sm: 'row' } }}>
              <Button
                variant="contained"
                size="large"
                fullWidth
                startIcon={<ShoppingCart />}
                disabled={!selectedSize}
                onClick={handleAddToCart}
                sx={{
                  bgcolor: '#ffffff',
                  color: '#000000',
                  fontWeight: 'bold',
                  '&:hover': {
                    bgcolor: '#e0e0e0'
                  },
                  '&:disabled': {
                    bgcolor: '#333',
                    color: '#666'
                  }
                }}
              >
                {isInCart(product.id, selectedSize) ? 'Added to Cart' : 'Add to Cart'}
              </Button>
              <Button
                variant="outlined"
                size="large"
                fullWidth
                onClick={handleBuyNow}
                disabled={!selectedSize}
                sx={{
                  borderColor: '#666',
                  color: '#ffffff',
                  fontWeight: 'bold',
                  '&:hover': {
                    borderColor: '#ffffff',
                    bgcolor: 'rgba(255,255,255,0.05)'
                  },
                  '&:disabled': {
                    borderColor: '#333',
                    color: '#666'
                  }
                }}
              >
                Buy Now
              </Button>
            </Box>

            <Box sx={{ display: 'flex', gap: 2, mb: 3 }}>
              <Button
                variant="outlined"
                size="medium"
                fullWidth
                onClick={handleTryOn}
                sx={{
                  borderColor: '#666',
                  color: '#ffffff',
                  fontWeight: 'bold',
                  '&:hover': {
                    borderColor: '#ffffff',
                    bgcolor: 'rgba(255,255,255,0.05)'
                  }
                }}
              >
                Virtual Try-On
              </Button>
            </Box>

            <Box sx={{ display: 'flex', gap: 2 }}>
              <Button 
                startIcon={<Favorite />} 
                variant="text"
                sx={{
                  color: '#888',
                  '&:hover': {
                    color: '#ffffff',
                    bgcolor: 'rgba(255,255,255,0.05)'
                  }
                }}
              >
                Add to Wishlist
              </Button>
              <Button 
                startIcon={<Share />} 
                variant="text"
                sx={{
                  color: '#888',
                  '&:hover': {
                    color: '#ffffff',
                    bgcolor: 'rgba(255,255,255,0.05)'
                  }
                }}
              >
                Share
              </Button>
            </Box>

            <Divider sx={{ my: 3, bgcolor: '#333' }} />

            {/* Product Info */}
            <Box>
              <Typography variant="subtitle2" gutterBottom sx={{ color: '#888' }}>
                <LocalShipping sx={{ fontSize: 16, mr: 0.5, verticalAlign: 'middle' }} />
                Free shipping on orders over $50
              </Typography>
              <Typography variant="subtitle2" gutterBottom sx={{ color: '#888' }}>
                SKU: {product.sku}
              </Typography>
              <Typography variant="subtitle2" sx={{ color: '#888' }}>
                Barcode: {product.barcode}
              </Typography>
            </Box>
          </Box>
        </Grid>
      </Grid>

      {/* Snackbar for notifications */}
      <Snackbar
        open={snackbar.open}
        autoHideDuration={3000}
        onClose={handleCloseSnackbar}
        message={snackbar.message}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'center' }}
        ContentProps={{
          sx: {
            bgcolor: '#ffffff',
            color: '#000000',
            fontWeight: 'bold',
          }
        }}
      />
    </Container>
  );
};

export default ProductDetailPage;

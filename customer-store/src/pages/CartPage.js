import React, { useState } from 'react';
import {
  Container,
  Typography,
  Box,
  Grid,
  Card,
  CardContent,
  CardMedia,
  Button,
  IconButton,
  TextField,
  Divider,
  Chip,
  Alert,
  Paper,
} from '@mui/material';
import {
  Delete,
  Add,
  Remove,
  ShoppingBag,
  ArrowBack,
  LocalShipping,
  Security,
  CheckCircle,
} from '@mui/icons-material';
import { useNavigate } from 'react-router-dom';
import { useCart } from '../contexts/CartContext';
import Model3DViewer from '../components/Model3DViewer';

const CartPage = () => {
  const navigate = useNavigate();
  const { cartItems, removeFromCart, updateQuantity, getCartTotal, clearCart } = useCart();
  const [promoCode, setPromoCode] = useState('');
  const [discount, setDiscount] = useState(0);

  const subtotal = getCartTotal();
  const shipping = subtotal > 50 ? 0 : 10;
  const tax = subtotal * 0.1; // 10% tax
  const total = subtotal + shipping + tax - discount;

  const handleQuantityChange = (productId, size, newQuantity) => {
    if (newQuantity < 1) return;
    updateQuantity(productId, size, newQuantity);
  };

  const handleApplyPromo = () => {
    if (promoCode.toUpperCase() === 'SAVE10') {
      setDiscount(subtotal * 0.1);
    } else if (promoCode.toUpperCase() === 'SAVE20') {
      setDiscount(subtotal * 0.2);
    } else {
      alert('Invalid promo code');
    }
  };

  const handleCheckout = () => {
    navigate('/checkout');
  };

  if (cartItems.length === 0) {
    return (
      <Box sx={{ bgcolor: '#000000', minHeight: '100vh', py: 8 }}>
        <Container maxWidth="md">
          <Card sx={{ 
            textAlign: 'center', 
            p: 6,
            bgcolor: '#1a1a1a',
            border: '1px solid #333',
          }}>
            <ShoppingBag sx={{ fontSize: 80, color: '#666', mb: 3 }} />
            <Typography variant="h4" gutterBottom sx={{ color: '#ffffff', fontWeight: 'bold' }}>
              Your Cart is Empty
            </Typography>
            <Typography variant="body1" sx={{ mb: 4, color: '#888' }}>
              Looks like you haven't added any items to your cart yet
            </Typography>
            <Button
              variant="contained"
              size="large"
              onClick={() => navigate('/products')}
              sx={{
                bgcolor: '#ffffff',
                color: '#000000',
                fontWeight: 'bold',
                px: 4,
                '&:hover': {
                  bgcolor: '#e0e0e0',
                }
              }}
            >
              Continue Shopping
            </Button>
          </Card>
        </Container>
      </Box>
    );
  }

  return (
    <Box sx={{ bgcolor: '#000000', minHeight: '100vh', py: 4 }}>
      <Container maxWidth="xl">
        {/* Header */}
        <Box sx={{ mb: 4 }}>
          <Button
            startIcon={<ArrowBack />}
            onClick={() => navigate('/products')}
            sx={{
              color: '#888',
              mb: 2,
              '&:hover': {
                color: '#ffffff',
                bgcolor: 'rgba(255,255,255,0.05)',
              }
            }}
          >
            Continue Shopping
          </Button>
          <Typography 
            variant="h3" 
            gutterBottom 
            sx={{ 
              color: '#ffffff', 
              fontWeight: 'bold',
              animation: 'fadeInUp 0.8s ease-out',
              '@keyframes fadeInUp': {
                '0%': {
                  opacity: 0,
                  transform: 'translateY(20px)',
                },
                '100%': {
                  opacity: 1,
                  transform: 'translateY(0)',
                },
              },
            }}
          >
            Shopping Cart
          </Typography>
          <Typography variant="body1" sx={{ color: '#888' }}>
            {cartItems.length} {cartItems.length === 1 ? 'item' : 'items'} in your cart
          </Typography>
        </Box>

        <Grid container spacing={3}>
          {/* Cart Items */}
          <Grid item xs={12} lg={8}>
            <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
              {cartItems.map((item) => (
                <Card
                  key={`${item.id}-${item.selectedSize}`}
                  sx={{
                    bgcolor: '#1a1a1a',
                    border: '1px solid #333',
                    transition: 'all 0.3s',
                    '&:hover': {
                      borderColor: '#666',
                    }
                  }}
                >
                  <CardContent sx={{ p: { xs: 2, sm: 3 } }}>
                    <Grid container spacing={2}>
                      {/* Product Image/3D Model */}
                      <Grid item xs={12} sm={4} md={3}>
                        <Box
                          sx={{
                            height: 200,
                            borderRadius: 2,
                            overflow: 'hidden',
                            bgcolor: '#000',
                            cursor: 'pointer',
                          }}
                          onClick={() => navigate(`/products/${item.id}`)}
                        >
                          {item.model3dUrl ? (
                            <Model3DViewer
                              modelUrl={`http://localhost:8082${item.model3dUrl}`}
                              height={200}
                              width="100%"
                              productColor={item.color?.split(',')[0]?.trim() || 'White'}
                              showColorPicker={false}
                              autoRotate={false}
                            />
                          ) : (
                            <CardMedia
                              component="img"
                              height="200"
                              image={item.imageUrl || item.image}
                              alt={item.name}
                              sx={{ objectFit: 'contain' }}
                            />
                          )}
                        </Box>
                      </Grid>

                      {/* Product Details */}
                      <Grid item xs={12} sm={8} md={9}>
                        <Box sx={{ display: 'flex', flexDirection: 'column', height: '100%' }}>
                          <Box sx={{ flex: 1 }}>
                            <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1 }}>
                              <Typography
                                variant="h6"
                                sx={{
                                  color: '#ffffff',
                                  fontWeight: 'bold',
                                  cursor: 'pointer',
                                  '&:hover': {
                                    color: '#e0e0e0',
                                  }
                                }}
                                onClick={() => navigate(`/products/${item.id}`)}
                              >
                                {item.name}
                              </Typography>
                              <IconButton
                                onClick={() => removeFromCart(item.id, item.selectedSize)}
                                sx={{
                                  color: '#ff6b6b',
                                  '&:hover': {
                                    bgcolor: 'rgba(255,107,107,0.1)',
                                  }
                                }}
                              >
                                <Delete />
                              </IconButton>
                            </Box>

                            <Typography variant="body2" sx={{ color: '#888', mb: 1 }}>
                              {item.brand}
                            </Typography>

                            <Box sx={{ display: 'flex', gap: 1, mb: 2, flexWrap: 'wrap' }}>
                              <Chip
                                label={`Size: ${item.selectedSize}`}
                                size="small"
                                sx={{
                                  bgcolor: 'rgba(255,255,255,0.1)',
                                  color: '#ffffff',
                                  fontWeight: 'bold',
                                }}
                              />
                              {item.color && (
                                <Chip
                                  label={item.color.split(',')[0]?.trim()}
                                  size="small"
                                  sx={{
                                    bgcolor: 'rgba(255,255,255,0.05)',
                                    color: '#888',
                                  }}
                                />
                              )}
                            </Box>
                          </Box>

                          {/* Quantity and Price */}
                          <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                              <IconButton
                                size="small"
                                onClick={() => handleQuantityChange(item.id, item.selectedSize, item.quantity - 1)}
                                disabled={item.quantity <= 1}
                                sx={{
                                  bgcolor: 'rgba(255,255,255,0.1)',
                                  color: '#ffffff',
                                  '&:hover': {
                                    bgcolor: 'rgba(255,255,255,0.2)',
                                  },
                                  '&:disabled': {
                                    bgcolor: 'rgba(255,255,255,0.05)',
                                    color: '#666',
                                  }
                                }}
                              >
                                <Remove fontSize="small" />
                              </IconButton>
                              <Typography
                                sx={{
                                  minWidth: 40,
                                  textAlign: 'center',
                                  color: '#ffffff',
                                  fontWeight: 'bold',
                                }}
                              >
                                {item.quantity}
                              </Typography>
                              <IconButton
                                size="small"
                                onClick={() => handleQuantityChange(item.id, item.selectedSize, item.quantity + 1)}
                                sx={{
                                  bgcolor: 'rgba(255,255,255,0.1)',
                                  color: '#ffffff',
                                  '&:hover': {
                                    bgcolor: 'rgba(255,255,255,0.2)',
                                  }
                                }}
                              >
                                <Add fontSize="small" />
                              </IconButton>
                            </Box>

                            <Typography variant="h6" sx={{ color: '#ffffff', fontWeight: 'bold' }}>
                              ${(item.price * item.quantity).toFixed(2)}
                            </Typography>
                          </Box>
                        </Box>
                      </Grid>
                    </Grid>
                  </CardContent>
                </Card>
              ))}

              {/* Clear Cart Button */}
              <Button
                variant="outlined"
                color="error"
                onClick={clearCart}
                sx={{
                  alignSelf: 'flex-start',
                  borderColor: '#ff6b6b',
                  color: '#ff6b6b',
                  '&:hover': {
                    borderColor: '#ff5252',
                    bgcolor: 'rgba(255,107,107,0.1)',
                  }
                }}
              >
                Clear Cart
              </Button>
            </Box>
          </Grid>

          {/* Order Summary */}
          <Grid item xs={12} lg={4}>
            <Box sx={{ position: { lg: 'sticky' }, top: 20 }}>
              <Card sx={{ bgcolor: '#1a1a1a', border: '1px solid #333', mb: 2 }}>
                <CardContent sx={{ p: 3 }}>
                  <Typography variant="h5" gutterBottom sx={{ color: '#ffffff', fontWeight: 'bold', mb: 3 }}>
                    Order Summary
                  </Typography>

                  <Box sx={{ mb: 3 }}>
                    <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 2 }}>
                      <Typography sx={{ color: '#888' }}>Subtotal</Typography>
                      <Typography sx={{ color: '#ffffff', fontWeight: 'bold' }}>
                        ${subtotal.toFixed(2)}
                      </Typography>
                    </Box>
                    <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 2 }}>
                      <Typography sx={{ color: '#888' }}>Shipping</Typography>
                      <Typography sx={{ color: shipping === 0 ? '#4caf50' : '#ffffff', fontWeight: 'bold' }}>
                        {shipping === 0 ? 'FREE' : `$${shipping.toFixed(2)}`}
                      </Typography>
                    </Box>
                    <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 2 }}>
                      <Typography sx={{ color: '#888' }}>Tax (10%)</Typography>
                      <Typography sx={{ color: '#ffffff', fontWeight: 'bold' }}>
                        ${tax.toFixed(2)}
                      </Typography>
                    </Box>
                    {discount > 0 && (
                      <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 2 }}>
                        <Typography sx={{ color: '#4caf50' }}>Discount</Typography>
                        <Typography sx={{ color: '#4caf50', fontWeight: 'bold' }}>
                          -${discount.toFixed(2)}
                        </Typography>
                      </Box>
                    )}
                  </Box>

                  <Divider sx={{ bgcolor: '#333', mb: 3 }} />

                  <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 3 }}>
                    <Typography variant="h6" sx={{ color: '#ffffff', fontWeight: 'bold' }}>
                      Total
                    </Typography>
                    <Typography variant="h5" sx={{ color: '#ffffff', fontWeight: 'bold' }}>
                      ${total.toFixed(2)}
                    </Typography>
                  </Box>

                  {/* Promo Code */}
                  <Box sx={{ mb: 3 }}>
                    <Typography variant="body2" sx={{ color: '#888', mb: 1 }}>
                      Have a promo code?
                    </Typography>
                    <Box sx={{ display: 'flex', gap: 1 }}>
                      <TextField
                        size="small"
                        placeholder="Enter code"
                        value={promoCode}
                        onChange={(e) => setPromoCode(e.target.value)}
                        sx={{
                          flex: 1,
                          '& .MuiOutlinedInput-root': {
                            color: '#ffffff',
                            '& fieldset': {
                              borderColor: '#333',
                            },
                            '&:hover fieldset': {
                              borderColor: '#666',
                            },
                          },
                        }}
                      />
                      <Button
                        variant="outlined"
                        onClick={handleApplyPromo}
                        sx={{
                          borderColor: '#666',
                          color: '#ffffff',
                          '&:hover': {
                            borderColor: '#ffffff',
                            bgcolor: 'rgba(255,255,255,0.05)',
                          }
                        }}
                      >
                        Apply
                      </Button>
                    </Box>
                    <Typography variant="caption" sx={{ color: '#666', mt: 0.5, display: 'block' }}>
                      Try: SAVE10 or SAVE20
                    </Typography>
                  </Box>

                  <Button
                    variant="contained"
                    size="large"
                    fullWidth
                    onClick={handleCheckout}
                    sx={{
                      bgcolor: '#ffffff',
                      color: '#000000',
                      fontWeight: 'bold',
                      py: 1.5,
                      fontSize: '1.1rem',
                      '&:hover': {
                        bgcolor: '#e0e0e0',
                      }
                    }}
                  >
                    Proceed to Checkout
                  </Button>
                </CardContent>
              </Card>

              {/* Benefits */}
              <Paper sx={{ bgcolor: '#1a1a1a', border: '1px solid #333', p: 2 }}>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 2 }}>
                  <LocalShipping sx={{ color: '#4caf50' }} />
                  <Typography variant="body2" sx={{ color: '#ffffff' }}>
                    Free shipping on orders over $50
                  </Typography>
                </Box>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 2 }}>
                  <Security sx={{ color: '#4caf50' }} />
                  <Typography variant="body2" sx={{ color: '#ffffff' }}>
                    Secure checkout with encryption
                  </Typography>
                </Box>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                  <CheckCircle sx={{ color: '#4caf50' }} />
                  <Typography variant="body2" sx={{ color: '#ffffff' }}>
                    30-day return policy
                  </Typography>
                </Box>
              </Paper>
            </Box>
          </Grid>
        </Grid>
      </Container>
    </Box>
  );
};

export default CartPage;
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

const CartPageNew = () => {
  const navigate = useNavigate();
  const { cartItems, removeFromCart, updateQuantity, getCartTotal, clearCart } = useCart();
  const [promoCode, setPromoCode] = useState('');
  const [discount, setDiscount] = useState(0);

  const subtotal = getCartTotal();
  const shipping = subtotal > 50 ? 0 : 10;
  const tax = subtotal * 0.1;
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
            border: '2px solid #333',
            borderRadius: 3,
          }}>
            <ShoppingBag sx={{ fontSize: 100, color: '#666', mb: 3 }} />
            <Typography variant="h3" gutterBottom sx={{ color: '#ffffff', fontWeight: 'bold' }}>
              Your Cart is Empty
            </Typography>
            <Typography variant="h6" sx={{ mb: 4, color: '#888' }}>
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
                px: 5,
                py: 1.5,
                fontSize: '1.1rem',
                '&:hover': {
                  bgcolor: '#e0e0e0',
                }
              }}
            >
              Start Shopping
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
        <Box sx={{ mb: 5 }}>
          <Button
            startIcon={<ArrowBack />}
            onClick={() => navigate('/products')}
            sx={{
              color: '#ffffff',
              mb: 3,
              fontSize: '1rem',
              fontWeight: 600,
              '&:hover': {
                bgcolor: 'rgba(255,255,255,0.1)',
              }
            }}
          >
            Continue Shopping
          </Button>
          <Typography 
            variant="h2" 
            gutterBottom 
            sx={{ 
              color: '#ffffff', 
              fontWeight: 'bold',
              mb: 1,
              fontSize: { xs: '2rem', md: '3rem' }
            }}
          >
            Shopping Cart
          </Typography>
          <Typography variant="h6" sx={{ color: '#888' }}>
            {cartItems.length} {cartItems.length === 1 ? 'item' : 'items'}
          </Typography>
        </Box>

        <Grid container spacing={4}>
          {/* Cart Items */}
          <Grid item xs={12} lg={8}>
            <Box sx={{ display: 'flex', flexDirection: 'column', gap: 3 }}>
              {cartItems.map((item) => (
                <Card
                  key={`${item.id}-${item.selectedSize}`}
                  sx={{
                    bgcolor: '#1a1a1a',
                    border: '2px solid #333',
                    borderRadius: 3,
                    transition: 'all 0.3s',
                    '&:hover': {
                      borderColor: '#666',
                      boxShadow: '0 8px 24px rgba(255,255,255,0.1)',
                    }
                  }}
                >
                  <CardContent sx={{ p: { xs: 2, sm: 3 } }}>
                    <Grid container spacing={3} alignItems="center">
                      {/* Product Image */}
                      <Grid item xs={12} sm={3}>
                        <Box
                          sx={{
                            height: 150,
                            borderRadius: 2,
                            overflow: 'hidden',
                            bgcolor: '#000',
                            border: '1px solid #333',
                            cursor: 'pointer',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            transition: 'transform 0.3s',
                            '&:hover': {
                              transform: 'scale(1.05)',
                            }
                          }}
                          onClick={() => navigate(`/products/${item.id}`)}
                        >
                          <CardMedia
                            component="img"
                            image={item.imageUrl || item.image || 'https://via.placeholder.com/150'}
                            alt={item.name}
                            sx={{ 
                              height: '100%',
                              width: '100%',
                              objectFit: 'contain',
                              p: 1
                            }}
                          />
                        </Box>
                      </Grid>

                      {/* Product Details */}
                      <Grid item xs={12} sm={9}>
                        <Box>
                          {/* Header */}
                          <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', mb: 2 }}>
                            <Box sx={{ flex: 1 }}>
                              <Typography
                                variant="h5"
                                sx={{
                                  color: '#ffffff',
                                  fontWeight: 'bold',
                                  mb: 0.5,
                                  cursor: 'pointer',
                                  '&:hover': {
                                    color: '#e0e0e0',
                                  }
                                }}
                                onClick={() => navigate(`/products/${item.id}`)}
                              >
                                {item.name}
                              </Typography>
                              <Typography variant="body1" sx={{ color: '#888' }}>
                                {item.brand}
                              </Typography>
                            </Box>
                            <IconButton
                              onClick={() => removeFromCart(item.id, item.selectedSize)}
                              sx={{
                                color: '#ff6b6b',
                                bgcolor: 'rgba(255,107,107,0.1)',
                                '&:hover': {
                                  bgcolor: 'rgba(255,107,107,0.2)',
                                }
                              }}
                            >
                              <Delete />
                            </IconButton>
                          </Box>

                          {/* Size and Color */}
                          <Box sx={{ display: 'flex', gap: 1.5, mb: 3 }}>
                            <Chip
                              label={`Size: ${item.selectedSize}`}
                              sx={{
                                bgcolor: '#ffffff',
                                color: '#000000',
                                fontWeight: 'bold',
                                fontSize: '0.9rem',
                              }}
                            />
                            {item.color && (
                              <Chip
                                label={item.color.split(',')[0]?.trim()}
                                sx={{
                                  bgcolor: 'rgba(255,255,255,0.1)',
                                  color: '#ffffff',
                                  border: '1px solid #333',
                                  fontSize: '0.9rem',
                                }}
                              />
                            )}
                          </Box>

                          {/* Quantity and Price */}
                          <Box sx={{ 
                            display: 'flex', 
                            justifyContent: 'space-between', 
                            alignItems: 'center',
                            flexWrap: 'wrap',
                            gap: 2
                          }}>
                            {/* Quantity */}
                            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                              <Typography variant="body2" sx={{ color: '#888', fontWeight: 600, mr: 1 }}>
                                Qty:
                              </Typography>
                              <IconButton
                                size="small"
                                onClick={() => handleQuantityChange(item.id, item.selectedSize, item.quantity - 1)}
                                disabled={item.quantity <= 1}
                                sx={{
                                  bgcolor: '#ffffff',
                                  color: '#000000',
                                  width: 32,
                                  height: 32,
                                  '&:hover': {
                                    bgcolor: '#e0e0e0',
                                  },
                                  '&:disabled': {
                                    bgcolor: '#333',
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
                                  fontSize: '1.1rem',
                                }}
                              >
                                {item.quantity}
                              </Typography>
                              <IconButton
                                size="small"
                                onClick={() => handleQuantityChange(item.id, item.selectedSize, item.quantity + 1)}
                                sx={{
                                  bgcolor: '#ffffff',
                                  color: '#000000',
                                  width: 32,
                                  height: 32,
                                  '&:hover': {
                                    bgcolor: '#e0e0e0',
                                  }
                                }}
                              >
                                <Add fontSize="small" />
                              </IconButton>
                            </Box>

                            {/* Price */}
                            <Box sx={{ textAlign: 'right' }}>
                              <Typography variant="caption" sx={{ color: '#888', display: 'block' }}>
                                ${item.price.toFixed(2)} each
                              </Typography>
                              <Typography variant="h4" sx={{ color: '#ffffff', fontWeight: 'bold' }}>
                                ${(item.price * item.quantity).toFixed(2)}
                              </Typography>
                            </Box>
                          </Box>
                        </Box>
                      </Grid>
                    </Grid>
                  </CardContent>
                </Card>
              ))}

              {/* Clear Cart */}
              <Button
                variant="outlined"
                startIcon={<Delete />}
                onClick={clearCart}
                sx={{
                  alignSelf: 'flex-start',
                  borderColor: '#ff6b6b',
                  color: '#ff6b6b',
                  fontWeight: 'bold',
                  px: 3,
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
              <Card sx={{ 
                bgcolor: '#1a1a1a', 
                border: '2px solid #333', 
                borderRadius: 3,
                mb: 3 
              }}>
                <CardContent sx={{ p: 4 }}>
                  <Typography variant="h4" gutterBottom sx={{ color: '#ffffff', fontWeight: 'bold', mb: 4 }}>
                    Order Summary
                  </Typography>

                  <Box sx={{ mb: 4 }}>
                    <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 2.5 }}>
                      <Typography variant="h6" sx={{ color: '#888' }}>Subtotal</Typography>
                      <Typography variant="h6" sx={{ color: '#ffffff', fontWeight: 'bold' }}>
                        ${subtotal.toFixed(2)}
                      </Typography>
                    </Box>
                    <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 2.5 }}>
                      <Typography variant="h6" sx={{ color: '#888' }}>Shipping</Typography>
                      <Typography variant="h6" sx={{ color: shipping === 0 ? '#4caf50' : '#ffffff', fontWeight: 'bold' }}>
                        {shipping === 0 ? 'FREE' : `$${shipping.toFixed(2)}`}
                      </Typography>
                    </Box>
                    <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 2.5 }}>
                      <Typography variant="h6" sx={{ color: '#888' }}>Tax</Typography>
                      <Typography variant="h6" sx={{ color: '#ffffff', fontWeight: 'bold' }}>
                        ${tax.toFixed(2)}
                      </Typography>
                    </Box>
                    {discount > 0 && (
                      <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 2.5 }}>
                        <Typography variant="h6" sx={{ color: '#4caf50' }}>Discount</Typography>
                        <Typography variant="h6" sx={{ color: '#4caf50', fontWeight: 'bold' }}>
                          -${discount.toFixed(2)}
                        </Typography>
                      </Box>
                    )}
                  </Box>

                  <Divider sx={{ bgcolor: '#333', mb: 4 }} />

                  <Box sx={{ 
                    display: 'flex', 
                    justifyContent: 'space-between', 
                    mb: 4,
                    p: 2,
                    bgcolor: 'rgba(255,255,255,0.05)',
                    borderRadius: 2
                  }}>
                    <Typography variant="h5" sx={{ color: '#ffffff', fontWeight: 'bold' }}>
                      Total
                    </Typography>
                    <Typography variant="h3" sx={{ color: '#ffffff', fontWeight: 'bold' }}>
                      ${total.toFixed(2)}
                    </Typography>
                  </Box>

                  {/* Promo Code */}
                  <Box sx={{ mb: 4 }}>
                    <Typography variant="body1" sx={{ color: '#ffffff', mb: 2, fontWeight: 600 }}>
                      Promo Code
                    </Typography>
                    <Box sx={{ display: 'flex', gap: 1 }}>
                      <TextField
                        size="small"
                        placeholder="Enter code"
                        value={promoCode}
                        onChange={(e) => setPromoCode(e.target.value)}
                        fullWidth
                        sx={{
                          '& .MuiOutlinedInput-root': {
                            color: '#ffffff',
                            bgcolor: 'rgba(255,255,255,0.05)',
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
                        variant="contained"
                        onClick={handleApplyPromo}
                        sx={{
                          bgcolor: '#ffffff',
                          color: '#000000',
                          fontWeight: 'bold',
                          px: 3,
                          '&:hover': {
                            bgcolor: '#e0e0e0',
                          }
                        }}
                      >
                        Apply
                      </Button>
                    </Box>
                    <Typography variant="caption" sx={{ color: '#666', mt: 1, display: 'block' }}>
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
                      py: 2,
                      fontSize: '1.2rem',
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
              <Paper sx={{ 
                bgcolor: '#1a1a1a', 
                border: '2px solid #333', 
                borderRadius: 3,
                p: 3 
              }}>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mb: 2.5 }}>
                  <LocalShipping sx={{ color: '#4caf50', fontSize: 32 }} />
                  <Box>
                    <Typography variant="body1" sx={{ color: '#ffffff', fontWeight: 'bold' }}>
                      Free Shipping
                    </Typography>
                    <Typography variant="body2" sx={{ color: '#888' }}>
                      On orders over $50
                    </Typography>
                  </Box>
                </Box>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mb: 2.5 }}>
                  <Security sx={{ color: '#4caf50', fontSize: 32 }} />
                  <Box>
                    <Typography variant="body1" sx={{ color: '#ffffff', fontWeight: 'bold' }}>
                      Secure Payment
                    </Typography>
                    <Typography variant="body2" sx={{ color: '#888' }}>
                      SSL encrypted
                    </Typography>
                  </Box>
                </Box>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                  <CheckCircle sx={{ color: '#4caf50', fontSize: 32 }} />
                  <Box>
                    <Typography variant="body1" sx={{ color: '#ffffff', fontWeight: 'bold' }}>
                      Easy Returns
                    </Typography>
                    <Typography variant="body2" sx={{ color: '#888' }}>
                      30-day policy
                    </Typography>
                  </Box>
                </Box>
              </Paper>
            </Box>
          </Grid>
        </Grid>
      </Container>
    </Box>
  );
};

export default CartPageNew;
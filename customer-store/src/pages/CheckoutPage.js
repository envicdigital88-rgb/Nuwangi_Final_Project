import React, { useState } from 'react';
import {
  Container,
  Typography,
  Box,
  Grid,
  Card,
  CardContent,
  TextField,
  Button,
  Stepper,
  Step,
  StepLabel,
  Radio,
  RadioGroup,
  FormControlLabel,
  FormControl,
  FormLabel,
  Divider,
  Alert,
  CircularProgress,
  Dialog,
  DialogContent,
  DialogTitle,
  List,
  ListItem,
  ListItemText,
} from '@mui/material';
import {
  CheckCircle,
  CreditCard,
  LocalShipping,
  Email,
  Phone,
  Home,
  Person,
} from '@mui/icons-material';
import { useNavigate } from 'react-router-dom';
import { useCart } from '../contexts/CartContext';
import { useCustomerAuth } from '../contexts/CustomerAuthContext';
import axios from 'axios';

const CheckoutPage = () => {
  const navigate = useNavigate();
  const { cartItems, getCartTotal, clearCart } = useCart();
  const { customer } = useCustomerAuth();
  
  const [activeStep, setActiveStep] = useState(0);
  const [loading, setLoading] = useState(false);
  const [orderSuccess, setOrderSuccess] = useState(false);
  const [orderId, setOrderId] = useState('');

  // Form data
  const [shippingInfo, setShippingInfo] = useState({
    firstName: customer?.firstName || '',
    lastName: customer?.lastName || '',
    email: customer?.email || '',
    phone: '',
    address: '',
    city: '',
    state: '',
    zipCode: '',
    country: 'USA',
  });

  const [paymentInfo, setPaymentInfo] = useState({
    cardNumber: '',
    cardName: '',
    expiryDate: '',
    cvv: '',
    paymentMethod: 'card',
  });

  const steps = ['Shipping Information', 'Payment Method', 'Review Order'];

  const subtotal = getCartTotal();
  const shipping = subtotal > 50 ? 0 : 10;
  const tax = subtotal * 0.1;
  const total = subtotal + shipping + tax;

  const handleShippingChange = (e) => {
    setShippingInfo({
      ...shippingInfo,
      [e.target.name]: e.target.value,
    });
  };

  const handlePaymentChange = (e) => {
    setPaymentInfo({
      ...paymentInfo,
      [e.target.name]: e.target.value,
    });
  };

  const validateShipping = () => {
    return (
      shippingInfo.firstName &&
      shippingInfo.lastName &&
      shippingInfo.email &&
      shippingInfo.phone &&
      shippingInfo.address &&
      shippingInfo.city &&
      shippingInfo.state &&
      shippingInfo.zipCode
    );
  };

  const validatePayment = () => {
    if (paymentInfo.paymentMethod === 'cod') return true;
    return (
      paymentInfo.cardNumber &&
      paymentInfo.cardName &&
      paymentInfo.expiryDate &&
      paymentInfo.cvv
    );
  };

  const handleNext = () => {
    if (activeStep === 0 && !validateShipping()) {
      alert('Please fill in all shipping information');
      return;
    }
    if (activeStep === 1 && !validatePayment()) {
      alert('Please fill in all payment information');
      return;
    }
    setActiveStep((prevStep) => prevStep + 1);
  };

  const handleBack = () => {
    setActiveStep((prevStep) => prevStep - 1);
  };

  const handlePlaceOrder = async () => {
    setLoading(true);

    try {
      // Simulate payment processing
      await new Promise((resolve) => setTimeout(resolve, 2000));

      // Generate order ID
      const newOrderId = `ORD-${Date.now()}`;
      setOrderId(newOrderId);

      // Prepare order data
      const orderData = {
        orderId: newOrderId,
        customer: {
          name: `${shippingInfo.firstName} ${shippingInfo.lastName}`,
          email: shippingInfo.email,
          phone: shippingInfo.phone,
        },
        shippingAddress: {
          address: shippingInfo.address,
          city: shippingInfo.city,
          state: shippingInfo.state,
          zipCode: shippingInfo.zipCode,
          country: shippingInfo.country,
        },
        items: cartItems.map((item) => ({
          productId: item.id,
          name: item.name,
          size: item.selectedSize,
          quantity: item.quantity,
          price: item.price,
          total: item.price * item.quantity,
        })),
        payment: {
          method: paymentInfo.paymentMethod,
          status: 'Paid',
        },
        pricing: {
          subtotal: subtotal.toFixed(2),
          shipping: shipping.toFixed(2),
          tax: tax.toFixed(2),
          total: total.toFixed(2),
        },
        orderDate: new Date().toISOString(),
      };

      // Send email with order details
      await axios.post('http://localhost:8082/api/orders/send-confirmation', orderData);

      // Clear cart and show success
      clearCart();
      setOrderSuccess(true);
    } catch (error) {
      console.error('Order placement failed:', error);
      alert('Failed to place order. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleCloseSuccess = () => {
    setOrderSuccess(false);
    navigate('/');
  };

  if (cartItems.length === 0 && !orderSuccess) {
    return (
      <Box sx={{ bgcolor: '#000000', minHeight: '100vh', py: 8 }}>
        <Container maxWidth="md">
          <Alert severity="warning" sx={{ bgcolor: '#1a1a1a', color: '#ffffff', border: '1px solid #333' }}>
            Your cart is empty. Please add items before checkout.
          </Alert>
          <Button
            variant="contained"
            onClick={() => navigate('/products')}
            sx={{ mt: 2, bgcolor: '#ffffff', color: '#000000' }}
          >
            Go to Products
          </Button>
        </Container>
      </Box>
    );
  }

  return (
    <Box sx={{ bgcolor: '#000000', minHeight: '100vh', py: 4 }}>
      <Container maxWidth="lg">
        <Typography
          variant="h3"
          gutterBottom
          sx={{
            color: '#ffffff',
            fontWeight: 'bold',
            mb: 4,
            animation: 'fadeInUp 0.8s ease-out',
            '@keyframes fadeInUp': {
              '0%': { opacity: 0, transform: 'translateY(20px)' },
              '100%': { opacity: 1, transform: 'translateY(0)' },
            },
          }}
        >
          Checkout
        </Typography>

        {/* Stepper */}
        <Card sx={{ bgcolor: '#1a1a1a', border: '1px solid #333', mb: 4 }}>
          <CardContent>
            <Stepper activeStep={activeStep} sx={{ mb: 2 }}>
              {steps.map((label) => (
                <Step key={label}>
                  <StepLabel
                    sx={{
                      '& .MuiStepLabel-label': {
                        color: '#888',
                        '&.Mui-active': { color: '#ffffff' },
                        '&.Mui-completed': { color: '#4caf50' },
                      },
                      '& .MuiStepIcon-root': {
                        color: '#333',
                        '&.Mui-active': { color: '#ffffff' },
                        '&.Mui-completed': { color: '#4caf50' },
                      },
                    }}
                  >
                    {label}
                  </StepLabel>
                </Step>
              ))}
            </Stepper>
          </CardContent>
        </Card>

        <Grid container spacing={3}>
          {/* Form Section */}
          <Grid item xs={12} md={8}>
            <Card sx={{ bgcolor: '#1a1a1a', border: '1px solid #333' }}>
              <CardContent sx={{ p: 4 }}>
                {/* Step 1: Shipping Information */}
                {activeStep === 0 && (
                  <Box>
                    <Box sx={{ display: 'flex', alignItems: 'center', mb: 3 }}>
                      <LocalShipping sx={{ color: '#ffffff', mr: 1 }} />
                      <Typography variant="h5" sx={{ color: '#ffffff', fontWeight: 'bold' }}>
                        Shipping Information
                      </Typography>
                    </Box>

                    <Grid container spacing={2}>
                      <Grid item xs={12} sm={6}>
                        <TextField
                          fullWidth
                          label="First Name"
                          name="firstName"
                          value={shippingInfo.firstName}
                          onChange={handleShippingChange}
                          required
                          InputProps={{
                            startAdornment: <Person sx={{ color: '#666', mr: 1 }} />,
                          }}
                        />
                      </Grid>
                      <Grid item xs={12} sm={6}>
                        <TextField
                          fullWidth
                          label="Last Name"
                          name="lastName"
                          value={shippingInfo.lastName}
                          onChange={handleShippingChange}
                          required
                        />
                      </Grid>
                      <Grid item xs={12} sm={6}>
                        <TextField
                          fullWidth
                          label="Email"
                          name="email"
                          type="email"
                          value={shippingInfo.email}
                          onChange={handleShippingChange}
                          required
                          InputProps={{
                            startAdornment: <Email sx={{ color: '#666', mr: 1 }} />,
                          }}
                        />
                      </Grid>
                      <Grid item xs={12} sm={6}>
                        <TextField
                          fullWidth
                          label="Phone"
                          name="phone"
                          value={shippingInfo.phone}
                          onChange={handleShippingChange}
                          required
                          InputProps={{
                            startAdornment: <Phone sx={{ color: '#666', mr: 1 }} />,
                          }}
                        />
                      </Grid>
                      <Grid item xs={12}>
                        <TextField
                          fullWidth
                          label="Address"
                          name="address"
                          value={shippingInfo.address}
                          onChange={handleShippingChange}
                          required
                          InputProps={{
                            startAdornment: <Home sx={{ color: '#666', mr: 1 }} />,
                          }}
                        />
                      </Grid>
                      <Grid item xs={12} sm={6}>
                        <TextField
                          fullWidth
                          label="City"
                          name="city"
                          value={shippingInfo.city}
                          onChange={handleShippingChange}
                          required
                        />
                      </Grid>
                      <Grid item xs={12} sm={6}>
                        <TextField
                          fullWidth
                          label="State"
                          name="state"
                          value={shippingInfo.state}
                          onChange={handleShippingChange}
                          required
                        />
                      </Grid>
                      <Grid item xs={12} sm={6}>
                        <TextField
                          fullWidth
                          label="ZIP Code"
                          name="zipCode"
                          value={shippingInfo.zipCode}
                          onChange={handleShippingChange}
                          required
                        />
                      </Grid>
                      <Grid item xs={12} sm={6}>
                        <TextField
                          fullWidth
                          label="Country"
                          name="country"
                          value={shippingInfo.country}
                          onChange={handleShippingChange}
                          required
                        />
                      </Grid>
                    </Grid>
                  </Box>
                )}

                {/* Step 2: Payment Method */}
                {activeStep === 1 && (
                  <Box>
                    <Box sx={{ display: 'flex', alignItems: 'center', mb: 3 }}>
                      <CreditCard sx={{ color: '#ffffff', mr: 1 }} />
                      <Typography variant="h5" sx={{ color: '#ffffff', fontWeight: 'bold' }}>
                        Payment Method
                      </Typography>
                    </Box>

                    <FormControl component="fieldset" sx={{ mb: 3 }}>
                      <FormLabel sx={{ color: '#ffffff', mb: 1 }}>Select Payment Method</FormLabel>
                      <RadioGroup
                        name="paymentMethod"
                        value={paymentInfo.paymentMethod}
                        onChange={handlePaymentChange}
                      >
                        <FormControlLabel
                          value="card"
                          control={<Radio sx={{ color: '#666', '&.Mui-checked': { color: '#ffffff' } }} />}
                          label={
                            <Box sx={{ display: 'flex', alignItems: 'center' }}>
                              <CreditCard sx={{ mr: 1 }} />
                              <Typography sx={{ color: '#ffffff' }}>Credit/Debit Card (Demo)</Typography>
                            </Box>
                          }
                        />
                        <FormControlLabel
                          value="cod"
                          control={<Radio sx={{ color: '#666', '&.Mui-checked': { color: '#ffffff' } }} />}
                          label={<Typography sx={{ color: '#ffffff' }}>Cash on Delivery</Typography>}
                        />
                      </RadioGroup>
                    </FormControl>

                    {paymentInfo.paymentMethod === 'card' && (
                      <Box>
                        <Alert severity="info" sx={{ mb: 3, bgcolor: 'rgba(33,150,243,0.1)', color: '#ffffff' }}>
                          This is a demo payment gateway. Use any test card number (e.g., 4111 1111 1111 1111)
                        </Alert>
                        <Grid container spacing={2}>
                          <Grid item xs={12}>
                            <TextField
                              fullWidth
                              label="Card Number"
                              name="cardNumber"
                              value={paymentInfo.cardNumber}
                              onChange={handlePaymentChange}
                              placeholder="1234 5678 9012 3456"
                              required
                            />
                          </Grid>
                          <Grid item xs={12}>
                            <TextField
                              fullWidth
                              label="Cardholder Name"
                              name="cardName"
                              value={paymentInfo.cardName}
                              onChange={handlePaymentChange}
                              required
                            />
                          </Grid>
                          <Grid item xs={12} sm={6}>
                            <TextField
                              fullWidth
                              label="Expiry Date"
                              name="expiryDate"
                              value={paymentInfo.expiryDate}
                              onChange={handlePaymentChange}
                              placeholder="MM/YY"
                              required
                            />
                          </Grid>
                          <Grid item xs={12} sm={6}>
                            <TextField
                              fullWidth
                              label="CVV"
                              name="cvv"
                              value={paymentInfo.cvv}
                              onChange={handlePaymentChange}
                              placeholder="123"
                              required
                            />
                          </Grid>
                        </Grid>
                      </Box>
                    )}
                  </Box>
                )}

                {/* Step 3: Review Order */}
                {activeStep === 2 && (
                  <Box>
                    <Typography variant="h5" gutterBottom sx={{ color: '#ffffff', fontWeight: 'bold', mb: 3 }}>
                      Review Your Order
                    </Typography>

                    <Box sx={{ mb: 3 }}>
                      <Typography variant="h6" sx={{ color: '#ffffff', mb: 2 }}>
                        Shipping Address
                      </Typography>
                      <Typography sx={{ color: '#888' }}>
                        {shippingInfo.firstName} {shippingInfo.lastName}
                      </Typography>
                      <Typography sx={{ color: '#888' }}>{shippingInfo.address}</Typography>
                      <Typography sx={{ color: '#888' }}>
                        {shippingInfo.city}, {shippingInfo.state} {shippingInfo.zipCode}
                      </Typography>
                      <Typography sx={{ color: '#888' }}>{shippingInfo.email}</Typography>
                      <Typography sx={{ color: '#888' }}>{shippingInfo.phone}</Typography>
                    </Box>

                    <Divider sx={{ bgcolor: '#333', my: 3 }} />

                    <Box sx={{ mb: 3 }}>
                      <Typography variant="h6" sx={{ color: '#ffffff', mb: 2 }}>
                        Payment Method
                      </Typography>
                      <Typography sx={{ color: '#888' }}>
                        {paymentInfo.paymentMethod === 'card'
                          ? `Card ending in ${paymentInfo.cardNumber.slice(-4)}`
                          : 'Cash on Delivery'}
                      </Typography>
                    </Box>

                    <Divider sx={{ bgcolor: '#333', my: 3 }} />

                    <Box>
                      <Typography variant="h6" sx={{ color: '#ffffff', mb: 2 }}>
                        Order Items
                      </Typography>
                      <List>
                        {cartItems.map((item) => (
                          <ListItem
                            key={`${item.id}-${item.selectedSize}`}
                            sx={{
                              bgcolor: 'rgba(255,255,255,0.05)',
                              borderRadius: 2,
                              mb: 1,
                            }}
                          >
                            <ListItemText
                              primary={
                                <Typography sx={{ color: '#ffffff', fontWeight: 'bold' }}>
                                  {item.name} - Size {item.selectedSize}
                                </Typography>
                              }
                              secondary={
                                <Typography sx={{ color: '#888' }}>
                                  Quantity: {item.quantity} × ${item.price} = ${(item.price * item.quantity).toFixed(2)}
                                </Typography>
                              }
                            />
                          </ListItem>
                        ))}
                      </List>
                    </Box>
                  </Box>
                )}

                {/* Navigation Buttons */}
                <Box sx={{ display: 'flex', justifyContent: 'space-between', mt: 4 }}>
                  <Button
                    disabled={activeStep === 0}
                    onClick={handleBack}
                    sx={{
                      color: '#888',
                      '&:hover': { color: '#ffffff', bgcolor: 'rgba(255,255,255,0.05)' },
                    }}
                  >
                    Back
                  </Button>
                  {activeStep === steps.length - 1 ? (
                    <Button
                      variant="contained"
                      onClick={handlePlaceOrder}
                      disabled={loading}
                      sx={{
                        bgcolor: '#ffffff',
                        color: '#000000',
                        fontWeight: 'bold',
                        px: 4,
                        '&:hover': { bgcolor: '#e0e0e0' },
                      }}
                    >
                      {loading ? <CircularProgress size={24} sx={{ color: '#000000' }} /> : 'Place Order'}
                    </Button>
                  ) : (
                    <Button
                      variant="contained"
                      onClick={handleNext}
                      sx={{
                        bgcolor: '#ffffff',
                        color: '#000000',
                        fontWeight: 'bold',
                        '&:hover': { bgcolor: '#e0e0e0' },
                      }}
                    >
                      Next
                    </Button>
                  )}
                </Box>
              </CardContent>
            </Card>
          </Grid>

          {/* Order Summary */}
          <Grid item xs={12} md={4}>
            <Card sx={{ bgcolor: '#1a1a1a', border: '1px solid #333', position: 'sticky', top: 20 }}>
              <CardContent sx={{ p: 3 }}>
                <Typography variant="h5" gutterBottom sx={{ color: '#ffffff', fontWeight: 'bold', mb: 3 }}>
                  Order Summary
                </Typography>

                <Box sx={{ mb: 2 }}>
                  <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1 }}>
                    <Typography sx={{ color: '#888' }}>Subtotal</Typography>
                    <Typography sx={{ color: '#ffffff' }}>${subtotal.toFixed(2)}</Typography>
                  </Box>
                  <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1 }}>
                    <Typography sx={{ color: '#888' }}>Shipping</Typography>
                    <Typography sx={{ color: shipping === 0 ? '#4caf50' : '#ffffff' }}>
                      {shipping === 0 ? 'FREE' : `$${shipping.toFixed(2)}`}
                    </Typography>
                  </Box>
                  <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 2 }}>
                    <Typography sx={{ color: '#888' }}>Tax</Typography>
                    <Typography sx={{ color: '#ffffff' }}>${tax.toFixed(2)}</Typography>
                  </Box>
                </Box>

                <Divider sx={{ bgcolor: '#333', mb: 2 }} />

                <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 3 }}>
                  <Typography variant="h6" sx={{ color: '#ffffff', fontWeight: 'bold' }}>
                    Total
                  </Typography>
                  <Typography variant="h5" sx={{ color: '#ffffff', fontWeight: 'bold' }}>
                    ${total.toFixed(2)}
                  </Typography>
                </Box>

                <Alert severity="info" sx={{ bgcolor: 'rgba(33,150,243,0.1)', color: '#ffffff' }}>
                  You will receive an email confirmation after placing your order
                </Alert>
              </CardContent>
            </Card>
          </Grid>
        </Grid>
      </Container>

      {/* Success Dialog */}
      <Dialog
        open={orderSuccess}
        onClose={handleCloseSuccess}
        maxWidth="sm"
        fullWidth
        PaperProps={{
          sx: {
            bgcolor: '#1a1a1a',
            border: '1px solid #333',
          },
        }}
      >
        <DialogTitle sx={{ textAlign: 'center', pt: 4 }}>
          <CheckCircle sx={{ fontSize: 80, color: '#4caf50', mb: 2 }} />
          <Typography variant="h4" sx={{ color: '#ffffff', fontWeight: 'bold' }}>
            Order Placed Successfully!
          </Typography>
        </DialogTitle>
        <DialogContent sx={{ textAlign: 'center', pb: 4 }}>
          <Typography variant="h6" sx={{ color: '#888', mb: 2 }}>
            Order ID: {orderId}
          </Typography>
          <Typography sx={{ color: '#b0b0b0', mb: 3 }}>
            Thank you for your purchase! A confirmation email with your order details and invoice has been sent to{' '}
            <strong>{shippingInfo.email}</strong>
          </Typography>
          <Button
            variant="contained"
            onClick={handleCloseSuccess}
            sx={{
              bgcolor: '#ffffff',
              color: '#000000',
              fontWeight: 'bold',
              px: 4,
              '&:hover': { bgcolor: '#e0e0e0' },
            }}
          >
            Continue Shopping
          </Button>
        </DialogContent>
      </Dialog>
    </Box>
  );
};

export default CheckoutPage;
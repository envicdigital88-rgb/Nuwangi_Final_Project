import React, { useState } from 'react';
import {
  Container,
  Typography,
  Box,
  Grid,
  TextField,
  Button,
  Paper,
  Alert,
  Snackbar,
  Card,
  CardContent,
  Divider,
} from '@mui/material';
import {
  Email,
  Phone,
  LocationOn,
  Send,
  CheckCircle,
} from '@mui/icons-material';

const ContactPage = () => {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    subject: '',
    message: '',
  });

  const [errors, setErrors] = useState({});
  const [openSnackbar, setOpenSnackbar] = useState(false);
  const [submitStatus, setSubmitStatus] = useState({ type: '', message: '' });

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
    // Clear error when user starts typing
    if (errors[name]) {
      setErrors((prev) => ({
        ...prev,
        [name]: '',
      }));
    }
  };

  const validateForm = () => {
    const newErrors = {};

    if (!formData.name.trim()) {
      newErrors.name = 'Name is required';
    }

    if (!formData.email.trim()) {
      newErrors.email = 'Email is required';
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
      newErrors.email = 'Invalid email format';
    }

    if (!formData.subject.trim()) {
      newErrors.subject = 'Subject is required';
    }

    if (!formData.message.trim()) {
      newErrors.message = 'Message is required';
    } else if (formData.message.trim().length < 10) {
      newErrors.message = 'Message must be at least 10 characters';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = (e) => {
    e.preventDefault();

    if (validateForm()) {
      // Simulate form submission
      console.log('Form submitted:', formData);
      
      setSubmitStatus({
        type: 'success',
        message: 'Thank you for contacting us! We will get back to you soon.',
      });
      setOpenSnackbar(true);

      // Reset form
      setFormData({
        name: '',
        email: '',
        phone: '',
        subject: '',
        message: '',
      });
    } else {
      setSubmitStatus({
        type: 'error',
        message: 'Please fix the errors in the form.',
      });
      setOpenSnackbar(true);
    }
  };

  const handleCloseSnackbar = () => {
    setOpenSnackbar(false);
  };

  const contactInfo = [
    {
      icon: <Email sx={{ fontSize: 40, color: '#3b82f6' }} />,
      title: 'Email',
      content: 'support@aurastyle.com',
      link: 'mailto:support@aurastyle.com',
    },
    {
      icon: <Phone sx={{ fontSize: 40, color: '#3b82f6' }} />,
      title: 'Phone',
      content: '+1 (555) 123-4567',
      link: 'tel:+15551234567',
    },
    {
      icon: <LocationOn sx={{ fontSize: 40, color: '#3b82f6' }} />,
      title: 'Address',
      content: '123 Fashion Street, Style City, SC 12345',
      link: null,
    },
  ];

  return (
    <Box sx={{ bgcolor: '#000000', minHeight: '100vh', py: 8 }}>
      <Container maxWidth="lg">
        {/* Header */}
        <Box sx={{ textAlign: 'center', mb: 8 }}>
          <Typography
            variant="h2"
            gutterBottom
            sx={{
              fontWeight: 'bold',
              color: '#ffffff',
              mb: 2,
              fontSize: { xs: '2rem', sm: '2.5rem', md: '3rem' },
            }}
          >
            Get In Touch
          </Typography>
          <Typography
            variant="h6"
            sx={{
              color: '#888',
              maxWidth: '700px',
              mx: 'auto',
            }}
          >
            Have questions or feedback? We'd love to hear from you. Send us a message and we'll respond as soon as possible.
          </Typography>
        </Box>

        <Grid container spacing={4}>
          {/* Contact Information Cards */}
          <Grid item xs={12} md={4}>
            <Box sx={{ display: 'flex', flexDirection: 'column', gap: 3 }}>
              {contactInfo.map((info, index) => (
                <Card
                  key={index}
                  sx={{
                    bgcolor: '#1a1a1a',
                    border: '2px solid #333',
                    borderRadius: 3,
                    transition: 'all 0.3s',
                    '&:hover': {
                      borderColor: '#3b82f6',
                      transform: 'translateY(-5px)',
                      boxShadow: '0 10px 30px rgba(59, 130, 246, 0.3)',
                    },
                  }}
                  component={info.link ? 'a' : 'div'}
                  href={info.link || undefined}
                  sx={{
                    textDecoration: 'none',
                    cursor: info.link ? 'pointer' : 'default',
                  }}
                >
                  <CardContent sx={{ textAlign: 'center', py: 4 }}>
                    <Box sx={{ mb: 2 }}>{info.icon}</Box>
                    <Typography
                      variant="h6"
                      sx={{ color: '#ffffff', fontWeight: 'bold', mb: 1 }}
                    >
                      {info.title}
                    </Typography>
                    <Typography variant="body1" sx={{ color: '#888' }}>
                      {info.content}
                    </Typography>
                  </CardContent>
                </Card>
              ))}

              {/* Business Hours */}
              <Card
                sx={{
                  bgcolor: '#1a1a1a',
                  border: '2px solid #333',
                  borderRadius: 3,
                }}
              >
                <CardContent sx={{ py: 4 }}>
                  <Typography
                    variant="h6"
                    sx={{
                      color: '#ffffff',
                      fontWeight: 'bold',
                      mb: 3,
                      textAlign: 'center',
                    }}
                  >
                    Business Hours
                  </Typography>
                  <Divider sx={{ bgcolor: '#333', mb: 2 }} />
                  <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1.5 }}>
                    <Typography sx={{ color: '#888' }}>Monday - Friday</Typography>
                    <Typography sx={{ color: '#fff', fontWeight: 'bold' }}>9:00 AM - 6:00 PM</Typography>
                  </Box>
                  <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1.5 }}>
                    <Typography sx={{ color: '#888' }}>Saturday</Typography>
                    <Typography sx={{ color: '#fff', fontWeight: 'bold' }}>10:00 AM - 4:00 PM</Typography>
                  </Box>
                  <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
                    <Typography sx={{ color: '#888' }}>Sunday</Typography>
                    <Typography sx={{ color: '#888' }}>Closed</Typography>
                  </Box>
                </CardContent>
              </Card>
            </Box>
          </Grid>

          {/* Contact Form */}
          <Grid item xs={12} md={8}>
            <Paper
              elevation={0}
              sx={{
                p: { xs: 3, sm: 4, md: 5 },
                bgcolor: '#1a1a1a',
                border: '2px solid #333',
                borderRadius: 3,
              }}
            >
              <Typography
                variant="h4"
                gutterBottom
                sx={{
                  color: '#ffffff',
                  fontWeight: 'bold',
                  mb: 3,
                }}
              >
                Send Us a Message
              </Typography>

              <form onSubmit={handleSubmit}>
                <Grid container spacing={3}>
                  <Grid item xs={12} sm={6}>
                    <TextField
                      fullWidth
                      label="Full Name"
                      name="name"
                      value={formData.name}
                      onChange={handleChange}
                      error={!!errors.name}
                      helperText={errors.name}
                      required
                      sx={{
                        '& .MuiOutlinedInput-root': {
                          bgcolor: '#0a0a0a',
                          color: '#fff',
                          '& fieldset': {
                            borderColor: '#333',
                          },
                          '&:hover fieldset': {
                            borderColor: '#555',
                          },
                          '&.Mui-focused fieldset': {
                            borderColor: '#3b82f6',
                          },
                        },
                        '& .MuiInputLabel-root': {
                          color: '#888',
                        },
                        '& .MuiInputLabel-root.Mui-focused': {
                          color: '#3b82f6',
                        },
                      }}
                    />
                  </Grid>

                  <Grid item xs={12} sm={6}>
                    <TextField
                      fullWidth
                      label="Email Address"
                      name="email"
                      type="email"
                      value={formData.email}
                      onChange={handleChange}
                      error={!!errors.email}
                      helperText={errors.email}
                      required
                      sx={{
                        '& .MuiOutlinedInput-root': {
                          bgcolor: '#0a0a0a',
                          color: '#fff',
                          '& fieldset': {
                            borderColor: '#333',
                          },
                          '&:hover fieldset': {
                            borderColor: '#555',
                          },
                          '&.Mui-focused fieldset': {
                            borderColor: '#3b82f6',
                          },
                        },
                        '& .MuiInputLabel-root': {
                          color: '#888',
                        },
                        '& .MuiInputLabel-root.Mui-focused': {
                          color: '#3b82f6',
                        },
                      }}
                    />
                  </Grid>

                  <Grid item xs={12}>
                    <TextField
                      fullWidth
                      label="Phone Number (Optional)"
                      name="phone"
                      value={formData.phone}
                      onChange={handleChange}
                      sx={{
                        '& .MuiOutlinedInput-root': {
                          bgcolor: '#0a0a0a',
                          color: '#fff',
                          '& fieldset': {
                            borderColor: '#333',
                          },
                          '&:hover fieldset': {
                            borderColor: '#555',
                          },
                          '&.Mui-focused fieldset': {
                            borderColor: '#3b82f6',
                          },
                        },
                        '& .MuiInputLabel-root': {
                          color: '#888',
                        },
                        '& .MuiInputLabel-root.Mui-focused': {
                          color: '#3b82f6',
                        },
                      }}
                    />
                  </Grid>

                  <Grid item xs={12}>
                    <TextField
                      fullWidth
                      label="Subject"
                      name="subject"
                      value={formData.subject}
                      onChange={handleChange}
                      error={!!errors.subject}
                      helperText={errors.subject}
                      required
                      sx={{
                        '& .MuiOutlinedInput-root': {
                          bgcolor: '#0a0a0a',
                          color: '#fff',
                          '& fieldset': {
                            borderColor: '#333',
                          },
                          '&:hover fieldset': {
                            borderColor: '#555',
                          },
                          '&.Mui-focused fieldset': {
                            borderColor: '#3b82f6',
                          },
                        },
                        '& .MuiInputLabel-root': {
                          color: '#888',
                        },
                        '& .MuiInputLabel-root.Mui-focused': {
                          color: '#3b82f6',
                        },
                      }}
                    />
                  </Grid>

                  <Grid item xs={12}>
                    <TextField
                      fullWidth
                      label="Message"
                      name="message"
                      value={formData.message}
                      onChange={handleChange}
                      error={!!errors.message}
                      helperText={errors.message}
                      required
                      multiline
                      rows={6}
                      sx={{
                        '& .MuiOutlinedInput-root': {
                          bgcolor: '#0a0a0a',
                          color: '#fff',
                          '& fieldset': {
                            borderColor: '#333',
                          },
                          '&:hover fieldset': {
                            borderColor: '#555',
                          },
                          '&.Mui-focused fieldset': {
                            borderColor: '#3b82f6',
                          },
                        },
                        '& .MuiInputLabel-root': {
                          color: '#888',
                        },
                        '& .MuiInputLabel-root.Mui-focused': {
                          color: '#3b82f6',
                        },
                      }}
                    />
                  </Grid>

                  <Grid item xs={12}>
                    <Button
                      type="submit"
                      variant="contained"
                      size="large"
                      fullWidth
                      endIcon={<Send />}
                      sx={{
                        py: 2,
                        fontSize: '1.1rem',
                        fontWeight: 'bold',
                        background: 'linear-gradient(135deg, #3b82f6 0%, #8b5cf6 100%)',
                        color: '#ffffff',
                        boxShadow: '0 4px 14px rgba(59, 130, 246, 0.4)',
                        '&:hover': {
                          background: 'linear-gradient(135deg, #2563eb 0%, #7c3aed 100%)',
                          boxShadow: '0 6px 20px rgba(59, 130, 246, 0.6)',
                          transform: 'translateY(-2px)',
                        },
                        transition: 'all 0.3s',
                      }}
                    >
                      Send Message
                    </Button>
                  </Grid>
                </Grid>
              </form>
            </Paper>
          </Grid>
        </Grid>

        {/* Success/Error Snackbar */}
        <Snackbar
          open={openSnackbar}
          autoHideDuration={6000}
          onClose={handleCloseSnackbar}
          anchorOrigin={{ vertical: 'bottom', horizontal: 'center' }}
        >
          <Alert
            onClose={handleCloseSnackbar}
            severity={submitStatus.type}
            sx={{
              width: '100%',
              bgcolor: submitStatus.type === 'success' ? '#1a1a1a' : '#2d1a1a',
              color: '#fff',
              border: `2px solid ${submitStatus.type === 'success' ? '#22c55e' : '#ef4444'}`,
              '& .MuiAlert-icon': {
                color: submitStatus.type === 'success' ? '#22c55e' : '#ef4444',
              },
            }}
            icon={submitStatus.type === 'success' ? <CheckCircle /> : undefined}
          >
            {submitStatus.message}
          </Alert>
        </Snackbar>
      </Container>
    </Box>
  );
};

export default ContactPage;

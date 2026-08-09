import React from 'react';
import {
  Box,
  Container,
  Grid,
  Typography,
  Link,
  IconButton,
  Divider,
} from '@mui/material';
import {
  Facebook,
  Twitter,
  Instagram,
  YouTube,
  Email,
  Phone,
  LocationOn,
} from '@mui/icons-material';

const Footer = () => {
  return (
    <Box
      component="footer"
      sx={{
        bgcolor: '#0a0a0a',
        color: 'white',
        py: 6,
        mt: 'auto',
        borderTop: '1px solid #333',
      }}
    >
      <Container maxWidth="lg">
        <Grid container spacing={4}>
          {/* Company Info */}
          <Grid item xs={12} sm={6} md={3}>
            <Typography variant="h6" gutterBottom fontWeight="bold" sx={{ letterSpacing: '2px' }}>
              AURA STYLE
            </Typography>
            <Typography variant="body2" sx={{ mb: 2, color: '#888' }}>
              Your premier destination for virtual try-on fashion experiences. 
              Discover the perfect fit with our cutting-edge technology.
            </Typography>
            <Box>
              <IconButton sx={{ color: '#888', '&:hover': { color: 'white' } }} size="small">
                <Facebook />
              </IconButton>
              <IconButton sx={{ color: '#888', '&:hover': { color: 'white' } }} size="small">
                <Twitter />
              </IconButton>
              <IconButton sx={{ color: '#888', '&:hover': { color: 'white' } }} size="small">
                <Instagram />
              </IconButton>
              <IconButton sx={{ color: '#888', '&:hover': { color: 'white' } }} size="small">
                <YouTube />
              </IconButton>
            </Box>
          </Grid>

          {/* Quick Links */}
          <Grid item xs={12} sm={6} md={3}>
            <Typography variant="h6" gutterBottom fontWeight="bold">
              Quick Links
            </Typography>
            <Box sx={{ display: 'flex', flexDirection: 'column' }}>
              <Link color="#888" href="/" sx={{ mb: 1, textDecoration: 'none', '&:hover': { color: 'white' } }}>
                Home
              </Link>
              <Link color="#888" href="/products" sx={{ mb: 1, textDecoration: 'none', '&:hover': { color: 'white' } }}>
                Products
              </Link>
              <Link color="#888" href="#" sx={{ mb: 1, textDecoration: 'none', '&:hover': { color: 'white' } }}>
                Categories
              </Link>
              <Link color="#888" href="/virtual-tryon" sx={{ mb: 1, textDecoration: 'none', '&:hover': { color: 'white' } }}>
                Virtual Try-On
              </Link>
              <Link color="#888" href="#" sx={{ mb: 1, textDecoration: 'none', '&:hover': { color: 'white' } }}>
                About Us
              </Link>
            </Box>
          </Grid>

          {/* Customer Service */}
          <Grid item xs={12} sm={6} md={3}>
            <Typography variant="h6" gutterBottom fontWeight="bold">
              Customer Service
            </Typography>
            <Box sx={{ display: 'flex', flexDirection: 'column' }}>
              <Link color="#888" href="/contact" sx={{ mb: 1, textDecoration: 'none', '&:hover': { color: 'white' } }}>
                Contact Us
              </Link>
              <Link color="#888" href="#" sx={{ mb: 1, textDecoration: 'none', '&:hover': { color: 'white' } }}>
                Size Guide
              </Link>
              <Link color="#888" href="#" sx={{ mb: 1, textDecoration: 'none', '&:hover': { color: 'white' } }}>
                Shipping Info
              </Link>
              <Link color="#888" href="#" sx={{ mb: 1, textDecoration: 'none', '&:hover': { color: 'white' } }}>
                Returns
              </Link>
              <Link color="#888" href="#" sx={{ mb: 1, textDecoration: 'none', '&:hover': { color: 'white' } }}>
                FAQ
              </Link>
            </Box>
          </Grid>

          {/* Contact Info */}
          <Grid item xs={12} sm={6} md={3}>
            <Typography variant="h6" gutterBottom fontWeight="bold">
              Contact Info
            </Typography>
            <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
              <LocationOn sx={{ mr: 1, fontSize: 20, color: '#888' }} />
              <Typography variant="body2" color="#888">
                123 Fashion Street, Style City, SC 12345
              </Typography>
            </Box>
            <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
              <Phone sx={{ mr: 1, fontSize: 20, color: '#888' }} />
              <Typography variant="body2" color="#888">
                +1 (555) 123-4567
              </Typography>
            </Box>
            <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
              <Email sx={{ mr: 1, fontSize: 20, color: '#888' }} />
              <Typography variant="body2" color="#888">
                support@aurastyle.com
              </Typography>
            </Box>
          </Grid>
        </Grid>

        <Divider sx={{ my: 4, bgcolor: '#333' }} />

        <Box
          sx={{
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            flexWrap: 'wrap',
          }}
        >
          <Typography variant="body2" color="#888">
            © 2024 AURA STYLE. All rights reserved.
          </Typography>
          <Box>
            <Link color="#888" href="#" sx={{ mx: 1, textDecoration: 'none', '&:hover': { color: 'white' } }}>
              Privacy Policy
            </Link>
            <Link color="#888" href="#" sx={{ mx: 1, textDecoration: 'none', '&:hover': { color: 'white' } }}>
              Terms of Service
            </Link>
          </Box>
        </Box>
      </Container>
    </Box>
  );
};

export default Footer;
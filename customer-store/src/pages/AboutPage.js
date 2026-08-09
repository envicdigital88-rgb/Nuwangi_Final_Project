import React from 'react';
import {
  Container,
  Typography,
  Box,
  Grid,
  Card,
  CardContent,
  Avatar,
  Chip,
} from '@mui/material';
import {
  ThreeDRotation,
  AutoAwesome,
  Speed,
  Security,
  EmojiEvents,
  Group,
} from '@mui/icons-material';

const AboutPage = () => {
  const features = [
    {
      icon: <ThreeDRotation sx={{ fontSize: 50 }} />,
      title: '3D Visualization',
      description: 'Experience products in stunning 3D with 360° rotation for the most realistic view.',
      color: '#667eea',
    },
    {
      icon: <AutoAwesome sx={{ fontSize: 50 }} />,
      title: 'AI-Powered',
      description: 'Machine learning algorithms provide personalized size recommendations with 84% accuracy.',
      color: '#f093fb',
    },
    {
      icon: <Speed sx={{ fontSize: 50 }} />,
      title: 'Smart Fit Scoring',
      description: 'Get detailed fit analysis based on your body measurements for chest, waist, and hips.',
      color: '#4facfe',
    },
    {
      icon: <Security sx={{ fontSize: 50 }} />,
      title: 'Secure Shopping',
      description: 'Your data is protected with industry-standard encryption and security measures.',
      color: '#43e97b',
    },
  ];

  const stats = [
    { value: '10,000+', label: 'Happy Customers' },
    { value: '84%', label: 'AI Accuracy' },
    { value: '500+', label: 'Products' },
    { value: '24/7', label: 'Support' },
  ];

  const team = [
    {
      name: 'Sarah Johnson',
      role: 'CEO & Founder',
      avatar: 'SJ',
      color: '#667eea',
    },
    {
      name: 'Michael Chen',
      role: 'CTO',
      avatar: 'MC',
      color: '#f093fb',
    },
    {
      name: 'Emily Davis',
      role: 'Head of AI',
      avatar: 'ED',
      color: '#4facfe',
    },
    {
      name: 'David Wilson',
      role: 'Design Lead',
      avatar: 'DW',
      color: '#43e97b',
    },
  ];

  return (
    <Box sx={{ bgcolor: '#000000', minHeight: '100vh', color: '#ffffff' }}>
      {/* Hero Section */}
      <Box
        sx={{
          background: 'linear-gradient(135deg, #000000 0%, #1a1a1a 50%, #000000 100%)',
          py: { xs: 8, md: 12 },
          position: 'relative',
          overflow: 'hidden',
          '&::before': {
            content: '""',
            position: 'absolute',
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            background: 'radial-gradient(circle at 20% 50%, rgba(102, 126, 234, 0.3) 0%, transparent 50%), radial-gradient(circle at 80% 80%, rgba(118, 75, 162, 0.3) 0%, transparent 50%)',
            animation: 'pulse 8s ease-in-out infinite',
          },
          '@keyframes pulse': {
            '0%, 100%': { opacity: 0.5 },
            '50%': { opacity: 1 },
          },
        }}
      >
        <Container maxWidth="lg" sx={{ position: 'relative', zIndex: 1 }}>
          <Box sx={{ textAlign: 'center' }}>
            <Chip 
              label="About Us" 
              icon={<Group />}
              sx={{ 
                mb: 3,
                bgcolor: 'rgba(255,255,255,0.1)',
                color: 'white',
                backdropFilter: 'blur(10px)',
                border: '1px solid rgba(255,255,255,0.2)',
                fontSize: '0.9rem',
                py: 2.5,
                px: 1,
              }}
            />
            <Typography 
              variant="h1" 
              gutterBottom 
              fontWeight="bold"
              sx={{ 
                fontSize: { xs: '2.5rem', sm: '3.5rem', md: '4rem' },
                mb: 3,
                animation: 'fadeInUp 1s ease-out',
                '@keyframes fadeInUp': {
                  '0%': {
                    opacity: 0,
                    transform: 'translateY(30px)',
                  },
                  '100%': {
                    opacity: 1,
                    transform: 'translateY(0)',
                  },
                },
              }}
            >
              Revolutionizing Online Fashion
            </Typography>
            <Typography 
              variant="h5" 
              sx={{ 
                mb: 4, 
                opacity: 0.9,
                maxWidth: '800px',
                mx: 'auto',
                lineHeight: 1.6,
              }}
            >
              We combine cutting-edge AI technology with 3D visualization to create the most immersive online shopping experience
            </Typography>
          </Box>
        </Container>
      </Box>

      {/* Stats Section */}
      <Container maxWidth="lg" sx={{ py: 8 }}>
        <Grid container spacing={4}>
          {stats.map((stat, index) => (
            <Grid item xs={6} md={3} key={index}>
              <Box sx={{ textAlign: 'center' }}>
                <Typography 
                  variant="h2" 
                  fontWeight="bold" 
                  sx={{ 
                    color: '#ffffff',
                    mb: 1,
                    animation: 'bounceIn 1s ease-out',
                    animationDelay: `${index * 0.1}s`,
                    '@keyframes bounceIn': {
                      '0%': {
                        opacity: 0,
                        transform: 'scale(0.3)',
                      },
                      '50%': {
                        opacity: 1,
                        transform: 'scale(1.05)',
                      },
                      '70%': {
                        transform: 'scale(0.9)',
                      },
                      '100%': {
                        transform: 'scale(1)',
                      },
                    },
                  }}
                >
                  {stat.value}
                </Typography>
                <Typography variant="body1" sx={{ color: '#888' }}>
                  {stat.label}
                </Typography>
              </Box>
            </Grid>
          ))}
        </Grid>
      </Container>

      {/* Mission Section */}
      <Box sx={{ bgcolor: '#0a0a0a', py: { xs: 8, md: 12 } }}>
        <Container maxWidth="lg">
          <Grid container spacing={6} alignItems="center">
            <Grid item xs={12} md={6}>
              <Typography 
                variant="h2" 
                gutterBottom 
                fontWeight="bold"
                sx={{ 
                  fontSize: { xs: '2rem', sm: '2.5rem', md: '3rem' },
                  mb: 3,
                }}
              >
                Our Mission
              </Typography>
              <Typography variant="h6" paragraph sx={{ color: '#b0b0b0', lineHeight: 1.8 }}>
                To eliminate the uncertainty of online shopping by providing customers with AI-powered size recommendations and immersive 3D product visualization.
              </Typography>
              <Typography variant="body1" paragraph sx={{ color: '#888', lineHeight: 1.8 }}>
                We believe that everyone deserves to find clothes that fit perfectly. That's why we've developed advanced machine learning algorithms that analyze your body measurements and provide personalized recommendations with 84% accuracy.
              </Typography>
              <Typography variant="body1" sx={{ color: '#888', lineHeight: 1.8 }}>
                Our 3D visualization technology lets you see products from every angle, giving you confidence in your purchase decisions.
              </Typography>
            </Grid>
            <Grid item xs={12} md={6}>
              <Box
                sx={{
                  width: '100%',
                  height: 400,
                  borderRadius: 4,
                  background: 'radial-gradient(circle, #2a2a2a 0%, #0a0a0a 100%)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  border: '1px solid #333',
                }}
              >
                <EmojiEvents sx={{ fontSize: 120, color: '#667eea' }} />
              </Box>
            </Grid>
          </Grid>
        </Container>
      </Box>

      {/* Features Section */}
      <Container maxWidth="lg" sx={{ py: { xs: 8, md: 12 } }}>
        <Box sx={{ textAlign: 'center', mb: 8 }}>
          <Typography 
            variant="h2" 
            gutterBottom 
            fontWeight="bold"
            sx={{ 
              fontSize: { xs: '2rem', sm: '2.5rem', md: '3rem' },
              mb: 2,
            }}
          >
            What Makes Us Different
          </Typography>
          <Typography variant="h6" sx={{ color: '#888', maxWidth: '700px', mx: 'auto' }}>
            We're not just another online store. We're pioneering the future of fashion retail.
          </Typography>
        </Box>

        <Grid container spacing={4}>
          {features.map((feature, index) => (
            <Grid item xs={12} sm={6} md={3} key={index}>
              <Card 
                sx={{ 
                  height: '100%', 
                  textAlign: 'center', 
                  p: 3,
                  borderRadius: 4,
                  bgcolor: '#1a1a1a',
                  border: '1px solid #333',
                  transition: 'all 0.3s',
                  '&:hover': { 
                    transform: 'translateY(-8px)',
                    boxShadow: '0 20px 60px rgba(0,0,0,0.5)',
                    borderColor: feature.color,
                  },
                }}
              >
                <Avatar
                  sx={{ 
                    width: 80, 
                    height: 80, 
                    mx: 'auto',
                    mb: 2,
                    bgcolor: `${feature.color}15`,
                    color: feature.color,
                  }}
                >
                  {feature.icon}
                </Avatar>
                <Typography variant="h6" gutterBottom fontWeight="bold" sx={{ color: '#ffffff' }}>
                  {feature.title}
                </Typography>
                <Typography variant="body2" sx={{ color: '#888', lineHeight: 1.6 }}>
                  {feature.description}
                </Typography>
              </Card>
            </Grid>
          ))}
        </Grid>
      </Container>

      {/* Team Section */}
      <Box sx={{ bgcolor: '#0a0a0a', py: { xs: 8, md: 12 } }}>
        <Container maxWidth="lg">
          <Box sx={{ textAlign: 'center', mb: 8 }}>
            <Typography 
              variant="h2" 
              gutterBottom 
              fontWeight="bold"
              sx={{ 
                fontSize: { xs: '2rem', sm: '2.5rem', md: '3rem' },
                mb: 2,
              }}
            >
              Meet Our Team
            </Typography>
            <Typography variant="h6" sx={{ color: '#888' }}>
              The brilliant minds behind the innovation
            </Typography>
          </Box>

          <Grid container spacing={4}>
            {team.map((member, index) => (
              <Grid item xs={12} sm={6} md={3} key={index}>
                <Card 
                  sx={{ 
                    textAlign: 'center', 
                    p: 4,
                    borderRadius: 4,
                    bgcolor: '#1a1a1a',
                    border: '1px solid #333',
                    transition: 'all 0.3s',
                    '&:hover': { 
                      transform: 'translateY(-8px)',
                      boxShadow: '0 20px 60px rgba(0,0,0,0.5)',
                    },
                  }}
                >
                  <Avatar
                    sx={{ 
                      width: 100, 
                      height: 100, 
                      mx: 'auto',
                      mb: 2,
                      bgcolor: member.color,
                      fontSize: '2rem',
                      fontWeight: 'bold',
                    }}
                  >
                    {member.avatar}
                  </Avatar>
                  <Typography variant="h6" gutterBottom fontWeight="bold" sx={{ color: '#ffffff' }}>
                    {member.name}
                  </Typography>
                  <Typography variant="body2" sx={{ color: '#888' }}>
                    {member.role}
                  </Typography>
                </Card>
              </Grid>
            ))}
          </Grid>
        </Container>
      </Box>

      {/* CTA Section */}
      <Container maxWidth="md" sx={{ py: { xs: 8, md: 12 }, textAlign: 'center' }}>
        <Typography 
          variant="h2" 
          gutterBottom 
          fontWeight="bold"
          sx={{ 
            fontSize: { xs: '2rem', sm: '2.5rem', md: '3rem' },
            mb: 3,
          }}
        >
          Ready to Experience the Future?
        </Typography>
        <Typography variant="h6" sx={{ mb: 4, color: '#b0b0b0' }}>
          Join thousands of satisfied customers who shop smarter with AI
        </Typography>
      </Container>
    </Box>
  );
};

export default AboutPage;

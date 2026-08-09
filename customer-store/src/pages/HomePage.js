import React, { useState, useEffect } from 'react';
import {
  Container,
  Typography,
  Button,
  Box,
  Grid,
  Card,
  CardContent,
  CardMedia,
  Chip,
  Paper,
  Avatar,
  Divider,
} from '@mui/material';
import { 
  ThreeDRotation, 
  CameraAlt, 
  ShoppingBag, 
  Star,
  TrendingUp,
  Security,
  ArrowForward,
  AutoAwesome,
  Speed,
  CheckCircle,
} from '@mui/icons-material';
import { useNavigate } from 'react-router-dom';
import { productsAPI } from '../services/apiService';
import Model3DViewer from '../components/Model3DViewer';
import ParticleBackground from '../components/ParticleBackground';

const HomePage = () => {
  const navigate = useNavigate();
  const [trendingProducts, setTrendingProducts] = useState([]);
  const [isVisible, setIsVisible] = useState({});
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchTrendingProducts();
    
    // Set products as visible immediately
    setTimeout(() => {
      setIsVisible({
        'product-0': true,
        'product-1': true,
        'product-2': true,
        'feature-0': true,
        'feature-1': true,
        'feature-2': true,
      });
    }, 100);
    
    // Intersection Observer for scroll animations
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            setIsVisible((prev) => ({ ...prev, [entry.target.id]: true }));
          }
        });
      },
      { threshold: 0.1 }
    );

    // Observe all sections
    const sections = document.querySelectorAll('.animate-on-scroll');
    sections.forEach((section) => observer.observe(section));

    return () => observer.disconnect();
  }, []);

  const fetchTrendingProducts = async () => {
    try {
      setLoading(true);
      console.log('Fetching products from API...');
      const response = await productsAPI.getAllProducts();
      console.log('API Response:', response);
      
      let products = [];
      
      if (response.data) {
        if (response.data.content && Array.isArray(response.data.content)) {
          products = response.data.content;
        } else if (Array.isArray(response.data)) {
          products = response.data;
        }
      }
      
      console.log('Extracted products:', products);
      console.log('Number of products:', products.length);
      
      // Take first 3 products for trending section
      setTrendingProducts(products.slice(0, 3));
      setLoading(false);
    } catch (error) {
      console.error('Failed to load trending products:', error);
      setLoading(false);
    }
  };

  const features = [
    {
      icon: <ThreeDRotation sx={{ fontSize: 50 }} />,
      title: '3D Product Visualization',
      description: 'View products in stunning 3D with 360° rotation on pure black background for the best experience',
    },
    {
      icon: <AutoAwesome sx={{ fontSize: 50 }} />,
      title: 'AI-Powered Size Recommendations',
      description: 'Enter your measurements and get personalized size recommendations with 84% accuracy using machine learning',
    },
    {
      icon: <Speed sx={{ fontSize: 50 }} />,
      title: 'Smart Fit Scoring',
      description: 'See fit scores for each product based on your body measurements with detailed chest, waist, and hip analysis',
    },
  ];

  const stats = [
    { value: '84%', label: 'AI Accuracy' },
    { value: '500+', label: 'Training Samples' },
    { value: '3D', label: 'Visualization' },
    { value: '100%', label: 'Satisfaction' },
  ];

  return (
    <Box sx={{ overflow: 'hidden' }}>
      {/* Hero Section with Gradient Animation and Particles */}
      <Box
        sx={{
          background: 'linear-gradient(135deg, #000000 0%, #1a1a1a 50%, #000000 100%)',
          color: 'white',
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
            zIndex: 0,
          },
          '@keyframes pulse': {
            '0%, 100%': { opacity: 0.5 },
            '50%': { opacity: 1 },
          },
        }}
      >
        {/* Animated Particles Background */}
        <ParticleBackground 
          particleCount={80} 
          particleColor="#ffffff" 
          particleSize={3} 
          speed={1.2} 
        />
        <Container maxWidth="lg" sx={{ position: 'relative', zIndex: 1 }}>
          <Box sx={{ textAlign: 'center', mb: 6 }}>
            {/* AURA Style Brand Name */}
            <Typography 
              variant="h2" 
              component="div" 
              sx={{ 
                fontSize: { xs: '2rem', sm: '3rem', md: '4rem' },
                mb: 2,
                fontWeight: 'bold',
                letterSpacing: { xs: '6px', sm: '10px', md: '15px' },
                textAlign: 'center',
                background: 'linear-gradient(135deg, #ffffff 0%, #e0e0e0 100%)',
                WebkitBackgroundClip: 'text',
                WebkitTextFillColor: 'transparent',
                textShadow: '0 0 40px rgba(255,255,255,0.5)',
                animation: 'fadeInScale 1.2s ease-out',
                '@keyframes fadeInScale': {
                  '0%': {
                    opacity: 0,
                    transform: 'scale(0.8)',
                  },
                  '100%': {
                    opacity: 1,
                    transform: 'scale(1)',
                  },
                },
              }}
            >
              AURA STYLE
            </Typography>

            <Chip 
              label="AI-Powered Shopping Experience" 
              icon={<AutoAwesome />}
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
              component="h1" 
              gutterBottom 
              fontWeight="bold"
              sx={{ 
                fontSize: { xs: '2.5rem', sm: '3.5rem', md: '4.5rem' },
                mb: 4,
                '& .letter': {
                  display: 'inline-block',
                  background: 'linear-gradient(135deg, #ffffff 0%, #e0e0e0 100%)',
                  WebkitBackgroundClip: 'text',
                  WebkitTextFillColor: 'transparent',
                  backgroundClip: 'text',
                  opacity: 0,
                  animation: 'fadeInLetter 0.1s ease-in forwards',
                },
                '& .space': {
                  display: 'inline-block',
                  width: '0.3em',
                  opacity: 0,
                  animation: 'fadeInLetter 0.1s ease-in forwards',
                },
                '& .letter:nth-of-type(1)': { animationDelay: '0.5s' },
                '& .letter:nth-of-type(2)': { animationDelay: '0.6s' },
                '& .letter:nth-of-type(3)': { animationDelay: '0.7s' },
                '& .space:nth-of-type(4)': { animationDelay: '0.8s' },
                '& .letter:nth-of-type(5)': { animationDelay: '0.9s' },
                '& .letter:nth-of-type(6)': { animationDelay: '1.0s' },
                '& .letter:nth-of-type(7)': { animationDelay: '1.1s' },
                '& .letter:nth-of-type(8)': { animationDelay: '1.2s' },
                '& .letter:nth-of-type(9)': { animationDelay: '1.3s' },
                '& .letter:nth-of-type(10)': { animationDelay: '1.4s' },
                '& .space:nth-of-type(11)': { animationDelay: '1.5s' },
                '& .letter:nth-of-type(12)': { animationDelay: '1.6s' },
                '& .letter:nth-of-type(13)': { animationDelay: '1.7s' },
                '& .letter:nth-of-type(14)': { animationDelay: '1.8s' },
                '& .space:nth-of-type(15)': { animationDelay: '1.9s' },
                '& .letter:nth-of-type(16)': { animationDelay: '2.0s' },
                '& .letter:nth-of-type(17)': { animationDelay: '2.1s' },
                '& .letter:nth-of-type(18)': { animationDelay: '2.2s' },
                '@keyframes fadeInLetter': {
                  '0%': {
                    opacity: 0,
                  },
                  '100%': {
                    opacity: 1,
                  },
                },
              }}
            >
              <span className="letter">T</span>
              <span className="letter">r</span>
              <span className="letter">y</span>
              <span className="space">&nbsp;</span>
              <span className="letter">B</span>
              <span className="letter">e</span>
              <span className="letter">f</span>
              <span className="letter">o</span>
              <span className="letter">r</span>
              <span className="letter">e</span>
              <span className="space">&nbsp;</span>
              <span className="letter">Y</span>
              <span className="letter">o</span>
              <span className="letter">u</span>
              <span className="space">&nbsp;</span>
              <span className="letter">B</span>
              <span className="letter">u</span>
              <span className="letter">y</span>
            </Typography>
            
            {/* Dancing GIF - Between Title and Description */}
            <Box
              sx={{
                display: 'inline-block',
                mb: 4,
                position: 'relative',
              }}
            >
              <Box
                sx={{
                  width: { xs: '180px', sm: '220px', md: '250px' },
                  height: { xs: '180px', sm: '220px', md: '250px' },
                  borderRadius: '50%',
                  overflow: 'hidden',
                  border: '3px solid rgba(255,255,255,0.2)',
                  boxShadow: '0 20px 60px rgba(0,0,0,0.5)',
                  animation: 'float 4s ease-in-out infinite',
                  '@keyframes float': {
                    '0%, 100%': { transform: 'translateY(0px)' },
                    '50%': { transform: 'translateY(-15px)' },
                  },
                }}
              >
                <img
                  src="/dancing.gif"
                  alt="Virtual Try-On Animation"
                  style={{
                    width: '100%',
                    height: '100%',
                    objectFit: 'cover',
                  }}
                  onError={(e) => {
                    console.error('GIF failed to load from /dancing.gif');
                    e.target.style.display = 'none';
                    e.target.parentElement.innerHTML = '<div style="color: white; display: flex; align-items: center; justify-content: center; height: 100%; font-size: 60px;">👗</div>';
                  }}
                />
              </Box>
            </Box>

            <Typography 
              variant="h5" 
              sx={{ 
                mb: 5, 
                opacity: 0.9,
                fontSize: { xs: '1.1rem', sm: '1.3rem', md: '1.5rem' },
                maxWidth: '800px',
                mx: 'auto',
                lineHeight: 1.6,
              }}
            >
              Experience the future of online shopping with AI-powered virtual try-on and 3D product visualization
            </Typography>
            
            {/* Stats Row with Counter Animation */}
            <Box sx={{ 
              display: 'flex', 
              gap: { xs: 2, sm: 4 }, 
              justifyContent: 'center', 
              flexWrap: 'wrap',
              mb: 5,
            }}>
              {stats.map((stat, index) => (
                <Box 
                  key={index} 
                  sx={{ 
                    textAlign: 'center',
                    animation: `popIn 0.6s ease-out ${index * 0.1}s both`,
                    '@keyframes popIn': {
                      '0%': {
                        opacity: 0,
                        transform: 'scale(0.5) rotate(-10deg)',
                      },
                      '70%': {
                        transform: 'scale(1.1) rotate(5deg)',
                      },
                      '100%': {
                        opacity: 1,
                        transform: 'scale(1) rotate(0deg)',
                      },
                    },
                    '&:hover': {
                      animation: 'bounce 0.6s ease-in-out',
                      '@keyframes bounce': {
                        '0%, 100%': { transform: 'translateY(0)' },
                        '50%': { transform: 'translateY(-10px)' },
                      },
                    },
                  }}
                >
                  <Typography 
                    variant="h3" 
                    fontWeight="bold" 
                    sx={{ 
                      color: '#ffffff',
                      textShadow: '0 0 20px rgba(255,255,255,0.3)',
                    }}
                  >
                    {stat.value}
                  </Typography>
                  <Typography variant="body2" sx={{ color: '#b0b0b0' }}>
                    {stat.label}
                  </Typography>
                </Box>
              ))}
            </Box>

            <Box sx={{ 
              display: 'flex', 
              gap: 2, 
              justifyContent: 'center', 
              flexWrap: 'wrap',
            }}>
              <Button
                variant="contained"
                size="large"
                onClick={() => navigate('/virtual-tryon')}
                endIcon={<ArrowForward />}
                sx={{
                  bgcolor: 'white',
                  color: '#000',
                  px: 4,
                  py: 2,
                  fontSize: '1.1rem',
                  fontWeight: 'bold',
                  borderRadius: 3,
                  boxShadow: '0 8px 32px rgba(255,255,255,0.2)',
                  position: 'relative',
                  overflow: 'hidden',
                  '&::before': {
                    content: '""',
                    position: 'absolute',
                    top: '50%',
                    left: '50%',
                    width: '0',
                    height: '0',
                    borderRadius: '50%',
                    background: 'rgba(0,0,0,0.1)',
                    transform: 'translate(-50%, -50%)',
                    transition: 'width 0.6s, height 0.6s',
                  },
                  '&:hover': { 
                    bgcolor: '#f0f0f0',
                    transform: 'translateY(-4px) scale(1.05)',
                    boxShadow: '0 15px 45px rgba(255,255,255,0.4)',
                    '&::before': {
                      width: '300px',
                      height: '300px',
                    },
                  },
                  transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
                }}
              >
                Start Virtual Try-On
              </Button>
              <Button
                variant="outlined"
                size="large"
                onClick={() => navigate('/products')}
                startIcon={<ShoppingBag />}
                sx={{
                  borderColor: 'white',
                  color: 'white',
                  px: 4,
                  py: 2,
                  fontSize: '1.1rem',
                  fontWeight: 'bold',
                  borderRadius: 3,
                  borderWidth: 2,
                  position: 'relative',
                  overflow: 'hidden',
                  '&::before': {
                    content: '""',
                    position: 'absolute',
                    top: 0,
                    left: '-100%',
                    width: '100%',
                    height: '100%',
                    background: 'rgba(255,255,255,0.1)',
                    transition: 'left 0.5s',
                  },
                  '&:hover': { 
                    borderColor: 'white',
                    bgcolor: 'rgba(255,255,255,0.15)',
                    borderWidth: 2,
                    transform: 'translateY(-4px) scale(1.05)',
                    boxShadow: '0 10px 30px rgba(255,255,255,0.2)',
                    '&::before': {
                      left: '100%',
                    },
                  },
                  transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
                }}
              >
                Browse Products
              </Button>
            </Box>
          </Box>
        </Container>
      </Box>

      {/* Features Section - Changed to Black with Particles */}
      <Box sx={{ bgcolor: '#0a0a0a', py: { xs: 8, md: 12 }, position: 'relative', overflow: 'hidden' }}>
        {/* Subtle Particles for Features Section */}
        <ParticleBackground 
          particleCount={40} 
          particleColor="rgba(255,255,255,0.3)" 
          particleSize={2} 
          speed={0.8} 
        />
      <Container maxWidth="lg">
        <Box sx={{ textAlign: 'center', mb: 8 }}>
          <Typography 
            variant="h2" 
            gutterBottom 
            fontWeight="bold"
            sx={{ 
              fontSize: { xs: '2rem', sm: '2.5rem', md: '3rem' },
              mb: 2,
              color: '#ffffff',
              animation: 'slideInLeft 0.8s ease-out',
              '@keyframes slideInLeft': {
                '0%': {
                  opacity: 0,
                  transform: 'translateX(-50px)',
                },
                '100%': {
                  opacity: 1,
                  transform: 'translateX(0)',
                },
              },
            }}
          >
            Why Choose Us?
          </Typography>
          <Typography 
            variant="h6" 
            color="#888" 
            sx={{ 
              maxWidth: '700px',
              mx: 'auto',
              fontSize: { xs: '1rem', sm: '1.1rem', md: '1.25rem' },
            }}
          >
            AI-powered shopping with 3D visualization and personalized fit recommendations
          </Typography>
        </Box>

        <Grid container spacing={4}>
          {features.map((feature, index) => (
            <Grid 
              item 
              xs={12} 
              md={4} 
              key={index}
              className="animate-on-scroll"
              id={`feature-${index}`}
              sx={{
                opacity: isVisible[`feature-${index}`] ? 1 : 0,
                transform: isVisible[`feature-${index}`] ? 'translateY(0)' : 'translateY(50px)',
                transition: `all 0.8s ease-out ${index * 0.2}s`,
              }}
            >
              <Card 
                elevation={0}
                sx={{ 
                  height: '100%', 
                  textAlign: 'center', 
                  p: 4,
                  borderRadius: 4,
                  bgcolor: '#1a1a1a',
                  border: '2px solid #333',
                  transition: 'all 0.5s cubic-bezier(0.4, 0, 0.2, 1)',
                  position: 'relative',
                  overflow: 'hidden',
                  cursor: 'pointer',
                  '&::before': {
                    content: '""',
                    position: 'absolute',
                    top: 0,
                    left: 0,
                    right: 0,
                    height: '3px',
                    background: 'linear-gradient(90deg, #ffffff, #888888)',
                    opacity: 0,
                    transition: 'opacity 0.3s',
                  },
                  '&::after': {
                    content: '""',
                    position: 'absolute',
                    top: '50%',
                    left: '50%',
                    width: '0',
                    height: '0',
                    borderRadius: '50%',
                    background: 'radial-gradient(circle, rgba(255,255,255,0.1), transparent)',
                    transform: 'translate(-50%, -50%)',
                    transition: 'width 0.6s, height 0.6s',
                  },
                  '&:hover': { 
                    transform: 'translateY(-15px) scale(1.03)',
                    boxShadow: '0 30px 80px rgba(255,255,255,0.15)',
                    borderColor: '#ffffff',
                    bgcolor: '#222222',
                    '& .feature-icon': {
                      transform: 'scale(1.3) rotate(360deg)',
                      boxShadow: '0 15px 40px rgba(255,255,255,0.3)',
                    },
                    '& .feature-title': {
                      color: '#ffffff',
                      textShadow: '0 0 20px rgba(255,255,255,0.5)',
                    },
                    '&::before': {
                      opacity: 1,
                    },
                    '&::after': {
                      width: '400px',
                      height: '400px',
                    },
                  },
                }}
              >
                <Avatar
                  className="feature-icon"
                  sx={{ 
                    width: 100, 
                    height: 100, 
                    mx: 'auto',
                    mb: 3,
                    bgcolor: 'rgba(255,255,255,0.05)',
                    color: '#ffffff',
                    border: '2px solid rgba(255,255,255,0.2)',
                    transition: 'all 0.6s cubic-bezier(0.68, -0.55, 0.265, 1.55)',
                    position: 'relative',
                    zIndex: 2,
                  }}
                >
                  {feature.icon}
                </Avatar>
                <Typography 
                  className="feature-title"
                  variant="h5" 
                  gutterBottom 
                  fontWeight="bold" 
                  sx={{ 
                    mb: 2, 
                    color: '#ffffff',
                    transition: 'all 0.3s',
                    position: 'relative',
                    zIndex: 2,
                  }}
                >
                  {feature.title}
                </Typography>
                <Typography 
                  variant="body1" 
                  color="#888" 
                  sx={{ 
                    lineHeight: 1.8,
                    position: 'relative',
                    zIndex: 2,
                  }}
                >
                  {feature.description}
                </Typography>
              </Card>
            </Grid>
          ))}
        </Grid>
        </Container>
      </Box>

      {/* Trending Products - Changed to Black with Particles */}
      <Box sx={{ bgcolor: '#000000', py: { xs: 8, md: 12 }, position: 'relative', overflow: 'hidden' }}>
        {/* Particles for Trending Section */}
        <ParticleBackground 
          particleCount={50} 
          particleColor="rgba(255,255,255,0.4)" 
          particleSize={2.5} 
          speed={1} 
        />
        <Container maxWidth="lg">
          <Box sx={{ textAlign: 'center', mb: 6 }}>
            <Chip 
              icon={<TrendingUp />}
              label="Popular Right Now"
              sx={{ 
                mb: 2,
                bgcolor: 'rgba(255,255,255,0.1)',
                color: 'white',
                fontWeight: 'bold',
                px: 2,
                py: 2.5,
                border: '1px solid rgba(255,255,255,0.2)',
              }}
            />
            <Typography 
              variant="h2" 
              fontWeight="bold"
              sx={{ 
                fontSize: { xs: '2rem', sm: '2.5rem', md: '3rem' },
                color: '#ffffff',
                animation: 'zoomIn 0.8s ease-out',
                '@keyframes zoomIn': {
                  '0%': {
                    opacity: 0,
                    transform: 'scale(0.8)',
                  },
                  '100%': {
                    opacity: 1,
                    transform: 'scale(1)',
                  },
                },
              }}
            >
              Trending Products
            </Typography>
          </Box>
          
          {loading ? (
            <Box sx={{ textAlign: 'center', py: 8 }}>
              <Typography variant="h5" sx={{ color: '#888', mb: 2 }}>
                Loading products...
              </Typography>
            </Box>
          ) : trendingProducts.length === 0 ? (
            <Box sx={{ textAlign: 'center', py: 8 }}>
              <Typography variant="h5" sx={{ color: '#888', mb: 2 }}>
                No products available yet
              </Typography>
              <Typography variant="body1" sx={{ color: '#666', mb: 3 }}>
                Please make sure your backend is running and products are added to the database
              </Typography>
              <Button
                variant="contained"
                onClick={() => window.location.reload()}
                sx={{
                  bgcolor: '#ffffff',
                  color: '#000000',
                  '&:hover': {
                    bgcolor: '#e0e0e0',
                  }
                }}
              >
                Retry
              </Button>
            </Box>
          ) : (
            <>
              <Grid container spacing={{ xs: 2, sm: 3, md: 4 }}>
            {trendingProducts.map((product, index) => (
              <Grid 
                item 
                xs={12} 
                sm={6} 
                md={4} 
                key={product.id}
                className="animate-on-scroll"
                id={`product-${index}`}
                sx={{
                  opacity: isVisible[`product-${index}`] ? 1 : 0,
                  transform: isVisible[`product-${index}`] ? 'scale(1) rotateX(0deg)' : 'scale(0.7) rotateX(-20deg)',
                  transition: `all 0.8s cubic-bezier(0.34, 1.56, 0.64, 1) ${index * 0.15}s`,
                }}
              >
                <Card 
                  elevation={0}
                  sx={{ 
                    cursor: 'pointer',
                    borderRadius: 4,
                    overflow: 'hidden',
                    transition: 'all 0.5s cubic-bezier(0.4, 0, 0.2, 1)',
                    bgcolor: '#1a1a1a',
                    border: '2px solid #333',
                    position: 'relative',
                    transformStyle: 'preserve-3d',
                    perspective: '1000px',
                    '&::before': {
                      content: '""',
                      position: 'absolute',
                      top: '-50%',
                      left: '-50%',
                      width: '200%',
                      height: '200%',
                      background: 'linear-gradient(45deg, transparent, rgba(255,255,255,0.1), transparent)',
                      transform: 'rotate(45deg)',
                      transition: 'all 0.6s',
                      opacity: 0,
                      zIndex: 1,
                    },
                    '&::after': {
                      content: '""',
                      position: 'absolute',
                      inset: 0,
                      background: 'linear-gradient(135deg, rgba(255,255,255,0.05) 0%, transparent 50%, rgba(255,255,255,0.05) 100%)',
                      opacity: 0,
                      transition: 'opacity 0.5s',
                      zIndex: 1,
                      pointerEvents: 'none',
                    },
                    '&:hover': { 
                      transform: 'translateY(-20px) scale(1.05)',
                      boxShadow: '0 30px 90px rgba(255,255,255,0.2), 0 0 0 1px rgba(255,255,255,0.3)',
                      borderColor: '#ffffff',
                      '&::before': {
                        top: '100%',
                        left: '100%',
                        opacity: 1,
                      },
                      '&::after': {
                        opacity: 1,
                      },
                      '& .product-image-container': {
                        transform: 'scale(1.15)',
                      },
                      '& .product-badge': {
                        transform: 'scale(1.2) rotate(360deg)',
                        boxShadow: '0 5px 20px rgba(255,255,255,0.5)',
                      },
                      '& .product-content': {
                        transform: 'translateY(-5px)',
                      },
                      '& .product-button': {
                        transform: 'translateY(-5px) scale(1.05)',
                        boxShadow: '0 10px 30px rgba(255,255,255,0.4)',
                        bgcolor: '#ffffff',
                      },
                      '& .product-price': {
                        transform: 'scale(1.1)',
                        textShadow: '0 0 20px rgba(255,255,255,0.5)',
                      },
                    },
                  }}
                  onClick={() => navigate(`/products`)}
                >
                  <Box 
                    className="product-image-container"
                    sx={{ 
                      position: 'relative', 
                      overflow: 'hidden', 
                      bgcolor: '#000', 
                      height: { xs: 280, sm: 330, md: 380 },
                      transition: 'transform 0.6s cubic-bezier(0.4, 0, 0.2, 1)',
                    }}
                  >
                    {product.model3dUrl ? (
                      <Model3DViewer 
                        modelUrl={`http://localhost:8082${product.model3dUrl}`}
                        height={{ xs: 280, sm: 330, md: 380 }}
                        width="100%"
                        productColor={product.color?.split(',')[0]?.trim() || 'White'}
                        productCategory={product.category}
                        showColorPicker={false}
                        showControls={false}
                        autoRotate={false}
                      />
                    ) : (
                      <CardMedia
                        component="img"
                        height="380"
                        image={product.imageUrl || `https://via.placeholder.com/300x400?text=${encodeURIComponent(product.name)}`}
                        alt={product.name}
                        sx={{ 
                          transition: 'transform 0.6s cubic-bezier(0.4, 0, 0.2, 1)',
                          objectFit: 'cover',
                        }}
                      />
                    )}
                    <Chip 
                      className="product-badge"
                      label="New" 
                      size="small"
                      sx={{ 
                        position: 'absolute',
                        top: 16,
                        right: 16,
                        bgcolor: 'white',
                        color: '#000',
                        fontWeight: 'bold',
                        zIndex: 10,
                        transition: 'all 0.5s cubic-bezier(0.68, -0.55, 0.265, 1.55)',
                      }}
                    />
                    {/* Animated corner accent */}
                    <Box
                      sx={{
                        position: 'absolute',
                        bottom: 0,
                        left: 0,
                        width: '100%',
                        height: '4px',
                        background: 'linear-gradient(90deg, transparent, #ffffff, transparent)',
                        animation: 'shimmer 3s infinite',
                        '@keyframes shimmer': {
                          '0%': { transform: 'translateX(-100%)' },
                          '100%': { transform: 'translateX(100%)' },
                        },
                      }}
                    />
                  </Box>
                  <CardContent 
                    className="product-content"
                    sx={{ 
                      p: 3, 
                      position: 'relative', 
                      zIndex: 2,
                      transition: 'transform 0.3s',
                    }}
                  >
                    <Typography 
                      variant="h6" 
                      gutterBottom 
                      fontWeight="bold" 
                      color="#ffffff"
                      sx={{
                        transition: 'all 0.3s',
                      }}
                    >
                      {product.name}
                    </Typography>
                    <Typography variant="body2" color="#888" sx={{ mb: 2 }}>
                      {product.brand}
                    </Typography>
                    <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 2 }}>
                      <Typography 
                        className="product-price"
                        variant="h5" 
                        color="white" 
                        fontWeight="bold"
                        sx={{
                          transition: 'all 0.3s',
                        }}
                      >
                        ${product.price}
                      </Typography>
                      <Box 
                        sx={{ 
                          display: 'flex', 
                          alignItems: 'center', 
                          gap: 0.5,
                          animation: 'pulse 2s ease-in-out infinite',
                          '@keyframes pulse': {
                            '0%, 100%': { opacity: 1 },
                            '50%': { opacity: 0.7 },
                          },
                        }}
                      >
                        <Star sx={{ color: '#ffc107', fontSize: 20 }} />
                        <Typography variant="body2" fontWeight="bold" color="#ffffff">
                          {product.rating || 4.5}
                        </Typography>
                      </Box>
                    </Box>
                    <Button
                      className="product-button"
                      fullWidth
                      variant="contained"
                      endIcon={<ThreeDRotation />}
                      sx={{ 
                        py: 1.2,
                        borderRadius: 2,
                        fontWeight: 'bold',
                        bgcolor: '#ffffff',
                        color: '#000',
                        transition: 'all 0.4s cubic-bezier(0.4, 0, 0.2, 1)',
                        position: 'relative',
                        overflow: 'hidden',
                        '&::before': {
                          content: '""',
                          position: 'absolute',
                          top: '50%',
                          left: '50%',
                          width: '0',
                          height: '0',
                          borderRadius: '50%',
                          background: 'rgba(0,0,0,0.1)',
                          transform: 'translate(-50%, -50%)',
                          transition: 'width 0.6s, height 0.6s',
                        },
                        '&:hover::before': {
                          width: '300px',
                          height: '300px',
                        },
                      }}
                      onClick={(e) => {
                        e.stopPropagation();
                        navigate('/virtual-tryon');
                      }}
                    >
                      Try in 3D
                    </Button>
                  </CardContent>
                </Card>
              </Grid>
            ))}
          </Grid>

          {trendingProducts.length > 0 && (
            <Box sx={{ textAlign: 'center', mt: 6 }}>
              <Button
                variant="outlined"
                size="large"
                endIcon={<ArrowForward />}
                onClick={() => navigate('/products')}
                sx={{
                  px: 4,
                  py: 1.5,
                  borderRadius: 3,
                  fontWeight: 'bold',
                  borderWidth: 2,
                  borderColor: '#ffffff',
                  color: '#ffffff',
                  '&:hover': {
                    borderWidth: 2,
                    borderColor: '#ffffff',
                    bgcolor: 'rgba(255,255,255,0.1)',
                  },
                }}
              >
                View All Products
              </Button>
            </Box>
          )}
            </>
          )}
        </Container>
      </Box>

      {/* Call to Action with Particles */}
      <Box 
        sx={{ 
          background: 'linear-gradient(135deg, #000000 0%, #1a1a1a 100%)',
          color: 'white', 
          py: { xs: 8, md: 10 },
          position: 'relative',
          overflow: 'hidden',
        }}
      >
        {/* Particles for CTA Section */}
        <ParticleBackground 
          particleCount={60} 
          particleColor="#ffffff" 
          particleSize={3} 
          speed={1.5} 
        />
        <Container maxWidth="md" sx={{ position: 'relative', zIndex: 1 }}>
          <Box sx={{ textAlign: 'center' }}>
            <AutoAwesome 
              sx={{ 
                fontSize: 60, 
                mb: 3, 
                opacity: 0.9,
                animation: 'spin 3s linear infinite',
                '@keyframes spin': {
                  '0%': { transform: 'rotate(0deg)' },
                  '100%': { transform: 'rotate(360deg)' },
                },
              }} 
            />
            <Typography 
              variant="h2" 
              gutterBottom 
              fontWeight="bold"
              sx={{ 
                fontSize: { xs: '2rem', sm: '2.5rem', md: '3rem' },
                mb: 2,
                animation: 'bounceIn 1s ease-out',
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
              Ready to Transform Your Shopping?
            </Typography>
            <Typography 
              variant="h6" 
              sx={{ 
                mb: 4, 
                opacity: 0.9,
                fontSize: { xs: '1rem', sm: '1.1rem', md: '1.25rem' },
                lineHeight: 1.6,
              }}
            >
              Join thousands of customers who shop smarter with AI-powered virtual try-on
            </Typography>
            
            <Box sx={{ 
              display: 'flex', 
              gap: 2, 
              justifyContent: 'center', 
              mb: 4, 
              flexWrap: 'wrap',
            }}>
              {[
                { icon: CheckCircle, text: '84% AI Accuracy' },
                { icon: CheckCircle, text: '3D Visualization' },
                { icon: CheckCircle, text: 'Smart Fit Scoring' },
              ].map((item, index) => (
                <Box 
                  key={index}
                  sx={{ 
                    display: 'flex', 
                    alignItems: 'center', 
                    gap: 1,
                    animation: `slideInUp 0.6s ease-out ${index * 0.1}s both`,
                    '@keyframes slideInUp': {
                      '0%': {
                        opacity: 0,
                        transform: 'translateY(30px)',
                      },
                      '100%': {
                        opacity: 1,
                        transform: 'translateY(0)',
                      },
                    },
                    '&:hover': {
                      transform: 'scale(1.1)',
                      transition: 'transform 0.3s',
                    },
                  }}
                >
                  <item.icon sx={{ color: '#4caf50' }} />
                  <Typography>{item.text}</Typography>
                </Box>
              ))}
            </Box>

            <Button
              variant="contained"
              size="large"
              endIcon={<ArrowForward />}
              onClick={() => navigate('/virtual-tryon')}
              sx={{
                bgcolor: 'white',
                color: '#000',
                px: 5,
                py: 2,
                fontSize: '1.1rem',
                fontWeight: 'bold',
                borderRadius: 3,
                boxShadow: '0 8px 32px rgba(255,255,255,0.2)',
                position: 'relative',
                overflow: 'hidden',
                '&::before': {
                  content: '""',
                  position: 'absolute',
                  top: '50%',
                  left: '50%',
                  width: '0',
                  height: '0',
                  borderRadius: '50%',
                  background: 'linear-gradient(135deg, #667eea, #764ba2)',
                  transform: 'translate(-50%, -50%)',
                  transition: 'width 0.6s, height 0.6s',
                  opacity: 0.2,
                },
                '&:hover': { 
                  bgcolor: '#f0f0f0',
                  transform: 'translateY(-4px) scale(1.08)',
                  boxShadow: '0 15px 50px rgba(255,255,255,0.4)',
                  '&::before': {
                    width: '400px',
                    height: '400px',
                  },
                },
                transition: 'all 0.4s cubic-bezier(0.4, 0, 0.2, 1)',
                animation: 'pulse 2s ease-in-out infinite',
                '@keyframes pulse': {
                  '0%, 100%': {
                    boxShadow: '0 8px 32px rgba(255,255,255,0.2)',
                  },
                  '50%': {
                    boxShadow: '0 8px 40px rgba(255,255,255,0.4)',
                  },
                },
              }}
            >
              Get Started Now
            </Button>
          </Box>
        </Container>
      </Box>
    </Box>
  );
};

export default HomePage;
import React, { useEffect, useState } from 'react';
import { Box, Typography } from '@mui/material';
import './Preloader.css';

const Preloader = ({ onLoadComplete }) => {
  const [progress, setProgress] = useState(0);
  const [isLoaded, setIsLoaded] = useState(false);

  useEffect(() => {
    // Simulate loading progress
    const interval = setInterval(() => {
      setProgress((prev) => {
        if (prev >= 100) {
          clearInterval(interval);
          setTimeout(() => {
            setIsLoaded(true);
            setTimeout(() => {
              if (onLoadComplete) onLoadComplete();
            }, 500);
          }, 300);
          return 100;
        }
        return prev + Math.random() * 15;
      });
    }, 150);

    return () => clearInterval(interval);
  }, [onLoadComplete]);

  if (isLoaded) return null;

  return (
    <Box
      className={`preloader ${isLoaded ? 'fade-out' : ''}`}
      sx={{
        position: 'fixed',
        top: 0,
        left: 0,
        width: '100vw',
        height: '100vh',
        background: 'linear-gradient(135deg, #000000 0%, #1a1a1a 50%, #000000 100%)',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        zIndex: 9999,
        overflow: 'hidden',
      }}
    >
      {/* Animated Background Particles */}
      <Box className="preloader-particles">
        {[...Array(30)].map((_, i) => (
          <Box
            key={i}
            className="particle"
            sx={{
              position: 'absolute',
              width: `${Math.random() * 4 + 2}px`,
              height: `${Math.random() * 4 + 2}px`,
              background: '#ffffff',
              borderRadius: '50%',
              top: `${Math.random() * 100}%`,
              left: `${Math.random() * 100}%`,
              animation: `float ${Math.random() * 3 + 2}s ease-in-out infinite`,
              animationDelay: `${Math.random() * 2}s`,
              opacity: Math.random() * 0.5 + 0.3,
            }}
          />
        ))}
      </Box>

      {/* Dancing GIF Animation */}
      <Box
        sx={{
          position: 'relative',
          mb: 4,
          width: { xs: '150px', sm: '180px', md: '200px' },
          height: { xs: '150px', sm: '180px', md: '200px' },
        }}
      >
        <Box
          sx={{
            width: '100%',
            height: '100%',
            borderRadius: '50%',
            overflow: 'hidden',
            border: '4px solid rgba(255,255,255,0.3)',
            boxShadow: '0 0 40px rgba(255,255,255,0.4)',
            animation: 'pulse 2s ease-in-out infinite',
            background: 'rgba(255,255,255,0.05)',
          }}
        >
          <img
            src="/dancing.gif"
            alt="Loading Animation"
            style={{
              width: '100%',
              height: '100%',
              objectFit: 'cover',
            }}
            onError={(e) => {
              console.error('GIF failed to load, using fallback');
              e.target.style.display = 'none';
              e.target.parentElement.innerHTML = '<div style="color: white; display: flex; align-items: center; justify-content: center; height: 100%; font-size: 80px; animation: rotate 3s linear infinite;">👗</div>';
            }}
          />
        </Box>
      </Box>

      {/* Brand Name */}
      <Typography
        variant="h3"
        sx={{
          color: '#ffffff',
          fontWeight: 'bold',
          fontSize: { xs: '2.2rem', sm: '3rem', md: '3.5rem' },
          mb: 2,
          textAlign: 'center',
          letterSpacing: '8px',
          animation: 'fadeIn 1s ease-in',
          textShadow: '0 0 30px rgba(255,255,255,0.5)',
          background: 'linear-gradient(135deg, #ffffff 0%, #e0e0e0 100%)',
          WebkitBackgroundClip: 'text',
          WebkitTextFillColor: 'transparent',
        }}
      >
        AURA STYLE
      </Typography>

      <Typography
        variant="body1"
        sx={{
          color: '#b0b0b0',
          fontSize: { xs: '1rem', sm: '1.2rem', md: '1.3rem' },
          mb: 4,
          textAlign: 'center',
          letterSpacing: '3px',
          fontWeight: 500,
          animation: 'fadeIn 1.5s ease-in',
          textShadow: '0 2px 10px rgba(255,255,255,0.2)',
        }}
      >
        Try Before You Buy
      </Typography>

      {/* Progress Bar */}
      <Box
        sx={{
          width: { xs: '80%', sm: '400px', md: '500px' },
          height: '4px',
          background: 'rgba(255,255,255,0.1)',
          borderRadius: '10px',
          overflow: 'hidden',
          mb: 2,
          position: 'relative',
        }}
      >
        <Box
          sx={{
            width: `${Math.min(progress, 100)}%`,
            height: '100%',
            background: 'linear-gradient(90deg, #ffffff, #9333ea)',
            borderRadius: '10px',
            transition: 'width 0.3s ease',
            boxShadow: '0 0 20px rgba(255,255,255,0.5)',
          }}
        />
      </Box>

      {/* Progress Percentage */}
      <Typography
        variant="body2"
        sx={{
          color: '#ffffff',
          fontSize: { xs: '0.8rem', sm: '0.9rem' },
          fontWeight: 'bold',
          animation: 'fadeIn 2s ease-in',
        }}
      >
        {Math.round(progress)}%
      </Typography>

      {/* Loading Text Animation */}
      <Box
        sx={{
          mt: 3,
          display: 'flex',
          gap: 0.5,
        }}
      >
        {['L', 'o', 'a', 'd', 'i', 'n', 'g'].map((letter, index) => (
          <Typography
            key={index}
            sx={{
              color: '#ffffff',
              fontSize: { xs: '0.9rem', sm: '1rem' },
              animation: `wave 1.5s ease-in-out infinite`,
              animationDelay: `${index * 0.1}s`,
              opacity: 0.7,
            }}
          >
            {letter}
          </Typography>
        ))}
        <Box
          sx={{
            display: 'flex',
            gap: 0.3,
            alignItems: 'flex-end',
            ml: 0.5,
          }}
        >
          {[0, 1, 2].map((i) => (
            <Box
              key={i}
              sx={{
                width: '6px',
                height: '6px',
                borderRadius: '50%',
                background: '#ffffff',
                animation: `bounce 1.4s ease-in-out infinite`,
                animationDelay: `${i * 0.2}s`,
              }}
            />
          ))}
        </Box>
      </Box>
    </Box>
  );
};

export default Preloader;

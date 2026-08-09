import React from 'react';
import { Box, Chip, Typography, Tooltip } from '@mui/material';
import { CheckCircle, Info } from '@mui/icons-material';

const FitBadge = ({ fitScore, fitLevel, size = 'medium', showDetails = false }) => {
  const getBadgeConfig = () => {
    if (fitScore >= 90) {
      return {
        label: 'PERFECT FIT',
        bgcolor: '#ffffff',
        color: '#000000',
        icon: '✓',
        description: 'This will fit you perfectly!'
      };
    } else if (fitScore >= 75) {
      return {
        label: 'GOOD FIT',
        bgcolor: '#e0e0e0',
        color: '#000000',
        icon: '✓',
        description: 'This should fit you well'
      };
    } else if (fitScore >= 60) {
      return {
        label: 'LOOSE FIT',
        bgcolor: '#666666',
        color: '#ffffff',
        icon: '~',
        description: 'This might be slightly loose'
      };
    } else {
      return {
        label: 'TIGHT FIT',
        bgcolor: '#333333',
        color: '#ffffff',
        icon: '!',
        description: 'This might be tight'
      };
    }
  };

  const config = getBadgeConfig();

  if (size === 'small') {
    return (
      <Tooltip title={`${fitScore}% fit - ${config.description}`}>
        <Chip
          label={config.label}
          size="small"
          sx={{
            bgcolor: config.bgcolor,
            color: config.color,
            fontWeight: 'bold',
            fontSize: '0.7rem',
            height: 20,
          }}
        />
      </Tooltip>
    );
  }

  if (showDetails) {
    return (
      <Box sx={{ 
        bgcolor: config.bgcolor,
        color: config.color,
        p: 2,
        borderRadius: 2,
        border: '2px solid',
        borderColor: config.bgcolor === '#ffffff' ? '#000000' : config.bgcolor
      }}>
        <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 1 }}>
          <Typography variant="h6" fontWeight="bold">
            {config.icon} {config.label}
          </Typography>
          <Typography variant="h5" fontWeight="bold">
            {fitScore}%
          </Typography>
        </Box>
        <Typography variant="body2">
          {config.description}
        </Typography>
      </Box>
    );
  }

  return (
    <Chip
      label={`${config.icon} ${config.label} - ${fitScore}%`}
      sx={{
        bgcolor: config.bgcolor,
        color: config.color,
        fontWeight: 'bold',
        fontSize: '0.9rem',
        px: 1,
      }}
    />
  );
};

export default FitBadge;

import React, { useState } from 'react';
import { 
  Box, Typography, Paper, Tabs, Tab, Divider, Grid, TextField, 
  Switch, FormControlLabel, Button, Slider, Snackbar, Alert
} from '@mui/material';
import { 
  Storefront, AutoAwesome, NotificationsActive, Save
} from '@mui/icons-material';

// Custom TabPanel component
function TabPanel(props) {
  const { children, value, index, ...other } = props;
  return (
    <div
      role="tabpanel"
      hidden={value !== index}
      id={`settings-tabpanel-${index}`}
      aria-labelledby={`settings-tab-${index}`}
      {...other}
    >
      {value === index && (
        <Box sx={{ p: 3 }}>
          {children}
        </Box>
      )}
    </div>
  );
}

const SettingsPage = () => {
  const [tabValue, setTabValue] = useState(0);
  const [snackbarOpen, setSnackbarOpen] = useState(false);

  // Dummy State for Settings
  const [settings, setSettings] = useState({
    storeName: 'Virtual Try-On Boutique',
    supportEmail: 'support@virtualtryon.com',
    address: '123 Fashion Ave, Colombo 03',
    maintenanceMode: false,
    aiConfidence: 85,
    enable3dRendering: true,
    autoExtractMeasurements: true,
    emailNewOrders: true,
    emailReturns: true,
    emailLowInventory: false,
  });

  const handleTabChange = (event, newValue) => {
    setTabValue(newValue);
  };

  const handleChange = (name) => (event) => {
    const value = event.target.type === 'checkbox' ? event.target.checked : event.target.value;
    setSettings({ ...settings, [name]: value });
  };

  const handleSliderChange = (event, newValue) => {
    setSettings({ ...settings, aiConfidence: newValue });
  };

  const handleSave = () => {
    // Simulate API call to save settings
    setSnackbarOpen(true);
  };

  const handleCloseSnackbar = (event, reason) => {
    if (reason === 'clickaway') return;
    setSnackbarOpen(false);
  };

  return (
    <Box sx={{ p: 3, maxWidth: 1000, margin: '0 auto' }}>
      <Typography variant="h4" fontWeight="bold" gutterBottom sx={{ mb: 4, color: 'text.primary' }}>
        System Settings
      </Typography>

      <Paper elevation={3} sx={{ bgcolor: 'background.paper', borderRadius: 2, overflow: 'hidden' }}>
        <Box sx={{ borderBottom: 1, borderColor: 'divider', bgcolor: 'rgba(255,255,255,0.02)' }}>
          <Tabs 
            value={tabValue} 
            onChange={handleTabChange} 
            indicatorColor="primary"
            textColor="primary"
            variant="fullWidth"
          >
            <Tab icon={<Storefront />} iconPosition="start" label="General Store" />
            <Tab icon={<AutoAwesome />} iconPosition="start" label="AI Configuration" />
            <Tab icon={<NotificationsActive />} iconPosition="start" label="Notifications" />
          </Tabs>
        </Box>

        {/* 1. General Store Settings */}
        <TabPanel value={tabValue} index={0}>
          <Typography variant="h6" gutterBottom fontWeight="medium">
            Store Profile
          </Typography>
          <Typography variant="body2" color="textSecondary" sx={{ mb: 3 }}>
            Update your public store information and operational status.
          </Typography>

          <Grid container spacing={3}>
            <Grid item xs={12} sm={6}>
              <TextField
                fullWidth
                label="Store Name"
                variant="outlined"
                value={settings.storeName}
                onChange={handleChange('storeName')}
              />
            </Grid>
            <Grid item xs={12} sm={6}>
              <TextField
                fullWidth
                label="Support Email"
                variant="outlined"
                type="email"
                value={settings.supportEmail}
                onChange={handleChange('supportEmail')}
              />
            </Grid>
            <Grid item xs={12}>
              <TextField
                fullWidth
                label="Physical Address"
                variant="outlined"
                multiline
                rows={2}
                value={settings.address}
                onChange={handleChange('address')}
              />
            </Grid>
          </Grid>

          <Divider sx={{ my: 4 }} />

          <Typography variant="h6" gutterBottom fontWeight="medium">
            System Status
          </Typography>
          <FormControlLabel
            control={<Switch checked={settings.maintenanceMode} onChange={handleChange('maintenanceMode')} color="error" />}
            label="Enable Maintenance Mode (Takes storefront offline)"
          />
        </TabPanel>

        {/* 2. AI Engine Configuration */}
        <TabPanel value={tabValue} index={1}>
          <Typography variant="h6" gutterBottom fontWeight="medium">
            Machine Learning Parameters
          </Typography>
          <Typography variant="body2" color="textSecondary" sx={{ mb: 4 }}>
            Configure how the Flask AI Service interacts with customers.
          </Typography>

          <Box sx={{ mb: 5 }}>
            <Typography id="confidence-slider" gutterBottom>
              Minimum AI Confidence Threshold: {settings.aiConfidence}%
            </Typography>
            <Typography variant="caption" color="textSecondary" display="block" sx={{ mb: 1 }}>
              Sizes will only be recommended if the Random Forest model's certainty is above this percentage.
            </Typography>
            <Slider
              value={settings.aiConfidence}
              onChange={handleSliderChange}
              aria-labelledby="confidence-slider"
              valueLabelDisplay="auto"
              step={1}
              marks
              min={50}
              max={99}
              sx={{ width: '80%', ml: 2 }}
            />
          </Box>

          <Divider sx={{ my: 4 }} />

          <Typography variant="h6" gutterBottom fontWeight="medium">
            Feature Toggles
          </Typography>
          <Grid container spacing={2}>
            <Grid item xs={12}>
              <FormControlLabel
                control={<Switch checked={settings.enable3dRendering} onChange={handleChange('enable3dRendering')} color="primary" />}
                label="Enable Three.js 3D Model Rendering on Storefront"
              />
            </Grid>
            <Grid item xs={12}>
              <FormControlLabel
                control={<Switch checked={settings.autoExtractMeasurements} onChange={handleChange('autoExtractMeasurements')} color="primary" />}
                label="Allow automated body measurement extraction (MediaPipe Vision)"
              />
            </Grid>
          </Grid>
          
          <Box sx={{ mt: 4, p: 2, bgcolor: 'rgba(59, 130, 246, 0.1)', borderRadius: 1, border: '1px solid rgba(59, 130, 246, 0.2)' }}>
             <Typography variant="body2">
               <strong>Note:</strong> To retrain the ML model with new size charts, please use the dedicated <a href="http://localhost:5001" target="_blank" rel="noreferrer" style={{color: '#60a5fa'}}>AI Training Dashboard (Port 5001)</a>.
             </Typography>
          </Box>
        </TabPanel>

        {/* 3. Notifications */}
        <TabPanel value={tabValue} index={2}>
          <Typography variant="h6" gutterBottom fontWeight="medium">
            Email Alerts
          </Typography>
          <Typography variant="body2" color="textSecondary" sx={{ mb: 3 }}>
            Manage which events trigger an email to the support team.
          </Typography>

          <Grid container spacing={2}>
            <Grid item xs={12}>
              <FormControlLabel
                control={<Switch checked={settings.emailNewOrders} onChange={handleChange('emailNewOrders')} />}
                label="New Customer Orders"
              />
            </Grid>
            <Grid item xs={12}>
              <FormControlLabel
                control={<Switch checked={settings.emailReturns} onChange={handleChange('emailReturns')} />}
                label="Product Return Requests"
              />
            </Grid>
            <Grid item xs={12}>
              <FormControlLabel
                control={<Switch checked={settings.emailLowInventory} onChange={handleChange('emailLowInventory')} />}
                label="Low Inventory Warnings (Stock < 5)"
              />
            </Grid>
          </Grid>
        </TabPanel>

        {/* Save Button Footer */}
        <Box sx={{ p: 3, bgcolor: 'rgba(0,0,0,0.2)', display: 'flex', justifyContent: 'flex-end', borderTop: 1, borderColor: 'divider' }}>
          <Button 
            variant="contained" 
            color="primary" 
            startIcon={<Save />}
            onClick={handleSave}
            size="large"
          >
            Save Changes
          </Button>
        </Box>
      </Paper>

      <Snackbar 
        open={snackbarOpen} 
        autoHideDuration={4000} 
        onClose={handleCloseSnackbar}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}
      >
        <Alert onClose={handleCloseSnackbar} severity="success" sx={{ width: '100%' }}>
          Settings successfully updated!
        </Alert>
      </Snackbar>
    </Box>
  );
};

export default SettingsPage;

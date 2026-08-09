import React, { useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import {
  Box, Drawer, AppBar, Toolbar, List, Typography, Divider, IconButton,
  ListItem, ListItemButton, ListItemIcon, ListItemText, Avatar, Menu, MenuItem
} from '@mui/material';
import {
  Menu as MenuIcon, Dashboard, Inventory, People, AdminPanelSettings,
  Analytics, Settings, Logout, AccountCircle
} from '@mui/icons-material';
import { useAuth } from '../../contexts/AuthContext';

const drawerWidth = 240;

const Layout = ({ children }) => {
  const [mobileOpen, setMobileOpen] = useState(false);
  const [anchorEl, setAnchorEl] = useState(null);
  const navigate = useNavigate();
  const location = useLocation();
  const { user, logout } = useAuth();

  const handleDrawerToggle = () => {
    setMobileOpen(!mobileOpen);
  };

  const handleProfileMenuOpen = (event) => {
    setAnchorEl(event.currentTarget);
  };

  const handleProfileMenuClose = () => {
    setAnchorEl(null);
  };

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  const menuItems = [
    { text: 'Dashboard', icon: <Dashboard />, path: '/dashboard' },
    { text: 'Products', icon: <Inventory />, path: '/products' },
    { text: 'Customers', icon: <People />, path: '/customers' },
    { text: 'Admins', icon: <AdminPanelSettings />, path: '/admins' },
    { text: 'Analytics', icon: <Analytics />, path: '/analytics' },
    { text: 'Settings', icon: <Settings />, path: '/settings' },
  ];

  const drawer = (
    <Box sx={{ height: '100%', display: 'flex', flexDirection: 'column' }}>
      <Toolbar sx={{ 
        background: 'linear-gradient(135deg, #3b82f6 0%, #8b5cf6 100%)',
        minHeight: '80px !important',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'flex-start',
        justifyContent: 'center',
        padding: '16px 24px',
      }}>
        <Typography variant="h5" sx={{ 
          fontWeight: 700,
          background: 'linear-gradient(135deg, #ffffff 0%, #e2e8f0 100%)',
          WebkitBackgroundClip: 'text',
          WebkitTextFillColor: 'transparent',
          mb: 0.5,
        }}>
          Virtual Try-On
        </Typography>
        <Typography variant="caption" sx={{ color: 'rgba(255,255,255,0.8)' }}>
          Admin Dashboard
        </Typography>
      </Toolbar>
      <Divider sx={{ borderColor: '#334155' }} />
      <List sx={{ flexGrow: 1, py: 2 }}>
        {menuItems.map((item) => (
          <ListItem key={item.text} disablePadding>
            <ListItemButton
              selected={location.pathname === item.path}
              onClick={() => navigate(item.path)}
            >
              <ListItemIcon sx={{ 
                color: location.pathname === item.path ? '#3b82f6' : '#94a3b8',
                minWidth: 40,
              }}>
                {item.icon}
              </ListItemIcon>
              <ListItemText 
                primary={item.text}
                primaryTypographyProps={{
                  fontSize: '0.95rem',
                  fontWeight: location.pathname === item.path ? 600 : 400,
                }}
              />
            </ListItemButton>
          </ListItem>
        ))}
      </List>
      <Divider sx={{ borderColor: '#334155' }} />
      <Box sx={{ p: 2 }}>
        <Box sx={{
          p: 2,
          borderRadius: 2,
          background: 'rgba(59, 130, 246, 0.1)',
          border: '1px solid rgba(59, 130, 246, 0.2)',
        }}>
          <Typography variant="caption" sx={{ color: '#94a3b8', display: 'block', mb: 0.5 }}>
            Logged in as
          </Typography>
          <Typography variant="body2" sx={{ color: '#e2e8f0', fontWeight: 500 }}>
            {user?.email}
          </Typography>
        </Box>
      </Box>
    </Box>
  );

  return (
    <Box sx={{ display: 'flex' }}>
      <AppBar
        position="fixed"
        elevation={0}
        sx={{
          width: { sm: `calc(100% - ${drawerWidth}px)` },
          ml: { sm: `${drawerWidth}px` },
        }}
      >
        <Toolbar sx={{ minHeight: '70px !important' }}>
          <IconButton
            color="inherit"
            edge="start"
            onClick={handleDrawerToggle}
            sx={{ mr: 2, display: { sm: 'none' } }}
          >
            <MenuIcon />
          </IconButton>
          <Box sx={{ flexGrow: 1 }} />
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
            <IconButton 
              onClick={handleProfileMenuOpen}
              sx={{
                background: 'rgba(59, 130, 246, 0.1)',
                '&:hover': {
                  background: 'rgba(59, 130, 246, 0.2)',
                },
              }}
            >
              <Avatar sx={{ 
                width: 36, 
                height: 36, 
                background: 'linear-gradient(135deg, #3b82f6 0%, #8b5cf6 100%)',
              }}>
                <AccountCircle />
              </Avatar>
            </IconButton>
          </Box>
          <Menu
            anchorEl={anchorEl}
            open={Boolean(anchorEl)}
            onClose={handleProfileMenuClose}
            PaperProps={{
              sx: {
                mt: 1.5,
                minWidth: 200,
                background: '#1e293b',
                border: '1px solid #334155',
              }
            }}
          >
            <MenuItem onClick={handleLogout} sx={{
              '&:hover': {
                background: 'rgba(59, 130, 246, 0.1)',
              }
            }}>
              <ListItemIcon>
                <Logout fontSize="small" sx={{ color: '#94a3b8' }} />
              </ListItemIcon>
              <Typography sx={{ color: '#e2e8f0' }}>Logout</Typography>
            </MenuItem>
          </Menu>
        </Toolbar>
      </AppBar>
      <Box
        component="nav"
        sx={{ width: { sm: drawerWidth }, flexShrink: { sm: 0 } }}
      >
        <Drawer
          variant="temporary"
          open={mobileOpen}
          onClose={handleDrawerToggle}
          ModalProps={{ keepMounted: true }}
          sx={{
            display: { xs: 'block', sm: 'none' },
            '& .MuiDrawer-paper': { boxSizing: 'border-box', width: drawerWidth },
          }}
        >
          {drawer}
        </Drawer>
        <Drawer
          variant="permanent"
          sx={{
            display: { xs: 'none', sm: 'block' },
            '& .MuiDrawer-paper': { boxSizing: 'border-box', width: drawerWidth },
          }}
          open
        >
          {drawer}
        </Drawer>
      </Box>
      <Box
        component="main"
        sx={{
          flexGrow: 1,
          p: 3,
          width: { sm: `calc(100% - ${drawerWidth}px)` },
          mt: '70px',
          minHeight: '100vh',
          background: '#0f172a',
        }}
      >
        {children}
      </Box>
    </Box>
  );
};

export default Layout;

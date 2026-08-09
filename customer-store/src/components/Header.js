import React, { useState } from 'react';
import {
  AppBar,
  Toolbar,
  Typography,
  Button,
  IconButton,
  Badge,
  Box,
  InputBase,
  alpha,
  Menu,
  MenuItem,
  Container,
  Drawer,
  List,
  ListItem,
  ListItemButton,
  ListItemText,
  Divider,
} from '@mui/material';
import {
  Search as SearchIcon,
  ShoppingCart,
  Person,
  Favorite,
  Menu as MenuIcon,
  Logout,
  Login,
  ThreeDRotation,
  Home,
  Category,
  Info,
  Close,
  Email,
} from '@mui/icons-material';
import { styled } from '@mui/material/styles';
import { useNavigate } from 'react-router-dom';
import { useCustomerAuth } from '../contexts/CustomerAuthContext';
import { useCart } from '../contexts/CartContext';

const Search = styled('div')(({ theme }) => ({
  position: 'relative',
  borderRadius: theme.shape.borderRadius,
  backgroundColor: alpha(theme.palette.common.white, 0.15),
  '&:hover': {
    backgroundColor: alpha(theme.palette.common.white, 0.25),
  },
  marginLeft: 0,
  width: '100%',
  [theme.breakpoints.up('sm')]: {
    marginLeft: theme.spacing(1),
    width: 'auto',
  },
}));

const SearchIconWrapper = styled('div')(({ theme }) => ({
  padding: theme.spacing(0, 2),
  height: '100%',
  position: 'absolute',
  pointerEvents: 'none',
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
}));

const StyledInputBase = styled(InputBase)(({ theme }) => ({
  color: 'inherit',
  '& .MuiInputBase-input': {
    padding: theme.spacing(1, 1, 1, 0),
    paddingLeft: `calc(1em + ${theme.spacing(4)})`,
    transition: theme.transitions.create('width'),
    width: '100%',
    [theme.breakpoints.up('sm')]: {
      width: '20ch',
      '&:focus': {
        width: '30ch',
      },
    },
  },
}));

const Header = () => {
  const navigate = useNavigate();
  const { customer, isAuthenticated, logout } = useCustomerAuth();
  const { getCartCount } = useCart();
  const [anchorEl, setAnchorEl] = useState(null);
  const [mobileOpen, setMobileOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');

  const handleMenuOpen = (event) => {
    setAnchorEl(event.currentTarget);
  };

  const handleMenuClose = () => {
    setAnchorEl(null);
  };

  const handleDrawerToggle = () => {
    setMobileOpen(!mobileOpen);
  };

  const handleLogout = () => {
    logout();
    handleMenuClose();
    navigate('/');
  };

  const handleSearchChange = (event) => {
    setSearchQuery(event.target.value);
  };

  const handleSearchSubmit = (event) => {
    event.preventDefault();
    if (searchQuery.trim()) {
      navigate(`/products?search=${encodeURIComponent(searchQuery.trim())}`);
      setSearchQuery('');
    }
  };

  const handleSearchKeyPress = (event) => {
    if (event.key === 'Enter') {
      handleSearchSubmit(event);
    }
  };

  const navItems = [
    { label: 'Home', path: '/', icon: <Home /> },
    { label: 'Products', path: '/products', icon: <Category /> },
    { label: 'Virtual Try-On', path: '/virtual-tryon', icon: <ThreeDRotation />, highlight: true },
    { label: 'About', path: '/about', icon: <Info /> },
    { label: 'Contact', path: '/contact', icon: <Email /> },
  ];

  const drawer = (
    <Box sx={{ width: 280, background: 'linear-gradient(180deg, #000000 0%, #0a0a0a 100%)', height: '100%', color: '#ffffff' }}>
      <Box sx={{ 
        p: 2, 
        display: 'flex', 
        justifyContent: 'space-between', 
        alignItems: 'center',
        borderBottom: '1px solid rgba(255,255,255,0.1)',
        background: 'rgba(255,255,255,0.03)',
      }}>
        <Typography variant="h6" fontWeight="bold" sx={{ letterSpacing: '2px' }}>
          AURA STYLE
        </Typography>
        <IconButton 
          onClick={handleDrawerToggle} 
          sx={{ 
            color: '#ffffff',
            background: 'rgba(255,255,255,0.05)',
            '&:hover': {
              background: 'rgba(239, 68, 68, 0.2)',
              transform: 'rotate(90deg)',
            },
            transition: 'all 0.3s',
          }}
        >
          <Close />
        </IconButton>
      </Box>
      <List sx={{ px: 1, py: 2 }}>
        {navItems.map((item) => (
          <ListItem key={item.label} disablePadding sx={{ mb: 1 }}>
            <ListItemButton 
              onClick={() => {
                navigate(item.path);
                handleDrawerToggle();
              }}
              sx={{
                py: 1.5,
                px: 2,
                borderRadius: 2,
                transition: 'all 0.3s',
                '&:hover': {
                  bgcolor: 'rgba(255,255,255,0.1)',
                  transform: 'translateX(5px)',
                },
              }}
            >
              <Box sx={{ mr: 2, display: 'flex', color: '#ffffff' }}>
                {item.icon}
              </Box>
              <ListItemText 
                primary={item.label}
                primaryTypographyProps={{
                  fontWeight: 500,
                }}
              />
            </ListItemButton>
          </ListItem>
        ))}
        {isAuthenticated && (
          <ListItem disablePadding sx={{ mb: 1 }}>
            <ListItemButton 
              onClick={() => {
                navigate('/avatar/customize');
                handleDrawerToggle();
              }}
              sx={{
                py: 1.5,
                px: 2,
                borderRadius: 2,
                transition: 'all 0.3s',
                '&:hover': {
                  bgcolor: 'rgba(255,255,255,0.1)',
                  transform: 'translateX(5px)',
                },
              }}
            >
              <Box sx={{ mr: 2, display: 'flex', color: '#ffffff' }}>
                <Person />
              </Box>
              <ListItemText 
                primary="My Avatar"
                primaryTypographyProps={{
                  fontWeight: 500,
                }}
              />
            </ListItemButton>
          </ListItem>
        )}
      </List>
      <Divider sx={{ bgcolor: 'rgba(255,255,255,0.1)', my: 2 }} />
      {isAuthenticated ? (
        <Box sx={{ px: 2 }}>
          <Box sx={{ 
            mb: 2,
            p: 2,
            borderRadius: 2,
            background: 'rgba(255,255,255,0.05)',
            border: '1px solid rgba(255,255,255,0.1)',
          }}>
            <Typography variant="body2" sx={{ mb: 1, color: '#888' }}>
              Signed in as
            </Typography>
            <Typography variant="body1" fontWeight="bold" sx={{ color: '#fff' }}>
              {customer?.firstName} {customer?.lastName}
            </Typography>
          </Box>
          <Button
            fullWidth
            variant="outlined"
            startIcon={<Logout />}
            onClick={() => {
              handleLogout();
              handleDrawerToggle();
            }}
            sx={{
              borderColor: 'rgba(239, 68, 68, 0.5)',
              color: '#ef4444',
              fontWeight: 600,
              borderRadius: 2,
              py: 1.5,
              transition: 'all 0.3s',
              '&:hover': {
                borderColor: '#ef4444',
                bgcolor: 'rgba(239, 68, 68, 0.1)',
                transform: 'scale(1.02)',
              }
            }}
          >
            Logout
          </Button>
        </Box>
      ) : (
        <Box sx={{ px: 2 }}>
          <Button
            fullWidth
            variant="contained"
            startIcon={<Login />}
            onClick={() => {
              navigate('/login');
              handleDrawerToggle();
            }}
            sx={{
              background: 'linear-gradient(135deg, #3b82f6 0%, #8b5cf6 100%)',
              color: '#ffffff',
              fontWeight: 'bold',
              borderRadius: 2,
              py: 1.5,
              boxShadow: '0 4px 15px rgba(59, 130, 246, 0.3)',
              transition: 'all 0.3s',
              '&:hover': {
                background: 'linear-gradient(135deg, #2563eb 0%, #7c3aed 100%)',
                transform: 'scale(1.02)',
                boxShadow: '0 6px 20px rgba(59, 130, 246, 0.5)',
              }
            }}
          >
            Login
          </Button>
        </Box>
      )}
    </Box>
  );

  return (
    <>
      <AppBar 
        position="sticky" 
        elevation={0}
        sx={{ 
          background: 'linear-gradient(135deg, #000000 0%, #0a0a0a 50%, #000000 100%)',
          backdropFilter: 'blur(20px)',
          borderBottom: '1px solid rgba(255,255,255,0.1)',
          boxShadow: '0 4px 30px rgba(0, 0, 0, 0.5)',
        }}
      >
        <Container maxWidth="xl">
          <Toolbar sx={{ px: { xs: 1, sm: 1.5 }, py: 1 }}>
            {/* Mobile Menu Button */}
            <IconButton
              color="inherit"
              edge="start"
              onClick={handleDrawerToggle}
              sx={{ 
                mr: 2, 
                display: { md: 'none' },
                background: 'rgba(255,255,255,0.05)',
                '&:hover': {
                  background: 'rgba(255,255,255,0.1)',
                  transform: 'scale(1.1)',
                },
                transition: 'all 0.3s',
              }}
            >
              <MenuIcon />
            </IconButton>

            {/* Logo with Image */}
            <Box
              sx={{ 
                cursor: 'pointer', 
                display: 'flex', 
                alignItems: 'center',
                gap: 1.5,
                mr: { xs: 1, md: 2 },
                transition: 'all 0.3s',
                '&:hover': {
                  transform: 'scale(1.02)',
                }
              }}
              onClick={() => navigate('/')}
            >
              <Box
                sx={{
                  width: { xs: 45, sm: 50, md: 55 },
                  height: { xs: 45, sm: 50, md: 55 },
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  transition: 'all 0.3s',
                  '&:hover': {
                    transform: 'scale(1.05)',
                    filter: 'drop-shadow(0 8px 20px rgba(255,255,255,0.4))',
                  }
                }}
              >
                <img
                  src="/logo.png"
                  alt="AURA STYLE Logo"
                  style={{
                    width: '100%',
                    height: '100%',
                    objectFit: 'contain',
                  }}
                  onError={(e) => {
                    console.error('Logo failed to load');
                    e.target.style.display = 'none';
                    e.target.parentElement.innerHTML = '<div style="color: #fff; font-size: 18px; font-weight: bold;">AS</div>';
                  }}
                />
              </Box>
              <Typography
                variant="h6"
                component="div"
                sx={{ 
                  fontWeight: 'bold',
                  display: { xs: 'none', sm: 'block' },
                  background: 'linear-gradient(135deg, #ffffff 0%, #e0e0e0 100%)',
                  WebkitBackgroundClip: 'text',
                  WebkitTextFillColor: 'transparent',
                  letterSpacing: '2px',
                  fontSize: { sm: '0.9rem', md: '1rem' },
                  position: 'relative',
                  '&::after': {
                    content: '""',
                    position: 'absolute',
                    bottom: -4,
                    left: 0,
                    width: '100%',
                    height: '2px',
                    background: 'linear-gradient(90deg, transparent, #ffffff, transparent)',
                    opacity: 0,
                    transition: 'opacity 0.3s',
                  },
                  '&:hover::after': {
                    opacity: 1,
                  }
                }}
              >
                AURA STYLE
              </Typography>
            </Box>

            {/* Desktop Navigation */}
            <Box sx={{ display: { xs: 'none', md: 'flex' }, gap: 1 }}>
              {navItems.map((item) => (
                <Button
                  key={item.label}
                  color="inherit"
                  onClick={() => navigate(item.path)}
                  startIcon={item.icon}
                  sx={{
                    px: 2.5,
                    py: 1.2,
                    fontWeight: 600,
                    textTransform: 'none',
                    fontSize: '0.95rem',
                    position: 'relative',
                    overflow: 'visible',
                    borderRadius: 2,
                    color: '#ffffff',
                    '&::after': {
                      content: '""',
                      position: 'absolute',
                      bottom: -2,
                      left: '50%',
                      transform: 'translateX(-50%)',
                      width: '0%',
                      height: '2px',
                      background: 'linear-gradient(90deg, #3b82f6, #8b5cf6)',
                      transition: 'width 0.3s',
                    },
                    '&:hover': { 
                      bgcolor: 'rgba(255,255,255,0.05)',
                      transform: 'translateY(-2px)',
                      '&::after': {
                        width: '80%',
                      }
                    },
                    transition: 'all 0.3s ease',
                  }}
                >
                  {item.label}
                </Button>
              ))}
              {isAuthenticated && (
                <Button
                  color="inherit"
                  onClick={() => navigate('/avatar/customize')}
                  startIcon={<Person />}
                  sx={{
                    px: 2.5,
                    py: 1.2,
                    fontWeight: 600,
                    textTransform: 'none',
                    fontSize: '0.95rem',
                    position: 'relative',
                    overflow: 'visible',
                    borderRadius: 2,
                    color: '#ffffff',
                    '&::after': {
                      content: '""',
                      position: 'absolute',
                      bottom: -2,
                      left: '50%',
                      transform: 'translateX(-50%)',
                      width: '0%',
                      height: '2px',
                      background: 'linear-gradient(90deg, #8b5cf6, #ec4899)',
                      transition: 'width 0.3s',
                    },
                    '&:hover': { 
                      bgcolor: 'rgba(255,255,255,0.05)',
                      transform: 'translateY(-2px)',
                      '&::after': {
                        width: '80%',
                      }
                    },
                    transition: 'all 0.3s ease',
                  }}
                >
                  My Avatar
                </Button>
              )}
            </Box>

            {/* Search */}
            <Box sx={{ flexGrow: 1, display: 'flex', justifyContent: 'center', mx: { xs: 1, md: 3 } }}>
              <Search 
                component="form" 
                onSubmit={handleSearchSubmit}
                sx={{ 
                  maxWidth: 500, 
                  width: '100%',
                  borderRadius: 3,
                  border: '1px solid rgba(255,255,255,0.1)',
                  background: 'rgba(255,255,255,0.03)',
                  transition: 'all 0.3s',
                  '&:hover': {
                    background: 'rgba(255,255,255,0.08)',
                    border: '1px solid rgba(255,255,255,0.2)',
                    boxShadow: '0 4px 20px rgba(59, 130, 246, 0.2)',
                  },
                  '&:focus-within': {
                    background: 'rgba(255,255,255,0.08)',
                    border: '1px solid rgba(59, 130, 246, 0.5)',
                    boxShadow: '0 4px 20px rgba(59, 130, 246, 0.3)',
                  }
                }}
              >
                <SearchIconWrapper>
                  <SearchIcon />
                </SearchIconWrapper>
                <StyledInputBase
                  placeholder="Search products here..."
                  inputProps={{ 'aria-label': 'search' }}
                  value={searchQuery}
                  onChange={handleSearchChange}
                  onKeyPress={handleSearchKeyPress}
                />
              </Search>
            </Box>

            {/* Right side icons */}
            <Box sx={{ display: 'flex', alignItems: 'center', gap: { xs: 0.5, sm: 1.5 } }}>
              {isAuthenticated && customer && (
                <Typography 
                  variant="body2" 
                  sx={{ 
                    mr: 1, 
                    display: { xs: 'none', lg: 'block' },
                    color: '#b0b0b0',
                    fontWeight: 600,
                    px: 2,
                    py: 1,
                    borderRadius: 2,
                    background: 'rgba(255,255,255,0.05)',
                    border: '1px solid rgba(255,255,255,0.1)',
                  }}
                >
                  Hi, {customer.firstName}
                </Typography>
              )}
              
              <IconButton 
                color="inherit"
                sx={{
                  background: 'rgba(255,255,255,0.05)',
                  border: '1px solid rgba(255,255,255,0.1)',
                  transition: 'all 0.3s',
                  '&:hover': {
                    background: 'linear-gradient(135deg, rgba(239, 68, 68, 0.2) 0%, rgba(220, 38, 38, 0.2) 100%)',
                    border: '1px solid rgba(239, 68, 68, 0.3)',
                    transform: 'translateY(-2px) scale(1.1)',
                    boxShadow: '0 4px 15px rgba(239, 68, 68, 0.3)',
                  }
                }}
              >
                <Favorite />
              </IconButton>
              
              <IconButton 
                color="inherit" 
                onClick={() => navigate('/cart')}
                sx={{
                  background: 'rgba(255,255,255,0.05)',
                  border: '1px solid rgba(255,255,255,0.1)',
                  transition: 'all 0.3s',
                  '&:hover': {
                    background: 'linear-gradient(135deg, rgba(59, 130, 246, 0.2) 0%, rgba(37, 99, 235, 0.2) 100%)',
                    border: '1px solid rgba(59, 130, 246, 0.3)',
                    transform: 'translateY(-2px) scale(1.1)',
                    boxShadow: '0 4px 15px rgba(59, 130, 246, 0.3)',
                  }
                }}
              >
                <Badge 
                  badgeContent={getCartCount()} 
                  sx={{
                    '& .MuiBadge-badge': {
                      bgcolor: 'linear-gradient(135deg, #3b82f6 0%, #8b5cf6 100%)',
                      color: '#ffffff',
                      fontWeight: 'bold',
                      boxShadow: '0 2px 8px rgba(59, 130, 246, 0.5)',
                    }
                  }}
                >
                  <ShoppingCart />
                </Badge>
              </IconButton>

              {isAuthenticated ? (
                <>
                  <IconButton 
                    color="inherit" 
                    onClick={handleMenuOpen}
                    sx={{
                      display: { xs: 'flex' },
                      background: 'linear-gradient(135deg, rgba(139, 92, 246, 0.2) 0%, rgba(236, 72, 153, 0.2) 100%)',
                      border: '1px solid rgba(139, 92, 246, 0.3)',
                      transition: 'all 0.3s',
                      '&:hover': {
                        background: 'linear-gradient(135deg, rgba(139, 92, 246, 0.3) 0%, rgba(236, 72, 153, 0.3) 100%)',
                        transform: 'translateY(-2px) scale(1.1)',
                        boxShadow: '0 4px 15px rgba(139, 92, 246, 0.4)',
                      }
                    }}
                  >
                    <Person />
                  </IconButton>

                  <Menu
                    anchorEl={anchorEl}
                    open={Boolean(anchorEl)}
                    onClose={handleMenuClose}
                    PaperProps={{
                      sx: {
                        bgcolor: '#0a0a0a',
                        color: '#ffffff',
                        border: '1px solid rgba(255,255,255,0.1)',
                        mt: 1,
                        minWidth: 220,
                        borderRadius: 2,
                        boxShadow: '0 8px 32px rgba(0,0,0,0.8)',
                        backdropFilter: 'blur(10px)',
                      }
                    }}
                  >
                    <MenuItem 
                      onClick={() => { 
                        handleMenuClose(); 
                        navigate('/avatar/customize'); 
                      }}
                      sx={{
                        py: 1.5,
                        px: 2,
                        borderRadius: 1,
                        mx: 1,
                        my: 0.5,
                        transition: 'all 0.2s',
                        '&:hover': {
                          bgcolor: 'rgba(139, 92, 246, 0.2)',
                          transform: 'translateX(5px)',
                        }
                      }}
                    >
                      <Person sx={{ mr: 1.5, fontSize: 20 }} />
                      Customize Avatar
                    </MenuItem>
                    <MenuItem 
                      onClick={() => { 
                        handleMenuClose(); 
                        navigate('/virtual-tryon'); 
                      }}
                      sx={{
                        py: 1.5,
                        px: 2,
                        borderRadius: 1,
                        mx: 1,
                        my: 0.5,
                        transition: 'all 0.2s',
                        '&:hover': {
                          bgcolor: 'rgba(59, 130, 246, 0.2)',
                          transform: 'translateX(5px)',
                        }
                      }}
                    >
                      <ThreeDRotation sx={{ mr: 1.5, fontSize: 20 }} />
                      My Profile
                    </MenuItem>
                    <MenuItem 
                      onClick={handleMenuClose}
                      sx={{
                        py: 1.5,
                        px: 2,
                        borderRadius: 1,
                        mx: 1,
                        my: 0.5,
                        transition: 'all 0.2s',
                        '&:hover': {
                          bgcolor: 'rgba(59, 130, 246, 0.2)',
                          transform: 'translateX(5px)',
                        }
                      }}
                    >
                      <ShoppingCart sx={{ mr: 1.5, fontSize: 20 }} />
                      My Orders
                    </MenuItem>
                    <MenuItem 
                      onClick={handleMenuClose}
                      sx={{
                        py: 1.5,
                        px: 2,
                        borderRadius: 1,
                        mx: 1,
                        my: 0.5,
                        transition: 'all 0.2s',
                        '&:hover': {
                          bgcolor: 'rgba(239, 68, 68, 0.2)',
                          transform: 'translateX(5px)',
                        }
                      }}
                    >
                      <Favorite sx={{ mr: 1.5, fontSize: 20 }} />
                      Wishlist
                    </MenuItem>
                    <Divider sx={{ bgcolor: 'rgba(255,255,255,0.1)', my: 1 }} />
                    <MenuItem 
                      onClick={handleLogout}
                      sx={{
                        py: 1.5,
                        px: 2,
                        borderRadius: 1,
                        mx: 1,
                        my: 0.5,
                        color: '#ef4444',
                        transition: 'all 0.2s',
                        '&:hover': {
                          bgcolor: 'rgba(239, 68, 68, 0.2)',
                          transform: 'translateX(5px)',
                        }
                      }}
                    >
                      <Logout sx={{ mr: 1.5, fontSize: 20 }} />
                      Logout
                    </MenuItem>
                  </Menu>
                </>
              ) : (
                <Button 
                  color="inherit" 
                  startIcon={<Login />}
                  onClick={() => navigate('/login')}
                  sx={{ 
                    ml: 1,
                    display: { xs: 'none', sm: 'flex' },
                    background: 'linear-gradient(135deg, #3b82f6 0%, #8b5cf6 100%)',
                    color: '#ffffff',
                    fontWeight: 'bold',
                    textTransform: 'none',
                    px: 3,
                    py: 1,
                    borderRadius: 2,
                    border: '1px solid rgba(59, 130, 246, 0.3)',
                    boxShadow: '0 4px 15px rgba(59, 130, 246, 0.3)',
                    transition: 'all 0.3s',
                    '&:hover': {
                      background: 'linear-gradient(135deg, #2563eb 0%, #7c3aed 100%)',
                      transform: 'translateY(-2px)',
                      boxShadow: '0 6px 20px rgba(59, 130, 246, 0.5)',
                    }
                  }}
                >
                  Login
                </Button>
              )}
            </Box>
          </Toolbar>
        </Container>
      </AppBar>

      {/* Mobile Drawer */}
      <Drawer
        anchor="left"
        open={mobileOpen}
        onClose={handleDrawerToggle}
        ModalProps={{
          keepMounted: true,
        }}
        sx={{
          display: { xs: 'block', md: 'none' },
          '& .MuiDrawer-paper': { 
            boxSizing: 'border-box', 
            width: 280,
            bgcolor: '#000000',
          },
        }}
      >
        {drawer}
      </Drawer>
    </>
  );
};

export default Header;
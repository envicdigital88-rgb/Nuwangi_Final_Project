import React, { useState, useEffect } from 'react';
import { Container, Typography, Box, Grid, Card, CardMedia, CardContent, CardActions, Button, CircularProgress, TextField, InputAdornment } from '@mui/material';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { Search as SearchIcon, Clear as ClearIcon } from '@mui/icons-material';
import { productsAPI } from '../services/apiService';
import Model3DViewer from '../components/Model3DViewer';

const ProductsPage = () => {
  const [products, setProducts] = useState([]);
  const [filteredProducts, setFilteredProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchParams, setSearchParams] = useSearchParams();
  const [localSearchQuery, setLocalSearchQuery] = useState('');
  const navigate = useNavigate();

  useEffect(() => {
    fetchProducts();
  }, []);

  useEffect(() => {
    const searchQuery = searchParams.get('search');
    if (searchQuery) {
      setLocalSearchQuery(searchQuery);
      filterProducts(searchQuery);
    } else {
      setLocalSearchQuery('');
      setFilteredProducts(products);
    }
  }, [searchParams, products]);

  const fetchProducts = async () => {
    try {
      const response = await productsAPI.getAllProducts();
      console.log('Products response:', response);
      // Handle different response structures
      const productData = response.data?.content || response.data || [];
      const productsArray = Array.isArray(productData) ? productData : [];
      setProducts(productsArray);
      setFilteredProducts(productsArray);
    } catch (error) {
      console.error('Failed to load products:', error);
      setProducts([]);
      setFilteredProducts([]);
    } finally {
      setLoading(false);
    }
  };

  const filterProducts = (query) => {
    if (!query || query.trim() === '') {
      setFilteredProducts(products);
      return;
    }

    const searchLower = query.toLowerCase().trim();
    const filtered = products.filter(product => 
      product.name?.toLowerCase().includes(searchLower) ||
      product.description?.toLowerCase().includes(searchLower) ||
      product.category?.toLowerCase().includes(searchLower) ||
      product.brand?.toLowerCase().includes(searchLower)
    );
    setFilteredProducts(filtered);
  };

  const handleLocalSearch = (event) => {
    const query = event.target.value;
    setLocalSearchQuery(query);
    
    if (query.trim()) {
      setSearchParams({ search: query });
    } else {
      setSearchParams({});
    }
  };

  const handleClearSearch = () => {
    setLocalSearchQuery('');
    setSearchParams({});
    setFilteredProducts(products);
  };

  const handleTryOn = (productId) => {
    navigate(`/virtual-tryon?productId=${productId}`);
  };

  if (loading) {
    return (
      <Container maxWidth="lg" sx={{ py: 8, textAlign: 'center' }}>
        <CircularProgress />
      </Container>
    );
  }

  return (
    <Container maxWidth="lg" sx={{ py: 4, bgcolor: '#000000', minHeight: '100vh' }}>
      <Box sx={{ textAlign: 'center', mb: 4 }}>
        <Typography variant="h3" gutterBottom sx={{ 
          color: '#ffffff', 
          fontWeight: 'bold',
          animation: 'flipInX 0.8s ease-out',
          '@keyframes flipInX': {
            '0%': {
              opacity: 0,
              transform: 'perspective(400px) rotateX(90deg)',
            },
            '40%': {
              transform: 'perspective(400px) rotateX(-10deg)',
            },
            '70%': {
              transform: 'perspective(400px) rotateX(10deg)',
            },
            '100%': {
              opacity: 1,
              transform: 'perspective(400px) rotateX(0deg)',
            },
          },
        }}>
          Products
        </Typography>
        <Typography variant="h6" sx={{ color: '#888', mb: 3 }}>
          Browse our collection and try them on virtually
        </Typography>

        {/* Search Box */}
        <Box sx={{ maxWidth: 600, mx: 'auto', mb: 4 }}>
          <TextField
            fullWidth
            variant="outlined"
            placeholder="Search products by name, category, or description..."
            value={localSearchQuery}
            onChange={handleLocalSearch}
            InputProps={{
              startAdornment: (
                <InputAdornment position="start">
                  <SearchIcon sx={{ color: '#888' }} />
                </InputAdornment>
              ),
              endAdornment: localSearchQuery && (
                <InputAdornment position="end">
                  <Button
                    onClick={handleClearSearch}
                    sx={{ 
                      minWidth: 'auto',
                      color: '#888',
                      '&:hover': {
                        color: '#fff',
                        bgcolor: 'rgba(255,255,255,0.1)',
                      }
                    }}
                  >
                    <ClearIcon />
                  </Button>
                </InputAdornment>
              ),
            }}
            sx={{
              '& .MuiOutlinedInput-root': {
                bgcolor: '#1a1a1a',
                color: '#fff',
                borderRadius: 3,
                '& fieldset': {
                  borderColor: '#333',
                  borderWidth: 2,
                },
                '&:hover fieldset': {
                  borderColor: '#555',
                },
                '&.Mui-focused fieldset': {
                  borderColor: '#3b82f6',
                },
              },
              '& .MuiInputBase-input': {
                py: 2,
              },
            }}
          />
          {localSearchQuery && (
            <Typography variant="body2" sx={{ color: '#888', mt: 2 }}>
              Found {filteredProducts.length} product{filteredProducts.length !== 1 ? 's' : ''} matching "{localSearchQuery}"
            </Typography>
          )}
        </Box>
      </Box>

      <Grid container spacing={3}>
        {filteredProducts.map((product) => (
          <Grid item xs={12} sm={6} md={4} key={product.id}>
            <Card sx={{ 
              height: '100%', 
              display: 'flex', 
              flexDirection: 'column',
              background: 'linear-gradient(135deg, #1e293b 0%, #0f172a 100%)',
              border: '1px solid #334155',
              borderRadius: 3,
              transition: 'all 0.3s',
              '&:hover': {
                transform: 'translateY(-8px)',
                borderColor: '#3b82f6',
                boxShadow: '0 20px 60px rgba(59, 130, 246, 0.3)',
              }
            }}>
              <Box sx={{ 
                position: 'relative', 
                height: 380, 
                bgcolor: '#000',
                overflow: 'hidden',
                borderRadius: '12px 12px 0 0',
              }}>
                {product.model3dUrl ? (
                  <Model3DViewer 
                    modelUrl={`http://localhost:8082${product.model3dUrl}`}
                    height={380}
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
                    image={product.imageUrl || 'https://via.placeholder.com/300x400?text=No+Image'}
                    alt={product.name}
                    sx={{ objectFit: 'cover' }}
                  />
                )}
                <Box sx={{
                  position: 'absolute',
                  top: 12,
                  right: 12,
                  bgcolor: 'rgba(59, 130, 246, 0.9)',
                  color: '#fff',
                  px: 2,
                  py: 0.5,
                  borderRadius: 2,
                  fontSize: '0.875rem',
                  fontWeight: 600,
                }}>
                  ${product.price}
                </Box>
              </Box>
              <CardContent sx={{ flexGrow: 1, p: 3 }}>
                <Typography gutterBottom variant="h5" component="h2" sx={{ 
                  color: '#e2e8f0', 
                  fontWeight: 700,
                  mb: 1.5,
                }}>
                  {product.name}
                </Typography>
                <Typography variant="body2" sx={{ 
                  mb: 2, 
                  color: '#94a3b8',
                  lineHeight: 1.6,
                }}>
                  {product.description}
                </Typography>
                <Box sx={{
                  display: 'inline-block',
                  px: 1.5,
                  py: 0.5,
                  bgcolor: 'rgba(59, 130, 246, 0.1)',
                  border: '1px solid rgba(59, 130, 246, 0.3)',
                  borderRadius: 1,
                }}>
                  <Typography variant="caption" sx={{ 
                    color: '#60a5fa',
                    fontWeight: 500,
                  }}>
                    {product.category}
                  </Typography>
                </Box>
              </CardContent>
              <CardActions sx={{ gap: 1.5, p: 3, pt: 0 }}>
                <Button 
                  size="large" 
                  fullWidth 
                  variant="outlined" 
                  onClick={() => navigate(`/products/${product.id}`)}
                  sx={{
                    borderColor: '#334155',
                    color: '#e2e8f0',
                    borderWidth: 2,
                    fontWeight: 600,
                    py: 1.2,
                    '&:hover': {
                      borderColor: '#3b82f6',
                      bgcolor: 'rgba(59, 130, 246, 0.1)',
                      borderWidth: 2,
                    }
                  }}
                >
                  View Details
                </Button>
                <Button 
                  size="large" 
                  fullWidth 
                  variant="contained" 
                  onClick={() => handleTryOn(product.id)}
                  sx={{
                    background: 'linear-gradient(135deg, #3b82f6 0%, #8b5cf6 100%)',
                    color: '#ffffff',
                    fontWeight: 700,
                    py: 1.2,
                    boxShadow: '0 4px 14px rgba(59, 130, 246, 0.4)',
                    '&:hover': {
                      background: 'linear-gradient(135deg, #2563eb 0%, #7c3aed 100%)',
                      boxShadow: '0 6px 20px rgba(59, 130, 246, 0.6)',
                    }
                  }}
                >
                  Try On
                </Button>
              </CardActions>
            </Card>
          </Grid>
        ))}
      </Grid>

      {filteredProducts.length === 0 && !loading && (
        <Box sx={{ textAlign: 'center', py: 8, width: '100%' }}>
          <Typography variant="h6" sx={{ color: '#888', mb: 2 }}>
            {localSearchQuery 
              ? `No products found matching "${localSearchQuery}"`
              : 'No products available yet. Check back soon!'
            }
          </Typography>
          {localSearchQuery && (
            <Button
              variant="outlined"
              onClick={handleClearSearch}
              sx={{
                mt: 2,
                borderColor: '#333',
                color: '#fff',
                '&:hover': {
                  borderColor: '#3b82f6',
                  bgcolor: 'rgba(59, 130, 246, 0.1)',
                }
              }}
            >
              Clear Search
            </Button>
          )}
        </Box>
      )}
    </Container>
  );
};

export default ProductsPage;

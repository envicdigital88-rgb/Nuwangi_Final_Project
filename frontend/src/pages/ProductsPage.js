import React, { useState, useEffect } from 'react';
import {
  Box, Typography, Button, Table, TableBody, TableCell, TableContainer,
  TableHead, TableRow, Paper, IconButton, Dialog, DialogTitle, DialogContent,
  DialogActions, TextField, CircularProgress, Alert, Select, MenuItem, 
  FormControl, InputLabel, Grid, Chip, Checkbox, FormControlLabel, Divider
} from '@mui/material';
import { Add as AddIcon, Edit as EditIcon, Delete as DeleteIcon, CloudUpload, ThreeDRotation } from '@mui/icons-material';
import { getProducts, createProduct, updateProduct, deleteProduct } from '../services/apiService';
import axios from 'axios';

const ProductsPage = () => {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [openDialog, setOpenDialog] = useState(false);
  const [editingProduct, setEditingProduct] = useState(null);
  const [availableModels, setAvailableModels] = useState([]);
  const [uploading, setUploading] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    brand: '',
    price: '',
    sku: '',
    barcode: '',
    color: '',
    material: '',
    imageUrl: '',
    model3dUrl: '',
    status: 'active',
    category: '',
    availableSizes: '',
    sizeChart: ''
  });
  
  // Size chart builder state
  const [sizeChartBuilder, setSizeChartBuilder] = useState({
    XS: { chest: 80, waist: 64, hip: 88, enabled: false },
    S: { chest: 86, waist: 68, hip: 92, enabled: true },
    M: { chest: 92, waist: 74, hip: 98, enabled: true },
    L: { chest: 98, waist: 80, hip: 104, enabled: true },
    XL: { chest: 106, waist: 88, hip: 112, enabled: false },
    XXL: { chest: 114, waist: 96, hip: 120, enabled: false },
  });

  useEffect(() => {
    // Check if user is logged in
    const token = localStorage.getItem('admin_token');
    if (!token) {
      setError('Please login to access this page');
      setLoading(false);
      return;
    }
    fetchProducts();
    fetchAvailableModels();
  }, []);

  const fetchAvailableModels = async () => {
    try {
      const response = await axios.get('http://localhost:8082/api/upload/models/list');
      setAvailableModels(response.data.models || []);
    } catch (err) {
      console.error('Failed to load available models:', err);
    }
  };

  const fetchProducts = async () => {
    try {
      setLoading(true);
      const response = await getProducts(0, 100);
      setProducts(response.content || []);
      setError(null);
    } catch (err) {
      setError('Failed to load products: ' + err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleOpenDialog = (product = null) => {
    if (product) {
      setEditingProduct(product);
      setFormData({
        name: product.name || '',
        description: product.description || '',
        brand: product.brand || '',
        price: product.price || '',
        sku: product.sku || '',
        barcode: product.barcode || '',
        color: product.color || '',
        material: product.material || '',
        imageUrl: product.imageUrl || '',
        model3dUrl: product.model3dUrl || '',
        status: product.status || 'active',
        category: product.category || '',
        availableSizes: product.availableSizes || '',
        sizeChart: product.sizeChart || ''
      });
      
      // Parse existing size chart into builder
      if (product.sizeChart) {
        try {
          const parsedChart = JSON.parse(product.sizeChart);
          const newBuilder = { ...sizeChartBuilder };
          Object.keys(newBuilder).forEach(size => {
            if (parsedChart[size]) {
              newBuilder[size] = {
                chest: parsedChart[size].chest || 0,
                waist: parsedChart[size].waist || 0,
                hip: parsedChart[size].hip || 0,
                enabled: true
              };
            } else {
              newBuilder[size].enabled = false;
            }
          });
          setSizeChartBuilder(newBuilder);
        } catch (e) {
          console.error('Failed to parse size chart:', e);
        }
      }
    } else {
      setEditingProduct(null);
      setFormData({
        name: '',
        description: '',
        brand: '',
        price: '',
        sku: '',
        barcode: '',
        color: '',
        material: '',
        imageUrl: '',
        model3dUrl: '',
        status: 'active',
        category: '',
        availableSizes: '',
        sizeChart: ''
      });
      
      // Reset size chart builder to defaults
      setSizeChartBuilder({
        XS: { chest: 80, waist: 64, hip: 88, enabled: false },
        S: { chest: 86, waist: 68, hip: 92, enabled: true },
        M: { chest: 92, waist: 74, hip: 98, enabled: true },
        L: { chest: 98, waist: 80, hip: 104, enabled: true },
        XL: { chest: 106, waist: 88, hip: 112, enabled: false },
        XXL: { chest: 114, waist: 96, hip: 120, enabled: false },
      });
    }
    setOpenDialog(true);
  };

  const handleCloseDialog = () => {
    setOpenDialog(false);
    setEditingProduct(null);
  };

  const handleInputChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };
  
  const handleSizeToggle = (size) => {
    setSizeChartBuilder({
      ...sizeChartBuilder,
      [size]: {
        ...sizeChartBuilder[size],
        enabled: !sizeChartBuilder[size].enabled
      }
    });
  };
  
  const handleSizeMeasurementChange = (size, measurement, value) => {
    setSizeChartBuilder({
      ...sizeChartBuilder,
      [size]: {
        ...sizeChartBuilder[size],
        [measurement]: parseFloat(value) || 0
      }
    });
  };
  
  const buildSizeChartJSON = () => {
    const chart = {};
    const enabledSizes = [];
    
    Object.keys(sizeChartBuilder).forEach(size => {
      if (sizeChartBuilder[size].enabled) {
        chart[size] = {
          chest: sizeChartBuilder[size].chest,
          waist: sizeChartBuilder[size].waist,
          hip: sizeChartBuilder[size].hip
        };
        enabledSizes.push(size);
      }
    });
    
    return {
      sizeChart: JSON.stringify(chart),
      availableSizes: enabledSizes.join(',')
    };
  };

  const handleSubmit = async () => {
    try {
      // Check if user is authenticated
      const token = localStorage.getItem('admin_token');
      if (!token) {
        setError('You are not logged in. Please login again.');
        return;
      }

      console.log('Submitting product with token:', token.substring(0, 50) + '...');

      // Build size chart from builder
      const { sizeChart, availableSizes } = buildSizeChartJSON();
      
      const productData = {
        ...formData,
        sizeChart,
        availableSizes
      };

      if (editingProduct) {
        await updateProduct(editingProduct.id, productData);
      } else {
        await createProduct(productData);
      }
      handleCloseDialog();
      fetchProducts();
      setError(null);
    } catch (err) {
      const errorMsg = err.response?.data?.message || err.message || 'Failed to save product';
      setError(`Error ${err.response?.status || ''}: ${errorMsg}`);
      console.error('Product save error:', err.response || err);
    }
  };

  const handleDelete = async (id) => {
    if (window.confirm('Are you sure you want to delete this product?')) {
      try {
        await deleteProduct(id);
        fetchProducts();
      } catch (err) {
        setError('Failed to delete product: ' + err.message);
      }
    }
  };

  const handleModelFileUpload = async (event) => {
    const file = event.target.files[0];
    if (!file) return;

    // Validate file type
    const validExtensions = ['.obj', '.glb', '.gltf', '.mtl'];
    const fileExtension = file.name.substring(file.name.lastIndexOf('.')).toLowerCase();
    if (!validExtensions.includes(fileExtension)) {
      setError('Invalid file type. Please upload .obj, .glb, .gltf, or .mtl files');
      return;
    }

    setUploading(true);
    const formDataUpload = new FormData();
    formDataUpload.append('file', file);

    try {
      const response = await axios.post('http://localhost:8082/api/upload/model', formDataUpload, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      });

      setFormData({ ...formData, model3dUrl: response.data.url });
      setError(null);
      
      // Refresh available models list
      fetchAvailableModels();
      
      alert(`File uploaded successfully: ${response.data.filename}`);
    } catch (err) {
      setError('Failed to upload file: ' + (err.response?.data?.error || err.message));
    } finally {
      setUploading(false);
    }
  };

  const handleImageFileUpload = async (event) => {
    const file = event.target.files[0];
    if (!file) return;

    setUploading(true);
    const formDataUpload = new FormData();
    formDataUpload.append('file', file);

    try {
      const response = await axios.post('http://localhost:8082/api/upload/image', formDataUpload, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      });

      setFormData({ ...formData, imageUrl: response.data.url });
      setError(null);
      
      alert(`Image uploaded successfully: ${response.data.filename}`);
    } catch (err) {
      setError('Failed to upload image: ' + (err.response?.data?.error || err.message));
    } finally {
      setUploading(false);
    }
  };

  if (loading) return <Box display="flex" justifyContent="center" p={4}><CircularProgress /></Box>;

  return (
    <Box>
      <Box display="flex" justifyContent="space-between" alignItems="center" mb={3}>
        <Typography variant="h4">Products</Typography>
        <Button variant="contained" startIcon={<AddIcon />} onClick={() => handleOpenDialog()}>
          Add Product
        </Button>
      </Box>

      {error && (
        <Alert 
          severity="error" 
          sx={{ mb: 2 }}
          action={
            error.includes('403') || error.includes('Forbidden') ? (
              <Button 
                color="inherit" 
                size="small" 
                onClick={() => {
                  localStorage.clear();
                  window.location.href = '/login';
                }}
              >
                RELOGIN
              </Button>
            ) : null
          }
        >
          {error}
          {error.includes('login') && (
            <div style={{ marginTop: 8 }}>
              <a href="/login" style={{ color: 'inherit', textDecoration: 'underline' }}>
                Click here to login
              </a>
            </div>
          )}
        </Alert>
      )}

      <TableContainer component={Paper}>
        <Table>
          <TableHead>
            <TableRow>
              <TableCell>Name</TableCell>
              <TableCell>Brand</TableCell>
              <TableCell>Category</TableCell>
              <TableCell>Available Sizes</TableCell>
              <TableCell>Price</TableCell>
              <TableCell>Status</TableCell>
              <TableCell align="right">Actions</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {products.length === 0 ? (
              <TableRow>
                <TableCell colSpan={7} align="center">No products found</TableCell>
              </TableRow>
            ) : (
              products.map((product) => (
                <TableRow key={product.id}>
                  <TableCell>{product.name}</TableCell>
                  <TableCell>{product.brand}</TableCell>
                  <TableCell>
                    {product.category ? (
                      <Chip label={product.category} size="small" color="primary" variant="outlined" />
                    ) : (
                      <Typography variant="caption" color="text.secondary">-</Typography>
                    )}
                  </TableCell>
                  <TableCell>
                    {product.availableSizes ? (
                      <Box sx={{ display: 'flex', gap: 0.5, flexWrap: 'wrap' }}>
                        {product.availableSizes.split(',').map((size, idx) => (
                          <Chip key={idx} label={size.trim()} size="small" sx={{ height: 20, fontSize: '0.7rem' }} />
                        ))}
                      </Box>
                    ) : (
                      <Typography variant="caption" color="text.secondary">Not set</Typography>
                    )}
                  </TableCell>
                  <TableCell>${product.price}</TableCell>
                  <TableCell>
                    <Chip 
                      label={product.status} 
                      size="small" 
                      color={product.status === 'active' ? 'success' : 'default'}
                    />
                  </TableCell>
                  <TableCell align="right">
                    <IconButton onClick={() => handleOpenDialog(product)} color="primary">
                      <EditIcon />
                    </IconButton>
                    <IconButton onClick={() => handleDelete(product.id)} color="error">
                      <DeleteIcon />
                    </IconButton>
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </TableContainer>

      <Dialog open={openDialog} onClose={handleCloseDialog} maxWidth="lg" fullWidth>
        <DialogTitle sx={{ bgcolor: 'primary.main', color: 'white', py: 2 }}>
          <Typography variant="h5" fontWeight="bold">
            {editingProduct ? 'Edit Product' : 'Add New Product'}
          </Typography>
        </DialogTitle>
        <DialogContent sx={{ mt: 2 }}>
          <Grid container spacing={3} sx={{ mt: 0.5 }}>
            
            {/* Basic Information Section */}
            <Grid item xs={12}>
              <Typography variant="h6" fontWeight="bold" color="primary" sx={{ mb: 2, pb: 1, borderBottom: '2px solid', borderColor: 'primary.main' }}>
                Basic Information
              </Typography>
            </Grid>
            
            <Grid item xs={12} md={8}>
              <TextField fullWidth label="Product Name" name="name" value={formData.name} onChange={handleInputChange} required />
            </Grid>
            
            <Grid item xs={12} md={4}>
              <TextField fullWidth label="Price" name="price" type="number" value={formData.price} onChange={handleInputChange} required InputProps={{ startAdornment: '$' }} />
            </Grid>
            
            <Grid item xs={12}>
              <TextField fullWidth label="Description" name="description" value={formData.description} onChange={handleInputChange} multiline rows={3} />
            </Grid>
            
            <Grid item xs={12} md={4}>
              <TextField fullWidth label="Brand" name="brand" value={formData.brand} onChange={handleInputChange} />
            </Grid>
            
            <Grid item xs={12} md={4}>
              <TextField fullWidth label="SKU" name="sku" value={formData.sku} onChange={handleInputChange} />
            </Grid>
            
            <Grid item xs={12} md={4}>
              <TextField fullWidth label="Barcode" name="barcode" value={formData.barcode} onChange={handleInputChange} />
            </Grid>
            
            <Grid item xs={12} md={6}>
              <TextField fullWidth label="Color" name="color" value={formData.color} onChange={handleInputChange} />
            </Grid>
            
            <Grid item xs={12} md={6}>
              <TextField fullWidth label="Material" name="material" value={formData.material} onChange={handleInputChange} />
            </Grid>

            {/* Category and Size Information */}
            <Grid item xs={12}>
              <Divider sx={{ my: 2 }} />
              <Typography variant="h6" fontWeight="bold" color="primary" sx={{ mb: 2, pb: 1, borderBottom: '2px solid', borderColor: 'primary.main' }}>
                Category & Size Information
              </Typography>
            </Grid>

            <Grid item xs={12}>
              <FormControl fullWidth>
                <InputLabel>Category</InputLabel>
                <Select
                  name="category"
                  value={formData.category}
                  onChange={handleInputChange}
                  label="Category"
                >
                  <MenuItem value="shirt">Shirt</MenuItem>
                  <MenuItem value="pants">Pants</MenuItem>
                  <MenuItem value="dress">Dress</MenuItem>
                  <MenuItem value="jacket">Jacket</MenuItem>
                  <MenuItem value="skirt">Skirt</MenuItem>
                </Select>
              </FormControl>
            </Grid>

            {/* Visual Size Chart Builder */}
            <Grid item xs={12}>
              <Typography variant="subtitle1" fontWeight="bold" sx={{ mb: 1, mt: 2 }}>
                Size Chart Builder
              </Typography>
              <Typography variant="caption" color="text.secondary" sx={{ mb: 2, display: 'block' }}>
                Check sizes to enable, then enter measurements (cm)
              </Typography>
            </Grid>

            {Object.keys(sizeChartBuilder).map((size) => (
              <Grid item xs={12} key={size}>
                <Box sx={{ 
                  display: 'flex', 
                  alignItems: 'center', 
                  gap: 2, 
                  p: 1.5, 
                  bgcolor: sizeChartBuilder[size].enabled ? 'action.selected' : 'background.default',
                  borderRadius: 1,
                  border: '1px solid',
                  borderColor: sizeChartBuilder[size].enabled ? 'primary.main' : 'divider'
                }}>
                  <FormControlLabel
                    control={
                      <Checkbox
                        checked={sizeChartBuilder[size].enabled}
                        onChange={() => handleSizeToggle(size)}
                        color="primary"
                      />
                    }
                    label={
                      <Typography variant="body1" fontWeight="bold" sx={{ minWidth: 40 }}>
                        {size}
                      </Typography>
                    }
                  />
                  
                  {sizeChartBuilder[size].enabled && (
                    <>
                      <TextField
                        label="Chest"
                        type="number"
                        value={sizeChartBuilder[size].chest}
                        onChange={(e) => handleSizeMeasurementChange(size, 'chest', e.target.value)}
                        size="small"
                        sx={{ width: 100 }}
                        InputProps={{ endAdornment: 'cm' }}
                      />
                      <TextField
                        label="Waist"
                        type="number"
                        value={sizeChartBuilder[size].waist}
                        onChange={(e) => handleSizeMeasurementChange(size, 'waist', e.target.value)}
                        size="small"
                        sx={{ width: 100 }}
                        InputProps={{ endAdornment: 'cm' }}
                      />
                      <TextField
                        label="Hip"
                        type="number"
                        value={sizeChartBuilder[size].hip}
                        onChange={(e) => handleSizeMeasurementChange(size, 'hip', e.target.value)}
                        size="small"
                        sx={{ width: 100 }}
                        InputProps={{ endAdornment: 'cm' }}
                      />
                    </>
                  )}
                </Box>
              </Grid>
            ))}

            <Grid item xs={12}>
              <Alert severity="info" sx={{ fontSize: '0.85rem' }}>
                <Typography variant="caption" fontWeight="bold" display="block">
                  Selected Sizes: {Object.keys(sizeChartBuilder).filter(s => sizeChartBuilder[s].enabled).join(', ') || 'None'}
                </Typography>
                <Typography variant="caption" display="block" sx={{ mt: 0.5 }}>
                  Tip: Check the boxes for sizes you want to offer, then enter the measurements for each size.
                </Typography>
              </Alert>
            </Grid>

            <Grid item xs={12}>
              <Divider sx={{ my: 2 }} />
              <Typography variant="h6" fontWeight="bold" color="primary" sx={{ mb: 2, pb: 1, borderBottom: '2px solid', borderColor: 'primary.main' }}>
                Media & Assets
              </Typography>
            </Grid>

            {/* Image Upload Section */}
            <Grid item xs={12}>
              <Typography variant="subtitle2" fontWeight="bold" sx={{ mb: 1 }}>
                Product Image
              </Typography>
            </Grid>
            
            <Grid item xs={12}>
              <Box sx={{ display: 'flex', gap: 1, alignItems: 'center' }}>
                <TextField 
                  fullWidth 
                  label="Image URL" 
                  name="imageUrl" 
                  value={formData.imageUrl} 
                  onChange={handleInputChange} 
                  placeholder="/uploads/images/product.jpg" 
                />
                <input
                  accept="image/*"
                  style={{ display: 'none' }}
                  id="image-upload-button"
                  type="file"
                  onChange={handleImageFileUpload}
                />
                <label htmlFor="image-upload-button">
                  <Button
                    variant="contained"
                    component="span"
                    startIcon={<CloudUpload />}
                    disabled={uploading}
                  >
                    Upload
                  </Button>
                </label>
              </Box>
            </Grid>

            {/* 3D Model Section */}
            <Grid item xs={12}>
              <Typography variant="subtitle2" fontWeight="bold" sx={{ mb: 1, mt: 2, display: 'flex', alignItems: 'center', gap: 1 }}>
                <ThreeDRotation /> 3D Model
              </Typography>
            </Grid>
            
            <Grid item xs={12}>
              <FormControl fullWidth>
                <InputLabel>Select Existing Model</InputLabel>
                <Select
                  value={formData.model3dUrl}
                  onChange={(e) => setFormData({ ...formData, model3dUrl: e.target.value })}
                  label="Select Existing Model"
                >
                  <MenuItem value="">
                    <em>None</em>
                  </MenuItem>
                  {availableModels.map((model) => (
                    <MenuItem key={model.url} value={model.url}>
                      {model.filename}
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>
            </Grid>
            
            <Grid item xs={12}>
              <Box sx={{ display: 'flex', gap: 1, alignItems: 'center' }}>
                <TextField 
                  fullWidth 
                  label="Or Enter Model URL" 
                  name="model3dUrl" 
                  value={formData.model3dUrl} 
                  onChange={handleInputChange} 
                  placeholder="/uploads/models/product.obj" 
                  helperText="Supports .obj, .glb, .gltf formats"
                />
                <input
                  accept=".obj,.glb,.gltf,.mtl"
                  style={{ display: 'none' }}
                  id="model-upload-button"
                  type="file"
                  onChange={handleModelFileUpload}
                />
                <label htmlFor="model-upload-button">
                  <Button
                    variant="contained"
                    component="span"
                    startIcon={<CloudUpload />}
                    disabled={uploading}
                  >
                    Upload New
                  </Button>
                </label>
              </Box>
            </Grid>

            {formData.model3dUrl && (
              <Grid item xs={12}>
                <Chip 
                  label={`Selected: ${formData.model3dUrl}`} 
                  color="success" 
                  icon={<ThreeDRotation />}
                  onDelete={() => setFormData({ ...formData, model3dUrl: '' })}
                />
              </Grid>
            )}
          </Grid>
        </DialogContent>
        <DialogActions sx={{ px: 3, py: 2, bgcolor: 'grey.50' }}>
          <Button onClick={handleCloseDialog} variant="outlined" size="large">
            Cancel
          </Button>
          <Button onClick={handleSubmit} variant="contained" disabled={uploading} size="large">
            {uploading ? <CircularProgress size={20} /> : (editingProduct ? 'Update Product' : 'Create Product')}
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default ProductsPage;

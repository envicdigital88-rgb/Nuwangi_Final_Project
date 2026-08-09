import React, { useState, useEffect } from 'react';
import {
  Box, Typography, Button, Table, TableBody, TableCell, TableContainer,
  TableHead, TableRow, Paper, IconButton, Dialog, DialogTitle, DialogContent,
  DialogActions, TextField, CircularProgress, Alert, Chip, MenuItem
} from '@mui/material';
import { Add as AddIcon, Edit as EditIcon, Delete as DeleteIcon, AdminPanelSettings } from '@mui/icons-material';
import { getAdmins, createAdmin, updateAdmin, deleteAdmin } from '../services/apiService';

const AdminsPage = () => {
  const [admins, setAdmins] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [openDialog, setOpenDialog] = useState(false);
  const [editingAdmin, setEditingAdmin] = useState(null);
  const [formData, setFormData] = useState({
    email: '',
    firstName: '',
    lastName: '',
    role: 'staff',
    passwordHash: ''
  });

  useEffect(() => {
    fetchAdmins();
  }, []);

  const fetchAdmins = async () => {
    try {
      setLoading(true);
      const response = await getAdmins();
      setAdmins(response.content || []);
      setError(null);
    } catch (err) {
      setError('Failed to load admins: ' + err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleOpenDialog = (admin = null) => {
    if (admin) {
      setEditingAdmin(admin);
      setFormData({
        email: admin.email || '',
        firstName: admin.firstName || '',
        lastName: admin.lastName || '',
        role: admin.role || 'staff',
        passwordHash: ''
      });
    } else {
      setEditingAdmin(null);
      setFormData({
        email: '',
        firstName: '',
        lastName: '',
        role: 'staff',
        passwordHash: ''
      });
    }
    setOpenDialog(true);
  };

  const handleCloseDialog = () => {
    setOpenDialog(false);
    setEditingAdmin(null);
  };

  const handleInputChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async () => {
    try {
      const submitData = { ...formData };
      if (editingAdmin) {
        if (!submitData.passwordHash) {
          delete submitData.passwordHash;
        }
        await updateAdmin(editingAdmin.id, submitData);
      } else {
        if (!submitData.passwordHash) {
          setError('Password is required for new admin');
          return;
        }
        await createAdmin(submitData);
      }
      handleCloseDialog();
      fetchAdmins();
    } catch (err) {
      setError('Failed to save admin: ' + err.message);
    }
  };

  const handleDelete = async (id) => {
    if (window.confirm('Are you sure you want to delete this admin?')) {
      try {
        await deleteAdmin(id);
        fetchAdmins();
      } catch (err) {
        setError('Failed to delete admin: ' + err.message);
      }
    }
  };

  const getRoleColor = (role) => {
    switch (role) {
      case 'admin': return 'error';
      case 'manager': return 'warning';
      case 'staff': return 'info';
      default: return 'default';
    }
  };

  if (loading) return <Box display="flex" justifyContent="center" p={4}><CircularProgress /></Box>;

  return (
    <Box>
      <Box display="flex" justifyContent="space-between" alignItems="center" mb={3}>
        <Box display="flex" alignItems="center" gap={2}>
          <AdminPanelSettings sx={{ fontSize: 40, color: 'primary.main' }} />
          <Typography variant="h4">Admin Management</Typography>
        </Box>
        <Button variant="contained" startIcon={<AddIcon />} onClick={() => handleOpenDialog()}>
          Add Admin
        </Button>
      </Box>

      {error && <Alert severity="error" sx={{ mb: 2 }} onClose={() => setError(null)}>{error}</Alert>}

      <TableContainer component={Paper} elevation={3}>
        <Table>
          <TableHead sx={{ bgcolor: 'primary.main' }}>
            <TableRow>
              <TableCell sx={{ color: 'white', fontWeight: 'bold' }}>Name</TableCell>
              <TableCell sx={{ color: 'white', fontWeight: 'bold' }}>Email</TableCell>
              <TableCell sx={{ color: 'white', fontWeight: 'bold' }}>Role</TableCell>
              <TableCell sx={{ color: 'white', fontWeight: 'bold' }}>Last Login</TableCell>
              <TableCell sx={{ color: 'white', fontWeight: 'bold' }} align="right">Actions</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {admins.length === 0 ? (
              <TableRow>
                <TableCell colSpan={5} align="center">No admins found</TableCell>
              </TableRow>
            ) : (
              admins.map((admin) => (
                <TableRow key={admin.id} hover>
                  <TableCell>{admin.firstName} {admin.lastName}</TableCell>
                  <TableCell>{admin.email}</TableCell>
                  <TableCell>
                    <Chip 
                      label={(admin.role || 'admin').toUpperCase()} 
                      color={getRoleColor(admin.role || 'admin')}
                      size="small"
                    />
                  </TableCell>
                  <TableCell>
                    {admin.lastLoginAt ? new Date(admin.lastLoginAt).toLocaleString() : 'Never'}
                  </TableCell>
                  <TableCell align="right">
                    <IconButton onClick={() => handleOpenDialog(admin)} color="primary" size="small">
                      <EditIcon />
                    </IconButton>
                    <IconButton onClick={() => handleDelete(admin.id)} color="error" size="small">
                      <DeleteIcon />
                    </IconButton>
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </TableContainer>

      <Dialog open={openDialog} onClose={handleCloseDialog} maxWidth="sm" fullWidth>
        <DialogTitle sx={{ bgcolor: 'primary.main', color: 'white' }}>
          {editingAdmin ? 'Edit Admin' : 'Add New Admin'}
        </DialogTitle>
        <DialogContent sx={{ mt: 2 }}>
          <TextField 
            fullWidth 
            margin="normal" 
            label="Email" 
            name="email" 
            type="email"
            value={formData.email} 
            onChange={handleInputChange} 
            required 
          />
          <TextField 
            fullWidth 
            margin="normal" 
            label="First Name" 
            name="firstName" 
            value={formData.firstName} 
            onChange={handleInputChange} 
            required 
          />
          <TextField 
            fullWidth 
            margin="normal" 
            label="Last Name" 
            name="lastName" 
            value={formData.lastName} 
            onChange={handleInputChange} 
            required 
          />
          <TextField 
            fullWidth 
            margin="normal" 
            label="Role" 
            name="role" 
            select
            value={formData.role} 
            onChange={handleInputChange} 
            required 
          >
            <MenuItem value="admin">Admin</MenuItem>
            <MenuItem value="manager">Manager</MenuItem>
            <MenuItem value="staff">Staff</MenuItem>
          </TextField>
          <TextField 
            fullWidth 
            margin="normal" 
            label={editingAdmin ? "New Password (leave blank to keep current)" : "Password"} 
            name="passwordHash" 
            type="password"
            value={formData.passwordHash} 
            onChange={handleInputChange} 
            required={!editingAdmin}
          />
        </DialogContent>
        <DialogActions sx={{ p: 2 }}>
          <Button onClick={handleCloseDialog}>Cancel</Button>
          <Button onClick={handleSubmit} variant="contained">
            {editingAdmin ? 'Update' : 'Create'}
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default AdminsPage;

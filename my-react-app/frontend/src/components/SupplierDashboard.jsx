import React, { useState, useEffect } from 'react';
import { Box, Grid, Card, CardContent, Typography, Dialog, DialogTitle, DialogContent, DialogActions, Button, TextField, MenuItem } from '@mui/material';
import { Inventory, LocalShipping, Assessment, Warning } from '@mui/icons-material';
import { supplierService } from '../services/supplierService';
import InventoryManagement from './supplier/InventoryManagement';

const SupplierDashboard = ({ onLogout }) => {
  const [dashboardStats, setDashboardStats] = useState({
    totalMaterials: 0,
    lowStock: 0,
    pendingOrders: 0,
    totalValue: 0
  });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [selectedItem, setSelectedItem] = useState('Dashboard');
  const [sellDialogOpen, setSellDialogOpen] = useState(false);
  const [selectedMaterial, setSelectedMaterial] = useState(null);
  const [sellQuantity, setSellQuantity] = useState('');
  const [inventory, setInventory] = useState([]);

  useEffect(() => {
    fetchDashboardStats();
  }, []);

  const fetchDashboardStats = async () => {
    try {
      const inventory = await supplierService.getInventory();
      setInventory(inventory);
      
      const stats = {
        totalMaterials: inventory.length,
        lowStock: inventory.filter(item => item.status === 'low').length,
        pendingOrders: 0,
        totalValue: inventory.reduce((total, item) => total + (item.price * item.quantity), 0)
      };
      
      setDashboardStats(stats);
    } catch (error) {
      setError(error.message);
    } finally {
      setLoading(false);
    }
  };

  const handleSellClick = (material) => {
    setSelectedMaterial(material);
    setSellDialogOpen(true);
  };

  const handleSellDialogClose = () => {
    setSellDialogOpen(false);
    setSelectedMaterial(null);
    setSellQuantity('');
  };

  const handleSellSubmit = async () => {
    try {
      setLoading(true);
      const quantity = Number(sellQuantity);
      
      if (quantity > selectedMaterial.quantity) {
        setError('Insufficient stock');
        return;
      }

      // Update inventory with new quantity
      await supplierService.updateInventoryItem(selectedMaterial._id, {
        ...selectedMaterial,
        quantity: selectedMaterial.quantity - quantity,
        status: selectedMaterial.quantity - quantity <= 100 ? 'low' : 'available'
      });

      // Create sale record
      await supplierService.createSale({
        materialId: selectedMaterial._id,
        quantity: quantity,
        price: selectedMaterial.price,
        totalAmount: quantity * selectedMaterial.price,
        date: new Date()
      });

      // Refresh dashboard stats
      await fetchDashboardStats();
      handleSellDialogClose();
    } catch (error) {
      setError(error.message);
    } finally {
      setLoading(false);
    }
  };

  const stats = [
    {
      title: 'Total Materials',
      value: dashboardStats.totalMaterials,
      icon: <Inventory />,
      color: '#2196f3'
    },
    {
      title: 'Low Stock Items',
      value: dashboardStats.lowStock,
      icon: <Warning />,
      color: '#ff9800'
    },
    {
      title: 'Pending Orders',
      value: dashboardStats.pendingOrders,
      icon: <LocalShipping />,
      color: '#f44336'
    },
    {
      title: 'Total Inventory Value',
      value: `₹${dashboardStats.totalValue.toFixed(2)}`,
      icon: <Assessment />,
      color: '#4caf50'
    }
  ];

  return (
    <Box sx={{ p: 3 }}>
      <Typography variant="h4" sx={{ mb: 4 }}>
        Supplier Dashboard
      </Typography>

      <Grid container spacing={3} sx={{ mb: 4 }}>
        {stats.map((stat, index) => (
          <Grid item xs={12} sm={6} md={3} key={index}>
            <Card>
              <CardContent>
                <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                  <Box
                    sx={{
                      backgroundColor: stat.color,
                      borderRadius: '50%',
                      p: 1,
                      mr: 2,
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center'
                    }}
                  >
                    {React.cloneElement(stat.icon, { sx: { color: 'white' } })}
                  </Box>
                  <Typography variant="h6" component="div">
                    {stat.title}
                  </Typography>
                </Box>
                <Typography variant="h4" component="div" sx={{ textAlign: 'center' }}>
                  {stat.value}
                </Typography>
              </CardContent>
            </Card>
          </Grid>
        ))}
      </Grid>

      <InventoryManagement 
        onInventoryUpdate={fetchDashboardStats} 
        onSellClick={handleSellClick}
      />

      {/* Sell Material Dialog */}
      <Dialog open={sellDialogOpen} onClose={handleSellDialogClose}>
        <DialogTitle>Sell Raw Material</DialogTitle>
        <DialogContent>
          {selectedMaterial && (
            <Box sx={{ pt: 2 }}>
              <Typography variant="body1" sx={{ mb: 2 }}>
                Material: {selectedMaterial.name}
              </Typography>
              <Typography variant="body2" sx={{ mb: 2 }}>
                Available Quantity: {selectedMaterial.quantity} {selectedMaterial.unit}
              </Typography>
              <TextField
                fullWidth
                label="Quantity to Sell"
                type="number"
                value={sellQuantity}
                onChange={(e) => setSellQuantity(e.target.value)}
                InputProps={{
                  inputProps: { min: 1, max: selectedMaterial.quantity }
                }}
                sx={{ mb: 2 }}
              />
              <Typography variant="body2">
                Total Amount: ₹{(sellQuantity * selectedMaterial.price).toFixed(2)}
              </Typography>
            </Box>
          )}
        </DialogContent>
        <DialogActions>
          <Button onClick={handleSellDialogClose}>Cancel</Button>
          <Button 
            onClick={handleSellSubmit} 
            variant="contained" 
            disabled={!sellQuantity || loading}
          >
            {loading ? 'Processing...' : 'Sell'}
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default SupplierDashboard; 
import React, { useState } from 'react';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  Button,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Box
} from '@mui/material';
import { rawMaterialService } from '../services/api';

const AddMaterialForm = ({ onMaterialAdded, isOpen, onClose }) => {
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    quantity: '',
    unit: '',
    price: ''
  });
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      setLoading(true);
      const response = await rawMaterialService.addMaterial(formData);
      onMaterialAdded(response.material);
      setFormData({
        name: '',
        description: '',
        quantity: '',
        unit: '',
        price: ''
      });
      onClose();
    } catch (error) {
      console.error('Error adding material:', error);
      alert(error.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog 
      open={isOpen}
      onClose={onClose}
      maxWidth="sm" 
      fullWidth
    >
      <DialogTitle>Add New Raw Material</DialogTitle>
      <DialogContent>
        <Box component="form" onSubmit={handleSubmit} sx={{ mt: 2 }}>
          <TextField
            fullWidth
            label="Material Name"
            name="name"
            value={formData.name}
            onChange={(e) => setFormData({ ...formData, name: e.target.value })}
            required
            sx={{ mb: 2 }}
          />
          
          <TextField
            fullWidth
            label="Description"
            name="description"
            value={formData.description}
            onChange={(e) => setFormData({ ...formData, description: e.target.value })}
            multiline
            rows={3}
            sx={{ mb: 2 }}
          />
          
          <TextField
            fullWidth
            label="Quantity"
            name="quantity"
            type="number"
            value={formData.quantity}
            onChange={(e) => setFormData({ ...formData, quantity: e.target.value })}
            required
            sx={{ mb: 2 }}
          />
          
          <FormControl fullWidth sx={{ mb: 2 }}>
            <InputLabel>Unit</InputLabel>
            <Select
              name="unit"
              value={formData.unit}
              onChange={(e) => setFormData({ ...formData, unit: e.target.value })}
              required
            >
              <MenuItem value="kg">Kilograms (kg)</MenuItem>
              <MenuItem value="g">Grams (g)</MenuItem>
              <MenuItem value="l">Liters (l)</MenuItem>
              <MenuItem value="ml">Milliliters (ml)</MenuItem>
              <MenuItem value="units">Units</MenuItem>
            </Select>
          </FormControl>
          
          <TextField
            fullWidth
            label="Price per unit"
            name="price"
            type="number"
            value={formData.price}
            onChange={(e) => setFormData({ ...formData, price: e.target.value })}
            required
            sx={{ mb: 2 }}
          />
        </Box>
      </DialogContent>
      <DialogActions>
        <Button onClick={onClose}>Cancel</Button>
        <Button 
          type="submit"
          variant="contained" 
          onClick={handleSubmit}
          disabled={loading}
        >
          {loading ? 'Adding...' : 'Add Material'}
        </Button>
      </DialogActions>
    </Dialog>
  );
};

export default AddMaterialForm;
import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  Box, 
  AppBar, 
  Toolbar, 
  Typography, 
  Container,
  Grid,
  Card,
  CardContent,
  IconButton,
  Menu,
  MenuItem,
  ListItemIcon,
  ListItemText,
  Divider,
  Paper,
  Avatar,
  TextField,
  Button,
  Drawer,
  List,
  ListItem,
  FormControl,
  InputLabel,
  Select,
  InputAdornment,
  Chip,
  Stack,
} from '@mui/material';
import {
  Factory,
  Assessment,
  Notifications,
  ExitToApp,
  Person,
  AccountCircle,
  Inventory,
  LocalShipping,
  Payments,
  Category,
  AddBox,
  List as ListIcon,
  Medication,
  Home,
  RequestQuote,
  AddPhotoAlternate,
} from '@mui/icons-material';
import { requestService, authService, materialRequestService, userService, drugCategoryService, drugService, batchService, drugRequestService } from '../services/api.js';

// Mock manufacturer data
const manufacturerData = {
  name: "Mubashir",
  organizationName: "Shameem Manufacturing Co.",
  email: "shameem@xyzmanufacturing.com",
  phone: "+915632412578",
  address: "Manufacturing Ave, Kashmir Zone",
  registrationDate: "February 1, 2024"
};

const DRAWER_WIDTH = 240;

const sidebarItems = [
  { text: 'Home', icon: <Home />, color: '#1a237e' },
  { text: 'Dashboard', icon: <Factory />, color: '#2196f3' },
  { text: 'Request Material', icon: <RequestQuote />, color: '#ff9800' },
  { text: 'Add Drug Category', icon: <Category />, color: '#4caf50' },
  { text: 'Add Drug', icon: <AddBox />, color: '#00796b' },
  { text: 'View Approval', icon: <Assessment />, color: '#e91e63' },
  { text: 'Create Batch', icon: <Inventory />, color: '#795548' },
  { text: 'Drug Inventory', icon: <Inventory />, color: '#3f51b5' },
  { text: 'Transfer Batch to Distributor', icon: <LocalShipping />, color: '#9c27b0' },
  { text: 'All Categories', icon: <ListIcon />, color: '#607d8b' },
  { text: 'View All Drugs', icon: <Medication />, color: '#f44336' },
  { text: 'Payment', icon: <Payments />, color: '#0d47a1' },
];

const ManufacturerDashboard = ({ onLogout }) => {
  const navigate = useNavigate();
  const [anchorEl, setAnchorEl] = useState(null);
  const [showProfile, setShowProfile] = useState(false);
  const [passwordData, setPasswordData] = useState({
    currentPassword: '',
    newPassword: '',
    confirmPassword: ''
  });
  const [selectedItem, setSelectedItem] = useState('Dashboard');
  const [categoryFormData, setCategoryFormData] = useState({
    categoryName: '',
    description: '',
    status: 'active' // default status
  });
  const [drugFormData, setDrugFormData] = useState({
    drugName: '',
    category: '',
    description: '',
    composition: '',
    dosageForm: '',
    manufacturer: manufacturerData.organizationName,
    manufacturingDate: '',
    expiryDate: '',
    price: '',
    quantity: ''
  });
  const [drugs, setDrugs] = useState([]); // To store all drugs
  const [dashboardStats, setDashboardStats] = useState([
    { title: 'Total Products', value: '0', icon: <Factory />, color: '#2196f3' },
    { title: 'Raw Materials', value: '120', icon: <Inventory />, color: '#4caf50' },
    { title: 'Pending Orders', value: '15', icon: <LocalShipping />, color: '#ff9800' },
    { title: 'Total Revenue', value: '₹50L', icon: <Payments />, color: '#f44336' },
  ]);
  const [batchFormData, setBatchFormData] = useState({
    drugId: '',
    manufacturingDate: '',
    expiryDate: '',
    unitPrice: '',
    quantity: '',
  });
  const [batches, setBatches] = useState([]);
  const [selectedDrug, setSelectedDrug] = useState(null);
  const [availableBatches, setAvailableBatches] = useState([
    {
      id: 1,
      batchName: "PCM-2024-001",
      drugName: "Paracetamol 500mg",
      quantity: 10000,
      manufacturingDate: "2024-02-15",
      expiryDate: "2026-02-15",
      price: "₹50,000",
      status: "ready"
    },
    // Add more batches as needed
  ]);
  const [selectedDistributor, setSelectedDistributor] = useState('');
  const [distributors, setDistributors] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [suppliers, setSuppliers] = useState([]);
  const [materialRequestData, setMaterialRequestData] = useState({
    supplierId: '',
    materialName: '',
    quantity: '',
    requiredBy: '',
    notes: ''
  });
  const [materialRequests, setMaterialRequests] = useState([]);
  const [categories, setCategories] = useState([]);
  const [drugRequests, setDrugRequests] = useState([]);

  // Fetch suppliers and material requests
  useEffect(() => {
    const fetchSuppliers = async () => {
      try {
        const response = await userService.getUsersByRole('supplier');
        setSuppliers(response.data);
      } catch (error) {
        console.error('Error fetching suppliers:', error);
      }
    };

    const fetchMaterialRequests = async () => {
      try {
        const response = await materialRequestService.getManufacturerRequests();
        setMaterialRequests(response.requests);
      } catch (error) {
        console.error('Error fetching material requests:', error);
      }
    };

    if (selectedItem === 'Request Material' || selectedItem === 'Home') {
      fetchSuppliers();
      fetchMaterialRequests();
    }
  }, [selectedItem]);

  useEffect(() => {
    if (selectedItem === 'Add Drug Category' || selectedItem === 'Add Drug' || selectedItem === 'All Categories') {
      fetchCategories();
    }
  }, [selectedItem]);

  useEffect(() => {
    if (selectedItem === 'View All Drugs' || selectedItem === 'Dashboard') {
      fetchDrugs();
    }
  }, [selectedItem]);

  useEffect(() => {
    if (selectedItem === 'Create Batch' || selectedItem === 'Transfer Batch to Distributor') {
      fetchDrugs();
      fetchBatches();
    }
  }, [selectedItem]);

  useEffect(() => {
    const fetchDistributors = async () => {
      try {
        setLoading(true);
        const response = await userService.getUsersByRole('distributor');
        console.log('Fetched distributors:', response.data);
        setDistributors(response.data);
      } catch (error) {
        console.error('Error fetching distributors:', error);
        alert('Failed to fetch distributors');
      } finally {
        setLoading(false);
      }
    };
    
    if (selectedItem === 'Transfer Batch to Distributor') {
      fetchDistributors();
    }
  }, [selectedItem]);

  useEffect(() => {
    const fetchDrugRequests = async () => {
      try {
        setLoading(true);
        const response = await drugRequestService.getManufacturerRequests();
        setDrugRequests(response.requests);
      } catch (error) {
        console.error('Error fetching drug requests:', error);
      } finally {
        setLoading(false);
      }
    };
    
    if (selectedItem === 'View Approval') {
      fetchDrugRequests();
    }
  }, [selectedItem]);

  const fetchCategories = async () => {
    try {
      const response = await drugCategoryService.getAllCategories();
      setCategories(response.categories);
      console.log('Fetched categories:', response.categories);
    } catch (error) {
      console.error('Error fetching categories:', error);
    }
  };

  const fetchDrugs = async () => {
    try {
      const response = await drugService.getAllDrugs();
      setDrugs(response.drugs);
    } catch (error) {
      console.error('Error fetching drugs:', error);
    }
  };

  const fetchBatches = async () => {
    try {
      const response = await batchService.getManufacturerBatches();
      setBatches(response.batches);
    } catch (error) {
      console.error('Error fetching batches:', error);
    }
  };

  const handleProfileMenuOpen = (event) => {
    setAnchorEl(event.currentTarget);
  };

  const handleProfileMenuClose = () => {
    setAnchorEl(null);
  };

  const handleProfileClick = () => {
    setShowProfile(true);
    handleProfileMenuClose();
  };

  const handleLogout = () => {
    handleProfileMenuClose();
    onLogout();
    navigate('/login');
  };

  const handlePasswordChange = (e) => {
    setPasswordData({
      ...passwordData,
      [e.target.name]: e.target.value
    });
  };

  const handlePasswordSubmit = (e) => {
    e.preventDefault();
    console.log('Password change requested:', passwordData);
    setPasswordData({
      currentPassword: '',
      newPassword: '',
      confirmPassword: ''
    });
  };

  const handleMenuClick = (text) => {
    setSelectedItem(text);
    if (text === 'Home') {
      setShowProfile(false);
      // Reset any other states if needed
    }
  };

  const handleCategoryFormChange = (e) => {
    setCategoryFormData({
      ...categoryFormData,
      [e.target.name]: e.target.value
    });
  };

  const handleCategorySubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      await drugCategoryService.createCategory(categoryFormData);
      
      // Reset form
      setCategoryFormData({
        categoryName: '',
        description: '',
        status: 'active'
      });
      
      // Refresh categories list
      fetchCategories();
      
      alert('Drug category created successfully!');
      setSelectedItem('All Categories');
    } catch (error) {
      console.error('Error creating category:', error);
      alert(error.response?.data?.message || 'Failed to create category');
    } finally {
      setLoading(false);
    }
  };

  const handleDrugFormChange = (e) => {
    const { name, value } = e.target;
    setDrugFormData(prev => ({
      ...prev,
      [name]: value
    }));
    console.log(`Updated ${name} to:`, value); // Debug log
  };

  const handleDrugSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      if (!drugFormData.category) {
        throw new Error('Please select a category');
      }

      await drugService.createDrug({
        ...drugFormData,
        price: Number(drugFormData.price),
        stock: Number(drugFormData.quantity),
        category: drugFormData.category
      });
      
      // Reset form
      setDrugFormData({
        drugName: '',
        category: '',
        description: '',
        composition: '',
        dosageForm: '',
        manufacturer: manufacturerData.organizationName,
        manufacturingDate: '',
        expiryDate: '',
        price: '',
        quantity: ''
      });
      
      // Refresh drugs list
      fetchDrugs();
      
      alert('Drug added successfully!');
    } catch (error) {
      console.error('Error adding drug:', error);
      alert(error.message || error.response?.data?.message || 'Failed to add drug');
    } finally {
      setLoading(false);
    }
  };

  const handleBatchFormChange = (e) => {
    const { name, value } = e.target;
    
    // If changing drug selection, update dates
    if (name === 'drugId') {
      const selectedDrug = drugs.find(d => d._id === value);
      if (selectedDrug) {
        setBatchFormData({
          ...batchFormData,
          [name]: value,
          manufacturingDate: new Date(selectedDrug.manufacturingDate).toISOString().split('T')[0],
          expiryDate: new Date(selectedDrug.expiryDate).toISOString().split('T')[0]
        });
        setSelectedDrug(selectedDrug);
      }
    } else {
      setBatchFormData({
        ...batchFormData,
        [name]: value
      });
    }
  };

  const handleBatchSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      if (!batchFormData.drugId) {
        throw new Error('Please select a drug');
      }

      const response = await batchService.createBatch({
        drugId: batchFormData.drugId,
        manufacturingDate: batchFormData.manufacturingDate,
        expiryDate: batchFormData.expiryDate,
        quantity: Number(batchFormData.quantity),
        unitPrice: Number(batchFormData.unitPrice)
      });

      // Reset form
      setBatchFormData({
        drugId: '',
        manufacturingDate: '',
        expiryDate: '',
        unitPrice: '',
        quantity: '',
      });

      // Refresh batches
      fetchBatches();
      
      alert('Batch created successfully!');
    } catch (error) {
      console.error('Error creating batch:', error);
      alert(error.message || error.response?.data?.message || 'Failed to create batch');
    } finally {
      setLoading(false);
    }
  };

  const handleBatchTransfer = async (batch) => {
    try {
      setLoading(true);

      if (!selectedDistributor) {
        throw new Error('Please select a distributor');
      }

      // Call API to transfer batch
      const response = await batchService.transferBatch({
        batchId: batch._id,
        distributorId: selectedDistributor,
        quantity: batch.quantity
      });

      // Update local state
      setBatches(prevBatches => 
        prevBatches.map(b => 
          b._id === batch._id 
            ? { ...b, status: 'transferred' } 
            : b
        )
      );

      // Reset distributor selection
      setSelectedDistributor('');

      // Show success message
      alert('Batch transferred successfully!');

      // Refresh batches list
      fetchBatches();
    } catch (error) {
      console.error('Error transferring batch:', error);
      alert(error.message || 'Failed to transfer batch');
    } finally {
      setLoading(false);
    }
  };

  const handleApprovalSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      await requestService.createRequest({
        type: 'Drug Approval',
        details: approvalFormData
      });
      // Reset form and show success message
    } catch (error) {
      setError(error.message);
    } finally {
      setLoading(false);
    }
  };

  const handleMaterialRequestChange = (e) => {
    setMaterialRequestData({
      ...materialRequestData,
      [e.target.name]: e.target.value
    });
  };

  const handleMaterialRequestSubmit = async (e) => {
    e.preventDefault();
    try {
      await materialRequestService.createRequest({
        supplierId: materialRequestData.supplierId,
        materialName: materialRequestData.materialName,
        quantity: Number(materialRequestData.quantity),
        requiredBy: materialRequestData.requiredBy,
        notes: materialRequestData.notes || ''
      });

      // Reset form
      setMaterialRequestData({
        supplierId: '',
        materialName: '',
        quantity: '',
        requiredBy: '',
        notes: ''
      });

      // Refresh requests
      const response = await materialRequestService.getManufacturerRequests();
      setMaterialRequests(response.requests);
      // Show success message
      alert('Request sent successfully to supplier!');
    } catch (error) {
      console.error('Error creating material request:', error);
      alert('Failed to send request. Please try again.');
    }
  };

  const handleDrugRequestAction = async (requestId, status) => {
    try {
      setLoading(true);
      await drugRequestService.updateRequestStatus(requestId, status);
      
      // Refresh requests list
      const response = await drugRequestService.getManufacturerRequests();
      setDrugRequests(response.requests);
      
      alert(`Request ${status} successfully`);
    } catch (error) {
      console.error('Error updating request status:', error);
      alert(error.message || 'Failed to update request status');
    } finally {
      setLoading(false);
    }
  };

  const renderContent = () => {
    switch (selectedItem) {
      case 'Home':
        return (
          <Box sx={{ 
            display: 'flex', 
            flexDirection: 'column', 
            alignItems: 'center', 
            justifyContent: 'center',
            minHeight: 'calc(100vh - 64px)', // Adjust for AppBar height
            bgcolor: '#f5f5f5',
            p: 3
          }}>
            <Paper 
              elevation={3} 
              sx={{ 
                p: 5, 
                textAlign: 'center',
                maxWidth: 600,
                width: '100%',
                background: 'linear-gradient(135deg, #1a237e 0%, #0d47a1 100%)',
                borderRadius: 2,
                boxShadow: '0 8px 32px rgba(0, 0, 0, 0.1)',
              }}
            >
              <Typography 
                variant="h3" 
                component="h1" 
                sx={{ 
                  mb: 3, 
                  color: '#ffffff',
                  fontWeight: 700 
                }}
              >
                Welcome Back!
              </Typography>
              <Typography 
                variant="h5" 
                sx={{ 
                  mb: 4, 
                  color: '#e3f2fd',
                  fontWeight: 500 
                }}
              >
                {`${manufacturerData.name} | ${manufacturerData.organizationName}`}
              </Typography>
              
              <Typography 
                variant="body2" 
                sx={{ 
                  color: '#90caf9',
                  mt: 2,
                  fontStyle: 'italic',
                  fontWeight: 500
                }}
              >
                Your trusted partner in pharmaceutical manufacturing
              </Typography>
            </Paper>
          </Box>
        );

      case 'Dashboard':
        return (
          <Grid container spacing={3}>
            {dashboardStats.map((stat) => (
              <Grid item xs={12} sm={6} md={3} key={stat.title}>
                <Card 
                  elevation={2}
                  sx={{ 
                    borderRadius: 2,
                    transition: 'transform 0.2s',
                    '&:hover': {
                      transform: 'translateY(-4px)'
                    }
                  }}
                >
                  <CardContent sx={{ 
                    display: 'flex', 
                    alignItems: 'center',
                    justifyContent: 'space-between'
                  }}>
                    <Box>
                      <Typography variant="h4" component="div" sx={{ fontWeight: 'bold', mb: 1 }}>
                        {stat.value}
                      </Typography>
                      <Typography variant="body2" color="text.secondary">
                        {stat.title}
                      </Typography>
                    </Box>
                    <Box 
                      sx={{ 
                        bgcolor: `${stat.color}15`,
                        p: 1,
                        borderRadius: 2,
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center'
                      }}
                    >
                      <Box sx={{ color: stat.color, '& > svg': { fontSize: 32 } }}>
                        {stat.icon}
                      </Box>
                    </Box>
                  </CardContent>
                </Card>
              </Grid>
            ))}
          </Grid>
        );

      // Add other cases for different menu items
      case 'Add Drug Category':
        return (
          <Container maxWidth="lg">
            <Grid container spacing={3}>
              {/* Add Category Form */}
              <Grid item xs={12} md={6}>
                <Paper elevation={3} sx={{ p: 3 }}>
                  <Typography variant="h6" gutterBottom>
                    Add New Drug Category
                  </Typography>
                  <form onSubmit={handleCategorySubmit}>
                    <TextField
                      fullWidth
                      label="Category Name"
                      name="categoryName"
                      value={categoryFormData.categoryName}
                      onChange={handleCategoryFormChange}
                      required
                      sx={{ mb: 2 }}
                    />
                    <TextField
                      fullWidth
                      label="Description"
                      name="description"
                      value={categoryFormData.description}
                      onChange={handleCategoryFormChange}
                      required
                      multiline
                      rows={4}
                      sx={{ mb: 2 }}
                    />
                    <FormControl fullWidth sx={{ mb: 2 }}>
                      <InputLabel>Status</InputLabel>
                      <Select
                        name="status"
                        value={categoryFormData.status}
                        onChange={handleCategoryFormChange}
                        required
                      >
                        <MenuItem value="active">Active</MenuItem>
                        <MenuItem value="inactive">Inactive</MenuItem>
                      </Select>
                    </FormControl>
                    <Button
                      type="submit"
                      variant="contained"
                      color="primary"
                      fullWidth
                      disabled={loading}
                    >
                      {loading ? 'Creating...' : 'Create Category'}
                    </Button>
                  </form>
                </Paper>
              </Grid>

              {/* Categories List */}
              <Grid item xs={12} md={6}>
                <Paper elevation={3} sx={{ p: 3 }}>
                  <Typography variant="h6" gutterBottom>
                    Existing Categories
                  </Typography>
                  {categories.length === 0 ? (
                    <Typography color="textSecondary">
                      No categories found
                    </Typography>
                  ) : (
                    categories.map((category) => (
                      <Card key={category._id} sx={{ mb: 2 }}>
                        <CardContent>
                          <Typography variant="subtitle1">
                            {category.categoryName}
                          </Typography>
                          <Typography color="textSecondary">
                            {category.description}
                          </Typography>
                          <Box sx={{ mt: 1 }}>
                            <Chip
                              label={category.status}
                              color={category.status === 'active' ? 'success' : 'error'}
                              size="small"
                            />
                          </Box>
                        </CardContent>
                      </Card>
                    ))
                  )}
                </Paper>
              </Grid>
            </Grid>
          </Container>
        );

      case 'Add Drug':
        return (
          <Container maxWidth="lg">
            <Paper elevation={3} sx={{ p: 3, mt: 3 }}>
              <Typography variant="h6" gutterBottom>
                Add New Drug
              </Typography>
              <form onSubmit={handleDrugSubmit}>
                <Grid container spacing={3}>
                  <Grid item xs={12} md={6}>
                    <TextField
                      fullWidth
                      label="Drug Name"
                      name="drugName"
                      value={drugFormData.drugName}
                      onChange={handleDrugFormChange}
                      required
                    />
                  </Grid>
                  
                  <Grid item xs={12} md={6}>
                    <FormControl fullWidth required>
                      <InputLabel>Category</InputLabel>
                      <Select
                        name="category"
                        value={drugFormData.category}
                        onChange={handleDrugFormChange}
                        label="Category"
                        error={!drugFormData.category && categories.length > 0}
                      >
                        {categories.length === 0 ? (
                          <MenuItem disabled>No categories available</MenuItem>
                        ) : (
                          categories.map((category) => (
                            <MenuItem 
                              key={category._id} 
                              value={category._id}
                              disabled={category.status === 'inactive'}
                            >
                              {category.categoryName}
                            </MenuItem>
                          ))
                        )}
                      </Select>
                      {categories.length === 0 && (
                        <Typography color="error" variant="caption" sx={{ mt: 1 }}>
                          Please add categories first
                        </Typography>
                      )}
                    </FormControl>
                  </Grid>
                  
                  <Grid item xs={12}>
                    <TextField
                      fullWidth
                      label="Description"
                      name="description"
                      value={drugFormData.description}
                      onChange={handleDrugFormChange}
                      multiline
                      rows={3}
                      required
                    />
                  </Grid>
                  
                  <Grid item xs={12}>
                    <TextField
                      fullWidth
                      label="Composition"
                      name="composition"
                      value={drugFormData.composition}
                      onChange={handleDrugFormChange}
                      multiline
                      rows={2}
                      required
                    />
                  </Grid>
                  
                  <Grid item xs={12} md={6}>
                    <FormControl fullWidth required>
                      <InputLabel>Dosage Form</InputLabel>
                      <Select
                        name="dosageForm"
                        value={drugFormData.dosageForm}
                        onChange={handleDrugFormChange}
                        label="Dosage Form"
                      >
                        <MenuItem value="tablet">Tablet</MenuItem>
                        <MenuItem value="capsule">Capsule</MenuItem>
                        <MenuItem value="liquid">Liquid</MenuItem>
                        <MenuItem value="injection">Injection</MenuItem>
                        <MenuItem value="cream">Cream</MenuItem>
                        <MenuItem value="ointment">Ointment</MenuItem>
                      </Select>
                    </FormControl>
                  </Grid>
                  
                  <Grid item xs={12} md={6}>
                    <TextField
                      fullWidth
                      label="Manufacturer"
                      name="manufacturer"
                      value={drugFormData.manufacturer}
                      disabled
                    />
                  </Grid>
                  
                  <Grid item xs={12} md={6}>
                    <TextField
                      fullWidth
                      label="Manufacturing Date"
                      name="manufacturingDate"
                      type="date"
                      value={drugFormData.manufacturingDate}
                      onChange={handleDrugFormChange}
                      required
                      InputLabelProps={{ shrink: true }}
                    />
                  </Grid>
                  
                  <Grid item xs={12} md={6}>
                    <TextField
                      fullWidth
                      label="Expiry Date"
                      name="expiryDate"
                      type="date"
                      value={drugFormData.expiryDate}
                      onChange={handleDrugFormChange}
                      required
                      InputLabelProps={{ shrink: true }}
                    />
                  </Grid>
                  
                  <Grid item xs={12} md={6}>
                    <TextField
                      fullWidth
                      label="Quantity"
                      name="quantity"
                      type="number"
                      value={drugFormData.quantity}
                      onChange={handleDrugFormChange}
                      required
                      inputProps={{ min: 0 }}
                      helperText="Initial stock quantity"
                      InputProps={{
                        endAdornment: <InputAdornment position="end">units</InputAdornment>,
                      }}
                    />
                  </Grid>
                  
                  <Grid item xs={12} md={6}>
                    <TextField
                      fullWidth
                      label="Price"
                      name="price"
                      type="number"
                      value={drugFormData.price}
                      onChange={handleDrugFormChange}
                      required
                      InputProps={{
                        startAdornment: <InputAdornment position="start">₹</InputAdornment>,
                      }}
                    />
                  </Grid>
                  
                  <Grid item xs={12}>
                    <Button
                      type="submit"
                      variant="contained"
                      color="primary"
                      fullWidth
                      disabled={loading}
                      sx={{ mt: 2 }}
                    >
                      {loading ? 'Adding Drug...' : 'Add Drug'}
                    </Button>
                  </Grid>
                </Grid>
              </form>
            </Paper>
          </Container>
        );

      case 'Request Approval':
        return (
          <Container maxWidth="md">
            <Paper elevation={3} sx={{ p: 4, borderRadius: 2 }}>
              <Typography 
                variant="h5" 
                sx={{ 
                  mb: 4, 
                  color: '#1a237e',
                  fontWeight: 600,
                  textAlign: 'center'
                }}
              >
                Send Drug Approval Request
              </Typography>

              <form onSubmit={handleApprovalSubmit}>
                <Grid container spacing={3}>
                  {/* Drug Image Upload */}
                  <Grid item xs={12}>
                    <Box
                      sx={{
                        border: '2px dashed #1a237e',
                        borderRadius: 2,
                        p: 3,
                        textAlign: 'center',
                        cursor: 'pointer',
                        '&:hover': {
                          bgcolor: 'rgba(26, 35, 126, 0.04)',
                        },
                      }}
                      onClick={() => document.getElementById('drugImage').click()}
                    >
                      {approvalFormData.drugImage ? (
                        <Box>
                          <Typography variant="body1" color="primary" gutterBottom>
                            {approvalFormData.drugImage.name}
                          </Typography>
                          <Typography variant="body2" color="text.secondary">
                            Click to change image
                          </Typography>
                        </Box>
                      ) : (
                        <Box>
                          <AddPhotoAlternate sx={{ fontSize: 40, color: '#1a237e', mb: 1 }} />
                          <Typography variant="body1" color="primary">
                            Upload Drug Image
                          </Typography>
                          <Typography variant="body2" color="text.secondary">
                            Click to select an image
                          </Typography>
                        </Box>
                      )}
                      <input
                        id="drugImage"
                        type="file"
                        accept="image/*"
                        hidden
                        onChange={handleImageUpload}
                        required
                      />
                    </Box>
                  </Grid>

                  {/* Category Name */}
                  <Grid item xs={12} md={6}>
                    <FormControl fullWidth required>
                      <InputLabel>Category Name</InputLabel>
                      <Select
                        name="categoryName"
                        value={approvalFormData.categoryName}
                        onChange={handleApprovalFormChange}
                        label="Category Name"
                      >
                        <MenuItem value="category1">Category 1</MenuItem>
                        <MenuItem value="category2">Category 2</MenuItem>
                        {/* Map through your categories here */}
                      </Select>
                    </FormControl>
                  </Grid>

                  {/* Drug Name */}
                  <Grid item xs={12} md={6}>
                    <TextField
                      fullWidth
                      label="Drug Name"
                      name="drugName"
                      value={approvalFormData.drugName}
                      onChange={handleApprovalFormChange}
                      required
                      variant="outlined"
                    />
                  </Grid>

                  {/* Description */}
                  <Grid item xs={12}>
                    <TextField
                      fullWidth
                      label="Drug Description"
                      name="description"
                      value={approvalFormData.description}
                      onChange={handleApprovalFormChange}
                      required
                      variant="outlined"
                      multiline
                      rows={4}
                    />
                  </Grid>

                  {/* Date */}
                  <Grid item xs={12} md={6}>
                    <TextField
                      fullWidth
                      label="Date"
                      name="date"
                      type="date"
                      value={approvalFormData.date}
                      onChange={handleApprovalFormChange}
                      required
                      variant="outlined"
                      InputLabelProps={{
                        shrink: true,
                      }}
                    />
                  </Grid>

                  {/* Email */}
                  <Grid item xs={12} md={6}>
                    <TextField
                      fullWidth
                      label="Email"
                      name="email"
                      type="email"
                      value={approvalFormData.email}
                      disabled
                      variant="outlined"
                    />
                  </Grid>

                  {/* Submit Button */}
                  <Grid item xs={12}>
                    <Box sx={{ display: 'flex', gap: 2, justifyContent: 'flex-end' }}>
                      <Button
                        variant="outlined"
                        onClick={() => setApprovalFormData({
                          drugImage: null,
                          categoryName: '',
                          drugName: '',
                          description: '',
                          date: new Date().toISOString().split('T')[0],
                          email: manufacturerData.email
                        })}
                        sx={{
                          px: 4,
                          py: 1.5,
                          fontSize: '1rem',
                          fontWeight: 500,
                          textTransform: 'none',
                          borderColor: '#1a237e',
                          color: '#1a237e',
                          '&:hover': {
                            borderColor: '#0d1b60',
                            bgcolor: 'rgba(26, 35, 126, 0.05)',
                          },
                        }}
                      >
                        Clear
                      </Button>
                      <Button
                        type="submit"
                        variant="contained"
                        sx={{
                          px: 4,
                          py: 1.5,
                          fontSize: '1rem',
                          fontWeight: 500,
                          textTransform: 'none',
                          bgcolor: '#1a237e',
                          '&:hover': {
                            bgcolor: '#0d1b60',
                          },
                        }}
                      >
                        Send Approval Request
                      </Button>
                    </Box>
                  </Grid>
                </Grid>
              </form>
            </Paper>
          </Container>
        );

      case 'View Approval':
        return (
          <Container maxWidth="lg">
            <Paper elevation={3} sx={{ p: 4, borderRadius: 2 }}>
              <Typography 
                variant="h5" 
                sx={{ 
                  mb: 4, 
                  color: '#1a237e',
                  fontWeight: 600,
                  textAlign: 'center'
                }}
              >
                Drug Requests from Distributors
              </Typography>

              {loading ? (
                <Box sx={{ textAlign: 'center', p: 3 }}>
                  <Typography>Loading requests...</Typography>
                </Box>
              ) : drugRequests.length === 0 ? (
                <Box sx={{ textAlign: 'center', p: 3 }}>
                  <Typography color="textSecondary">
                    No pending requests
                  </Typography>
                </Box>
              ) : (
                <Grid container spacing={3}>
                  {drugRequests.map((request) => (
                    <Grid item xs={12} key={request._id}>
                      <Card 
                        elevation={2}
                        sx={{ 
                          p: 2,
                          borderLeft: '4px solid',
                          borderColor: 
                            request.status === 'approved' ? '#4caf50' :
                            request.status === 'rejected' ? '#f44336' :
                            '#ff9800'
                        }}
                      >
                        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                          <Box>
                            <Typography variant="h6" sx={{ color: '#1a237e', fontWeight: 600, mb: 1 }}>
                              {request.drugName}
                            </Typography>
                            <Grid container spacing={2}>
                              <Grid item xs={12} sm={6}>
                                <Typography variant="body2" color="textSecondary">
                                  Distributor: {request.distributor.organizationName}
                                </Typography>
                                <Typography variant="body2" color="textSecondary">
                                  Email: {request.distributor.email}
                                </Typography>
                                <Typography variant="body2" color="textSecondary">
                                  Quantity: {request.quantity} units
                                </Typography>
                              </Grid>
                              <Grid item xs={12} sm={6}>
                                <Typography variant="body2" color="textSecondary">
                                  Required By: {new Date(request.requiredBy).toLocaleDateString()}
                                </Typography>
                                <Typography variant="body2" color="textSecondary">
                                  Request Date: {new Date(request.requestDate).toLocaleDateString()}
                                </Typography>
                                {request.notes && (
                                  <Typography variant="body2" color="textSecondary">
                                    Notes: {request.notes}
                                  </Typography>
                                )}
                              </Grid>
                            </Grid>
                          </Box>
                          <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-end', gap: 2 }}>
                            <Chip
                              label={
                                request.status === 'approved' ? 'Approved' :
                                request.status === 'rejected' ? 'Rejected' :
                                'Pending'
                              }
                              color={
                                request.status === 'approved' ? 'success' :
                                request.status === 'rejected' ? 'error' :
                                'warning'
                              }
                            />
                            {request.status === 'pending' && (
                              <Box sx={{ display: 'flex', gap: 1 }}>
                                <Button
                                  variant="contained"
                                  color="success"
                                  onClick={() => handleDrugRequestAction(request._id, 'approved')}
                                  disabled={loading}
                                  size="small"
                                >
                                  Approve
                                </Button>
                                <Button
                                  variant="contained"
                                  color="error"
                                  onClick={() => handleDrugRequestAction(request._id, 'rejected')}
                                  disabled={loading}
                                  size="small"
                                >
                                  Reject
                                </Button>
                              </Box>
                            )}
                          </Box>
                        </Box>
                      </Card>
                    </Grid>
                  ))}
                </Grid>
              )}
            </Paper>
          </Container>
        );

      case 'Create Batch':
        return (
          <Container maxWidth="lg">
            <Grid container spacing={3}>
              {/* Batch Creation Form */}
              <Grid item xs={12} md={6}>
                <Paper elevation={3} sx={{ p: 4, borderRadius: 2 }}>
                  <Typography variant="h6" gutterBottom>Create New Batch</Typography>
                  <form onSubmit={handleBatchSubmit}>
                    <FormControl fullWidth sx={{ mb: 3 }}>
                      <InputLabel>Select Drug</InputLabel>
                      <Select
                        name="drugId"
                        value={batchFormData.drugId}
                        onChange={handleBatchFormChange}
                        required
                      >
                        {drugs.map((drug) => (
                          <MenuItem key={drug._id} value={drug._id}>
                            {drug.drugName} - {drug.dosageForm}
                          </MenuItem>
                        ))}
                      </Select>
                    </FormControl>

                    <Grid container spacing={3}>
                      <Grid item xs={12} md={6}>
                        <TextField
                          fullWidth
                          type="date"
                          label="Manufacturing Date"
                          name="manufacturingDate"
                          value={batchFormData.manufacturingDate}
                          onChange={handleBatchFormChange}
                          required
                          InputLabelProps={{ shrink: true }}
                          disabled={!batchFormData.drugId}
                          helperText="Auto-filled from drug details"
                        />
                      </Grid>
                      
                      <Grid item xs={12} md={6}>
                        <TextField
                          fullWidth
                          type="date"
                          label="Expiry Date"
                          name="expiryDate"
                          value={batchFormData.expiryDate}
                          onChange={handleBatchFormChange}
                          required
                          InputLabelProps={{ shrink: true }}
                          disabled={!batchFormData.drugId}
                          helperText="Auto-filled from drug details"
                        />
                      </Grid>

                      <Grid item xs={12} md={6}>
                        <TextField
                          fullWidth
                          type="number"
                          label="Quantity"
                          name="quantity"
                          value={batchFormData.quantity}
                          onChange={handleBatchFormChange}
                          required
                          inputProps={{ min: 1 }}
                        />
                      </Grid>

                      <Grid item xs={12} md={6}>
                        <TextField
                          fullWidth
                          type="number"
                          label="Unit Price"
                          name="unitPrice"
                          value={batchFormData.unitPrice}
                          onChange={handleBatchFormChange}
                          required
                          InputProps={{
                            startAdornment: <InputAdornment position="start">₹</InputAdornment>,
                          }}
                        />
                      </Grid>
                    </Grid>

                    <Box sx={{ mt: 3, display: 'flex', justifyContent: 'flex-end' }}>
                      <Button
                        type="submit"
                        variant="contained"
                        disabled={loading}
                        sx={{ minWidth: 150 }}
                      >
                        {loading ? 'Creating...' : 'Create Batch'}
                      </Button>
                    </Box>
                  </form>
                </Paper>
              </Grid>

              {/* Recent Batches */}
              <Grid item xs={12} md={6}>
                <Paper elevation={3} sx={{ p: 4, borderRadius: 2 }}>
                  <Typography variant="h6" gutterBottom>Recent Batches</Typography>
                  {batches.length === 0 ? (
                    <Typography color="textSecondary">No batches created yet</Typography>
                  ) : (
                    <Stack spacing={2}>
                      {batches.map((batch) => (
                        <Card key={batch._id} sx={{ p: 2 }}>
                          <Typography variant="subtitle1" gutterBottom>
                            Batch: {batch.batchNumber}
                          </Typography>
                          <Typography variant="body2" color="textSecondary">
                            Drug: {batch.drug.drugName}
                          </Typography>
                          <Typography variant="body2" color="textSecondary">
                            Quantity: {batch.quantity}
                          </Typography>
                          <Typography variant="body2" color="textSecondary">
                            Status: {batch.status}
                          </Typography>
                          <Chip
                            sx={{ mt: 1 }}
                            label={batch.status}
                            color={
                              batch.status === 'ready' ? 'success' :
                              batch.status === 'quality_check' ? 'warning' :
                              'default'
                            }
                            size="small"
                          />
                        </Card>
                      ))}
                    </Stack>
                  )}
                </Paper>
              </Grid>
            </Grid>
          </Container>
        );

      case 'Transfer Batch to Distributor':
        return (
          <Container maxWidth="lg">
            <Paper elevation={3} sx={{ p: 4, borderRadius: 2 }}>
              <Typography variant="h5" gutterBottom>
                Transfer Batch to Distributor
              </Typography>
              
              {loading ? (
                <Box sx={{ textAlign: 'center', p: 3 }}>
                  <Typography>Loading...</Typography>
                </Box>
              ) : batches.filter(b => b.status === 'manufactured').length === 0 ? (
                <Box sx={{ textAlign: 'center', p: 3 }}>
                  <Typography color="textSecondary">
                    No batches available for transfer
                  </Typography>
                </Box>
              ) : (
                <Grid container spacing={3}>
                  {batches.filter(b => b.status === 'manufactured').map((batch) => (
                    <Grid item xs={12} key={batch._id}>
                      <Card elevation={2}>
                        <CardContent>
                          <Grid container spacing={2}>
                            <Grid item xs={12} md={6}>
                              <Typography variant="h6">
                                Batch: {batch.batchNumber}
                              </Typography>
                              <Typography color="textSecondary">
                                Drug: {batch.drug.drugName}
                              </Typography>
                              <Typography>
                                Quantity: {batch.quantity}
                              </Typography>
                              <Typography>
                                Manufacturing Date: {new Date(batch.manufacturingDate).toLocaleDateString()}
                              </Typography>
                              <Typography>
                                Expiry Date: {new Date(batch.expiryDate).toLocaleDateString()}
                              </Typography>
                              <Typography>
                                Unit Price: ₹{batch.unitPrice}
                              </Typography>
                              <Typography color="primary" sx={{ fontWeight: 'bold', mt: 1 }}>
                                Total Value: ₹{(batch.quantity * batch.unitPrice).toFixed(2)}
                              </Typography>
                            </Grid>
                            <Grid item xs={12} md={6}>
                              <FormControl fullWidth sx={{ mb: 2 }}>
                                <InputLabel>Select Distributor</InputLabel>
                                <Select
                                  value={selectedDistributor || ''}
                                  onChange={(e) => setSelectedDistributor(e.target.value)}
                                  label="Select Distributor"
                                  required
                                >
                                  <MenuItem value="">Select a distributor</MenuItem>
                                  {distributors.map((dist) => (
                                    <MenuItem 
                                      key={dist._id} 
                                      value={dist._id}
                                    >
                                      <Box>
                                        <Typography variant="subtitle1">
                                          {dist.organizationName || 'Organization Not Set'}
                                        </Typography>
                                        <Typography variant="caption" color="textSecondary">
                                          Username: {dist.username} • {dist.email}
                                          {dist.phone && ` • ${dist.phone}`}
                                        </Typography>
                                      </Box>
                                    </MenuItem>
                                  ))}
                                </Select>
                                {distributors.length === 0 && (
                                  <Typography variant="caption" color="error" sx={{ mt: 1 }}>
                                    No registered distributors found
                                  </Typography>
                                )}
                              </FormControl>
                              <Button
                                fullWidth
                                variant="contained"
                                onClick={() => handleBatchTransfer(batch)}
                                disabled={!selectedDistributor || loading}
                                sx={{
                                  bgcolor: '#1a237e',
                                  '&:hover': {
                                    bgcolor: '#0d1b60'
                                  }
                                }}
                              >
                                {loading ? 'Transferring...' : 'Transfer Batch'}
                              </Button>
                            </Grid>
                          </Grid>
                        </CardContent>
                      </Card>
                    </Grid>
                  ))}
                </Grid>
              )}
            </Paper>
          </Container>
        );

      case 'All Categories':
        return (
          <Container maxWidth="lg">
            <Paper elevation={3} sx={{ p: 4, borderRadius: 2 }}>
              <Typography 
                variant="h5" 
                sx={{ 
                  mb: 4, 
                  color: '#1a237e',
                  fontWeight: 600,
                  textAlign: 'center'
                }}
              >
                Drug Categories
              </Typography>
              
              {loading ? (
                <Box sx={{ textAlign: 'center', p: 3 }}>
                  <Typography>Loading categories...</Typography>
                </Box>
              ) : categories.length === 0 ? (
                <Box sx={{ textAlign: 'center', p: 3 }}>
                  <Typography color="textSecondary">No categories found</Typography>
                  <Button
                    variant="contained"
                    onClick={() => setSelectedItem('Add Drug Category')}
                    sx={{ mt: 2 }}
                  >
                    Add Category
                  </Button>
                </Box>
              ) : (
                <Grid container spacing={3}>
                  {categories.map((category) => (
                    <Grid item xs={12} sm={6} md={4} key={category._id}>
                      <Card 
                        elevation={2}
                        sx={{ 
                          height: '100%',
                          display: 'flex',
                          flexDirection: 'column',
                          transition: 'transform 0.2s',
                          '&:hover': {
                            transform: 'translateY(-4px)'
                          }
                        }}
                      >
                        <CardContent sx={{ flexGrow: 1 }}>
                          <Box sx={{ 
                            display: 'flex', 
                            justifyContent: 'space-between', 
                            alignItems: 'flex-start',
                            mb: 2 
                          }}>
                            <Typography variant="h6" component="h3" sx={{ color: '#1a237e' }}>
                              {category.categoryName}
                            </Typography>
                            <Chip
                              label={category.status}
                              color={category.status === 'active' ? 'success' : 'error'}
                              size="small"
                            />
                          </Box>
                          
                          <Typography 
                            variant="body2" 
                            color="text.secondary"
                            sx={{ 
                              mb: 2,
                              minHeight: '3em',
                              display: '-webkit-box',
                              WebkitLineClamp: 2,
                              WebkitBoxOrient: 'vertical',
                              overflow: 'hidden',
                              textOverflow: 'ellipsis'
                            }}
                          >
                            {category.description}
                          </Typography>
                          
                          <Box sx={{ mt: 'auto' }}>
                            <Typography variant="caption" color="text.secondary">
                              Created by: {category.createdBy?.name || 'Unknown'}
                            </Typography>
                            <Typography 
                              variant="caption" 
                              display="block" 
                              color="text.secondary"
                            >
                              Created: {new Date(category.createdAt).toLocaleDateString()}
                            </Typography>
                          </Box>
                        </CardContent>
                      </Card>
                    </Grid>
                  ))}
                </Grid>
              )}
            </Paper>
          </Container>
        );

      case 'View All Drugs':
        return (
          <Container maxWidth="lg">
            <Paper elevation={3} sx={{ p: 3, mt: 3 }}>
              <Typography variant="h6" gutterBottom>
                All Drugs
              </Typography>
              {drugs.length === 0 ? (
                <Typography color="textSecondary">
                  No drugs found
                </Typography>
              ) : (
                <Grid container spacing={3}>
                  {drugs.map((drug) => (
                    <Grid item xs={12} md={6} key={drug._id}>
                      <Card>
                        <CardContent>
                          <Typography variant="h6">
                            {drug.drugName}
                          </Typography>
                          <Typography color="textSecondary" gutterBottom>
                            Category: {drug.category.categoryName}
                          </Typography>
                          <Typography variant="body2" paragraph>
                            {drug.description}
                          </Typography>
                          <Grid container spacing={2}>
                            <Grid item xs={6}>
                              <Typography variant="body2">
                                Dosage Form: {drug.dosageForm}
                              </Typography>
                            </Grid>
                            <Grid item xs={6}>
                              <Typography variant="body2">
                                Price: ₹{drug.price}
                              </Typography>
                            </Grid>
                            <Grid item xs={6}>
                              <Typography variant="body2">
                                Mfg Date: {new Date(drug.manufacturingDate).toLocaleDateString()}
                              </Typography>
                            </Grid>
                            <Grid item xs={6}>
                              <Typography variant="body2">
                                Exp Date: {new Date(drug.expiryDate).toLocaleDateString()}
                              </Typography>
                            </Grid>
                          </Grid>
                        </CardContent>
                      </Card>
                    </Grid>
                  ))}
                </Grid>
              )}
            </Paper>
          </Container>
        );

      case 'Payment':
        return (
          <Paper elevation={3} sx={{ p: 4, borderRadius: 2 }}>
            <Typography variant="h5" sx={{ mb: 3 }}>Payment</Typography>
            {/* Payment interface will go here */}
          </Paper>
        );

      case 'Request Material':
        return (
          <Container maxWidth="lg">
            <Grid container spacing={3}>
              {/* Request Form */}
              <Grid item xs={12} md={6}>
                <Paper elevation={3} sx={{ p: 3 }}>
                  <Typography variant="h6" gutterBottom>
                    Request Raw Material
                  </Typography>
                  <form onSubmit={handleMaterialRequestSubmit}>
                    <FormControl fullWidth sx={{ mb: 2 }}>
                      <InputLabel>Select Supplier</InputLabel>
                      <Select
                        name="supplierId"
                        value={materialRequestData.supplierId}
                        onChange={handleMaterialRequestChange}
                        required
                      >
                        {suppliers.map((supplier) => (
                          <MenuItem key={supplier._id} value={supplier._id}>
                            {supplier.organizationName || supplier.username}
                          </MenuItem>
                        ))}
                      </Select>
                    </FormControl>

                    <TextField
                      fullWidth
                      label="Material Name"
                      name="materialName"
                      value={materialRequestData.materialName}
                      onChange={handleMaterialRequestChange}
                      sx={{ mb: 2 }}
                      required
                      placeholder="Enter material name"
                    />

                    <TextField
                      fullWidth
                      label="Quantity"
                      type="number"
                      name="quantity"
                      value={materialRequestData.quantity}
                      onChange={handleMaterialRequestChange}
                      sx={{ mb: 2 }}
                      required
                      inputProps={{ min: 1 }}
                      placeholder="Enter required quantity"
                    />

                    <TextField
                      fullWidth
                      label="Required By"
                      type="date"
                      name="requiredBy"
                      value={materialRequestData.requiredBy}
                      onChange={handleMaterialRequestChange}
                      sx={{ mb: 2 }}
                      required
                      InputLabelProps={{ shrink: true }}
                      inputProps={{
                        min: new Date().toISOString().split('T')[0]
                      }}
                    />

                    <TextField
                      fullWidth
                      label="Notes"
                      name="notes"
                      value={materialRequestData.notes}
                      onChange={handleMaterialRequestChange}
                      multiline
                      rows={4}
                      sx={{ mb: 2 }}
                      placeholder="Add any additional notes or specifications"
                    />

                    <Button
                      type="submit"
                      variant="contained"
                      color="primary"
                      fullWidth
                    >
                      Submit Request
                    </Button>
                  </form>
                </Paper>
              </Grid>

              {/* Request History */}
              <Grid item xs={12} md={6}>
                <Paper elevation={3} sx={{ p: 3 }}>
                  <Typography variant="h6" gutterBottom>
                    Request History
                  </Typography>
                  {materialRequests.length === 0 ? (
                    <Typography color="textSecondary">
                      No material requests found
                    </Typography>
                  ) : (
                    materialRequests.map((request) => (
                      <Card key={request._id} sx={{ mb: 2 }}>
                        <CardContent>
                          <Typography variant="subtitle1">
                            {request.materialName}
                          </Typography>
                          <Typography color="textSecondary">
                            Supplier: {request.supplier.organizationName}
                          </Typography>
                          <Typography>
                            Quantity: {request.quantity}
                          </Typography>
                          <Typography>
                            Required By: {new Date(request.requiredBy).toLocaleDateString()}
                          </Typography>
                          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mt: 1 }}>
                            <Typography component="span">
                              Status:
                            </Typography>
                            <Chip 
                              label={request.status} 
                              color={
                                request.status === 'accepted' ? 'success' :
                                request.status === 'rejected' ? 'error' :
                                request.status === 'completed' ? 'info' : 'warning'
                              }
                              size="small"
                            />
                          </Box>
                          {request.notes && (
                            <Typography>
                              Notes: {request.notes}
                            </Typography>
                          )}
                        </CardContent>
                      </Card>
                    ))
                  )}
                </Paper>
              </Grid>
            </Grid>
          </Container>
        );

      case 'Drug Inventory':
        return (
          <Container maxWidth="lg">
            <Paper elevation={3} sx={{ p: 3, mt: 3 }}>
              <Typography variant="h6" gutterBottom sx={{ mb: 3 }}>
                Drug Inventory Status
              </Typography>
              
              {loading ? (
                <Box sx={{ textAlign: 'center', p: 3 }}>
                  <Typography>Loading inventory...</Typography>
                </Box>
              ) : drugs.length === 0 ? (
                <Box sx={{ textAlign: 'center', p: 3 }}>
                  <Typography color="textSecondary">No drugs in inventory</Typography>
                </Box>
              ) : (
                <Grid container spacing={3}>
                  {drugs.map((drug) => (
                    <Grid item xs={12} md={6} key={drug._id}>
                      <Card 
                        elevation={2}
                        sx={{ 
                          height: '100%',
                          position: 'relative',
                          '&:hover': { transform: 'translateY(-4px)' },
                          transition: 'transform 0.2s ease-in-out'
                        }}
                      >
                        <CardContent>
                          <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', mb: 2 }}>
                            <Typography variant="h6" component="div">
                              {drug.drugName}
                            </Typography>
                            <Chip
                              label={drug.stock > 100 ? 'In Stock' : drug.stock > 0 ? 'Low Stock' : 'Out of Stock'}
                              color={drug.stock > 100 ? 'success' : drug.stock > 0 ? 'warning' : 'error'}
                              size="small"
                            />
                          </Box>
                          
                          <Grid container spacing={2}>
                            <Grid item xs={12}>
                              <Typography variant="body2" color="textSecondary">
                                Category: {drug.category?.categoryName}
                              </Typography>
                            </Grid>
                            
                            <Grid item xs={6}>
                              <Typography variant="body2" color="textSecondary">
                                Current Stock: 
                                <Typography 
                                  component="span" 
                                  sx={{ 
                                    ml: 1,
                                    color: drug.stock > 100 ? 'success.main' : drug.stock > 0 ? 'warning.main' : 'error.main',
                                    fontWeight: 'bold'
                                  }}
                                >
                                  {drug.stock} units
                                </Typography>
                              </Typography>
                            </Grid>
                            
                            <Grid item xs={6}>
                              <Typography variant="body2" color="textSecondary">
                                Price: ₹{drug.price}/unit
                              </Typography>
                            </Grid>
                            
                            <Grid item xs={12}>
                              <Typography variant="body2" color="textSecondary">
                                Dosage Form: {drug.dosageForm}
                              </Typography>
                            </Grid>
                            
                            <Grid item xs={6}>
                              <Typography variant="body2" color="textSecondary">
                                Mfg Date: {new Date(drug.manufacturingDate).toLocaleDateString()}
                              </Typography>
                            </Grid>
                            
                            <Grid item xs={6}>
                              <Typography variant="body2" color="textSecondary">
                                Exp Date: {new Date(drug.expiryDate).toLocaleDateString()}
                              </Typography>
                            </Grid>
                          </Grid>
                        </CardContent>
                      </Card>
                    </Grid>
                  ))}
                </Grid>
              )}
            </Paper>
          </Container>
        );

      default:
        return null;
    }
  };

  return (
    <Box sx={{ display: 'flex', minHeight: '100vh' }}>
      {/* Header */}
      <AppBar 
        position="fixed" 
        sx={{ 
          zIndex: (theme) => theme.zIndex.drawer + 1,
          bgcolor: '#1a237e'
        }}
      >
        <Toolbar sx={{ justifyContent: 'space-between' }}>
          <Typography variant="h6" component="h1" sx={{ fontWeight: 600 }}>
            MANUFACTURER
          </Typography>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
            <IconButton color="inherit">
              <Notifications />
            </IconButton>
            <IconButton
              color="inherit"
              onClick={handleProfileMenuOpen}
              sx={{ 
                display: 'flex', 
                alignItems: 'center', 
                gap: 1 
              }}
            >
              <AccountCircle />
              <Typography variant="subtitle2" sx={{ display: { xs: 'none', sm: 'block' } }}>
                {manufacturerData.name}
              </Typography>
            </IconButton>
          </Box>
        </Toolbar>
      </AppBar>

      {/* Add Sidebar */}
      <Drawer
        variant="permanent"
        sx={{
          width: DRAWER_WIDTH,
          flexShrink: 0,
          '& .MuiDrawer-paper': {
            width: DRAWER_WIDTH,
            boxSizing: 'border-box',
            bgcolor: '#f5f5f5',
            borderRight: '1px solid rgba(0, 0, 0, 0.12)',
          },
        }}
      >
        <Toolbar />
        <Box sx={{ overflow: 'auto', mt: 2 }}>
          <List>
            {sidebarItems.map((item, index) => (
              <React.Fragment key={item.text}>
                <ListItem 
                  button
                  selected={selectedItem === item.text}
                  onClick={() => handleMenuClick(item.text)}
                  sx={{
                    mb: 1,
                    mx: 1,
                    borderRadius: 1,
                    '&.Mui-selected': {
                      bgcolor: `${item.color}15`,
                      '&:hover': {
                        bgcolor: `${item.color}25`,
                      },
                    },
                    '&:hover': {
                      bgcolor: 'rgba(25, 118, 210, 0.08)',
                    },
                  }}
                >
                  <ListItemIcon sx={{ color: item.color }}>
                    {item.icon}
                  </ListItemIcon>
                  <ListItemText 
                    primary={item.text} 
                    sx={{ 
                      '& .MuiListItemText-primary': {
                        fontWeight: selectedItem === item.text ? 600 : 500,
                        color: selectedItem === item.text ? item.color : '#1a237e',
                      }
                    }}
                  />
                </ListItem>
                {index === 1 && <Divider sx={{ my: 2, mx: 2 }} />}
              </React.Fragment>
            ))}
          </List>
        </Box>
      </Drawer>

      {/* Main Content */}
      <Box
        component="main"
        sx={{
          flexGrow: 1,
          p: 3,
          bgcolor: '#f8fafc',
          mt: 8,
        }}
      >
        <Container maxWidth="lg">
          {renderContent()}
        </Container>
      </Box>

      {/* Profile Menu */}
      <Menu
        anchorEl={anchorEl}
        open={Boolean(anchorEl)}
        onClose={handleProfileMenuClose}
        PaperProps={{
          sx: {
            mt: 1,
            width: 200,
          }
        }}
      >
        <MenuItem onClick={handleProfileClick}>
          <ListItemIcon>
            <Person fontSize="small" />
          </ListItemIcon>
          <ListItemText primary="Profile" />
        </MenuItem>
        <Divider />
        <MenuItem onClick={handleLogout}>
          <ListItemIcon>
            <ExitToApp fontSize="small" />
          </ListItemIcon>
          <ListItemText primary="Logout" />
        </MenuItem>
      </Menu>
    </Box>
  );
};

export default ManufacturerDashboard;
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
  Chip,
  Drawer,
  List,
  ListItem,
  FormControl,
  InputLabel,
  Select,
  MenuItem as MuiMenuItem,
  InputAdornment,
  Accordion,
  AccordionSummary,
  AccordionDetails,
} from '@mui/material';
import {
  Person,
  AccountCircle,
  ExitToApp,
  Notifications,
  LocalPharmacy,
  Inventory,
  Payments,
  ShoppingCart,
  Home,
  Medication,
  LocalShipping,
  Assessment,
  RequestQuote,
  AddBox,
  ExpandMore,
  Dashboard,
} from '@mui/icons-material';
import { requestService, authService, drugService, batchService, drugRequestService, userService } from '../services/api.js';

// Mock pharmacy data
const pharmacyData = {
  name: "Priyanshu Mehra",
  organizationName: "Mehra Pharmacy",
  email: "mehra@pharmacy.com",
  phone: "+915678356782",
  address: "svce, bengaluru",
  registrationDate: "April 1, 2024"
};

const stats = [
  { title: 'Available Medicines', value: '250', icon: <LocalPharmacy />, color: '#2196f3' },
  { title: 'Current Stock', value: '15000', icon: <Inventory />, color: '#4caf50' },
  { title: 'Orders', value: '45', icon: <ShoppingCart />, color: '#ff9800' },
  { title: 'Total Revenue', value: '₹2L', icon: <Payments />, color: '#f44336' },
];

const DRAWER_WIDTH = 240;

const sidebarItems = [
  { text: 'Home', icon: <Home />, color: '#1a237e' },
  { text: 'Dashboard', icon: <Dashboard />, color: '#2196f3' },
  { text: 'Request Drug', icon: <AddBox />, color: '#00796b' },
  { text: 'Received Drugs', icon: <LocalShipping />, color: '#4caf50' },
  { text: 'Stock', icon: <Inventory />, color: '#ff9800' },
  { text: 'Payments', icon: <Payments />, color: '#9c27b0' },
];

// Add this mock data for received batches
const mockReceivedBatches = [
  {
    id: 1,
    batchName: "PCM-2024-001",
    drugName: "Paracetamol 500mg",
    distributor: "ABC Distribution Co.",
    quantity: 5000,
    manufacturingDate: "2024-02-15",
    expiryDate: "2026-02-15",
    status: "pending",
    price: "₹25,000"
  },
  {
    id: 2,
    batchName: "AMX-2024-001",
    drugName: "Amoxicillin 250mg",
    distributor: "XYZ Distributors Ltd.",
    quantity: 3000,
    manufacturingDate: "2024-02-14",
    expiryDate: "2025-02-14",
    status: "received",
    price: "₹35,000"
  },
];

const PharmacyDashboard = ({ onLogout }) => {
  const navigate = useNavigate();
  const [anchorEl, setAnchorEl] = useState(null);
  const [showProfile, setShowProfile] = useState(false);
  const [passwordData, setPasswordData] = useState({
    currentPassword: '',
    newPassword: '',
    confirmPassword: ''
  });
  const [selectedItem, setSelectedItem] = useState('Home');
  const [receivedBatches, setReceivedBatches] = useState(mockReceivedBatches);
  const [drugRequestFormData, setDrugRequestFormData] = useState({
    distributorId: '',
    drugName: '',
    quantity: '',
    requiredBy: '',
    notes: '',
    status: 'pending'
  });
  const [distributors, setDistributors] = useState([]);
  const [loading, setLoading] = useState(false);
  const [receivedDrugs, setReceivedDrugs] = useState([]);
  const [stock, setStock] = useState([]);
  const [error, setError] = useState(null);

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
    }
  };

  // Add handler for receiving batches
  const handleReceiveBatch = (batchId) => {
    setReceivedBatches(prevBatches => 
      prevBatches.map(batch => 
        batch.id === batchId 
          ? { ...batch, status: 'received' } 
          : batch
      )
    );
  };

  // Fetch distributors when Request Drug page is opened
  useEffect(() => {
    const fetchDistributors = async () => {
      try {
        setLoading(true);
        const response = await userService.getUsersByRole('distributor');
        setDistributors(response.data);
      } catch (error) {
        console.error('Error fetching distributors:', error);
      } finally {
        setLoading(false);
      }
    };
    
    if (selectedItem === 'Request Drug') {
      fetchDistributors();
    }
  }, [selectedItem]);

  // Handle drug request submission
  const handleDrugRequestSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      await drugRequestService.createRequest({
        distributorId: drugRequestFormData.distributorId,
        drugName: drugRequestFormData.drugName,
        quantity: Number(drugRequestFormData.quantity),
        requiredBy: drugRequestFormData.requiredBy,
        notes: drugRequestFormData.notes,
        pharmacyId: pharmacyData.id
      });
      
      // Reset form
      setDrugRequestFormData({
        distributorId: '',
        drugName: '',
        quantity: '',
        requiredBy: '',
        notes: '',
        status: 'pending'
      });
      
      alert('Drug request sent successfully!');
    } catch (error) {
      console.error('Error sending drug request:', error);
      alert(error.message || 'Failed to send request');
    } finally {
      setLoading(false);
    }
  };

  // Fetch received drugs
  useEffect(() => {
    const fetchReceivedDrugs = async () => {
      try {
        setLoading(true);
        const response = await batchService.getPharmacyReceivedDrugs();
        setReceivedDrugs(response.receivedDrugs);
      } catch (error) {
        console.error('Error fetching received drugs:', error);
      } finally {
        setLoading(false);
      }
    };
    
    if (selectedItem === 'Received Drugs') {
      fetchReceivedDrugs();
    }
  }, [selectedItem]);

  const handleReceiveDrug = async (drugId) => {
    try {
      setLoading(true);
      await batchService.receivePharmacyDrug(drugId);
      
      // Refresh the list
      const response = await batchService.getPharmacyReceivedDrugs();
      setReceivedDrugs(response.receivedDrugs);
      
      alert('Drug received successfully!');
    } catch (error) {
      console.error('Error receiving drug:', error);
      alert(error.message || 'Failed to receive drug');
    } finally {
      setLoading(false);
    }
  };

  // Fetch stock data
  useEffect(() => {
    const fetchStock = async () => {
      try {
        setLoading(true);
        setError(null);
        const response = await batchService.getPharmacyStock();
        
        if (!response.success) {
          throw new Error(response.message || 'Failed to fetch stock');
        }
        
        // Group drugs by name
        const groupedStock = response.stock.reduce((acc, item) => {
          const drugName = item.drug.drugName;
          if (!acc[drugName]) {
            acc[drugName] = {
              drugName: drugName,
              totalQuantity: 0,
              batches: [],
              distributor: item.distributor,
              drug: item.drug,
              totalValue: 0,
              lastReceived: null
            };
          }
          acc[drugName].totalQuantity += item.quantity;
          acc[drugName].totalValue += item.quantity * (item.unitPrice || 0);
          acc[drugName].batches.push(item);
          // Track most recent received date
          const receivedDate = new Date(item.receivedDate);
          if (!acc[drugName].lastReceived || receivedDate > new Date(acc[drugName].lastReceived)) {
            acc[drugName].lastReceived = item.receivedDate;
          }
          return acc;
        }, {});
        
        setStock(Object.values(groupedStock));
      } catch (error) {
        console.error('Error fetching stock:', error);
        setError(error.message);
      } finally {
        setLoading(false);
      }
    };
    
    if (selectedItem === 'Stock') {
      fetchStock();
    }
  }, [selectedItem]);

  const renderContent = () => {
    if (showProfile) {
      return (
        <Container maxWidth="lg">
          {/* Profile Info */}
          <Paper elevation={3} sx={{ p: 4, borderRadius: 2, mb: 4 }}>
            <Box sx={{ mb: 4, textAlign: 'center' }}>
              <Avatar 
                sx={{ 
                  width: 100, 
                  height: 100, 
                  bgcolor: '#1a237e',
                  margin: '0 auto',
                  mb: 2
                }}
              >
                <Person sx={{ fontSize: 60 }} />
              </Avatar>
              <Typography variant="h5" sx={{ fontWeight: 600, color: '#1a237e', mb: 1 }}>
                Pharmacy Profile
              </Typography>
            </Box>

            <Grid container spacing={3}>
              <Grid item xs={12} md={6}>
                <Box sx={{ mb: 3 }}>
                  <Typography variant="subtitle2" color="text.secondary">
                    Organization Name
                  </Typography>
                  <Typography variant="body1" sx={{ fontWeight: 500 }}>
                    {pharmacyData.organizationName}
                  </Typography>
                </Box>
              </Grid>

              <Grid item xs={12} md={6}>
                <Box sx={{ mb: 3 }}>
                  <Typography variant="subtitle2" color="text.secondary">
                    Contact Person
                  </Typography>
                  <Typography variant="body1" sx={{ fontWeight: 500 }}>
                    {pharmacyData.name}
                  </Typography>
                </Box>
              </Grid>

              <Grid item xs={12} md={6}>
                <Box sx={{ mb: 3 }}>
                  <Typography variant="subtitle2" color="text.secondary">
                    Email Address
                  </Typography>
                  <Typography variant="body1" sx={{ fontWeight: 500 }}>
                    {pharmacyData.email}
                  </Typography>
                </Box>
              </Grid>

              <Grid item xs={12} md={6}>
                <Box sx={{ mb: 3 }}>
                  <Typography variant="subtitle2" color="text.secondary">
                    Phone Number
                  </Typography>
                  <Typography variant="body1" sx={{ fontWeight: 500 }}>
                    {pharmacyData.phone}
                  </Typography>
                </Box>
              </Grid>

              <Grid item xs={12} md={6}>
                <Box sx={{ mb: 3 }}>
                  <Typography variant="subtitle2" color="text.secondary">
                    Business Address
                  </Typography>
                  <Typography variant="body1" sx={{ fontWeight: 500 }}>
                    {pharmacyData.address}
                  </Typography>
                </Box>
              </Grid>

              <Grid item xs={12} md={6}>
                <Box sx={{ mb: 3 }}>
                  <Typography variant="subtitle2" color="text.secondary">
                    Registration Date
                  </Typography>
                  <Typography variant="body1" sx={{ fontWeight: 500 }}>
                    {pharmacyData.registrationDate}
                  </Typography>
                </Box>
              </Grid>
            </Grid>
          </Paper>

          {/* Change Password Section */}
          <Paper elevation={3} sx={{ p: 4, borderRadius: 2 }}>
            <Typography variant="h6" sx={{ color: '#1a237e', fontWeight: 600, mb: 3 }}>
              Change Password
            </Typography>

            <form onSubmit={handlePasswordSubmit}>
              <Grid container spacing={3}>
                <Grid item xs={12}>
                  <TextField
                    fullWidth
                    label="Current Password"
                    name="currentPassword"
                    type="password"
                    value={passwordData.currentPassword}
                    onChange={handlePasswordChange}
                    required
                    variant="outlined"
                  />
                </Grid>

                <Grid item xs={12}>
                  <TextField
                    fullWidth
                    label="New Password"
                    name="newPassword"
                    type="password"
                    value={passwordData.newPassword}
                    onChange={handlePasswordChange}
                    required
                    variant="outlined"
                  />
                </Grid>

                <Grid item xs={12}>
                  <TextField
                    fullWidth
                    label="Confirm New Password"
                    name="confirmPassword"
                    type="password"
                    value={passwordData.confirmPassword}
                    onChange={handlePasswordChange}
                    required
                    variant="outlined"
                  />
                </Grid>

                <Grid item xs={12}>
                  <Box sx={{ display: 'flex', justifyContent: 'flex-end' }}>
                    <Button
                      type="submit"
                      variant="contained"
                      sx={{
                        px: 4,
                        py: 1,
                        fontSize: '1rem',
                        fontWeight: 500,
                        textTransform: 'none',
                        bgcolor: '#1a237e',
                        '&:hover': {
                          bgcolor: '#0d1b60',
                        },
                      }}
                    >
                      Update Password
                    </Button>
                  </Box>
                </Grid>
              </Grid>
            </form>
          </Paper>
        </Container>
      );
    }

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
                {`${pharmacyData.name} | ${pharmacyData.organizationName}`}
              </Typography>
              <Typography 
                variant="body1" 
                sx={{ 
                  color: '#e3f2fd',
                  mb: 3,
                  lineHeight: 1.6,
                  opacity: 0.9
                }}
              >
                Access your pharmacy dashboard to manage inventory, 
                track received batches, and ensure efficient medication distribution.
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
                Your trusted healthcare partner
              </Typography>
            </Paper>
          </Box>
        );

      case 'View Stocks':
        return (
          <Paper elevation={3} sx={{ p: 4, borderRadius: 2 }}>
            <Typography variant="h5" sx={{ mb: 3, color: '#1a237e', fontWeight: 600 }}>
              Current Stock
            </Typography>
            {/* Add your stock view content here */}
          </Paper>
        );

      case 'Received Batches':
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
                Received Batches
              </Typography>

              {receivedBatches.length === 0 ? (
                <Typography 
                  variant="body1" 
                  sx={{ textAlign: 'center', color: 'text.secondary' }}
                >
                  No batches to display
                </Typography>
              ) : (
                <Grid container spacing={3}>
                  {receivedBatches.map((batch) => (
                    <Grid item xs={12} key={batch.id}>
                      <Card 
                        elevation={2}
                        sx={{ 
                          p: 2,
                          borderLeft: '4px solid',
                          borderColor: batch.status === 'pending' ? '#ff9800' : '#4caf50'
                        }}
                      >
                        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                          <Box>
                            <Typography variant="h6" sx={{ color: '#1a237e', fontWeight: 600, mb: 1 }}>
                              {batch.drugName}
                            </Typography>
                            <Grid container spacing={2}>
                              <Grid item xs={12} sm={6}>
                                <Typography variant="body2" color="text.secondary">
                                  Batch: {batch.batchName}
                                </Typography>
                                <Typography variant="body2" color="text.secondary">
                                  Distributor: {batch.distributor}
                                </Typography>
                                <Typography variant="body2" color="text.secondary">
                                  Quantity: {batch.quantity} units
                                </Typography>
                              </Grid>
                              <Grid item xs={12} sm={6}>
                                <Typography variant="body2" color="text.secondary">
                                  Manufacturing Date: {batch.manufacturingDate}
                                </Typography>
                                <Typography variant="body2" color="text.secondary">
                                  Expiry Date: {batch.expiryDate}
                                </Typography>
                                <Typography variant="body2" color="text.secondary">
                                  Price: {batch.price}
                                </Typography>
                              </Grid>
                            </Grid>
                          </Box>
                          <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-end', gap: 1 }}>
                            <Chip 
                              label={batch.status === 'pending' ? 'Pending' : 'Received'} 
                              color={batch.status === 'pending' ? 'warning' : 'success'}
                            />
                            {batch.status === 'pending' && (
                              <Button
                                variant="contained"
                                color="primary"
                                onClick={() => handleReceiveBatch(batch.id)}
                                sx={{
                                  textTransform: 'none',
                                  bgcolor: '#1a237e',
                                  '&:hover': {
                                    bgcolor: '#0d1b60',
                                  },
                                }}
                              >
                                Receive Batch
                              </Button>
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

      case 'All Drugs':
        return (
          <Paper elevation={3} sx={{ p: 4, borderRadius: 2 }}>
            <Typography variant="h5" sx={{ mb: 3, color: '#1a237e', fontWeight: 600 }}>
              All Drugs
            </Typography>
            {/* Add your drugs list content here */}
          </Paper>
        );

      case 'Payments':
        return (
          <Paper elevation={3} sx={{ p: 4, borderRadius: 2 }}>
            <Typography variant="h5" sx={{ mb: 3, color: '#1a237e', fontWeight: 600 }}>
              Payments
            </Typography>
            {/* Add your payments content here */}
          </Paper>
        );

      case 'Request Drug':
        return (
          <Container maxWidth="lg">
            <Paper elevation={3} sx={{ p: 4, borderRadius: 2 }}>
              <Typography variant="h5" gutterBottom sx={{ color: '#1a237e', mb: 3 }}>
                Request Drug from Distributor
              </Typography>
              
              <form onSubmit={handleDrugRequestSubmit}>
                <Grid container spacing={3}>
                  <Grid item xs={12}>
                    <FormControl fullWidth required>
                      <InputLabel>Select Distributor</InputLabel>
                      <Select
                        value={drugRequestFormData.distributorId}
                        onChange={(e) => setDrugRequestFormData({
                          ...drugRequestFormData,
                          distributorId: e.target.value
                        })}
                        label="Select Distributor"
                      >
                        {distributors.map((distributor) => (
                          <MuiMenuItem key={distributor._id} value={distributor._id}>
                            <Box>
                              <Typography variant="subtitle1">
                                {distributor.organizationName}
                              </Typography>
                              <Typography variant="caption" color="textSecondary">
                                {distributor.email}
                              </Typography>
                            </Box>
                          </MuiMenuItem>
                        ))}
                      </Select>
                    </FormControl>
                  </Grid>
                  
                  <Grid item xs={12} md={6}>
                    <TextField
                      fullWidth
                      label="Drug Name"
                      value={drugRequestFormData.drugName}
                      onChange={(e) => setDrugRequestFormData({
                        ...drugRequestFormData,
                        drugName: e.target.value
                      })}
                      required
                    />
                  </Grid>
                  
                  <Grid item xs={12} md={6}>
                    <TextField
                      fullWidth
                      label="Quantity"
                      type="number"
                      value={drugRequestFormData.quantity}
                      onChange={(e) => setDrugRequestFormData({
                        ...drugRequestFormData,
                        quantity: e.target.value
                      })}
                      required
                      InputProps={{
                        endAdornment: <InputAdornment position="end">units</InputAdornment>,
                      }}
                    />
                  </Grid>
                  
                  <Grid item xs={12} md={6}>
                    <TextField
                      fullWidth
                      label="Required By"
                      type="date"
                      value={drugRequestFormData.requiredBy}
                      onChange={(e) => setDrugRequestFormData({
                        ...drugRequestFormData,
                        requiredBy: e.target.value
                      })}
                      required
                      InputLabelProps={{ shrink: true }}
                      inputProps={{
                        min: new Date().toISOString().split('T')[0]
                      }}
                    />
                  </Grid>
                  
                  <Grid item xs={12}>
                    <TextField
                      fullWidth
                      label="Additional Notes"
                      multiline
                      rows={4}
                      value={drugRequestFormData.notes}
                      onChange={(e) => setDrugRequestFormData({
                        ...drugRequestFormData,
                        notes: e.target.value
                      })}
                      placeholder="Add any specific requirements or notes"
                    />
                  </Grid>
                  
                  <Grid item xs={12}>
                    <Box sx={{ display: 'flex', gap: 2, justifyContent: 'flex-end' }}>
                      <Button
                        variant="outlined"
                        onClick={() => setDrugRequestFormData({
                          distributorId: '',
                          drugName: '',
                          quantity: '',
                          requiredBy: '',
                          notes: '',
                          status: 'pending'
                        })}
                      >
                        Clear
                      </Button>
                      <Button
                        type="submit"
                        variant="contained"
                        disabled={loading}
                        sx={{
                          bgcolor: '#1a237e',
                          '&:hover': { bgcolor: '#0d1b60' }
                        }}
                      >
                        {loading ? 'Sending Request...' : 'Send Request'}
                      </Button>
                    </Box>
                  </Grid>
                </Grid>
              </form>
            </Paper>
          </Container>
        );

      case 'Received Drugs':
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
                Received Drugs
              </Typography>
              
              {loading ? (
                <Box sx={{ textAlign: 'center', p: 3 }}>
                  <Typography>Loading received drugs...</Typography>
                </Box>
              ) : receivedDrugs.length === 0 ? (
                <Box sx={{ textAlign: 'center', p: 3 }}>
                  <Typography color="textSecondary">
                    No drugs received yet
                  </Typography>
                </Box>
              ) : (
                <Grid container spacing={3}>
                  {receivedDrugs.map((drug) => (
                    <Grid item xs={12} key={drug._id}>
                      <Card 
                        elevation={2}
                        sx={{ 
                          p: 2,
                          borderLeft: '4px solid',
                          borderColor: drug.status === 'received' ? '#4caf50' : '#ff9800'
                        }}
                      >
                        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                          <Box>
                            <Typography variant="h6" sx={{ color: '#1a237e', fontWeight: 600, mb: 1 }}>
                              {drug.drug.drugName}
                            </Typography>
                            <Grid container spacing={2}>
                              <Grid item xs={12} sm={6}>
                                <Typography variant="body2" color="textSecondary">
                                  Batch Number: {drug.batch.batchNumber}
                                </Typography>
                                <Typography variant="body2" color="textSecondary">
                                  Distributor: {drug.distributor.organizationName}
                                </Typography>
                                <Typography variant="body2" color="textSecondary">
                                  Quantity: {drug.quantity} units
                                </Typography>
                              </Grid>
                              <Grid item xs={12} sm={6}>
                                <Typography variant="body2" color="textSecondary">
                                  Sent Date: {new Date(drug.createdAt).toLocaleDateString()}
                                </Typography>
                                {drug.status === 'received' && (
                                  <Typography variant="body2" color="textSecondary">
                                    Received Date: {new Date(drug.receivedDate).toLocaleDateString()}
                                  </Typography>
                                )}
                              </Grid>
                            </Grid>
                          </Box>
                          <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-end', gap: 2 }}>
                            <Chip
                              label={drug.status === 'received' ? 'Received' : 'Pending'}
                              color={drug.status === 'received' ? 'success' : 'warning'}
                            />
                            {drug.status === 'pending' && (
                              <Button
                                variant="contained"
                                onClick={() => handleReceiveDrug(drug._id)}
                                disabled={loading}
                                sx={{
                                  bgcolor: '#1a237e',
                                  '&:hover': { bgcolor: '#0d1b60' }
                                }}
                              >
                                {loading ? 'Receiving...' : 'Receive Drug'}
                              </Button>
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

      case 'Stock':
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
                Current Stock
              </Typography>

              {/* Summary Cards */}
              <Grid container spacing={3} sx={{ mb: 4 }}>
                <Grid item xs={12} sm={6} md={3}>
                  <Card elevation={2}>
                    <CardContent>
                      <Typography variant="h6" gutterBottom color="textSecondary">
                        Total Items
                      </Typography>
                      <Typography variant="h4">
                        {stock.length}
                      </Typography>
                    </CardContent>
                  </Card>
                </Grid>
                <Grid item xs={12} sm={6} md={3}>
                  <Card elevation={2}>
                    <CardContent>
                      <Typography variant="h6" gutterBottom color="textSecondary">
                        Total Units
                      </Typography>
                      <Typography variant="h4">
                        {stock.reduce((sum, item) => sum + item.totalQuantity, 0).toLocaleString()}
                      </Typography>
                    </CardContent>
                  </Card>
                </Grid>
                <Grid item xs={12} sm={6} md={3}>
                  <Card elevation={2}>
                    <CardContent>
                      <Typography variant="h6" gutterBottom color="textSecondary">
                        Total Value
                      </Typography>
                      <Typography variant="h4">
                        ₹{stock.reduce((sum, item) => sum + item.totalValue, 0).toLocaleString()}
                      </Typography>
                    </CardContent>
                  </Card>
                </Grid>
              </Grid>

              {loading ? (
                <Box sx={{ textAlign: 'center', p: 3 }}>
                  <Typography>Loading stock...</Typography>
                </Box>
              ) : error ? (
                <Box sx={{ textAlign: 'center', p: 3, color: 'error.main' }}>
                  <Typography>{error}</Typography>
                </Box>
              ) : stock.length === 0 ? (
                <Box sx={{ textAlign: 'center', p: 3 }}>
                  <Typography color="textSecondary">
                    No items in stock
                  </Typography>
                </Box>
              ) : (
                <Grid container spacing={3}>
                  {stock.map((item) => (
                    <Grid item xs={12} md={6} key={item.drugName}>
                      <Card 
                        elevation={2}
                        sx={{ 
                          p: 2,
                          borderLeft: '4px solid',
                          borderColor: item.totalQuantity > 100 ? '#4caf50' : '#ff9800',
                          transition: 'transform 0.2s',
                          '&:hover': {
                            transform: 'translateY(-4px)'
                          }
                        }}
                      >
                        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                          <Box>
                            <Typography variant="h6" sx={{ color: '#1a237e', fontWeight: 600, mb: 1 }}>
                              {item.drugName}
                            </Typography>
                            <Grid container spacing={2}>
                              <Grid item xs={12} sm={6}>
                                <Typography variant="body2" color="textSecondary">
                                  Dosage Form: {item.drug.dosageForm}
                                </Typography>
                                <Typography variant="body2" sx={{ 
                                  color: item.totalQuantity > 100 ? 'success.main' : 'warning.main',
                                  fontWeight: 'bold' 
                                }}>
                                  Total Quantity: {item.totalQuantity.toLocaleString()} units
                                </Typography>
                                <Typography variant="body2" color="primary" sx={{ fontWeight: 'bold' }}>
                                  Value: ₹{item.totalValue.toLocaleString()}
                                </Typography>
                              </Grid>
                              <Grid item xs={12} sm={6}>
                                <Typography variant="body2" color="textSecondary">
                                  Distributor: {item.distributor.organizationName}
                                </Typography>
                                <Typography variant="body2" color="textSecondary">
                                  Batches: {item.batches.length}
                                </Typography>
                                <Typography variant="body2" color="textSecondary">
                                  Last Received: {new Date(item.lastReceived).toLocaleDateString()}
                                </Typography>
                              </Grid>
                            </Grid>

                            {/* Batch Details Expansion */}
                            <Accordion sx={{ mt: 2, boxShadow: 'none', '&:before': { display: 'none' } }}>
                              <AccordionSummary expandIcon={<ExpandMore />}>
                                <Typography color="primary">View Batch Details</Typography>
                              </AccordionSummary>
                              <AccordionDetails>
                                {item.batches.map((batch) => (
                                  <Box key={batch._id} sx={{ mb: 2, pb: 1, borderBottom: '1px solid #eee' }}>
                                    <Typography variant="subtitle2">
                                      Batch: {batch.batch.batchNumber}
                                    </Typography>
                                    <Typography variant="body2" color="textSecondary">
                                      Quantity: {batch.quantity.toLocaleString()} units
                                    </Typography>
                                    <Typography variant="body2" color="textSecondary">
                                      Received: {new Date(batch.receivedDate).toLocaleDateString()}
                                    </Typography>
                                    <Typography variant="body2" color="textSecondary">
                                      Unit Price: ₹{batch.unitPrice}
                                    </Typography>
                                  </Box>
                                ))}
                              </AccordionDetails>
                            </Accordion>
                          </Box>
                          <Chip
                            label={item.totalQuantity > 100 ? 'In Stock' : 'Low Stock'}
                            color={item.totalQuantity > 100 ? 'success' : 'warning'}
                            size="small"
                          />
                        </Box>
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
            PHARMACY
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
                {pharmacyData.name}
              </Typography>
            </IconButton>
          </Box>
        </Toolbar>
      </AppBar>

      {/* Sidebar */}
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
                {index === 0 && <Divider sx={{ my: 2, mx: 2 }} />}
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

export default PharmacyDashboard;
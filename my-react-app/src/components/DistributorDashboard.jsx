import React, { useState, useEffect, useCallback } from 'react';
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
  FormControl,
  InputLabel,
  Select,
  InputAdornment,
  Drawer,
  List,
  ListItem,
  Accordion,
  AccordionSummary,
  AccordionDetails,
  Alert,
  CircularProgress,
  TableContainer,
  Table,
  TableHead,
  TableBody,
  TableRow,
  TableCell,
} from '@mui/material';
import {
  Person,
  AccountCircle,
  ExitToApp,
  Notifications,
  LocalShipping,
  Inventory,
  Payments,
  Home,
  CheckCircle,
  Warning,
  LocalPharmacy,
  Dashboard,
  AddBox,
  NotificationsActive,
  ExpandMore,
} from '@mui/icons-material';
import { requestService, authService, drugService, batchService, userService, drugRequestService } from '../services/api.js';

// Mock distributor data
const distributorData = {
  name: "Priyanshu",
  organizationName: "Mehra Distribution Co.",
  email: "mehra@distributor.com",
  phone: "+91 8521432695",
  address: "789 Distribution Center, svce Zone",
  registrationDate: "March 1, 2024"
};

// Mock incoming batches
const mockIncomingBatches = [
  {
    id: 1,
    batchName: "PCM-2024-001",
    drugName: "Paracetamol 500mg",
    manufacturer: "XYZ Manufacturing Co.",
    quantity: 10000,
    manufacturingDate: "2024-02-15",
    expiryDate: "2026-02-15",
    status: "pending",
    price: "₹50,000"
  },
  {
    id: 2,
    batchName: "AMX-2024-001",
    drugName: "Amoxicillin 250mg",
    manufacturer: "ABC Pharma Ltd.",
    quantity: 5000,
    manufacturingDate: "2024-02-14",
    expiryDate: "2025-02-14",
    status: "received",
    price: "₹75,000"
  },
];

const stats = [
  { title: 'Pending Batches', value: '5', icon: <Warning />, color: '#ff9800' },
  { title: 'Received Batches', value: '12', icon: <CheckCircle />, color: '#4caf50' },
  { title: 'Total Inventory', value: '25000', icon: <Inventory />, color: '#2196f3' },
  { title: 'Total Value', value: '₹5L', icon: <Payments />, color: '#f44336' },
];

// Update sidebarItems array
const sidebarItems = [
  { text: 'Home', icon: <Home />, color: '#1a237e' },
  { text: 'Dashboard', icon: <Dashboard />, color: '#2196f3' },
  { text: 'View Requests', icon: <NotificationsActive />, color: '#ff9800' },
  { text: 'Received Batches', icon: <LocalShipping />, color: '#4caf50' },
  { text: 'Request Drug', icon: <AddBox />, color: '#00796b' },
  { text: 'Send Drugs to Pharmacy', icon: <LocalPharmacy />, color: '#e91e63' },
  { text: 'Inventory', icon: <Inventory />, color: '#00796b' },
  { text: 'Payments', icon: <Payments />, color: '#9c27b0' },
];

// Add mock data for available drugs to send
const availableDrugsToSend = [
  {
    id: 1,
    batchName: "PCM-2024-001",
    drugName: "Paracetamol 500mg",
    manufacturer: "XYZ Manufacturing Co.",
    quantity: 10000,
    manufacturingDate: "2024-02-15",
    expiryDate: "2026-02-15",
    status: "available",
    price: "₹50,000"
  },
  {
    id: 2,
    batchName: "AMX-2024-001",
    drugName: "Amoxicillin 250mg",
    manufacturer: "ABC Pharma Ltd.",
    quantity: 5000,
    manufacturingDate: "2024-02-14",
    expiryDate: "2025-02-14",
    status: "available",
    price: "₹75,000"
  },
];

const DRAWER_WIDTH = 240;

const DistributorDashboard = ({ onLogout }) => {
  const navigate = useNavigate();
  const [anchorEl, setAnchorEl] = useState(null);
  const [showProfile, setShowProfile] = useState(false);
  const [incomingBatches, setIncomingBatches] = useState([]);
  const [receivedBatches, setReceivedBatches] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [selectedItem, setSelectedItem] = useState('Home');
  const [drugsToSend, setDrugsToSend] = useState(availableDrugsToSend);
  const [selectedPharmacy, setSelectedPharmacy] = useState('');

  const [requestFormData, setRequestFormData] = useState({
    drugName: '',
    quantity: '',
    urgency: 'normal',
    requestDate: new Date().toISOString().split('T')[0],
    description: '',
    distributorName: distributorData.organizationName,
    email: distributorData.email
  });

  const [drugRequestFormData, setDrugRequestFormData] = useState({
    manufacturerId: '',
    drugName: '',
    quantity: '',
    requiredBy: '',
    notes: '',
    status: 'pending'
  });
  const [manufacturers, setManufacturers] = useState([]);
  const [pharmacyRequests, setPharmacyRequests] = useState([]);
  const [pharmacies, setPharmacies] = useState([]);

  // Add state for transfer form
  const [transferFormData, setTransferFormData] = useState({});

  // Add state for inventory
  const [inventory, setInventory] = useState([]);

  // Add these new state variables
  const [selectedDistributor, setSelectedDistributor] = useState('');
  const [drugRequestData, setDrugRequestData] = useState({
    drugName: '',
    quantity: '',
    requiredBy: '',
    notes: ''
  });
  const [successMessage, setSuccessMessage] = useState('');

  // Add state for batches
  const [batches, setBatches] = useState([]);

  // Add handler for drug request form changes
  const handleDrugRequestChange = (e) => {
    const { name, value } = e.target;
    setDrugRequestData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  // Add handler for distributor selection
  const handleDistributorChange = (e) => {
    setSelectedDistributor(e.target.value);
  };

  // Update inventory whenever received batches change
  useEffect(() => {
    if (receivedBatches.length > 0) {
      const groupedBatches = receivedBatches.reduce((acc, batch) => {
        const drugName = batch.drug.drugName;
        if (!acc[drugName]) {
          acc[drugName] = {
            drugName: drugName,
            totalQuantity: 0,
            totalValue: 0,
            batches: [],
            manufacturer: batch.manufacturer,
            dosageForm: batch.drug.dosageForm
          };
        }
        acc[drugName].totalQuantity += batch.quantity;
        acc[drugName].totalValue += batch.quantity * batch.unitPrice;
        acc[drugName].batches.push(batch);
        return acc;
      }, {});
      
      setInventory(Object.values(groupedBatches));
    }
  }, [receivedBatches]);

  // Fetch incoming batches
  useEffect(() => {
    const fetchIncomingBatches = async () => {
      try {
        setLoading(true);
        const response = await batchService.getDistributorBatches();
        setIncomingBatches(response.batches);
      } catch (error) {
        console.error('Error fetching batches:', error);
        setError('Failed to fetch batches');
      } finally {
        setLoading(false);
      }
    };

    if (selectedItem === 'Dashboard' || selectedItem === 'Home') {
      fetchIncomingBatches();
    }
  }, [selectedItem]);

  // Fetch received batches
  useEffect(() => {
    const fetchReceivedBatches = async () => {
      try {
        const response = await batchService.getDistributorReceivedBatches();
        setReceivedBatches(response.receivedBatches);
      } catch (error) {
        console.error('Error fetching received batches:', error);
      }
    };

    if (selectedItem === 'Received Batches' || selectedItem === 'Dashboard') {
      fetchReceivedBatches();
    }
  }, [selectedItem]);

  useEffect(() => {
    const fetchManufacturers = async () => {
      try {
        const response = await userService.getUsersByRole('manufacturer');
        setManufacturers(response.data);
      } catch (error) {
        console.error('Error fetching manufacturers:', error);
      }
    };
    
    if (selectedItem === 'Request Drug') {
      fetchManufacturers();
    }
  }, [selectedItem]);

  // Fetch pharmacy requests
  useEffect(() => {
    const fetchPharmacyRequests = async () => {
      try {
        setLoading(true);
        setError(null);
        const response = await drugRequestService.getDistributorRequests();
        if (response.success) {
          setPharmacyRequests(response.requests);
        }
      } catch (error) {
        console.error('Error fetching pharmacy requests:', error);
        setError(error.response?.data?.message || 'Failed to connect to server. Please try again.');
        alert('Failed to fetch requests. Please check your connection and try again.');
      } finally {
        setLoading(false);
      }
    };
    
    if (selectedItem === 'View Requests') {
      fetchPharmacyRequests();
    }
  }, [selectedItem]);

  // Fetch pharmacies
  useEffect(() => {
    const fetchPharmacies = async () => {
      try {
        setLoading(true);
        setError(null);
        const response = await userService.getUsersByRole('pharmacy');
        if (response && response.data) {
          setPharmacies(response.data);
        } else {
          throw new Error('Failed to fetch pharmacies data');
        }
      } catch (error) {
        console.error('Error fetching pharmacies:', error);
        setError('Failed to fetch pharmacies');
        alert('Failed to load pharmacies. Please try again.');
      } finally {
        setLoading(false);
      }
    };
    
    if (selectedItem === 'Send Drugs to Pharmacy') {
      fetchPharmacies();
    }
  }, [selectedItem]);

  const handleRequestFormChange = (e) => {
    setRequestFormData({
      ...requestFormData,
      [e.target.name]: e.target.value
    });
  };

  const handleRequestSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      await requestService.createRequest({
        type: 'Drug Request',
        details: requestFormData
      });
      // Reset form and show success message
    } catch (error) {
      setError(error.message);
    } finally {
      setLoading(false);
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

  const handleReceiveBatch = async (batchId) => {
    try {
      setLoading(true);
      setError(null);

      const receiveResponse = await batchService.receiveBatch(batchId);
      
      // Update inventory immediately with new batch
      setInventory(prevInventory => {
        const newBatch = receiveResponse.batch;
        const drugName = newBatch.drug.drugName;
        
        const updatedInventory = [...prevInventory];
        const existingDrugIndex = updatedInventory.findIndex(item => item.drugName === drugName);
        
        if (existingDrugIndex >= 0) {
          // Update existing drug inventory
          updatedInventory[existingDrugIndex] = {
            ...updatedInventory[existingDrugIndex],
            totalQuantity: updatedInventory[existingDrugIndex].totalQuantity + newBatch.quantity,
            totalValue: updatedInventory[existingDrugIndex].totalValue + (newBatch.quantity * newBatch.unitPrice),
            batches: [...updatedInventory[existingDrugIndex].batches, newBatch]
          };
        } else {
          // Add new drug to inventory
          updatedInventory.push({
            drugName,
            totalQuantity: newBatch.quantity,
            totalValue: newBatch.quantity * newBatch.unitPrice,
            batches: [newBatch],
            manufacturer: newBatch.manufacturer,
            dosageForm: newBatch.drug.dosageForm
          });
        }
        
        return updatedInventory;
      });

      // Update local state
      setIncomingBatches(prevBatches => 
        prevBatches.filter(batch => batch._id !== batchId)
      );
      
      // Refresh received batches
      const refreshResponse = await batchService.getDistributorReceivedBatches();
      setReceivedBatches(refreshResponse.receivedBatches);
      
      alert('Batch received successfully!');
    } catch (error) {
      console.error('Error receiving batch:', error);
      setError(error.response?.data?.message || error.message || 'Failed to receive batch');
      alert(error.response?.data?.message || error.message || 'Failed to receive batch');
    } finally {
      setLoading(false);
    }
  };

  const handleSendDrug = async (drugBatches, pharmacyId, quantity) => {
    try {
      setLoading(true);
      const transferQuantity = Number(quantity);

      // Validate inputs
      if (!pharmacyId) {
        throw new Error('Please select a pharmacy');
      }
      
      if (!quantity || isNaN(transferQuantity) || transferQuantity <= 0) {
        throw new Error('Please enter a valid quantity');
      }

      const drug = drugBatches[0]?.drug;
      if (!drug) {
        throw new Error('Invalid drug data');
      }

      // Check if we have enough quantity
      const totalAvailable = drugBatches.reduce((sum, batch) => sum + batch.quantity, 0);
      if (transferQuantity > totalAvailable) {
        throw new Error('Invalid pharmacy or quantity');
      }

      let remainingQuantity = transferQuantity;

      // Update inventory immediately
      setInventory(prevInventory => {
        const drugName = drugBatches[0].drug.drugName;
        return prevInventory.map(item => {
          if (item.drugName === drugName) {
            const newQuantity = item.totalQuantity - transferQuantity;
            if (newQuantity < 0) {
              throw new Error('Insufficient quantity available');
            }
            return {
              ...item,
              totalQuantity: newQuantity,
              totalValue: newQuantity * item.batches[0].unitPrice,
              batches: item.batches.map(batch => {
                if (batch._id === drugBatches[0]._id) {
                  const newBatchQuantity = batch.quantity - transferQuantity;
                  return {
                    ...batch,
                    quantity: newBatchQuantity >= 0 ? newBatchQuantity : batch.quantity
                  };
                }
                return batch;
              }).filter(batch => batch.quantity > 0)
            };
          }
          return item;
        }).filter(item => item.totalQuantity > 0);
      });

      // Sort batches by received date (FIFO)
      const sortedBatches = [...drugBatches].sort((a, b) => 
        new Date(a.receivedDate) - new Date(b.receivedDate)
      );

      // Transfer from each batch until quantity is fulfilled
      for (const batch of sortedBatches) {
        if (remainingQuantity <= 0) break;

        const batchTransferQuantity = Math.min(batch.quantity, remainingQuantity);

        if (batchTransferQuantity > 0) {
          await batchService.transferToPharmacy({
            batchId: batch._id,
            pharmacyId,
            quantity: Number(batchTransferQuantity)
          });

          remainingQuantity -= batchTransferQuantity;
        }
      }

      // Refresh inventory after transfer
      const response = await batchService.getDistributorReceivedBatches();
      setReceivedBatches(response.receivedBatches);

      // Reset transfer form for this drug
      setTransferFormData(prev => {
        const updated = { ...prev };
        delete updated[drugBatches[0].drug.drugName];
        return updated;
      });

      alert('Drug sent to pharmacy successfully!');
    } catch (error) {
      // Revert inventory changes if transfer failed
      const response = await batchService.getDistributorReceivedBatches();
      setReceivedBatches(response.receivedBatches);
      
      console.error('Error sending drug:', error);
      alert(error.message || 'Failed to send drug. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleDrugRequestSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    // Validate required fields
    if (!drugRequestFormData.manufacturerId || 
        !drugRequestFormData.drugName || 
        !drugRequestFormData.quantity || 
        !drugRequestFormData.requiredBy) {
      setError('Please fill in all required fields');
      setLoading(false);
      return;
    }

    try {
      const requestData = {
        manufacturerId: drugRequestFormData.manufacturerId,
        drugName: drugRequestFormData.drugName,
        quantity: parseInt(drugRequestFormData.quantity),
        requiredBy: drugRequestFormData.requiredBy,
        notes: drugRequestFormData.notes || ''
      };

      console.log('Submitting drug request:', requestData); // Debug log

      const response = await drugRequestService.createRequest(requestData);

      if (response.success) {
        // Reset form
        setDrugRequestFormData({
          manufacturerId: '',
          drugName: '',
          quantity: '',
          requiredBy: '',
          notes: ''
        });

        // Show success message
        setSuccessMessage('Drug request submitted successfully');
      }
    } catch (error) {
      console.error('Error sending drug request:', error);
      setError(error.message || 'Failed to submit drug request');
    } finally {
      setLoading(false);
    }
  };

  // Handle request approval/rejection
  const handleRequestAction = async (requestId, status) => {
    try {
      setLoading(true);
      await drugRequestService.updateRequestStatus(requestId, status);
      
      // Refresh requests list
      const response = await drugRequestService.getDistributorRequests();
      setPharmacyRequests(response.requests);
      
      alert(`Request ${status} successfully`);
    } catch (error) {
      console.error('Error updating request status:', error);
      alert(error.message || 'Failed to update request status');
    } finally {
      setLoading(false);
    }
  };

  // Reset transfer form when changing batches
  useEffect(() => {
    setTransferFormData({
      pharmacyId: '',
      quantity: ''
    });
  }, [selectedItem]);

  // Add this useEffect to load manufacturers
  useEffect(() => {
    const loadManufacturers = async () => {
      if (selectedItem === 'Request Drug') {
        try {
          setLoading(true);
          const response = await userService.getUsersByRole('manufacturer');
          if (response.success) {
            console.log('Loaded manufacturers:', response.data); // Debug log
            setManufacturers(response.data);
          } else {
            setError('Failed to load manufacturers');
          }
        } catch (error) {
          console.error('Error loading manufacturers:', error);
          setError('Failed to load manufacturers');
        } finally {
          setLoading(false);
        }
      }
    };

    loadManufacturers();
  }, [selectedItem]);

  // Add this function to fetch batches
  const fetchBatches = useCallback(async () => {
    try {
      setLoading(true);
      const response = await batchService.getDistributorReceivedBatches();
      console.log('Fetched batches:', response); // Debug log
      if (response?.success) {
        // Transform the data to ensure it has the required structure
        const transformedBatches = response.batches.map(batch => ({
          _id: batch._id,
          batchNumber: batch.batchNumber,
          drugName: batch.drug?.drugName || batch.drugName || 'N/A',
          quantity: batch.quantity || 0,
          manufacturingDate: batch.manufacturingDate,
          expiryDate: batch.expiryDate,
          status: batch.status || 'N/A'
        }));
        setBatches(transformedBatches);
      } else {
        setBatches([]);
        setError('Failed to fetch batches');
      }
    } catch (error) {
      console.error('Error fetching batches:', error);
      setBatches([]);
      setError('Failed to fetch batches');
    } finally {
      setLoading(false);
    }
  }, []);

  // Add useEffect to load batches
  useEffect(() => {
    if (selectedItem === 'Inventory') {
      fetchBatches();
    }
  }, [selectedItem, fetchBatches]);

  const renderContent = () => {
    if (showProfile) {
      // Profile content similar to manufacturer dashboard
      return (
        <Container maxWidth="lg">
          <Paper elevation={3} sx={{ p: 4, borderRadius: 2 }}>
            {/* Profile content */}
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
                {`${distributorData.name} | ${distributorData.organizationName}`}
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
                Access your distributor dashboard to manage drug distribution, 
                handle batch transfers, and maintain efficient supply chain operations.
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
                Your trusted partner in pharmaceutical distribution
              </Typography>
            </Paper>
          </Box>
        );

      case 'Dashboard':
        return (
          <Container maxWidth="lg">
            {/* Stats Cards */}
            <Grid container spacing={3} sx={{ mb: 4 }}>
              {stats.map((stat) => (
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

            {/* Incoming Batches */}
            <Paper elevation={3} sx={{ p: 4, borderRadius: 2 }}>
              <Typography 
                variant="h5" 
                sx={{ 
                  mb: 4, 
                  color: '#1a237e',
                  fontWeight: 600,
                }}
              >
                Incoming Batches
              </Typography>

              {loading ? (
                <Box sx={{ textAlign: 'center', p: 3 }}>
                  <Typography>Loading batches...</Typography>
                </Box>
              ) : incomingBatches.length === 0 ? (
                <Box sx={{ textAlign: 'center', p: 3 }}>
                  <Typography color="textSecondary">
                    No incoming batches found
                  </Typography>
                </Box>
              ) : (
                <Grid container spacing={3}>
                  {incomingBatches.map((batch) => (
                    <Grid item xs={12} key={batch._id}>
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
                              {batch.drug.drugName}
                            </Typography>
                            <Grid container spacing={2}>
                              <Grid item xs={12} sm={6}>
                                <Typography variant="body2" color="textSecondary">
                                  Batch: {batch.batchNumber}
                                </Typography>
                                <Typography variant="body2" color="textSecondary">
                                  Manufacturer: {batch.manufacturer.organizationName}
                                </Typography>
                                <Typography variant="body2" color="textSecondary">
                                  Quantity: {batch.quantity} units
                                </Typography>
                              </Grid>
                              <Grid item xs={12} sm={6}>
                                <Typography variant="body2" color="textSecondary">
                                  Manufacturing Date: {new Date(batch.manufacturingDate).toLocaleDateString()}
                                </Typography>
                                <Typography variant="body2" color="textSecondary">
                                  Expiry Date: {new Date(batch.expiryDate).toLocaleDateString()}
                                </Typography>
                                <Typography variant="body2" color="textSecondary">
                                  Unit Price: ₹{batch.unitPrice}
                                </Typography>
                                <Typography variant="body2" sx={{ color: 'primary.main', fontWeight: 'bold', mt: 1 }}>
                                  Total Value: ₹{(batch.quantity * batch.unitPrice).toFixed(2)}
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
                                onClick={() => handleReceiveBatch(batch.transferId)}
                                disabled={loading}
                                sx={{
                                  textTransform: 'none',
                                  bgcolor: '#1a237e',
                                  '&:hover': {
                                    bgcolor: '#0d1b60',
                                  },
                                }}
                              >
                                {loading ? 'Receiving...' : 'Receive Batch'}
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

      case 'Send Drugs to Pharmacy':
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
                Send Drugs to Pharmacy
              </Typography>

              {/* Group batches by drug name for selection */}
              {(() => {
                const groupedBatches = receivedBatches.reduce((acc, batch) => {
                  const drugName = batch.drug.drugName;
                  if (!acc[drugName]) {
                    acc[drugName] = {
                      drugName: drugName,
                      totalQuantity: 0,
                      batches: [],
                      manufacturer: batch.manufacturer,
                      dosageForm: batch.drug.dosageForm
                    };
                  }
                  acc[drugName].totalQuantity += batch.quantity;
                  acc[drugName].batches.push(batch);
                  return acc;
                }, {});

                const availableDrugs = Object.values(groupedBatches);

                return (
                  <>
                    {loading ? (
                      <Box sx={{ textAlign: 'center', p: 3 }}>
                        <Typography>Loading inventory...</Typography>
                      </Box>
                    ) : availableDrugs.length === 0 ? (
                      <Box sx={{ textAlign: 'center', p: 3 }}>
                        <Typography color="textSecondary">
                          No drugs available to send
                        </Typography>
                      </Box>
                    ) : (
                      <Grid container spacing={3}>
                        {availableDrugs.map((drug) => (
                          <Grid item xs={12} key={drug.drugName}>
                            <Card 
                              elevation={2}
                              sx={{ 
                                p: 2,
                                borderLeft: '4px solid',
                                borderColor: drug.totalQuantity > 0 ? '#4caf50' : '#ff9800'
                              }}
                            >
                              <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                                <Box>
                                  <Typography variant="h6" sx={{ color: '#1a237e', fontWeight: 600, mb: 1 }}>
                                    {drug.drugName}
                                  </Typography>
                                  <Grid container spacing={2}>
                                    <Grid item xs={12} sm={6}>
                                      <Typography variant="body2" color="textSecondary">
                                        Manufacturer: {drug.manufacturer.organizationName}
                                      </Typography>
                                      <Typography variant="body2" color="textSecondary">
                                        Dosage Form: {drug.dosageForm}
                                      </Typography>
                                      <Typography variant="body2" sx={{ 
                                        color: drug.totalQuantity > 0 ? 'success.main' : 'error.main',
                                        fontWeight: 'bold'
                                      }}>
                                        Available Quantity: {drug.totalQuantity} units
                                      </Typography>
                                    </Grid>
                                    <Grid item xs={12} sm={6}>
                                      <FormControl fullWidth sx={{ mb: 2 }}>
                                        <InputLabel>Select Pharmacy</InputLabel>
                                        <Select
                                          value={transferFormData[drug.drugName]?.pharmacyId || ''}
                                          onChange={(e) => setTransferFormData({
                                            ...transferFormData,
                                            [drug.drugName]: {
                                              ...transferFormData[drug.drugName],
                                              pharmacyId: e.target.value
                                            }
                                          })}
                                          label="Select Pharmacy"
                                          disabled={drug.totalQuantity === 0}
                                        >
                                          {pharmacies.map((pharmacy) => (
                                            <MenuItem key={pharmacy._id} value={pharmacy._id}>
                                              <Box>
                                                <Typography variant="subtitle1">
                                                  {pharmacy.organizationName}
                                                </Typography>
                                                <Typography variant="caption" color="textSecondary">
                                                  {pharmacy.email}
                                                </Typography>
                                              </Box>
                                            </MenuItem>
                                          ))}
                                        </Select>
                                      </FormControl>

                                      <TextField
                                        fullWidth
                                        label="Transfer Quantity"
                                        type="number"
                                        value={transferFormData[drug.drugName]?.quantity || ''}
                                        onChange={(e) => {
                                          const value = e.target.value;
                                          const numValue = Number(value);
                                          setTransferFormData({
                                            ...transferFormData,
                                            [drug.drugName]: {
                                              ...transferFormData[drug.drugName],
                                              quantity: value && !isNaN(numValue) && numValue > 0 ? numValue : ''
                                            }
                                          });
                                        }}
                                        disabled={!transferFormData[drug.drugName]?.pharmacyId || drug.totalQuantity === 0}
                                        InputProps={{
                                          inputProps: { 
                                            min: 1, 
                                            max: drug.totalQuantity,
                                            step: 1
                                          }
                                        }}
                                        sx={{ mb: 2 }}
                                        error={Boolean(transferFormData[drug.drugName]?.quantity && 
                                          (isNaN(transferFormData[drug.drugName].quantity) || 
                                          transferFormData[drug.drugName].quantity <= 0 ||
                                          transferFormData[drug.drugName].quantity > drug.totalQuantity))}
                                        helperText={
                                          transferFormData[drug.drugName]?.quantity && 
                                          (isNaN(transferFormData[drug.drugName].quantity) || 
                                          transferFormData[drug.drugName].quantity <= 0)
                                            ? 'Please enter a valid quantity'
                                            : transferFormData[drug.drugName]?.quantity > drug.totalQuantity
                                            ? 'Quantity exceeds available stock'
                                            : `Available: ${drug.totalQuantity} units`
                                        }
                                      />

                                      <Button
                                        fullWidth
                                        variant="contained"
                                        onClick={() => handleSendDrug(
                                          drug.batches,
                                          transferFormData[drug.drugName]?.pharmacyId,
                                          transferFormData[drug.drugName]?.quantity
                                        )}
                                        disabled={
                                          !transferFormData[drug.drugName]?.pharmacyId ||
                                          !transferFormData[drug.drugName]?.quantity ||
                                          drug.totalQuantity === 0 ||
                                          Number(transferFormData[drug.drugName]?.quantity) > drug.totalQuantity ||
                                          loading
                                        }
                                        sx={{
                                          bgcolor: '#1a237e',
                                          '&:hover': { bgcolor: '#0d1b60' }
                                        }}
                                      >
                                        {loading ? 'Sending...' : 'Send to Pharmacy'}
                                      </Button>
                                    </Grid>
                                  </Grid>
                                </Box>
                              </Box>
                            </Card>
                          </Grid>
                        ))}
                      </Grid>
                    )}
                  </>
                );
              })()}
            </Paper>
          </Container>
        );

      case 'Request Drug':
        return (
          <Paper elevation={3} sx={{ p: 3 }}>
            <Typography variant="h6" gutterBottom>
              Request Drug from Manufacturer
            </Typography>

            {error && (
              <Alert severity="error" sx={{ mb: 2 }} onClose={() => setError(null)}>
                {error}
              </Alert>
            )}

            <form onSubmit={handleDrugRequestSubmit}>
              <FormControl fullWidth sx={{ mb: 2 }}>
                <InputLabel>Select Manufacturer</InputLabel>
                <Select
                  name="manufacturerId"
                  value={drugRequestFormData.manufacturerId}
                  onChange={(e) => setDrugRequestFormData({
                    ...drugRequestFormData,
                    manufacturerId: e.target.value
                  })}
                  required
                >
                  {manufacturers && manufacturers.map((manufacturer) => (
                    <MenuItem key={manufacturer._id} value={manufacturer._id}>
                      <Box>
                        <Typography variant="subtitle1">
                          {manufacturer.organizationName}
                        </Typography>
                        <Typography variant="caption" color="textSecondary">
                          {manufacturer.username}
                        </Typography>
                      </Box>
                    </MenuItem>
                  ))}
                </Select>
                {manufacturers.length === 0 && (
                  <Typography color="error" variant="caption" sx={{ mt: 1 }}>
                    No manufacturers available
                  </Typography>
                )}
              </FormControl>

              <TextField
                fullWidth
                label="Drug Name"
                name="drugName"
                value={drugRequestFormData.drugName}
                onChange={(e) => setDrugRequestFormData({
                  ...drugRequestFormData,
                  drugName: e.target.value
                })}
                required
                sx={{ mb: 2 }}
              />

              <TextField
                fullWidth
                label="Quantity"
                name="quantity"
                type="number"
                value={drugRequestFormData.quantity}
                onChange={(e) => setDrugRequestFormData({
                  ...drugRequestFormData,
                  quantity: e.target.value
                })}
                required
                sx={{ mb: 2 }}
                inputProps={{ min: 1 }}
              />

              <TextField
                fullWidth
                label="Required By"
                name="requiredBy"
                type="date"
                value={drugRequestFormData.requiredBy}
                onChange={(e) => setDrugRequestFormData({
                  ...drugRequestFormData,
                  requiredBy: e.target.value
                })}
                required
                sx={{ mb: 2 }}
                InputLabelProps={{ shrink: true }}
                inputProps={{
                  min: new Date().toISOString().split('T')[0]
                }}
              />

              <TextField
                fullWidth
                label="Notes"
                name="notes"
                multiline
                rows={3}
                value={drugRequestFormData.notes}
                onChange={(e) => setDrugRequestFormData({
                  ...drugRequestFormData,
                  notes: e.target.value
                })}
                sx={{ mb: 2 }}
              />

              <Button
                type="submit"
                variant="contained"
                disabled={loading}
                sx={{
                  mt: 2,
                  bgcolor: '#1a237e',
                  '&:hover': { bgcolor: '#0d47a1' }
                }}
              >
                {loading ? 'Submitting...' : 'Submit Request'}
              </Button>
            </form>

            {successMessage && (
              <Alert 
                severity="success" 
                sx={{ mb: 2 }} 
                onClose={() => setSuccessMessage('')}
              >
                {successMessage}
              </Alert>
            )}
          </Paper>
        );

      case 'Inventory':
        return (
          <Container maxWidth="lg">
            <Paper elevation={3} sx={{ p: 4, borderRadius: 2 }}>
              <Typography variant="h6" gutterBottom>
                Inventory Management
              </Typography>

              {error && (
                <Alert severity="error" sx={{ mb: 2 }} onClose={() => setError(null)}>
                  {error}
                </Alert>
              )}

              {loading ? (
                <Box sx={{ display: 'flex', justifyContent: 'center', p: 3 }}>
                  <CircularProgress />
                </Box>
              ) : Array.isArray(batches) && batches.length > 0 ? (
                <TableContainer>
                  <Table>
                    <TableHead>
                      <TableRow>
                        <TableCell>Batch Number</TableCell>
                        <TableCell>Drug Name</TableCell>
                        <TableCell>Quantity</TableCell>
                        <TableCell>Manufacturing Date</TableCell>
                        <TableCell>Expiry Date</TableCell>
                        <TableCell>Status</TableCell>
                        <TableCell>Actions</TableCell>
                      </TableRow>
                    </TableHead>
                    <TableBody>
                      {batches.map((batch) => (
                        <TableRow key={batch._id}>
                          <TableCell>{batch.batchNumber}</TableCell>
                          <TableCell>{batch.drugName}</TableCell>
                          <TableCell>{batch.quantity}</TableCell>
                          <TableCell>
                            {batch.manufacturingDate ? 
                              new Date(batch.manufacturingDate).toLocaleDateString() : 
                              'N/A'
                            }
                          </TableCell>
                          <TableCell>
                            {batch.expiryDate ? 
                              new Date(batch.expiryDate).toLocaleDateString() : 
                              'N/A'
                            }
                          </TableCell>
                          <TableCell>
                            <Chip
                              label={batch.status}
                              color={
                                batch.status === 'received' ? 'success' :
                                batch.status === 'in_stock' ? 'primary' :
                                'default'
                              }
                              size="small"
                            />
                          </TableCell>
                          <TableCell>
                            <Button
                              variant="contained"
                              size="small"
                              onClick={() => handleTransferClick(batch)}
                              disabled={batch.status !== 'in_stock'}
                            >
                              Transfer
                            </Button>
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </TableContainer>
              ) : (
                <Typography color="textSecondary" sx={{ textAlign: 'center', py: 3 }}>
                  No batches found in inventory
                </Typography>
              )}
            </Paper>
          </Container>
        );

      case 'View Requests':
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
                Drug Requests from Pharmacies
              </Typography>

              {loading ? (
                <Box sx={{ textAlign: 'center', p: 3 }}>
                  <Typography>Loading requests...</Typography>
                </Box>
              ) : pharmacyRequests.length === 0 ? (
                <Box sx={{ textAlign: 'center', p: 3 }}>
                  <Typography color="textSecondary">
                    No pending requests
                  </Typography>
                </Box>
              ) : (
                <Grid container spacing={3}>
                  {pharmacyRequests.map((request) => (
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
                                  Pharmacy: {request.pharmacy.organizationName}
                                </Typography>
                                <Typography variant="body2" color="textSecondary">
                                  Email: {request.pharmacy.email}
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
                                  onClick={() => handleRequestAction(request._id, 'approved')}
                                  disabled={loading}
                                  size="small"
                                >
                                  Approve
                                </Button>
                                <Button
                                  variant="contained"
                                  color="error"
                                  onClick={() => handleRequestAction(request._id, 'rejected')}
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

      default:
        return (
          <Container maxWidth="lg">
            {/* Stats Cards */}
            <Grid container spacing={3} sx={{ mb: 4 }}>
              {stats.map((stat) => (
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

            {/* Incoming Batches */}
            <Paper elevation={3} sx={{ p: 4, borderRadius: 2 }}>
              <Typography 
                variant="h5" 
                sx={{ 
                  mb: 4, 
                  color: '#1a237e',
                  fontWeight: 600,
                }}
              >
                Incoming Batches
              </Typography>

              {loading ? (
                <Box sx={{ textAlign: 'center', p: 3 }}>
                  <Typography>Loading batches...</Typography>
                </Box>
              ) : incomingBatches.length === 0 ? (
                <Box sx={{ textAlign: 'center', p: 3 }}>
                  <Typography color="textSecondary">
                    No incoming batches found
                  </Typography>
                </Box>
              ) : (
                <Grid container spacing={3}>
                  {incomingBatches.map((batch) => (
                    <Grid item xs={12} key={batch._id}>
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
                              {batch.drug.drugName}
                            </Typography>
                            <Grid container spacing={2}>
                              <Grid item xs={12} sm={6}>
                                <Typography variant="body2" color="textSecondary">
                                  Batch: {batch.batchNumber}
                                </Typography>
                                <Typography variant="body2" color="textSecondary">
                                  Manufacturer: {batch.manufacturer.organizationName}
                                </Typography>
                                <Typography variant="body2" color="textSecondary">
                                  Quantity: {batch.quantity} units
                                </Typography>
                              </Grid>
                              <Grid item xs={12} sm={6}>
                                <Typography variant="body2" color="textSecondary">
                                  Manufacturing Date: {new Date(batch.manufacturingDate).toLocaleDateString()}
                                </Typography>
                                <Typography variant="body2" color="textSecondary">
                                  Expiry Date: {new Date(batch.expiryDate).toLocaleDateString()}
                                </Typography>
                                <Typography variant="body2" color="textSecondary">
                                  Unit Price: ₹{batch.unitPrice}
                                </Typography>
                                <Typography variant="body2" sx={{ color: 'primary.main', fontWeight: 'bold', mt: 1 }}>
                                  Total Value: ₹{(batch.quantity * batch.unitPrice).toFixed(2)}
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
                                onClick={() => handleReceiveBatch(batch.transferId)}
                                disabled={loading}
                                sx={{
                                  textTransform: 'none',
                                  bgcolor: '#1a237e',
                                  '&:hover': {
                                    bgcolor: '#0d1b60',
                                  },
                                }}
                              >
                                {loading ? 'Receiving...' : 'Receive Batch'}
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
            DISTRIBUTOR
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
                {distributorData.name}
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
                  onClick={() => setSelectedItem(item.text)}
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

export default DistributorDashboard; 
import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  Box, 
  AppBar, 
  Toolbar, 
  Typography, 
  Drawer,
  List,
  ListItem,
  ListItemIcon,
  ListItemText,
  Container,
  Grid,
  Card,
  CardContent,
  IconButton,
  Divider,
  Paper,
  Avatar,
  Menu,
  MenuItem,
  ListItemButton,
  FormControl,
  InputLabel,
  Select,
  TextField,
  Button,
  InputAdornment,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Chip,
  CircularProgress
} from '@mui/material';
import {
  Science,
  LocalShipping,
  Assessment,
  Notifications,
  ExitToApp,
  History,
  Update,
  Dashboard,
  Inventory,
  Settings,
  Payments,
  Person,
  AccountCircle,
  Home,
  RequestQuote,
  Warning
} from '@mui/icons-material';
import { rawMaterialService, userService, materialRequestService } from '../services/api';
import AddMaterialForm from './AddMaterialForm';

const DRAWER_WIDTH = 240;

const sidebarItems = [
  { text: 'Home', icon: <Home />, color: '#1a237e' },
  { text: 'Dashboard', icon: <Dashboard />, color: '#2196f3' },
  { text: 'Add Raw Material', icon: <Science />, color: '#4caf50' },
  { text: 'Inventory', icon: <Inventory />, color: '#00796b' },
  { text: 'Shipments', icon: <LocalShipping />, color: '#795548' },
  { text: 'Reports', icon: <Assessment />, color: '#9c27b0' },
];

const supplierData = {
  name: "Ravish Kumar",
  organizationName: "Ravish Ingredients Ltd.",
  email: "ravish@ingredients.com",
  phone: "+918797043484",
  address: "svce, Industrial Area",
  registrationDate: "December 05, 2024"
};

const initialMaterials = [

];

const SupplierDashboard = ({ onLogout }) => {
  const navigate = useNavigate();
  const [selectedItem, setSelectedItem] = useState('Dashboard');
  const [anchorEl, setAnchorEl] = useState(null);
  const [showProfile, setShowProfile] = useState(false);
  const [materials, setMaterials] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [newMaterial, setNewMaterial] = useState({ name: '', quantity: '' });
  const [passwordData, setPasswordData] = useState({
    currentPassword: '',
    newPassword: '',
    confirmPassword: ''
  });
  const [isAddMaterialOpen, setIsAddMaterialOpen] = useState(false);
  const [sellDialogOpen, setSellDialogOpen] = useState(false);
  const [selectedMaterial, setSelectedMaterial] = useState(null);
  const [manufacturers, setManufacturers] = useState([]);
  const [sellFormData, setSellFormData] = useState({
    manufacturerId: '',
    quantity: '',
    price: ''
  });
  const [materialRequests, setMaterialRequests] = useState([]);
  const [salesReports, setSalesReports] = useState([]);
  const [reportLoading, setReportLoading] = useState(false);
  const [reportDateRange, setReportDateRange] = useState({
    startDate: '',
    endDate: ''
  });

  useEffect(() => {
    const fetchMaterials = async () => {
      try {
        setLoading(true);
        const user = JSON.parse(localStorage.getItem('user'));
        if (!user || !user.id) {
          throw new Error('User not found');
        }
        const response = await rawMaterialService.getMaterialsBySupplier(user.id);
        setMaterials(response.materials);
      } catch (error) {
        console.error('Error fetching materials:', error);
        if (error.message === 'User not found') {
          navigate('/login');
        }
        setError(error.message);
      } finally {
        setLoading(false);
      }
    };

    fetchMaterials();
  }, [navigate]);

  useEffect(() => {
    const fetchManufacturers = async () => {
      try {
        const response = await userService.getManufacturers();
        setManufacturers(response.data);
        console.log('Fetched manufacturers:', response.data);
      } catch (error) {
        console.error('Error fetching manufacturers:', error);
      }
    };

    fetchManufacturers();
  }, []);

  useEffect(() => {
    const fetchMaterialRequests = async () => {
      try {
        const response = await materialRequestService.getSupplierRequests();
        setMaterialRequests(response.requests);
      } catch (error) {
        console.error('Error fetching material requests:', error);
      }
    };

    if (selectedItem === 'View Requests') {
      fetchMaterialRequests();
    }
  }, [selectedItem]);

  useEffect(() => {
    const fetchSalesReports = async () => {
      try {
        setReportLoading(true);
        const response = await rawMaterialService.getSalesReports(reportDateRange);
        setSalesReports(response.sales);
      } catch (error) {
        console.error('Error fetching sales reports:', error);
        alert('Failed to fetch sales reports');
      } finally {
        setReportLoading(false);
      }
    };

    if (selectedItem === 'Reports') {
      fetchSalesReports();
    }
  }, [selectedItem, reportDateRange]);

  const handleMaterialAdded = (newMaterial) => {
    setMaterials([...materials, newMaterial]);
  };

  const handleProfileMenuOpen = (event) => {
    setAnchorEl(event.currentTarget);
  };

  const handleProfileMenuClose = () => {
    setAnchorEl(null);
  };

  const handleProfileClick = () => {
    setShowProfile(true);
    setSelectedItem('Profile');
    handleProfileMenuClose();
  };

  const handleLogout = () => {
    handleProfileMenuClose();
    onLogout();
    navigate('/login');
  };

  const handleSellSubmit = async () => {
    try {
      setLoading(true);
      await rawMaterialService.sellMaterial({
        materialId: selectedMaterial._id,
        manufacturerId: sellFormData.manufacturerId,
        quantity: Number(sellFormData.quantity),
        price: Number(sellFormData.price)
      });
      
      setMaterials(prevMaterials => 
        prevMaterials.map(material => 
          material._id === selectedMaterial._id 
            ? { 
                ...material, 
                quantity: material.quantity - Number(sellFormData.quantity) 
              }
            : material
        )
      );
      
      setSellDialogOpen(false);
      
      setSellFormData({
        manufacturerId: '',
        quantity: '',
        price: ''
      });
      
      alert('Material sold successfully!');
    } catch (error) {
      console.error('Error selling material:', error);
      alert(error.response?.data?.message || 'Failed to sell material');
    } finally {
      setLoading(false);
    }
  };

  const handleAddMaterial = async () => {
    if (newMaterial.name && newMaterial.quantity) {
      try {
        const user = JSON.parse(localStorage.getItem('user'));
        
        const materialData = {
          name: newMaterial.name,
          quantity: parseInt(newMaterial.quantity),
          unit: 'units',
          price: 0,
          supplier: user.id,
          status: 'available',
          description: ''
        };

        const response = await rawMaterialService.addMaterial(materialData);
        
        if (response.success) {
          setMaterials([...materials, response.material]);
          setNewMaterial({ name: '', quantity: '' });
          setSelectedItem('Inventory');
        }
      } catch (error) {
        console.error('Error adding material:', error);
      }
    }
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
    // Add your password change logic here
    setPasswordData({
      currentPassword: '',
      newPassword: '',
      confirmPassword: ''
    });
  };

  const getStats = () => [
    { 
      title: 'Total Materials', 
      value: materials.length.toString(), 
      icon: <Science />, 
      color: '#2196f3' 
    },
    { 
      title: 'Low Stock Items', 
      value: materials.filter(m => m.quantity < 10).length.toString(), 
      icon: <Update />, 
      color: '#f44336' 
    },
    { 
      title: 'Total Stock Value', 
      value: `₹${materials.reduce((acc, m) => acc + (m.price * m.quantity), 0)}`, 
      icon: <Payments />, 
      color: '#4caf50' 
    },
    { 
      title: 'Active Materials', 
      value: materials.filter(m => m.status === 'available').length.toString(), 
      icon: <Inventory />, 
      color: '#ff9800' 
    }
  ];

  const handleSellClick = (material) => {
    setSelectedMaterial(material);
    setSellFormData({
      manufacturerId: '',
      quantity: '',
      price: material.price || ''
    });
    setSellDialogOpen(true);
  };

  const handleSellFormChange = (event) => {
    const { name, value } = event.target;
    setSellFormData(prev => ({
      ...prev,
      [name]: value
    }));
    
    // Validate quantity
    if (name === 'quantity' && selectedMaterial) {
      const numValue = Number(value);
      if (numValue > selectedMaterial.quantity) {
        alert(`Maximum available quantity is ${selectedMaterial.quantity}`);
        setSellFormData(prev => ({
          ...prev,
          quantity: selectedMaterial.quantity.toString()
        }));
      }
    }
  };

  const handleRequestAction = async (requestId, action) => {
    try {
      setLoading(true);
      
      let status;
      switch (action) {
        case 'accept':
          status = 'ACCEPTED';
          break;
        case 'reject':
          status = 'REJECTED';
          break;
        case 'complete':
          status = 'COMPLETED';
          break;
        default:
          throw new Error('Invalid action');
      }

      await materialRequestService.updateRequestStatus(requestId, status);
      
      // Refresh requests list
      const response = await materialRequestService.getSupplierRequests();
      setMaterialRequests(response.requests);
      
      alert(`Request ${action}ed successfully`);
    } catch (error) {
      console.error('Error updating request status:', error);
      alert(error.message || 'Failed to update request status. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  // Add auto-refresh for material requests
  useEffect(() => {
    const fetchRequests = async () => {
      if (selectedItem === 'View Requests') {
        try {
          const response = await materialRequestService.getSupplierRequests();
          setMaterialRequests(response.requests);
        } catch (error) {
          console.error('Error fetching material requests:', error);
        }
      }
    };

    // Fetch immediately
    fetchRequests();

    // Set up polling every 30 seconds
    const interval = setInterval(fetchRequests, 30000);

    // Cleanup
    return () => clearInterval(interval);
  }, [selectedItem]);

  const handleDateRangeChange = (event) => {
    const { name, value } = event.target;
    setReportDateRange(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const renderReports = () => {
    return (
      <Container>
        <Typography variant="h5" gutterBottom>Sales Reports</Typography>
        
        {/* Sales Summary */}
        <Grid container spacing={3} sx={{ mb: 4 }}>
          <Grid item xs={12} sm={6} md={4}>
            <Card sx={{ bgcolor: '#e3f2fd' }}>
              <CardContent>
                <Typography variant="h6" gutterBottom>Total Sales</Typography>
                <Typography variant="h4">
                  ₹{salesReports.reduce((sum, sale) => sum + (sale.quantity * sale.price), 0).toFixed(2)}
                </Typography>
              </CardContent>
            </Card>
          </Grid>
          <Grid item xs={12} sm={6} md={4}>
            <Card sx={{ bgcolor: '#e8f5e9' }}>
              <CardContent>
                <Typography variant="h6" gutterBottom>Total Items Sold</Typography>
                <Typography variant="h4">
                  {salesReports.reduce((sum, sale) => sum + sale.quantity, 0)}
                </Typography>
              </CardContent>
            </Card>
          </Grid>
          <Grid item xs={12} sm={6} md={4}>
            <Card sx={{ bgcolor: '#fff3e0' }}>
              <CardContent>
                <Typography variant="h6" gutterBottom>Total Transactions</Typography>
                <Typography variant="h4">{salesReports.length}</Typography>
              </CardContent>
            </Card>
          </Grid>
        </Grid>
        
        {/* Sales Table */}
        <Paper sx={{ width: '100%', overflow: 'hidden' }}>
          <Box sx={{ p: 2 }}>
            <Typography variant="h6">Sales History</Typography>
          </Box>
          {reportLoading ? (
            <Box sx={{ p: 3, textAlign: 'center' }}>
              <Typography>Loading reports...</Typography>
            </Box>
          ) : salesReports.length === 0 ? (
            <Box sx={{ p: 3, textAlign: 'center' }}>
              <Typography>No sales data found</Typography>
            </Box>
          ) : (
            <Box sx={{ overflowX: 'auto' }}>
              <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                <thead>
                  <tr style={{ backgroundColor: '#f5f5f5' }}>
                    <th style={tableHeaderStyle}>Material Name</th>
                    <th style={tableHeaderStyle}>Manufacturer Name</th>
                    <th style={tableHeaderStyle}>Quantity</th>
                    <th style={tableHeaderStyle}>Price/Unit</th>
                    <th style={tableHeaderStyle}>Total Amount</th>
                    <th style={tableHeaderStyle}>Sale Date</th>
                  </tr>
                </thead>
                <tbody>
                  {salesReports.map((sale) => (
                    <tr key={sale._id} style={{ borderBottom: '1px solid #eee' }}>
                      <td style={tableCellStyle}>
                        {sale.material?.name || 'Unknown Material'}
                      </td>
                      <td style={tableCellStyle}>
                        <Box>
                          <Typography variant="body1">
                            {sale.manufacturer?.username || 'Unknown User'}
                          </Typography>
                          <Typography variant="caption" color="textSecondary">
                            {sale.manufacturer?.organizationName || 'No organization'}
                          </Typography>
                        </Box>
                      </td>
                      <td style={tableCellStyle}>
                        {sale.quantity} {sale.material?.unit}
                      </td>
                      <td style={tableCellStyle}>₹{sale.price}</td>
                      <td style={tableCellStyle}>
                        ₹{(sale.quantity * sale.price).toFixed(2)}
                      </td>
                      <td style={tableCellStyle}>
                        {new Date(sale.date).toLocaleDateString('en-IN', {
                          year: 'numeric',
                          month: 'short',
                          day: 'numeric',
                          hour: '2-digit',
                          minute: '2-digit'
                        })}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </Box>
          )}
        </Paper>
      </Container>
    );
  };

  const tableHeaderStyle = {
    padding: '12px 16px',
    textAlign: 'left',
    fontWeight: 600,
    color: '#1a237e'
  };

  const tableCellStyle = {
    padding: '12px 16px',
    textAlign: 'left'
  };

  const renderRequests = () => {
    return (
      <Container>
        <Typography variant="h5" gutterBottom>Material Requests</Typography>
        {loading ? (
          <Box sx={{ display: 'flex', justifyContent: 'center', p: 3 }}>
            <CircularProgress />
          </Box>
        ) : materialRequests.length === 0 ? (
          <Box sx={{ textAlign: 'center', p: 3 }}>
            <Typography>No requests found</Typography>
          </Box>
        ) : (
          <Grid container spacing={3}>
            {materialRequests.map((request) => (
              <Grid item xs={12} key={request._id}>
                <Card>
                  <CardContent>
                    {/* Request details */}
                    <Typography variant="h6">{request.materialName}</Typography>
                    <Typography>Quantity: {request.quantity}</Typography>
                    <Typography>Required By: {new Date(request.requiredBy).toLocaleDateString()}</Typography>
                    
                    {request.status === 'PENDING' && (
                      <Box sx={{ mt: 2, display: 'flex', gap: 1 }}>
                        <Button
                          variant="contained"
                          color="success"
                          onClick={() => handleRequestAction(request._id, 'accept')}
                          disabled={loading}
                        >
                          Accept
                        </Button>
                        <Button
                          variant="contained"
                          color="error"
                          onClick={() => handleRequestAction(request._id, 'reject')}
                          disabled={loading}
                        >
                          Reject
                        </Button>
                      </Box>
                    )}
                    
                    {request.status === 'ACCEPTED' && (
                      <Button
                        variant="contained"
                        color="primary"
                        onClick={() => handleRequestAction(request._id, 'complete')}
                        disabled={loading}
                        sx={{ mt: 2 }}
                      >
                        Mark as Completed
                      </Button>
                    )}
                    
                    <Chip
                      label={request.status}
                      color={
                        request.status === 'ACCEPTED' ? 'success' :
                        request.status === 'REJECTED' ? 'error' :
                        request.status === 'COMPLETED' ? 'default' : 'warning'
                      }
                      sx={{ mt: 2 }}
                    />
                  </CardContent>
                </Card>
              </Grid>
            ))}
          </Grid>
        )}
      </Container>
    );
  };

  const renderInventory = () => {
    return (
      <Container>
        <Typography variant="h5" gutterBottom>Inventory</Typography>
        <Paper sx={{ p: 2 }}>
          {loading ? (
            <Box sx={{ p: 3, textAlign: 'center' }}>
              <Typography>Loading materials...</Typography>
            </Box>
          ) : error ? (
            <Box sx={{ p: 3, textAlign: 'center', color: 'error.main' }}>
              <Typography>{error}</Typography>
            </Box>
          ) : materials.length === 0 ? (
            <Box sx={{ p: 3, textAlign: 'center' }}>
              <Typography>No materials found. Add some materials to get started.</Typography>
              <Button
                variant="contained"
                onClick={() => setSelectedItem('Add Raw Material')}
                sx={{ mt: 2 }}
              >
                Add Material
              </Button>
            </Box>
          ) : (
            <Grid container spacing={3}>
              {materials.map((material) => (
                <Grid item xs={12} sm={6} md={4} key={material._id}>
                  <Card>
                    <CardContent>
                      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                        <Typography variant="h6" component="h3">
                          {material.name}
                        </Typography>
                        <Chip
                          label={material.quantity < 100 ? 'Low Stock' : 'In Stock'}
                          color={material.quantity < 100 ? 'warning' : 'success'}
                          size="small"
                        />
                      </Box>
                      <Typography color="textSecondary" gutterBottom>
                        {material.description}
                      </Typography>
                      <Typography variant="body1" sx={{ mt: 2 }}>
                        Quantity: {material.quantity} {material.unit}
                      </Typography>
                      <Typography variant="body1">
                        Price: ₹{material.price}/unit
                      </Typography>
                      <Box sx={{ mt: 2, display: 'flex', justifyContent: 'flex-end' }}>
                        <Button
                          variant="contained"
                          size="small"
                          onClick={() => handleSellClick(material)}
                          disabled={material.quantity === 0}
                        >
                          Sell
                        </Button>
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
  };

  const renderDashboard = () => {
    return (
      <Container>
        {/* Welcome Banner */}
        <Box 
          sx={{ 
            textAlign: 'center', 
            py: 4,
            background: 'linear-gradient(to right bottom, #1a237e, #3949ab)',
            borderRadius: 2,
            color: 'white',
            mb: 4
          }}
        >
          <Typography variant="h4" gutterBottom sx={{ fontWeight: 600 }}>
            Welcome back, {supplierData.name}!
          </Typography>
        </Box>

        {/* Key Metrics */}
        <Grid container spacing={3} sx={{ mb: 4 }}>
          <Grid item xs={12} sm={6} md={3}>
            <Card sx={{ bgcolor: '#e3f2fd', height: '100%' }}>
              <CardContent>
                <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                  <Inventory sx={{ color: '#1565c0', mr: 1 }} />
                  <Typography variant="h6">Total Materials</Typography>
                </Box>
                <Typography variant="h4" sx={{ color: '#1565c0' }}>
                  {materials.length}
                </Typography>
                <Typography variant="body2" color="textSecondary" sx={{ mt: 1 }}>
                  Active materials in inventory
                </Typography>
              </CardContent>
            </Card>
          </Grid>
          
          <Grid item xs={12} sm={6} md={3}>
            <Card sx={{ bgcolor: '#fff3e0', height: '100%' }}>
              <CardContent>
                <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                  <Warning sx={{ color: '#ed6c02', mr: 1 }} />
                  <Typography variant="h6">Low Stock</Typography>
                </Box>
                <Typography variant="h4" sx={{ color: '#ed6c02' }}>
                  {materials.filter(m => m.quantity < 100).length}
                </Typography>
                <Typography variant="body2" color="textSecondary" sx={{ mt: 1 }}>
                  Materials below threshold
                </Typography>
              </CardContent>
            </Card>
          </Grid>
          
          <Grid item xs={12} sm={6} md={3}>
            <Card sx={{ bgcolor: '#e8f5e9', height: '100%' }}>
              <CardContent>
                <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                  <RequestQuote sx={{ color: '#2e7d32', mr: 1 }} />
                  <Typography variant="h6">Pending Requests</Typography>
                </Box>
                <Typography variant="h4" sx={{ color: '#2e7d32' }}>
                  {materialRequests.filter(req => req.status === 'pending').length}
                </Typography>
                <Typography variant="body2" color="textSecondary" sx={{ mt: 1 }}>
                  Awaiting response
                </Typography>
              </CardContent>
            </Card>
          </Grid>
          
          <Grid item xs={12} sm={6} md={3}>
            <Card sx={{ bgcolor: '#f3e5f5', height: '100%' }}>
              <CardContent>
                <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                  <Payments sx={{ color: '#9c27b0', mr: 1 }} />
                  <Typography variant="h6">Total Sales</Typography>
                </Box>
                <Typography variant="h4" sx={{ color: '#9c27b0' }}>
                  ₹{salesReports.reduce((sum, sale) => sum + (sale.quantity * sale.price), 0).toFixed(2)}
                </Typography>
                <Typography variant="body2" color="textSecondary" sx={{ mt: 1 }}>
                  Revenue generated
                </Typography>
              </CardContent>
            </Card>
          </Grid>
        </Grid>

        {/* Recent Activity */}
        <Grid container spacing={3}>
          <Grid item xs={12} md={6}>
            <Paper sx={{ p: 3 }}>
              <Typography variant="h6" gutterBottom sx={{ color: '#1a237e', mb: 3 }}>
                Recent Sales
              </Typography>
              {salesReports.slice(0, 5).map((sale, index) => (
                <Box 
                  key={sale._id} 
                  sx={{ 
                    mb: 2, 
                    pb: 2, 
                    borderBottom: index !== 4 ? '1px solid #eee' : 'none',
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'center'
                  }}
                >
                  <Box>
                    <Typography variant="subtitle1">
                      {sale.material?.name}
                    </Typography>
                    <Typography variant="body2" color="textSecondary">
                      {sale.manufacturer?.organizationName} • {new Date(sale.date).toLocaleDateString()}
                    </Typography>
                  </Box>
                  <Box sx={{ textAlign: 'right' }}>
                    <Typography variant="subtitle1" color="primary">
                      ₹{(sale.quantity * sale.price).toFixed(2)}
                    </Typography>
                    <Typography variant="body2" color="textSecondary">
                      {sale.quantity} units
                    </Typography>
                  </Box>
                </Box>
              ))}
            </Paper>
          </Grid>
          
          <Grid item xs={12} md={6}>
            <Paper sx={{ p: 3 }}>
              <Typography variant="h6" gutterBottom sx={{ color: '#1a237e', mb: 3 }}>
                Low Stock Materials
              </Typography>
              {materials
                .filter(m => m.quantity < 100)
                .slice(0, 5)
                .map((material, index) => (
                  <Box 
                    key={material._id}
                    sx={{ 
                      mb: 2, 
                      pb: 2, 
                      borderBottom: index !== 4 ? '1px solid #eee' : 'none',
                      display: 'flex',
                      justifyContent: 'space-between',
                      alignItems: 'center'
                    }}
                  >
                    <Box>
                      <Typography variant="subtitle1">
                        {material.name}
                      </Typography>
                      <Typography variant="body2" color="textSecondary">
                        {material.description}
                      </Typography>
                    </Box>
                    <Box sx={{ textAlign: 'right' }}>
                      <Typography 
                        variant="subtitle1" 
                        color={material.quantity < 50 ? 'error' : 'warning.main'}
                      >
                        {material.quantity} {material.unit}
                      </Typography>
                      <Typography variant="body2" color="textSecondary">
                        In stock
                      </Typography>
                    </Box>
                  </Box>
                ))}
            </Paper>
          </Grid>
        </Grid>
      </Container>
    );
  };

  const renderProfile = () => {
    return (
      <Container>
        <Typography variant="h5" gutterBottom>Profile</Typography>
        <Paper sx={{ p: 3, mt: 3 }}>
          <Grid container spacing={3}>
            <Grid item xs={12} md={4}>
              <Box sx={{ textAlign: 'center' }}>
                <Avatar
                  sx={{
                    width: 120,
                    height: 120,
                    margin: '0 auto',
                    bgcolor: '#1a237e'
                  }}
                >
                  {supplierData.name.charAt(0)}
                </Avatar>
                <Typography variant="h6" sx={{ mt: 2 }}>
                  {supplierData.name}
                </Typography>
                <Typography color="textSecondary">
                  {supplierData.organizationName}
                </Typography>
              </Box>
            </Grid>
            <Grid item xs={12} md={8}>
              <Box>
                <Typography variant="h6" gutterBottom>Contact Information</Typography>
                <Grid container spacing={2}>
                  <Grid item xs={12} sm={6}>
                    <Typography color="textSecondary">Email</Typography>
                    <Typography>{supplierData.email}</Typography>
                  </Grid>
                  <Grid item xs={12} sm={6}>
                    <Typography color="textSecondary">Phone</Typography>
                    <Typography>{supplierData.phone}</Typography>
                  </Grid>
                  <Grid item xs={12}>
                    <Typography color="textSecondary">Address</Typography>
                    <Typography>{supplierData.address}</Typography>
                  </Grid>
                  <Grid item xs={12}>
                    <Typography color="textSecondary">Registration Date</Typography>
                    <Typography>{supplierData.registrationDate}</Typography>
                  </Grid>
                </Grid>
              </Box>
            </Grid>
          </Grid>
        </Paper>
      </Container>
    );
  };

  const handleAddMaterialClick = () => {
    setIsAddMaterialOpen(true);
  };

  const renderContent = () => {
    switch (selectedItem) {
      case 'Add Raw Material':
        return <AddMaterialForm 
          onMaterialAdded={handleMaterialAdded}
          isOpen={true}
          onClose={() => setSelectedItem('Dashboard')}
        />;
      case 'View Requests':
        return renderRequests();
      case 'Profile':
        return renderProfile();
      case 'Reports':
        return renderReports();
      case 'Inventory':
        return renderInventory();
      default:
        return renderDashboard();
    }
  };

  return (
    <div>
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
              INGREDIENT SUPPLIER
            </Typography>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
              <Button
                color="inherit"
                startIcon={<RequestQuote />}
                onClick={() => setSelectedItem('View Requests')}
                sx={{
                  textTransform: 'none',
                  '&:hover': {
                    bgcolor: 'rgba(255, 255, 255, 0.1)',
                  },
                }}
              >
                View Requests
                {materialRequests.filter(req => req.status === 'pending').length > 0 && (
                  <Chip
                    label={materialRequests.filter(req => req.status === 'pending').length}
                    color="error"
                    size="small"
                    sx={{ ml: 1, height: 20, minWidth: 20 }}
                  />
                )}
              </Button>
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
                  {supplierData.name}
                </Typography>
              </IconButton>
            </Box>
          </Toolbar>
        </AppBar>

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
      </Box>

      {/* Sell Dialog */}
      <Dialog 
        open={sellDialogOpen} 
        onClose={() => setSellDialogOpen(false)}
        maxWidth="sm"
        fullWidth
      >
        <DialogTitle>
          Sell {selectedMaterial?.name}
        </DialogTitle>
        <DialogContent>
          <FormControl fullWidth sx={{ mt: 2 }}>
            <InputLabel>Select Manufacturer</InputLabel>
            <Select
              name="manufacturerId"
              value={sellFormData.manufacturerId}
              onChange={handleSellFormChange}
              required
            >
              {manufacturers.map((manufacturer) => (
                <MenuItem 
                  key={manufacturer._id} 
                  value={manufacturer._id}
                >
                  <Box sx={{ display: 'flex', flexDirection: 'column' }}>
                    <Typography variant="subtitle1">
                      {manufacturer.organizationName || manufacturer.username}
                    </Typography>
                    <Typography variant="caption" color="textSecondary">
                      {manufacturer.email} • {manufacturer.phone || 'No phone'}
                    </Typography>
                  </Box>
                </MenuItem>
              ))}
            </Select>
          </FormControl>
          
          {sellFormData.manufacturerId && (
            <>
              <TextField
                fullWidth
                label="Quantity"
                type="number"
                name="quantity"
                value={sellFormData.quantity}
                onChange={handleSellFormChange}
                sx={{ mt: 2 }}
                required
                inputProps={{ 
                  min: 1, 
                  max: selectedMaterial?.quantity 
                }}
                helperText={`Available: ${selectedMaterial?.quantity} ${selectedMaterial?.unit}`}
                error={Number(sellFormData.quantity) > selectedMaterial?.quantity}
              />
              
              <TextField
                fullWidth
                label="Price per unit"
                type="number"
                name="price"
                value={sellFormData.price}
                onChange={handleSellFormChange}
                sx={{ mt: 2 }}
                required
                inputProps={{ min: 0 }}
                InputProps={{
                  startAdornment: <InputAdornment position="start">₹</InputAdornment>,
                }}
              />

              <Typography variant="body2" color="textSecondary" sx={{ mt: 2 }}>
                Total Amount: ₹{(sellFormData.quantity * sellFormData.price).toFixed(2)}
              </Typography>
            </>
          )}
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setSellDialogOpen(false)}>Cancel</Button>
          <Button 
            onClick={handleSellSubmit}
            variant="contained"
            disabled={
              !sellFormData.manufacturerId || 
              !sellFormData.quantity || 
              !sellFormData.price ||
              loading ||
              Number(sellFormData.quantity) > selectedMaterial?.quantity
            }
          >
            {loading ? 'Selling...' : 'Sell'}
          </Button>
        </DialogActions>
      </Dialog>
    </div>
  );
};

export default SupplierDashboard;
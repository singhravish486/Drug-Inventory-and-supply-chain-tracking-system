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
  LinearProgress,
  CircularProgress,
} from '@mui/material';
import {
  Person,
  AccountCircle,
  ExitToApp,
  PeopleAlt,
  LocalHospital,
  LocalShipping,
  Factory,
  Home,
  Dashboard,
  Assessment,
  LocalPharmacy,
  NotificationsActive,
  Science,
  InfoOutlined,
} from '@mui/icons-material';
import { requestService, userService, drugService } from '../services/api.js';
import BlockchainDrugTracker from './BlockchainDrugTracker';

// Mock admin data
const adminData = {
  name: "Ravish kumar",
  email: "admin@gmail.com",
  phone: "+91 9262602999",
  registrationDate: "January 1, 2024"
};

const stats = [
  { title: 'Total Manufacturers', value: '25', icon: <Factory />, color: '#2196f3' },
  { title: 'Total Pharmacies', value: '150', icon: <LocalHospital />, color: '#4caf50' },
  { title: 'Total Distributors', value: '45', icon: <LocalShipping />, color: '#ff9800' },
  { title: 'Total Users', value: '220', icon: <PeopleAlt />, color: '#f44336' },
];

// Add the DRAWER_WIDTH constant and sidebarItems array
const DRAWER_WIDTH = 240;

const sidebarItems = [
  { text: 'Home', icon: <Home />, color: '#1a237e' },
  { text: 'Dashboard', icon: <Dashboard />, color: '#2196f3' },
  { text: 'View Requests', icon: <NotificationsActive />, color: '#ff9800' },
  { text: 'Manage Manufacturers', icon: <Factory />, color: '#4caf50' },
  { text: 'Manage Distributors', icon: <LocalShipping />, color: '#00796b' },
  { text: 'Manage Pharmacies', icon: <LocalPharmacy />, color: '#e91e63' },
  { text: 'Reports', icon: <Assessment />, color: '#9c27b0' },
];

const AdminDashboard = ({ onLogout }) => {
  const navigate = useNavigate();
  const [anchorEl, setAnchorEl] = useState(null);
  const [showProfile, setShowProfile] = useState(false);
  const [passwordData, setPasswordData] = useState({
    currentPassword: '',
    newPassword: '',
    confirmPassword: ''
  });
  const [selectedItem, setSelectedItem] = useState('Home');
  const [requests, setRequests] = useState([]);
  const [users, setUsers] = useState([]);
  const [userStats, setUserStats] = useState({
    suppliers: 0,
    manufacturers: 0,
    distributors: 0,
    pharmacies: 0,
    totalUsers: 0
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [currentView, setCurrentView] = useState('home');

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      try {
        if (selectedItem === 'View Requests') {
          const data = await requestService.getAllRequests();
          setRequests(data);
        } else if (selectedItem === 'Manage Users') {
          const data = await userService.getAllUsers();
          setUsers(data);
        }
      } catch (error) {
        setError(error.message);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [selectedItem]);

  useEffect(() => {
    const fetchUsers = async () => {
      try {
        setLoading(true);
        setError(null);
        const response = await userService.getAllUsersWithStats();
        
        setUserStats(response.stats);
        setUsers(response.recentUsers);
      } catch (error) {
        console.error('Error fetching users:', error);
        setError(error.message);
      } finally {
        setLoading(false);
      }
    };
    
    if (selectedItem === 'Dashboard' || selectedItem === 'Home') {
      fetchUsers();
    }
  }, [selectedItem]);

  useEffect(() => {
    const fetchRequests = async () => {
      try {
        // Use requestService instead of raw fetch
        const response = await requestService.getAllRequests();
        setRequests(response.requests || []);
      } catch (error) {
        console.error('Error fetching requests:', error);
        setRequests([]);
      }
    };

    if (selectedItem === 'View Requests') {
      fetchRequests();
    }
  }, [selectedItem]);

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

  const handleHomeClick = () => {
    setSelectedItem('Home');
    setShowProfile(false);
    setCurrentView('home');
  };

  const handleRequestAction = async (requestId, action) => {
    try {
      await requestService.updateRequestStatus(requestId, action);
      const updatedRequests = await requestService.getAllRequests();
      setRequests(updatedRequests);
    } catch (error) {
      setError(error.message);
    }
  };

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
                Admin Profile
              </Typography>
            </Box>

            <Grid container spacing={3}>
              <Grid item xs={12} md={6}>
                <Box sx={{ mb: 3 }}>
                  <Typography variant="subtitle2" color="text.secondary">
                    Name
                  </Typography>
                  <Typography variant="body1" sx={{ fontWeight: 500 }}>
                    {adminData.name}
                  </Typography>
                </Box>
              </Grid>

              <Grid item xs={12} md={6}>
                <Box sx={{ mb: 3 }}>
                  <Typography variant="subtitle2" color="text.secondary">
                    Email Address
                  </Typography>
                  <Typography variant="body1" sx={{ fontWeight: 500 }}>
                    {adminData.email}
                  </Typography>
                </Box>
              </Grid>

              <Grid item xs={12} md={6}>
                <Box sx={{ mb: 3 }}>
                  <Typography variant="subtitle2" color="text.secondary">
                    Phone Number
                  </Typography>
                  <Typography variant="body1" sx={{ fontWeight: 500 }}>
                    {adminData.phone}
                  </Typography>
                </Box>
              </Grid>

              <Grid item xs={12} md={6}>
                <Box sx={{ mb: 3 }}>
                  <Typography variant="subtitle2" color="text.secondary">
                    Registration Date
                  </Typography>
                  <Typography variant="body1" sx={{ fontWeight: 500 }}>
                    {adminData.registrationDate}
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

    switch (currentView) {
      case 'home':
        return (
          <Box>
            <Typography 
              variant="h4" 
              sx={{ 
                color: '#1a237e',
                fontWeight: 700,
                mb: 4,
                textAlign: 'center'
              }}
            >
              Welcome to Admin Dashboard
            </Typography>
            <Typography 
              variant="h6" 
              sx={{ 
                color: '#666',
                mb: 3,
                textAlign: 'center'
              }}
            >
              Manage and monitor the drug supply chain system
            </Typography>
            <Grid container spacing={3} sx={{ mt: 4 }}>
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
          </Box>
        );

      case 'requests':
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
                View Requests
              </Typography>

              {loading ? (
                <Box sx={{ display: 'flex', justifyContent: 'center', p: 3 }}>
                  <CircularProgress />
                </Box>
              ) : requests.length === 0 ? (
                <Typography 
                  variant="body1" 
                  sx={{ textAlign: 'center', color: 'text.secondary' }}
                >
                  No pending requests
                </Typography>
              ) : (
                <Grid container spacing={3}>
                  {requests.map((request) => (
                    <Grid item xs={12} key={request._id || request.id}>
                      <Card 
                        elevation={2}
                        sx={{ 
                          p: 2,
                          borderLeft: '4px solid',
                          borderColor: request.status === 'pending' ? '#ff9800' : '#4caf50'
                        }}
                      >
                        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                          <Box>
                            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 1 }}>
                              <Typography variant="h6" sx={{ color: '#1a237e', fontWeight: 600 }}>
                                {request.type || 'Request'}
                              </Typography>
                              {request.from?.role && (
                                <Chip 
                                  label={request.from.role} 
                                  size="small"
                                  color={
                                    request.from.role.toLowerCase() === 'manufacturer' ? 'primary' : 
                                    request.from.role.toLowerCase() === 'distributor' ? 'success' :
                                    request.from.role.toLowerCase() === 'supplier' ? 'info' : 'warning'
                                  }
                                />
                              )}
                              {request.details?.urgency && (
                                <Chip 
                                  label={`Urgency: ${request.details.urgency}`}
                                  size="small"
                                  color={
                                    request.details.urgency.toLowerCase() === 'high' ? 'error' :
                                    request.details.urgency.toLowerCase() === 'normal' ? 'warning' : 'default'
                                  }
                                />
                              )}
                            </Box>
                            <Typography variant="body2" color="text.secondary" sx={{ mb: 1 }}>
                              From: {request.from?.name || 'Unknown'}
                            </Typography>
                            <Typography variant="body2" color="text.secondary" sx={{ mb: 1 }}>
                              Email: {request.from?.email || 'N/A'}
                            </Typography>
                            {request.details && (
                              <>
                                <Divider sx={{ my: 1 }} />
                                <Typography variant="subtitle2" color="text.primary" sx={{ mt: 1, mb: 1 }}>
                                  Request Details:
                                </Typography>
                                {Object.entries(request.details).map(([key, value]) => (
                                  value && (
                                    <Typography key={key} variant="body2" color="text.secondary">
                                      {key.charAt(0).toUpperCase() + key.slice(1)}: {value}
                                    </Typography>
                                  )
                                ))}
                              </>
                            )}
                          </Box>
                          <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-end', gap: 2 }}>
                            <Chip 
                              label={request.status === 'pending' ? 'Pending' : 'Processed'} 
                              color={request.status === 'pending' ? 'warning' : 'success'}
                            />
                            {request.status === 'pending' && (
                              <Box sx={{ display: 'flex', gap: 1 }}>
                                <Button
                                  variant="contained"
                                  color="success"
                                  onClick={() => handleRequestAction(request._id || request.id, 'approved')}
                                  sx={{ textTransform: 'none' }}
                                >
                                  Approve
                                </Button>
                                <Button
                                  variant="contained"
                                  color="error"
                                  onClick={() => handleRequestAction(request._id || request.id, 'rejected')}
                                  sx={{ textTransform: 'none' }}
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
          <Grid container spacing={3}>
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
        );
    }
  };

  const renderDashboard = () => {
    return (
      <Container maxWidth="lg">
        {loading ? (
          <Box sx={{ textAlign: 'center', p: 3 }}>
            <Typography>Loading dashboard data...</Typography>
          </Box>
        ) : error ? (
          <Box sx={{ textAlign: 'center', p: 3, color: 'error.main' }}>
            <Typography>{error}</Typography>
          </Box>
        ) : (
          <Box>
            <Typography 
              variant="h4" 
              sx={{ 
                color: '#1a237e',
                fontWeight: 700,
                mb: 4,
                textAlign: 'center'
              }}
            >
              Welcome to Admin Dashboard
            </Typography>

            {/* Stats Cards */}
            <Grid container spacing={3} sx={{ mb: 4 }}>
              {[
                {
                  title: 'Total Suppliers',
                  value: userStats.suppliers,
                  icon: <Science />,
                  color: '#2196f3',
                  route: 'Manage Suppliers'
                },
                {
                  title: 'Total Manufacturers',
                  value: userStats.manufacturers,
                  icon: <Factory />,
                  color: '#4caf50',
                  route: 'Manage Manufacturers'
                },
                {
                  title: 'Total Distributors',
                  value: userStats.distributors,
                  icon: <LocalShipping />,
                  color: '#ff9800',
                  route: 'Manage Distributors'
                },
                {
                  title: 'Total Pharmacies',
                  value: userStats.pharmacies,
                  icon: <LocalPharmacy />,
                  color: '#f44336',
                  route: 'Manage Pharmacies'
                }
              ].map((stat) => (
                <Grid item xs={12} sm={6} md={3} key={stat.title}>
                  <Card 
                    elevation={2}
                    sx={{ 
                      borderRadius: 2,
                      transition: 'transform 0.2s',
                      cursor: 'pointer',
                      '&:hover': {
                        transform: 'translateY(-4px)'
                      }
                    }}
                    onClick={() => setSelectedItem(stat.route)}
                  >
                    <CardContent>
                      <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                        <Box 
                          sx={{ 
                            bgcolor: `${stat.color}15`,
                            p: 1.5,
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
                        <Box>
                          <Typography variant="h4" sx={{ fontWeight: 700 }}>
                            {stat.value}
                          </Typography>
                          <Typography variant="body2" color="textSecondary">
                            {stat.title}
                          </Typography>
                        </Box>
                      </Box>
                    </CardContent>
                  </Card>
                </Grid>
              ))}
            </Grid>

            {/* Recent Registrations */}
            <Paper elevation={3} sx={{ p: 3 }}>
              <Typography variant="h6" sx={{ mb: 3, color: '#1a237e', fontWeight: 600 }}>
                Recent Registrations
              </Typography>
              <Grid container spacing={3}>
                {users.slice(0, 6).map((user) => (
                  <Grid item xs={12} sm={6} md={4} key={user._id}>
                    <Card elevation={2}>
                      <CardContent>
                        <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                          <Avatar sx={{ bgcolor: '#1a237e', mr: 2 }}>
                            {user.organizationName?.charAt(0) || user.username?.charAt(0)}
                          </Avatar>
                          <Box>
                            <Typography variant="subtitle1" sx={{ fontWeight: 600 }}>
                              {user.organizationName || user.username}
                            </Typography>
                            <Chip 
                              label={user.role.toUpperCase()} 
                              size="small"
                              color={
                                user.role === 'manufacturer' ? 'primary' :
                                user.role === 'distributor' ? 'success' :
                                user.role === 'pharmacy' ? 'warning' : 'info'
                              }
                            />
                          </Box>
                        </Box>
                        <Typography variant="body2" color="textSecondary">
                          Email: {user.email}
                        </Typography>
                        <Typography variant="body2" color="textSecondary">
                          Phone: {user.phoneNumber}
                        </Typography>
                        <Typography variant="body2" color="textSecondary">
                          Joined: {new Date(user.createdAt).toLocaleDateString()}
                        </Typography>
                      </CardContent>
                    </Card>
                  </Grid>
                ))}
              </Grid>
            </Paper>

            {/* Add Blockchain Drug Tracker */}
            <BlockchainDrugTracker />
          </Box>
        )}
      </Container>
    );
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
            ADMIN
          </Typography>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
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
                {adminData.name}
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
                  onClick={() => {
                    setSelectedItem(item.text);
                    setShowProfile(false);
                    if (item.text === 'Home') {
                      setCurrentView('home');
                    } else if (item.text === 'View Requests') {
                      setCurrentView('requests');
                    } else {
                      setCurrentView(item.text.toLowerCase());
                    }
                  }}
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

export default AdminDashboard;
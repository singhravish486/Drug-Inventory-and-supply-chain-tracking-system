import React, { useState } from 'react';
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
  Paper,
  TextField,
  Button,
  IconButton,
  InputAdornment,
  Link,
  Divider,
  Alert
} from '@mui/material';
import {
  Home,
  Science,
  Factory,
  LocalShipping,
  LocalPharmacy,
  AdminPanelSettings,
  Visibility,
  VisibilityOff,
} from '@mui/icons-material';
import { useNavigate } from 'react-router-dom';
import { authService } from '../services/api';
import { motion, AnimatePresence } from 'framer-motion';
import { alpha } from '@mui/material/styles';
import ErrorAlert from './ErrorAlert';

const DRAWER_WIDTH = 240;

const sidebarItems = [
  { text: 'Home', icon: <Home /> },
  { text: 'Ingredient Supplier', icon: <Science />, role: 'supplier' },
  { text: 'Manufacturer', icon: <Factory />, role: 'manufacturer' },
  { text: 'Distributor', icon: <LocalShipping />, role: 'distributor' },
  { text: 'Pharmacy', icon: <LocalPharmacy />, role: 'pharmacy' },
  { text: 'Admin', icon: <AdminPanelSettings />, role: 'admin' },
];

const roleAnimations = {
  container: {
    hidden: { opacity: 0 },
    show: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1
      }
    }
  },
  item: {
    hidden: { y: 20, opacity: 0 },
    show: { 
      y: 0, 
      opacity: 1,
      transition: {
        type: "spring",
        stiffness: 100
      }
    }
  }
};

const formAnimations = {
  initial: { 
    x: 300, 
    opacity: 0,
    scale: 0.9
  },
  animate: { 
    x: 0, 
    opacity: 1,
    scale: 1,
    transition: {
      type: "spring",
      stiffness: 100,
      damping: 20
    }
  },
  exit: { 
    x: -300, 
    opacity: 0,
    scale: 0.9,
    transition: {
      duration: 0.3
    }
  }
};

const sidebarAnimations = {
  container: {
    show: {
      transition: {
        staggerChildren: 0.1,
        delayChildren: 0.3
      }
    }
  },
  item: {
    hidden: { 
      x: -50,
      opacity: 0 
    },
    show: { 
      x: 0,
      opacity: 1,
      transition: {
        type: "spring",
        stiffness: 100,
        damping: 12
      }
    }
  },
  hover: {
    scale: 1.02,
    x: 10,
    transition: {
      type: "spring",
      stiffness: 400,
      damping: 10
    }
  },
  tap: {
    scale: 0.95
  }
};

const getRoleColor = (role) => {
  switch (role) {
    case 'supplier': return '#1565C0';
    case 'manufacturer': return '#1976D2';
    case 'distributor': return '#2196F3';
    case 'pharmacy': return '#0D47A1';
    case 'admin': return '#0277BD';
    default: return '#1a237e';
  }
};

const getRoleGradient = (role) => {
  const baseColor = getRoleColor(role);
  const lighterColor = alpha(baseColor, 0.8);
  return `linear-gradient(135deg, ${baseColor} 0%, ${lighterColor} 100%)`;
};

const textAnimations = {
  heading: {
    initial: { opacity: 0, y: -20 },
    animate: { 
      opacity: 1, 
      y: 0,
      transition: {
        duration: 0.6,
        ease: "easeOut"
      }
    }
  },
  text: {
    initial: { opacity: 0, y: 20 },
    animate: { 
      opacity: 1, 
      y: 0,
      transition: {
        duration: 0.6,
        delay: 0.2,
        ease: "easeOut"
      }
    }
  }
};

const LoginPage = ({ onLogin }) => {
  const [selectedRole, setSelectedRole] = useState(null);
  const [showLoginForm, setShowLoginForm] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [isRegistering, setIsRegistering] = useState(false);
  const [formData, setFormData] = useState({
    username: '',
    password: '',
    email: '',
    confirmPassword: '',
    phoneNumber: '',
    organization: ''
  });
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    
    try {
      if (isRegistering) {
        if (formData.password !== formData.confirmPassword) {
          throw new Error("Passwords don't match");
        }
        
        if (!formData.username || !formData.email || !formData.password || !formData.phoneNumber) {
          throw new Error('All fields are required');
        }

        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!emailRegex.test(formData.email)) {
          throw new Error('Please enter a valid email address');
        }

        const phoneRegex = /^\+?[1-9]\d{9,14}$/;
        if (!phoneRegex.test(formData.phoneNumber)) {
          throw new Error('Please enter a valid phone number');
        }

        const registrationData = {
          username: formData.username,
          email: formData.email,
          password: formData.password,
          phoneNumber: formData.phoneNumber,
          organization: formData.organization || formData.username,
          role: selectedRole
        };

        console.log('Sending registration data:', registrationData);
        const response = await authService.register(registrationData);

        if (response.success) {
          // Store user data and token
          localStorage.setItem('token', response.token);
          localStorage.setItem('user', JSON.stringify(response.user));
          
          // Update app state and navigate
          onLogin(response.user.role);
          
          // Navigate to dashboard
          navigateToRoleDashboard(response.user.role);
        } else {
          throw new Error(response.message || 'Registration failed');
        }
      } else {
        // Handle Login
        const response = await authService.login({
          email: formData.email,
          password: formData.password
        });
        
        // Store user data and token
        localStorage.setItem('token', response.token);
        localStorage.setItem('user', JSON.stringify(response.user));
        onLogin(response.user.role);
        navigateToRoleDashboard(response.user.role);
      }
    } catch (error) {
      console.error('Authentication error:', error);
      setError({
        type: 'error',
        message: error.response?.data?.message || error.message || 'Authentication failed'
      });
    } finally {
      setLoading(false);
    }
  };

  const navigateToRoleDashboard = (role) => {
    const dashboardRoutes = {
      admin: '/admin-dashboard',
      manufacturer: '/manufacturer-dashboard',
      distributor: '/distributor-dashboard',
      pharmacy: '/pharmacy-dashboard',
      supplier: '/supplier-dashboard'
    };

    const route = dashboardRoutes[role];
    if (route) {
      navigate(route);
    } else {
      setError('Invalid role');
    }
  };

  const handleMenuClick = (item) => {
    if (item.text === 'Home') {
      setSelectedRole(null);
      setShowLoginForm(false);
      setIsRegistering(false);
      setFormData({
        username: '',
        password: '',
        email: '',
        confirmPassword: '',
        phoneNumber: '',
        organization: ''
      });
      navigate('/');
    } else if (item.role) {
      setSelectedRole(item.role);
      setShowLoginForm(true);
      setIsRegistering(false);
      // Pre-fill email based on role for testing
      switch (item.role) {
        case 'admin':
          setFormData(prev => ({ ...prev, email: 'admin@example.com' }));
          break;
        case 'manufacturer':
          setFormData(prev => ({ ...prev, email: 'manufacturer@example.com' }));
          break;
        case 'distributor':
          setFormData(prev => ({ ...prev, email: 'distributor@example.com' }));
          break;
        case 'pharmacy':
          setFormData(prev => ({ ...prev, email: 'pharmacy@example.com' }));
          break;
        case 'supplier':
          setFormData(prev => ({ ...prev, email: 'supplier@example.com' }));
          break;
      }
    }
  };

  const toggleMode = () => {
    setIsRegistering(!isRegistering);
    setFormData({
      username: '',
      password: '',
      email: '',
      confirmPassword: '',
      phoneNumber: '',
      organization: ''
    });
  };

  const getFormTitle = () => {
    const roleTitle = selectedRole?.charAt(0).toUpperCase() + selectedRole?.slice(1);
    return `${roleTitle} ${isRegistering ? 'Registration' : 'Login'}`;
  };

  const shouldShowOrganization = () => {
    return isRegistering && selectedRole && selectedRole !== 'admin';
  };

  return (
    <Box sx={{ display: 'flex', minHeight: '100vh' }}>
      {/* Header */}
      <AppBar 
        position="fixed" 
        sx={{ 
          zIndex: (theme) => theme.zIndex.drawer + 1,
          bgcolor: '#1a237e',
          boxShadow: 3
        }}
      >
        <Toolbar>
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.5 }}
          >
            <Typography 
              variant="h5" 
              component="h1" 
              sx={{ 
                fontWeight: 700,
                letterSpacing: '0.5px',
                background: 'linear-gradient(45deg, #fff 30%, #e3f2fd 90%)',
                WebkitBackgroundClip: 'text',
                WebkitTextFillColor: 'transparent',
                textShadow: '2px 2px 4px rgba(0,0,0,0.2)'
              }}
            >
              Drug Supply Chain Tracking System
            </Typography>
          </motion.div>
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
            bgcolor: '#f8fafc',
            borderRight: '1px solid rgba(0, 0, 0, 0.08)',
            backgroundImage: 'linear-gradient(to bottom, #ffffff, #f8fafc)',
            boxShadow: '4px 0 15px -5px rgba(0, 0, 0, 0.1)',
            '&::-webkit-scrollbar': {
              display: 'none'  // Hide scrollbar for Chrome, Safari, and newer Edge
            },
            scrollbarWidth: 'none',  // Hide scrollbar for Firefox
            msOverflowStyle: 'none'  // Hide scrollbar for IE and older Edge
          },
        }}
      >
        <Toolbar />
        <Box 
          sx={{ 
            overflow: 'auto',
            mt: 2,
            '&::-webkit-scrollbar': {
              display: 'none'
            },
            scrollbarWidth: 'none',
            msOverflowStyle: 'none'
          }}
        >
          <motion.div
            variants={sidebarAnimations.container}
            initial="hidden"
            animate="show"
          >
            <List>
              {sidebarItems.map((item) => (
                <motion.div
                  key={item.text}
                  variants={sidebarAnimations.item}
                  whileHover={sidebarAnimations.hover}
                  whileTap={sidebarAnimations.tap}
                >
                  <ListItem 
                    button 
                    onClick={() => handleMenuClick(item)}
                    sx={{
                      mb: 1.5,
                      mx: 2,
                      borderRadius: 2,
                      position: 'relative',
                      overflow: 'hidden',
                      backdropFilter: 'blur(8px)',
                      transition: 'all 0.3s ease',
                      background: selectedRole === item.role ? 
                        'linear-gradient(135deg, rgba(25, 118, 210, 0.08) 0%, rgba(25, 118, 210, 0.03) 100%)' : 
                        'transparent',
                      '&::before': {
                        content: '""',
                        position: 'absolute',
                        top: 0,
                        left: 0,
                        right: 0,
                        bottom: 0,
                        background: item.role ? getRoleGradient(item.role) : 'transparent',
                        opacity: selectedRole === item.role ? 0.12 : 0,
                        transition: 'opacity 0.3s ease'
                      },
                      '&::after': {
                        content: '""',
                        position: 'absolute',
                        top: 0,
                        left: -100,
                        width: '40%',
                        height: '100%',
                        background: 'linear-gradient(90deg, transparent, rgba(255,255,255,0.3), transparent)',
                        transition: 'left 0.5s ease',
                      },
                      '&:hover': {
                        '&::before': {
                          opacity: 0.08
                        },
                        '&::after': {
                          left: '200%'
                        },
                        transform: 'translateX(5px)',
                        backgroundColor: 'rgba(25, 118, 210, 0.04)'
                      },
                      boxShadow: selectedRole === item.role ? 
                        '0 2px 8px -2px rgba(25, 118, 210, 0.15)' : 'none'
                    }}
                  >
                    <ListItemIcon 
                      sx={{ 
                        color: item.role ? getRoleColor(item.role) : '#1976D2',
                        transition: 'all 0.3s ease',
                        transform: selectedRole === item.role ? 'scale(1.1)' : 'scale(1)',
                        mr: 1,
                        '& svg': {
                          filter: selectedRole === item.role ? 
                            'drop-shadow(0 2px 4px rgba(25, 118, 210, 0.3))' : 'none'
                        }
                      }}
                    >
                      <motion.div
                        animate={selectedRole === item.role ? {
                          rotate: [0, -10, 10, -10, 0],
                          transition: {
                            duration: 0.5,
                            ease: "easeInOut"
                          }
                        } : {}}
                      >
                        {item.icon}
                      </motion.div>
                    </ListItemIcon>
                    <ListItemText 
                      primary={item.text} 
                      sx={{ 
                        '& .MuiListItemText-primary': {
                          color: item.role ? getRoleColor(item.role) : '#1976D2',
                          fontWeight: selectedRole === item.role ? 600 : 500,
                          transition: 'all 0.3s ease',
                          fontSize: '0.95rem',
                          letterSpacing: '0.3px',
                          textShadow: selectedRole === item.role ? 
                            '0 2px 4px rgba(25, 118, 210, 0.1)' : 'none',
                          fontFamily: '"Segoe UI", "Roboto", "Helvetica", sans-serif'
                        }
                      }}
                    />
                    {selectedRole === item.role && (
                      <motion.div
                        initial={{ scale: 0 }}
                        animate={{ scale: 1 }}
                        transition={{
                          type: "spring",
                          stiffness: 500,
                          damping: 15
                        }}
                        style={{
                          width: 4,
                          height: 4,
                          borderRadius: '50%',
                          background: getRoleColor(item.role),
                          marginLeft: 8
                        }}
                      />
                    )}
                  </ListItem>
                </motion.div>
              ))}
            </List>
          </motion.div>
        </Box>
      </Drawer>

      {/* Main Content */}
      <Box
        component="main"
        sx={{
          flexGrow: 1,
          p: 3,
          bgcolor: '#f8fafc',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center'
        }}
      >
        <Toolbar />
        {showLoginForm ? (
          <AnimatePresence mode="wait">
            <motion.div
              key={`${selectedRole}-${isRegistering}`}
              initial="initial"
              animate="animate"
              exit="exit"
              variants={formAnimations}
            >
              <Container maxWidth="sm">
                <Paper
                  elevation={3}
                  sx={{
                    p: 4,
                    display: 'flex',
                    flexDirection: 'column',
                    alignItems: 'center',
                    borderRadius: 2,
                    position: 'relative',
                    overflow: 'hidden',
                    '&::before': {
                      content: '""',
                      position: 'absolute',
                      top: 0,
                      left: 0,
                      right: 0,
                      height: '4px',
                      background: getRoleGradient(selectedRole)
                    }
                  }}
                >
                  {/* Form Content */}
                  {sidebarItems.find(item => item.role === selectedRole)?.icon && (
                    <Box
                      sx={{ 
                        fontSize: 50, 
                        color: getRoleColor(selectedRole),
                        mb: 2,
                        '& > svg': {
                          fontSize: 50
                        }
                      }}
                    >
                      {sidebarItems.find(item => item.role === selectedRole)?.icon}
                    </Box>
                  )}
                  
                  <Typography 
                    variant="h5" 
                    component="h2" 
                    gutterBottom
                    sx={{ 
                      color: getRoleColor(selectedRole),
                      fontWeight: 700,
                      mb: 3,
                      letterSpacing: '0.5px',
                      textTransform: 'none',
                      position: 'relative',
                      '&::after': {
                        content: '""',
                        position: 'absolute',
                        bottom: -8,
                        left: '50%',
                        transform: 'translateX(-50%)',
                        width: '40px',
                        height: '3px',
                        background: getRoleGradient(selectedRole),
                        borderRadius: '2px'
                      }
                    }}
                  >
                    {getFormTitle()}
                  </Typography>

                  <form onSubmit={handleSubmit} style={{ width: '100%' }}>
                    <TextField
                      fullWidth
                      label="Username"
                      name="username"
                      variant="outlined"
                      value={formData.username}
                      onChange={handleChange}
                      required
                      sx={{ mb: 2 }}
                    />

                    {isRegistering && (
                      <>
                        <TextField
                          fullWidth
                          label="Email"
                          name="email"
                          type="email"
                          variant="outlined"
                          value={formData.email}
                          onChange={handleChange}
                          required
                          sx={{ mb: 2 }}
                        />

                        {shouldShowOrganization() && (
                          <TextField
                            fullWidth
                            label={`${selectedRole.charAt(0).toUpperCase() + selectedRole.slice(1)} Organization Name`}
                            name="organization"
                            variant="outlined"
                            value={formData.organization}
                            onChange={handleChange}
                            required
                            sx={{ mb: 2 }}
                          />
                        )}
                      </>
                    )}

                    {!isRegistering && (
                      <TextField
                        fullWidth
                        label="Email"
                        name="email"
                        type="email"
                        variant="outlined"
                        value={formData.email}
                        onChange={handleChange}
                        required
                        sx={{ mb: 2 }}
                      />
                    )}

                    <TextField
                      fullWidth
                      label="Password"
                      name="password"
                      type={showPassword ? 'text' : 'password'}
                      variant="outlined"
                      value={formData.password}
                      onChange={handleChange}
                      required
                      InputProps={{
                        endAdornment: (
                          <InputAdornment position="end">
                            <IconButton
                              onClick={() => setShowPassword(!showPassword)}
                              edge="end"
                            >
                              {showPassword ? <VisibilityOff /> : <Visibility />}
                            </IconButton>
                          </InputAdornment>
                        ),
                      }}
                      sx={{ mb: isRegistering ? 2 : 3 }}
                    />

                    {isRegistering && (
                      <>
                        <TextField
                          fullWidth
                          label="Confirm Password"
                          name="confirmPassword"
                          type="password"
                          variant="outlined"
                          value={formData.confirmPassword}
                          onChange={handleChange}
                          required
                          sx={{ mb: 2 }}
                        />

                        <TextField
                          fullWidth
                          label="Phone Number"
                          name="phoneNumber"
                          variant="outlined"
                          value={formData.phoneNumber}
                          onChange={handleChange}
                          required
                          sx={{ mb: 3 }}
                        />
                      </>
                    )}

                    <Button
                      type="submit"
                      fullWidth
                      variant="contained"
                      disabled={loading}
                      size="large"
                      sx={{
                        py: 1.5,
                        fontSize: '1.1rem',
                        fontWeight: 500,
                        textTransform: 'none',
                        background: getRoleGradient(selectedRole),
                        '&:hover': {
                          background: getRoleGradient(selectedRole),
                          filter: 'brightness(0.9)'
                        },
                        '&:disabled': {
                          background: '#ccc'
                        }
                      }}
                    >
                      <motion.div
                        initial={{ scale: 1 }}
                        whileTap={{ scale: 0.95 }}
                      >
                        {loading ? 'Processing...' : (isRegistering ? 'Register' : 'Login')}
                      </motion.div>
                    </Button>

                    <Divider sx={{ my: 2 }} />

                    <Box sx={{ textAlign: 'center' }}>
                      <Link
                        component="button"
                        variant="body2"
                        onClick={toggleMode}
                        sx={{
                          color: getRoleColor(selectedRole),
                          textDecoration: 'none',
                          fontWeight: 500,
                          letterSpacing: '0.3px',
                          transition: 'all 0.3s ease',
                          '&:hover': {
                            color: alpha(getRoleColor(selectedRole), 0.8),
                            textDecoration: 'none',
                            transform: 'translateY(-1px)'
                          }
                        }}
                      >
                        {isRegistering 
                          ? 'Already have an account? Login here' 
                          : 'Don\'t have an account? Register here'}
                      </Link>
                    </Box>

                    {error && (
                      <ErrorAlert error={error} onClose={() => setError(null)} />
                    )}
                  </form>
                </Paper>
              </Container>
            </motion.div>
          </AnimatePresence>
        ) : (
          <Container maxWidth="md" sx={{ textAlign: 'center' }}>
            <motion.div
              variants={textAnimations.heading}
              initial="initial"
              animate="animate"
            >
              <Typography 
                variant="h3" 
                component="h2"
                sx={{ 
                  color: '#1a237e',
                  fontWeight: 800,
                  mb: 3,
                  letterSpacing: '0.5px',
                  textTransform: 'none',
                  background: 'linear-gradient(45deg, #1a237e 30%, #283593 90%)',
                  WebkitBackgroundClip: 'text',
                  WebkitTextFillColor: 'transparent',
                  textShadow: '2px 2px 4px rgba(0,0,0,0.1)',
                  lineHeight: 1.3
                }}
              >
                Welcome to Drug Supply Chain Tracking System
              </Typography>
            </motion.div>
            
            <motion.div
              variants={textAnimations.text}
              initial="initial"
              animate="animate"
            >
              <Typography 
                variant="h6"
                sx={{ 
                  color: '#455a64',
                  mb: 4,
                  fontWeight: 500,
                  letterSpacing: '0.3px',
                  lineHeight: 1.6,
                  maxWidth: '600px',
                  margin: '0 auto',
                  opacity: 0.9
                }}
              >
                Please select a role from the sidebar to login or register
              </Typography>
            </motion.div>
          </Container>
        )}
      </Box>
    </Box>
  );
};

export default LoginPage;
import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Box, Button, Typography, Container } from '@mui/material';
import Background3D from './Background3D';

const HomePage = () => {
  const navigate = useNavigate();

  return (
    <Box sx={{ minHeight: '100vh', display: 'flex', flexDirection: 'column' }}>
      {/* Main Content */}
      <Box 
        sx={{ 
          flex: 1, 
          position: 'relative',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center'
        }}
      >
        <Background3D />
        <Container 
          maxWidth="md" 
          sx={{ 
            position: 'relative',
            zIndex: 1,
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            justifyContent: 'center',
            textAlign: 'center',
            gap: 4
          }}
        >
          <Typography 
            variant="h1" 
            component="h1" 
            sx={{ 
              color: 'white',
              fontWeight: 700,
              fontSize: { xs: '2.5rem', sm: '3.5rem', md: '4.5rem' },
              textShadow: '2px 2px 4px rgba(0,0,0,0.3)',
              letterSpacing: '0.05em',
              lineHeight: 1.2
            }}
          >
            Drug Supply Chain
            <br />
            Tracking System
          </Typography>

          <Button
            variant="contained"
            size="large"
            onClick={() => navigate('/login')}
            sx={{
              mt: 4,
              px: 8,
              py: 2,
              fontSize: '1.4rem',
              borderRadius: '50px',
              background: 'linear-gradient(45deg, #1976d2 30%, #2196f3 90%)',
              boxShadow: '0 3px 15px rgba(33, 150, 243, 0.3)',
              transition: 'all 0.3s ease-in-out',
              textTransform: 'none',
              '&:hover': {
                background: 'linear-gradient(45deg, #1565c0 30%, #1976d2 90%)',
                transform: 'translateY(-5px) scale(1.05)',
                boxShadow: '0 5px 25px rgba(33, 150, 243, 0.5)',
              }
            }}
          >
            Get Started
          </Button>
        </Container>
      </Box>

      {/* Footer */}
      <Box 
        component="footer" 
        sx={{
          py: 3,
          px: 2,
          backgroundColor: 'rgba(0,0,0,0.87)',
          position: 'relative',
          zIndex: 1
        }}
      >
        <Container maxWidth="sm">
          <Typography 
            variant="body1" 
            align="center"
            sx={{ 
              color: 'rgba(255,255,255,0.7)',
              fontWeight: 500
            }}
          >
            Drug Tracking System © {new Date().getFullYear()}
          </Typography>
        </Container>
      </Box>
    </Box>
  );
};

export default HomePage;


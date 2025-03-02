import { useEffect, useState } from 'react';
import { requestService } from '../services/api';
import { Container, Paper } from '@mui/material';
import ChangePassword from './ChangePassword';

// Inside component
useEffect(() => {
  const fetchRequests = async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await requestService.getAllRequests();
      setRequests(data);
    } catch (error) {
      setError('Failed to fetch requests');
      console.error('Failed to fetch requests:', error);
    } finally {
      setLoading(false);
    }
  };

  if (selectedItem === 'View Requests') {
    fetchRequests();
  }
}, [selectedItem]); 

const renderContent = () => {
  if (showProfile) {
    return (
      <Container maxWidth="lg">
        {/* Profile Info */}
        <Paper elevation={3} sx={{ p: 4, borderRadius: 2, mb: 4 }}>
          {/* ... existing profile info ... */}
        </Paper>

        {/* Change Password Section */}
        <ChangePassword />
      </Container>
    );
  }
};

return (
  <div>
    {renderContent()}
  </div>
);
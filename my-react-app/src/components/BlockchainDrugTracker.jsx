import React, { useState, useEffect } from 'react';
import {
  Box,
  Paper,
  Typography,
  Grid,
  Card,
  CardContent,
  List,
  ListItem,
  ListItemText,
  Chip,
  Button,
  TextField,
  CircularProgress,
  Alert
} from '@mui/material';
import { DrugBlockchain } from '../utils/blockchainService';

const BlockchainDrugTracker = () => {
  const [blockchain, setBlockchain] = useState(null);
  const [drugHistory, setDrugHistory] = useState([]);
  const [batchId, setBatchId] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [verification, setVerification] = useState(null);

  useEffect(() => {
    const initBlockchain = async () => {
      try {
        const blockchainService = new DrugBlockchain();
        await blockchainService.initialize();
        setBlockchain(blockchainService);
      } catch (error) {
        setError('Failed to initialize blockchain connection');
        console.error(error);
      }
    };

    initBlockchain();
  }, []);

  const handleTrack = async () => {
    if (!batchId.trim()) return;

    setLoading(true);
    setError(null);
    try {
      const history = await blockchain.getDrugHistory(batchId);
      const verify = await blockchain.verifyDrug(batchId);
      setDrugHistory(history);
      setVerification(verify);
    } catch (error) {
      setError('Failed to fetch drug history');
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  const getStatusColor = (temp, humidity) => {
    if (temp < 15 || temp > 25) return 'error';
    if (humidity < 35 || humidity > 65) return 'warning';
    return 'success';
  };

  return (
    <Paper elevation={3} sx={{ p: 3 }}>
      <Typography variant="h6" gutterBottom sx={{ color: '#1a237e', fontWeight: 600 }}>
        Blockchain Drug Tracking
      </Typography>

      <Box sx={{ mb: 3 }}>
        <TextField
          fullWidth
          label="Enter Batch ID"
          value={batchId}
          onChange={(e) => setBatchId(e.target.value)}
          sx={{ mb: 2 }}
        />
        <Button
          variant="contained"
          onClick={handleTrack}
          disabled={loading || !blockchain}
          sx={{
            bgcolor: '#1a237e',
            '&:hover': { bgcolor: '#0d47a1' }
          }}
        >
          {loading ? 'Tracking...' : 'Track Drug'}
        </Button>
      </Box>

      {error && (
        <Alert severity="error" sx={{ mb: 2 }}>
          {error}
        </Alert>
      )}

      {verification && (
        <Card sx={{ mb: 3, bgcolor: '#f5f5f5' }}>
          <CardContent>
            <Typography variant="h6" gutterBottom>
              Drug Verification
            </Typography>
            <Grid container spacing={2}>
              <Grid item xs={12} sm={6}>
                <Typography variant="body2" color="textSecondary">
                  Authenticity:
                  <Chip
                    label={verification.isAuthentic ? 'Authentic' : 'Not Verified'}
                    color={verification.isAuthentic ? 'success' : 'error'}
                    size="small"
                    sx={{ ml: 1 }}
                  />
                </Typography>
              </Grid>
              <Grid item xs={12} sm={6}>
                <Typography variant="body2" color="textSecondary">
                  Current Location: {verification.currentLocation}
                </Typography>
              </Grid>
              <Grid item xs={12} sm={6}>
                <Typography variant="body2" color="textSecondary">
                  Temperature: {verification.temperature}°C
                </Typography>
              </Grid>
              <Grid item xs={12} sm={6}>
                <Typography variant="body2" color="textSecondary">
                  Humidity: {verification.humidity}%
                </Typography>
              </Grid>
            </Grid>
          </CardContent>
        </Card>
      )}

      {drugHistory.length > 0 && (
        <Box>
          <Typography variant="h6" gutterBottom>
            Supply Chain History
          </Typography>
          <List>
            {drugHistory.map((record, index) => (
              <ListItem key={index} sx={{ bgcolor: '#f5f5f5', mb: 1, borderRadius: 1 }}>
                <ListItemText
                  primary={
                    <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                      <Typography variant="subtitle1">
                        {record.location}
                      </Typography>
                      <Chip
                        label={`${record.temperature}°C, ${record.humidity}%`}
                        color={getStatusColor(record.temperature, record.humidity)}
                        size="small"
                      />
                    </Box>
                  }
                  secondary={
                    <>
                      <Typography variant="body2" color="textSecondary">
                        Action: {record.action}
                      </Typography>
                      <Typography variant="body2" color="textSecondary">
                        Handler: {record.handler}
                      </Typography>
                      <Typography variant="body2" color="textSecondary">
                        Time: {record.timestamp.toLocaleString()}
                      </Typography>
                    </>
                  }
                />
              </ListItem>
            ))}
          </List>
        </Box>
      )}
    </Paper>
  );
};

export default BlockchainDrugTracker; 
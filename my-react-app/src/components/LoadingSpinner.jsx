import React from 'react';
import { Box, CircularProgress } from '@mui/material';
import { motion } from 'framer-motion';

const LoadingSpinner = () => {
  return (
    <Box
      component={motion.div}
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      sx={{
        position: 'fixed',
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        bgcolor: 'rgba(255, 255, 255, 0.8)',
        zIndex: 9999,
        backdropFilter: 'blur(5px)'
      }}
    >
      <motion.div
        animate={{
          rotate: 360,
          scale: [1, 1.2, 1],
        }}
        transition={{
          duration: 2,
          repeat: Infinity,
          ease: "easeInOut"
        }}
      >
        <CircularProgress 
          size={60}
          thickness={4}
          sx={{ 
            color: '#1a237e',
            filter: 'drop-shadow(0 0 8px rgba(26, 35, 126, 0.3))'
          }} 
        />
      </motion.div>
    </Box>
  );
};

export default LoadingSpinner; 
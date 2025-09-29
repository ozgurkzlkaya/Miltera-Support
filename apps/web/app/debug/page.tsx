"use client";

import { useEffect, useState } from 'react';
import { Box, Typography, Card, CardContent, Button } from '@mui/material';

export default function DebugPage() {
  const [localStorageData, setLocalStorageData] = useState<any>({});

  useEffect(() => {
    const authToken = localStorage.getItem('auth_token');
    const authTokenAlt = localStorage.getItem('authToken');
    const user = localStorage.getItem('user');
    
    setLocalStorageData({
      auth_token: authToken,
      authToken: authTokenAlt,
      user: user ? JSON.parse(user) : null,
      allKeys: Object.keys(localStorage)
    });
  }, []);

  const clearStorage = () => {
    localStorage.clear();
    window.location.reload();
  };

  return (
    <Box sx={{ p: 3 }}>
      <Typography variant="h4" gutterBottom>
        Debug - LocalStorage Data
      </Typography>
      
      <Card sx={{ mb: 2 }}>
        <CardContent>
          <Typography variant="h6" gutterBottom>
            LocalStorage Contents:
          </Typography>
          <pre style={{ background: '#f5f5f5', padding: '16px', borderRadius: '4px', overflow: 'auto' }}>
            {JSON.stringify(localStorageData, null, 2)}
          </pre>
        </CardContent>
      </Card>

      <Button variant="contained" color="error" onClick={clearStorage}>
        Clear LocalStorage
      </Button>
    </Box>
  );
}

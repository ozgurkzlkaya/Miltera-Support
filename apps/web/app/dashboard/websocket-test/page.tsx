'use client';

import React, { useState, useEffect } from 'react';
import {
  Box,
  Card,
  CardContent,
  Typography,
  Button,
  TextField,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Grid,
  Alert,
  Chip,
  Paper,
  Divider,
} from '@mui/material';
import { useWebSocket } from '../../../lib/websocket';
import { callRPC, client } from '../../../lib/rpc';

interface WebSocketStatus {
  isConnected: boolean;
  connectedUsers: number;
  usersByRole: Record<string, number>;
}

export default function WebSocketTestPage() {
  const { isConnected, notifications, unreadCount } = useWebSocket();
  const [status, setStatus] = useState<WebSocketStatus | null>(null);
  const [testForm, setTestForm] = useState({
    type: 'system_alert',
    title: '',
    message: '',
    priority: 'medium',
    target: 'all',
    targetId: '',
  });

  const [systemAlertForm, setSystemAlertForm] = useState({
    title: '',
    message: '',
    priority: 'medium',
  });

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  // Get WebSocket status
  const getStatus = async () => {
    try {
      const response = await callRPC(client.api.v1.websocket.status.get());
      setStatus(response.data);
    } catch (error) {
      console.error('Error getting WebSocket status:', error);
    }
  };

  // Send test notification
  const sendTestNotification = async () => {
    setLoading(true);
    setError(null);
    setSuccess(null);

    try {
      const response = await callRPC(
        client.api.v1.websocket['test-notification'].post({
          json: testForm,
        })
      );

      setSuccess(`Test notification sent successfully to ${response.data.sentTo} users`);
      setTestForm({
        type: 'system_alert',
        title: '',
        message: '',
        priority: 'medium',
        target: 'all',
        targetId: '',
      });
    } catch (error: any) {
      setError(error.message || 'Failed to send test notification');
    } finally {
      setLoading(false);
    }
  };

  // Send system alert
  const sendSystemAlert = async () => {
    setLoading(true);
    setError(null);
    setSuccess(null);

    try {
      const response = await callRPC(
        client.api.v1.websocket['system-alert'].post({
          json: systemAlertForm,
        })
      );

      setSuccess(`System alert sent successfully to ${response.data.sentTo} users`);
      setSystemAlertForm({
        title: '',
        message: '',
        priority: 'medium',
      });
    } catch (error: any) {
      setError(error.message || 'Failed to send system alert');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    getStatus();
    const interval = setInterval(getStatus, 5000); // Update every 5 seconds
    return () => clearInterval(interval);
  }, []);

  return (
    <Box sx={{ p: 3 }}>
      <Typography variant="h4" gutterBottom>
        WebSocket Test
      </Typography>

      {/* Connection Status */}
      <Card sx={{ mb: 3 }}>
        <CardContent>
          <Typography variant="h6" gutterBottom>
            Connection Status
          </Typography>
          <Box sx={{ display: 'flex', gap: 2, alignItems: 'center', mb: 2 }}>
            <Chip
              label={isConnected ? 'Connected' : 'Disconnected'}
              color={isConnected ? 'success' : 'error'}
            />
            <Chip label={`${unreadCount} unread notifications`} color="info" />
          </Box>

          {status && (
            <Grid container spacing={2}>
              <Grid item xs={12} md={6}>
                <Typography variant="body2">
                  <strong>Connected Users:</strong> {status.connectedUsers}
                </Typography>
              </Grid>
              <Grid item xs={12} md={6}>
                <Typography variant="body2">
                  <strong>Users by Role:</strong>
                </Typography>
                <Box sx={{ display: 'flex', gap: 1, flexWrap: 'wrap', mt: 1 }}>
                  {Object.entries(status.usersByRole).map(([role, count]) => (
                    <Chip key={role} label={`${role}: ${count}`} size="small" />
                  ))}
                </Box>
              </Grid>
            </Grid>
          )}
        </CardContent>
      </Card>

      {/* Test Notification Form */}
      <Card sx={{ mb: 3 }}>
        <CardContent>
          <Typography variant="h6" gutterBottom>
            Send Test Notification
          </Typography>
          <Grid container spacing={2}>
            <Grid item xs={12} md={6}>
              <FormControl fullWidth>
                <InputLabel>Type</InputLabel>
                <Select
                  value={testForm.type}
                  onChange={(e) => setTestForm({ ...testForm, type: e.target.value })}
                >
                  <MenuItem value="issue_status_change">Issue Status Change</MenuItem>
                  <MenuItem value="product_status_change">Product Status Change</MenuItem>
                  <MenuItem value="shipment_update">Shipment Update</MenuItem>
                  <MenuItem value="system_alert">System Alert</MenuItem>
                </Select>
              </FormControl>
            </Grid>
            <Grid item xs={12} md={6}>
              <FormControl fullWidth>
                <InputLabel>Priority</InputLabel>
                <Select
                  value={testForm.priority}
                  onChange={(e) => setTestForm({ ...testForm, priority: e.target.value })}
                >
                  <MenuItem value="low">Low</MenuItem>
                  <MenuItem value="medium">Medium</MenuItem>
                  <MenuItem value="high">High</MenuItem>
                  <MenuItem value="urgent">Urgent</MenuItem>
                </Select>
              </FormControl>
            </Grid>
            <Grid item xs={12} md={6}>
              <FormControl fullWidth>
                <InputLabel>Target</InputLabel>
                <Select
                  value={testForm.target}
                  onChange={(e) => setTestForm({ ...testForm, target: e.target.value })}
                >
                  <MenuItem value="all">All Users</MenuItem>
                  <MenuItem value="role">Specific Role</MenuItem>
                  <MenuItem value="user">Specific User</MenuItem>
                </Select>
              </FormControl>
            </Grid>
            <Grid item xs={12} md={6}>
              <TextField
                fullWidth
                label="Target ID (User ID or Role)"
                value={testForm.targetId}
                onChange={(e) => setTestForm({ ...testForm, targetId: e.target.value })}
                disabled={testForm.target === 'all'}
              />
            </Grid>
            <Grid item xs={12}>
              <TextField
                fullWidth
                label="Title"
                value={testForm.title}
                onChange={(e) => setTestForm({ ...testForm, title: e.target.value })}
              />
            </Grid>
            <Grid item xs={12}>
              <TextField
                fullWidth
                label="Message"
                multiline
                rows={3}
                value={testForm.message}
                onChange={(e) => setTestForm({ ...testForm, message: e.target.value })}
              />
            </Grid>
            <Grid item xs={12}>
              <Button
                variant="contained"
                onClick={sendTestNotification}
                disabled={loading || !testForm.title || !testForm.message}
              >
                Send Test Notification
              </Button>
            </Grid>
          </Grid>
        </CardContent>
      </Card>

      {/* System Alert Form */}
      <Card sx={{ mb: 3 }}>
        <CardContent>
          <Typography variant="h6" gutterBottom>
            Send System Alert
          </Typography>
          <Grid container spacing={2}>
            <Grid item xs={12} md={6}>
              <TextField
                fullWidth
                label="Title"
                value={systemAlertForm.title}
                onChange={(e) => setSystemAlertForm({ ...systemAlertForm, title: e.target.value })}
              />
            </Grid>
            <Grid item xs={12} md={6}>
              <FormControl fullWidth>
                <InputLabel>Priority</InputLabel>
                <Select
                  value={systemAlertForm.priority}
                  onChange={(e) => setSystemAlertForm({ ...systemAlertForm, priority: e.target.value })}
                >
                  <MenuItem value="low">Low</MenuItem>
                  <MenuItem value="medium">Medium</MenuItem>
                  <MenuItem value="high">High</MenuItem>
                  <MenuItem value="urgent">Urgent</MenuItem>
                </Select>
              </FormControl>
            </Grid>
            <Grid item xs={12}>
              <TextField
                fullWidth
                label="Message"
                multiline
                rows={3}
                value={systemAlertForm.message}
                onChange={(e) => setSystemAlertForm({ ...systemAlertForm, message: e.target.value })}
              />
            </Grid>
            <Grid item xs={12}>
              <Button
                variant="contained"
                onClick={sendSystemAlert}
                disabled={loading || !systemAlertForm.title || !systemAlertForm.message}
              >
                Send System Alert
              </Button>
            </Grid>
          </Grid>
        </CardContent>
      </Card>

      {/* Recent Notifications */}
      <Card>
        <CardContent>
          <Typography variant="h6" gutterBottom>
            Recent Notifications
          </Typography>
          {notifications.length === 0 ? (
            <Typography color="text.secondary">No notifications received yet</Typography>
          ) : (
            <Box>
              {notifications.slice(0, 5).map((notification, index) => (
                <Paper key={index} sx={{ p: 2, mb: 2 }}>
                  <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                    <Box>
                      <Typography variant="subtitle1" fontWeight="bold">
                        {notification.title}
                      </Typography>
                      <Typography variant="body2" color="text.secondary">
                        {notification.message}
                      </Typography>
                      <Typography variant="caption" color="text.secondary">
                        {new Date(notification.timestamp).toLocaleString()}
                      </Typography>
                    </Box>
                    <Chip
                      label={notification.priority}
                      color={
                        notification.priority === 'urgent' ? 'error' :
                        notification.priority === 'high' ? 'warning' :
                        notification.priority === 'medium' ? 'info' : 'success'
                      }
                      size="small"
                    />
                  </Box>
                </Paper>
              ))}
            </Box>
          )}
        </CardContent>
      </Card>

      {/* Messages */}
      {error && (
        <Alert severity="error" sx={{ mt: 2 }}>
          {error}
        </Alert>
      )}
      {success && (
        <Alert severity="success" sx={{ mt: 2 }}>
          {success}
        </Alert>
      )}
    </Box>
  );
}

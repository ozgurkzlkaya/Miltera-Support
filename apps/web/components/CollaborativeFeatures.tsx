"use client";

import React, { useState, useEffect, useRef } from 'react';
import {
  Box,
  Card,
  CardContent,
  Typography,
  TextField,
  Button,
  Avatar,
  List,
  ListItem,
  ListItemAvatar,
  ListItemText,
  Chip,
  IconButton,
  Tooltip,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Divider,
  Badge,
  useTheme,
  useMediaQuery,
} from '@mui/material';
import {
  Send as SendIcon,
  PersonAdd as PersonAddIcon,
  Notifications as NotificationsIcon,
  Chat as ChatIcon,
  Group as GroupIcon,
  Close as CloseIcon,
  Reply as ReplyIcon,
  Edit as EditIcon,
  Delete as DeleteIcon,
} from '@mui/icons-material';

interface Comment {
  id: string;
  content: string;
  author: {
    id: string;
    name: string;
    avatar?: string;
  };
  timestamp: Date;
  replies?: Comment[];
  mentions?: string[];
}

interface CollaborativeFeaturesProps {
  entityType: 'issue' | 'product' | 'service-operation';
  entityId: string;
  currentUser: {
    id: string;
    name: string;
    avatar?: string;
  };
  teamMembers?: Array<{
    id: string;
    name: string;
    avatar?: string;
    role: string;
  }>;
}

export const CollaborativeFeatures: React.FC<CollaborativeFeaturesProps> = ({
  entityType,
  entityId,
  currentUser,
  teamMembers = [],
}) => {
  const [comments, setComments] = useState<Comment[]>([]);
  const [newComment, setNewComment] = useState('');
  const [showMentions, setShowMentions] = useState(false);
  const [mentionQuery, setMentionQuery] = useState('');
  const [selectedMentions, setSelectedMentions] = useState<string[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [showTeamDialog, setShowTeamDialog] = useState(false);
  const [notifications, setNotifications] = useState<number>(0);
  
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('md'));
  const textFieldRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    loadComments();
    loadNotifications();
  }, [entityType, entityId]);

  const loadComments = async () => {
    try {
      setIsLoading(true);
      const token = localStorage.getItem('auth_token');
      const response = await fetch(
        `http://localhost:3015/api/v1/collaboration/comments/${entityType}/${entityId}`,
        {
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json',
          },
        }
      );

      if (response.ok) {
        const data = await response.json();
        setComments(data.comments || []);
      }
    } catch (error) {
      console.error('Error loading comments:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const loadNotifications = async () => {
    try {
      const token = localStorage.getItem('auth_token');
      const response = await fetch(
        `http://localhost:3015/api/v1/collaboration/notifications`,
        {
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json',
          },
        }
      );

      if (response.ok) {
        const data = await response.json();
        setNotifications(data.unreadCount || 0);
      }
    } catch (error) {
      console.error('Error loading notifications:', error);
    }
  };

  const handleSendComment = async () => {
    if (!newComment.trim()) return;

    try {
      const token = localStorage.getItem('auth_token');
      const response = await fetch(
        `http://localhost:3015/api/v1/collaboration/comments`,
        {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            entityType,
            entityId,
            content: newComment,
            mentions: selectedMentions,
          }),
        }
      );

      if (response.ok) {
        const newCommentData = await response.json();
        setComments(prev => [...prev, newCommentData]);
        setNewComment('');
        setSelectedMentions([]);
        setShowMentions(false);
      }
    } catch (error) {
      console.error('Error sending comment:', error);
    }
  };

  const handleMention = (query: string) => {
    setMentionQuery(query);
    setShowMentions(query.length > 0);
  };

  const handleSelectMention = (userId: string) => {
    if (!selectedMentions.includes(userId)) {
      setSelectedMentions(prev => [...prev, userId]);
    }
    setShowMentions(false);
    setMentionQuery('');
  };

  const handleKeyPress = (event: React.KeyboardEvent) => {
    if (event.key === '@') {
      setShowMentions(true);
    }
  };

  const formatTimestamp = (timestamp: Date) => {
    const now = new Date();
    const diff = now.getTime() - new Date(timestamp).getTime();
    const minutes = Math.floor(diff / 60000);
    const hours = Math.floor(diff / 3600000);
    const days = Math.floor(diff / 86400000);

    if (minutes < 1) return 'Şimdi';
    if (minutes < 60) return `${minutes} dakika önce`;
    if (hours < 24) return `${hours} saat önce`;
    return `${days} gün önce`;
  };

  const filteredTeamMembers = teamMembers.filter(member =>
    member.name.toLowerCase().includes(mentionQuery.toLowerCase()) &&
    member.id !== currentUser.id
  );

  return (
    <Box sx={{ width: '100%' }}>
      {/* Header */}
      <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 2 }}>
        <Typography variant="h6" sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
          <ChatIcon />
          İşbirliği
        </Typography>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
          <Tooltip title="Takım Üyeleri">
            <IconButton onClick={() => setShowTeamDialog(true)}>
              <GroupIcon />
            </IconButton>
          </Tooltip>
          <Tooltip title="Bildirimler">
            <IconButton>
              <Badge badgeContent={notifications} color="error">
                <NotificationsIcon />
              </Badge>
            </IconButton>
          </Tooltip>
        </Box>
      </Box>

      {/* Comments Section */}
      <Card sx={{ mb: 2 }}>
        <CardContent>
          <Typography variant="subtitle1" sx={{ mb: 2, fontWeight: 600 }}>
            Yorumlar ({comments.length})
          </Typography>
          
          {/* Comments List */}
          <List sx={{ maxHeight: 400, overflow: 'auto' }}>
            {comments.map((comment) => (
              <ListItem key={comment.id} sx={{ alignItems: 'flex-start', py: 2 }}>
                <ListItemAvatar>
                  <Avatar src={comment.author.avatar}>
                    {comment.author.name.charAt(0).toUpperCase()}
                  </Avatar>
                </ListItemAvatar>
                <ListItemText
                  primary={
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 1 }}>
                      <Typography variant="subtitle2" sx={{ fontWeight: 600 }}>
                        {comment.author.name}
                      </Typography>
                      <Typography variant="caption" color="text.secondary">
                        {formatTimestamp(comment.timestamp)}
                      </Typography>
                    </Box>
                  }
                  secondary={
                    <Box>
                      <Typography variant="body2" sx={{ mb: 1 }}>
                        {comment.content}
                      </Typography>
                      {comment.mentions && comment.mentions.length > 0 && (
                        <Box sx={{ display: 'flex', gap: 0.5, flexWrap: 'wrap' }}>
                          {comment.mentions.map((mention) => (
                            <Chip
                              key={mention}
                              label={`@${mention}`}
                              size="small"
                              color="primary"
                              variant="outlined"
                            />
                          ))}
                        </Box>
                      )}
                    </Box>
                  }
                />
                <Box sx={{ display: 'flex', gap: 0.5 }}>
                  <Tooltip title="Yanıtla">
                    <IconButton size="small">
                      <ReplyIcon fontSize="small" />
                    </IconButton>
                  </Tooltip>
                  {comment.author.id === currentUser.id && (
                    <>
                      <Tooltip title="Düzenle">
                        <IconButton size="small">
                          <EditIcon fontSize="small" />
                        </IconButton>
                      </Tooltip>
                      <Tooltip title="Sil">
                        <IconButton size="small">
                          <DeleteIcon fontSize="small" />
                        </IconButton>
                      </Tooltip>
                    </>
                  )}
                </Box>
              </ListItem>
            ))}
          </List>

          {/* New Comment Input */}
          <Box sx={{ mt: 2, pt: 2, borderTop: 1, borderColor: 'divider' }}>
            <Box sx={{ display: 'flex', gap: 1, alignItems: 'flex-end' }}>
              <Avatar sx={{ width: 32, height: 32, mr: 1 }}>
                {currentUser.name.charAt(0).toUpperCase()}
              </Avatar>
              <TextField
                ref={textFieldRef}
                fullWidth
                multiline
                maxRows={4}
                placeholder="Yorum ekle... (@ ile bahset)"
                value={newComment}
                onChange={(e) => {
                  setNewComment(e.target.value);
                  handleMention(e.target.value);
                }}
                onKeyPress={handleKeyPress}
                size="small"
                sx={{ flex: 1 }}
              />
              <Button
                variant="contained"
                startIcon={<SendIcon />}
                onClick={handleSendComment}
                disabled={!newComment.trim()}
                size="small"
              >
                Gönder
              </Button>
            </Box>

            {/* Mentions Dropdown */}
            {showMentions && filteredTeamMembers.length > 0 && (
              <Card sx={{ mt: 1, maxHeight: 200, overflow: 'auto' }}>
                <List dense>
                  {filteredTeamMembers.map((member) => (
                    <ListItem
                      key={member.id}
                      button
                      onClick={() => handleSelectMention(member.id)}
                      sx={{ py: 0.5 }}
                    >
                      <ListItemAvatar>
                        <Avatar sx={{ width: 24, height: 24 }}>
                          {member.name.charAt(0).toUpperCase()}
                        </Avatar>
                      </ListItemAvatar>
                      <ListItemText
                        primary={member.name}
                        secondary={member.role}
                        primaryTypographyProps={{ variant: 'body2' }}
                        secondaryTypographyProps={{ variant: 'caption' }}
                      />
                    </ListItem>
                  ))}
                </List>
              </Card>
            )}

            {/* Selected Mentions */}
            {selectedMentions.length > 0 && (
              <Box sx={{ mt: 1, display: 'flex', gap: 0.5, flexWrap: 'wrap' }}>
                {selectedMentions.map((userId) => {
                  const member = teamMembers.find(m => m.id === userId);
                  return (
                    <Chip
                      key={userId}
                      label={`@${member?.name || userId}`}
                      size="small"
                      color="primary"
                      onDelete={() => setSelectedMentions(prev => prev.filter(id => id !== userId))}
                    />
                  );
                })}
              </Box>
            )}
          </Box>
        </CardContent>
      </Card>

      {/* Team Members Dialog */}
      <Dialog
        open={showTeamDialog}
        onClose={() => setShowTeamDialog(false)}
        maxWidth="sm"
        fullWidth
        fullScreen={isMobile}
      >
        <DialogTitle sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <Typography variant="h6">Takım Üyeleri</Typography>
          <IconButton onClick={() => setShowTeamDialog(false)}>
            <CloseIcon />
          </IconButton>
        </DialogTitle>
        <DialogContent>
          <List>
            {teamMembers.map((member) => (
              <ListItem key={member.id}>
                <ListItemAvatar>
                  <Avatar src={member.avatar}>
                    {member.name.charAt(0).toUpperCase()}
                  </Avatar>
                </ListItemAvatar>
                <ListItemText
                  primary={member.name}
                  secondary={member.role}
                />
                <Chip
                  label="Aktif"
                  color="success"
                  size="small"
                  variant="outlined"
                />
              </ListItem>
            ))}
          </List>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setShowTeamDialog(false)}>
            Kapat
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default CollaborativeFeatures;

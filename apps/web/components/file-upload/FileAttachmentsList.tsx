'use client';

import React, { useState, useEffect } from 'react';
import {
  Box,
  Card,
  CardContent,
  Typography,
  IconButton,
  Grid,
  Chip,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  Alert,
  CircularProgress,
  List,
  ListItem,
  ListItemIcon,
  ListItemText,
  ListItemSecondaryAction,
} from '@mui/material';
import {
  Image as ImageIcon,
  Description as DescriptionIcon,
  Archive as ArchiveIcon,
  Delete as DeleteIcon,
  Download as DownloadIcon,
  Visibility as VisibilityIcon,
  Close as CloseIcon,
  PictureAsPdf as PdfIcon,
  InsertDriveFile as FileIcon,
} from '@mui/icons-material';
import Lightbox from 'yet-another-react-lightbox';
import 'yet-another-react-lightbox/styles.css';

export interface FileAttachment {
  id: string;
  fileName: string;
  originalFileName: string;
  filePath: string;
  fileUrl: string | null;
  mimeType: string;
  fileSize: number;
  fileType: string;
  entityType: string;
  entityId: string;
  uploadedBy: string;
  description: string | null;
  tags: string[];
  createdAt: string;
  updatedAt: string;
}

export interface FileAttachmentsListProps {
  entityType: 'issue' | 'product' | 'shipment' | 'service_operation';
  entityId: string;
  onDelete?: (attachmentId: string) => void;
  showUploadZone?: boolean;
  maxHeight?: number;
}

export const FileAttachmentsList: React.FC<FileAttachmentsListProps> = ({
  entityType,
  entityId,
  onDelete,
  showUploadZone = false,
  maxHeight = 400,
}) => {
  const [attachments, setAttachments] = useState<FileAttachment[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [lightboxOpen, setLightboxOpen] = useState(false);
  const [lightboxIndex, setLightboxIndex] = useState(0);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [deleteAttachmentId, setDeleteAttachmentId] = useState<string | null>(null);

  const fetchAttachments = async () => {
    try {
      setLoading(true);
      const response = await fetch(`/api/v1/file-upload/attachments/${entityType}/${entityId}`, {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('auth-token')}`,
        },
      });

      if (!response.ok) {
        throw new Error('Dosya ekleri yüklenemedi');
      }

      const data = await response.json();
      setAttachments(data.data.attachments || []);
    } catch (error) {
      setError(error instanceof Error ? error.message : 'Bilinmeyen hata');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAttachments();
  }, [entityType, entityId]);

  const handleDelete = async (attachmentId: string) => {
    try {
      const response = await fetch(`/api/v1/file-upload/attachments/${attachmentId}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('auth-token')}`,
        },
      });

      if (!response.ok) {
        throw new Error('Dosya eki silinemedi');
      }

      setAttachments(prev => prev.filter(att => att.id !== attachmentId));
      onDelete?.(attachmentId);
    } catch (error) {
      setError(error instanceof Error ? error.message : 'Silme hatası');
    }
  };

  const openLightbox = (index: number) => {
    setLightboxIndex(index);
    setLightboxOpen(true);
  };

  const getFileIcon = (mimeType: string, fileType: string) => {
    if (mimeType.startsWith('image/')) return <ImageIcon />;
    if (mimeType.includes('pdf')) return <PdfIcon />;
    if (fileType === 'archive') return <ArchiveIcon />;
    return <FileIcon />;
  };

  const formatFileSize = (bytes: number) => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('tr-TR', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  const imageAttachments = attachments.filter(att => att.mimeType.startsWith('image/'));

  if (loading) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', p: 3 }}>
        <CircularProgress />
      </Box>
    );
  }

  if (error) {
    return (
      <Alert severity="error" sx={{ mb: 2 }}>
        {error}
      </Alert>
    );
  }

  return (
    <Box>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
        <Typography variant="h6">
          Dosya Ekleri ({attachments.length})
        </Typography>
        {attachments.length > 0 && (
          <Chip 
            label={`${formatFileSize(attachments.reduce((sum, att) => sum + att.fileSize, 0))}`}
            size="small"
            color="primary"
            variant="outlined"
          />
        )}
      </Box>

      {attachments.length === 0 ? (
        <Card>
          <CardContent sx={{ textAlign: 'center', py: 4 }}>
            <DescriptionIcon sx={{ fontSize: 48, color: 'text.secondary', mb: 2 }} />
            <Typography variant="body1" color="text.secondary">
              Henüz dosya eki yok
            </Typography>
          </CardContent>
        </Card>
      ) : (
        <Box sx={{ maxHeight, overflow: 'auto' }}>
          <List>
            {attachments.map((attachment, index) => (
              <ListItem key={attachment.id} divider>
                <ListItemIcon>
                  {getFileIcon(attachment.mimeType, attachment.fileType)}
                </ListItemIcon>
                <ListItemText
                  primary={attachment.originalFileName}
                  secondary={
                    <Box>
                      <Typography variant="body2" color="text.secondary">
                        {formatFileSize(attachment.fileSize)} • {formatDate(attachment.createdAt)}
                      </Typography>
                      {attachment.description && (
                        <Typography variant="caption" color="text.secondary">
                          {attachment.description}
                        </Typography>
                      )}
                      {attachment.tags.length > 0 && (
                        <Box sx={{ mt: 1 }}>
                          {attachment.tags.map((tag, tagIndex) => (
                            <Chip
                              key={tagIndex}
                              label={tag}
                              size="small"
                              variant="outlined"
                              sx={{ mr: 0.5, mb: 0.5 }}
                            />
                          ))}
                        </Box>
                      )}
                    </Box>
                  }
                />
                <ListItemSecondaryAction>
                  <Box sx={{ display: 'flex', gap: 1 }}>
                    {attachment.mimeType.startsWith('image/') && (
                      <IconButton
                        size="small"
                        onClick={() => openLightbox(imageAttachments.findIndex(att => att.id === attachment.id))}
                      >
                        <VisibilityIcon />
                      </IconButton>
                    )}
                    {attachment.fileUrl && (
                      <IconButton
                        size="small"
                        onClick={() => attachment.fileUrl && window.open(attachment.fileUrl, '_blank')}
                      >
                        <DownloadIcon />
                      </IconButton>
                    )}
                    <IconButton
                      size="small"
                      color="error"
                      onClick={() => {
                        setDeleteAttachmentId(attachment.id);
                        setDeleteDialogOpen(true);
                      }}
                    >
                      <DeleteIcon />
                    </IconButton>
                  </Box>
                </ListItemSecondaryAction>
              </ListItem>
            ))}
          </List>
        </Box>
      )}

      {/* Lightbox for images */}
      {lightboxOpen && imageAttachments.length > 0 && (
        <Lightbox
          open={lightboxOpen}
          close={() => setLightboxOpen(false)}
          index={lightboxIndex}
          slides={imageAttachments.map(att => ({ src: att.fileUrl || '' }))}
        />
      )}

      {/* Delete confirmation dialog */}
      <Dialog open={deleteDialogOpen} onClose={() => setDeleteDialogOpen(false)}>
        <DialogTitle>Dosya Eki Sil</DialogTitle>
        <DialogContent>
          <Typography>
            Bu dosya ekini silmek istediğinizden emin misiniz? Bu işlem geri alınamaz.
          </Typography>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setDeleteDialogOpen(false)}>İptal</Button>
          <Button
            onClick={() => {
              if (deleteAttachmentId) {
                handleDelete(deleteAttachmentId);
                setDeleteDialogOpen(false);
                setDeleteAttachmentId(null);
              }
            }}
            color="error"
            variant="contained"
          >
            Sil
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

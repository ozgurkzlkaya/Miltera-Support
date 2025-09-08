'use client';

import React, { useCallback, useState } from 'react';
import { useDropzone } from 'react-dropzone';
import {
  Box,
  Paper,
  Typography,
  CircularProgress,
  Alert,
  Chip,
  IconButton,
  List,
  ListItem,
  ListItemText,
  ListItemSecondaryAction,
} from '@mui/material';
import {
  CloudUpload as CloudUploadIcon,
  Delete as DeleteIcon,
  Image as ImageIcon,
  Description as DescriptionIcon,
  Archive as ArchiveIcon,
  CheckCircle as CheckCircleIcon,
  Error as ErrorIcon,
} from '@mui/icons-material';

export interface FileUploadZoneProps {
  entityType: 'issue' | 'product' | 'shipment' | 'service_operation';
  entityId: string;
  onUploadSuccess?: (files: any[]) => void;
  onUploadError?: (error: string) => void;
  maxFiles?: number;
  maxFileSize?: number; // MB
  acceptedFileTypes?: string[];
  disabled?: boolean;
}

interface UploadingFile {
  id: string;
  name: string;
  size: number;
  type: string;
  status: 'uploading' | 'success' | 'error';
  progress?: number;
  error?: string;
}

export const FileUploadZone: React.FC<FileUploadZoneProps> = ({
  entityType,
  entityId,
  onUploadSuccess,
  onUploadError,
  maxFiles = 10,
  maxFileSize = 10,
  acceptedFileTypes = [
    'image/*',
    'application/pdf',
    'application/msword',
    'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
    'application/vnd.ms-excel',
    'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
    'text/plain',
    'text/csv',
    'application/zip',
    'application/x-rar-compressed',
  ],
  disabled = false,
}) => {
  const [uploadingFiles, setUploadingFiles] = useState<UploadingFile[]>([]);
  const [error, setError] = useState<string | null>(null);

  const uploadFile = async (file: File): Promise<any> => {
    const formData = new FormData();
    formData.append('file', file);

    const response = await fetch(`/api/v1/file-upload/upload/${entityType}/${entityId}`, {
      method: 'POST',
      body: formData,
      headers: {
        'Authorization': `Bearer ${localStorage.getItem('auth-token')}`,
      },
    });

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.error?.message || 'Dosya yükleme hatası');
    }

    return response.json();
  };

  const onDrop = useCallback(
    async (acceptedFiles: File[]) => {
      setError(null);

      if (acceptedFiles.length === 0) {
        setError('Desteklenmeyen dosya türü veya boyut.');
        return;
      }

      if (acceptedFiles.length > maxFiles) {
        setError(`Maksimum ${maxFiles} dosya yüklenebilir.`);
        return;
      }

      // Dosyaları yükleme listesine ekle
      const newUploadingFiles: UploadingFile[] = acceptedFiles.map((file, index) => ({
        id: `${Date.now()}-${index}`,
        name: file.name,
        size: file.size,
        type: file.type,
        status: 'uploading',
        progress: 0,
      }));

      setUploadingFiles(prev => [...prev, ...newUploadingFiles]);

      // Her dosyayı ayrı ayrı yükle
      const uploadPromises = acceptedFiles.map(async (file, index) => {
        const fileId = newUploadingFiles[index].id;

        try {
          // Progress simülasyonu
          const progressInterval = setInterval(() => {
            setUploadingFiles(prev =>
              prev.map(f =>
                f.id === fileId
                  ? { ...f, progress: Math.min((f.progress || 0) + 10, 90) }
                  : f
              )
            );
          }, 200);

          const result = await uploadFile(file);

          clearInterval(progressInterval);

          // Başarılı yükleme
          setUploadingFiles(prev =>
            prev.map(f =>
              f.id === fileId
                ? { ...f, status: 'success', progress: 100 }
                : f
            )
          );

          return result.data.files[0];
        } catch (error) {
          // Hata durumu
          setUploadingFiles(prev =>
            prev.map(f =>
              f.id === fileId
                ? { ...f, status: 'error', error: error instanceof Error ? error.message : 'Bilinmeyen hata' }
                : f
            )
          );

          throw error;
        }
      });

      try {
        const uploadedFiles = await Promise.all(uploadPromises);
        onUploadSuccess?.(uploadedFiles);
      } catch (error) {
        const errorMessage = error instanceof Error ? error.message : 'Dosya yükleme hatası';
        setError(errorMessage);
        onUploadError?.(errorMessage);
      }
    },
    [entityType, entityId, maxFiles, onUploadSuccess, onUploadError]
  );

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: acceptedFileTypes.reduce((acc, type) => ({ ...acc, [type]: [] }), {}),
    maxSize: maxFileSize * 1024 * 1024,
    disabled,
  });

  const removeUploadingFile = (fileId: string) => {
    setUploadingFiles(prev => prev.filter(f => f.id !== fileId));
  };

  const getFileIcon = (type: string) => {
    if (type.startsWith('image/')) return <ImageIcon />;
    if (type.includes('pdf') || type.includes('document')) return <DescriptionIcon />;
    if (type.includes('zip') || type.includes('rar')) return <ArchiveIcon />;
    return <DescriptionIcon />;
  };

  const formatFileSize = (bytes: number) => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  return (
    <Box>
      <Paper
        {...getRootProps()}
        sx={{
          border: '2px dashed',
          borderColor: isDragActive ? 'primary.main' : 'grey.300',
          backgroundColor: isDragActive ? 'action.hover' : 'background.paper',
          p: 3,
          textAlign: 'center',
          cursor: disabled ? 'not-allowed' : 'pointer',
          opacity: disabled ? 0.6 : 1,
          transition: 'all 0.2s ease-in-out',
          '&:hover': {
            borderColor: disabled ? 'grey.300' : 'primary.main',
            backgroundColor: disabled ? 'background.paper' : 'action.hover',
          },
        }}
      >
        <input {...getInputProps()} />
        <CloudUploadIcon sx={{ fontSize: 48, color: 'primary.main', mb: 2 }} />
        <Typography variant="h6" gutterBottom>
          {isDragActive ? 'Dosyaları buraya bırakın' : 'Dosya yüklemek için tıklayın veya sürükleyin'}
        </Typography>
        <Typography variant="body2" color="text.secondary">
          Maksimum {maxFiles} dosya, her biri {maxFileSize}MB'a kadar
        </Typography>
        <Typography variant="caption" color="text.secondary" display="block" sx={{ mt: 1 }}>
          Desteklenen formatlar: Resim, PDF, Word, Excel, ZIP
        </Typography>
      </Paper>

      {error && (
        <Alert severity="error" sx={{ mt: 2 }}>
          {error}
        </Alert>
      )}

      {uploadingFiles.length > 0 && (
        <Box sx={{ mt: 2 }}>
          <Typography variant="h6" gutterBottom>
            Yüklenen Dosyalar
          </Typography>
          <List>
            {uploadingFiles.map((file) => (
              <ListItem key={file.id} divider>
                <Box sx={{ display: 'flex', alignItems: 'center', mr: 2 }}>
                  {getFileIcon(file.type)}
                </Box>
                <ListItemText
                  primary={file.name}
                  secondary={
                    <Box>
                      <Typography variant="body2" color="text.secondary">
                        {formatFileSize(file.size)}
                      </Typography>
                      {file.status === 'uploading' && (
                        <Box sx={{ display: 'flex', alignItems: 'center', mt: 1 }}>
                          <CircularProgress size={16} sx={{ mr: 1 }} />
                          <Typography variant="caption">
                            %{file.progress || 0}
                          </Typography>
                        </Box>
                      )}
                      {file.status === 'error' && (
                        <Typography variant="caption" color="error">
                          {file.error}
                        </Typography>
                      )}
                    </Box>
                  }
                />
                <ListItemSecondaryAction>
                  {file.status === 'success' && (
                    <CheckCircleIcon color="success" />
                  )}
                  {file.status === 'error' && (
                    <ErrorIcon color="error" />
                  )}
                  <IconButton
                    edge="end"
                    onClick={() => removeUploadingFile(file.id)}
                    size="small"
                  >
                    <DeleteIcon />
                  </IconButton>
                </ListItemSecondaryAction>
              </ListItem>
            ))}
          </List>
        </Box>
      )}
    </Box>
  );
};

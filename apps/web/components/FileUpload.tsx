'use client';

import React, { useState, useRef, useCallback } from 'react';
import {
  Box,
  Button,
  Typography,
  LinearProgress,
  Alert,
  IconButton,
  List,
  ListItem,
  ListItemText,
  ListItemSecondaryAction,
  Chip,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
} from '@mui/material';
import {
  CloudUpload as UploadIcon,
  Delete as DeleteIcon,
  Download as DownloadIcon,
  Visibility as ViewIcon,
  AttachFile as AttachFileIcon,
} from '@mui/icons-material';

interface FileUploadProps {
  entityType: 'issue' | 'product' | 'shipment' | 'service_operation';
  entityId: string;
  onUploadComplete?: (files: UploadedFile[]) => void;
  maxFiles?: number;
  maxFileSize?: number; // in MB
  acceptedTypes?: string[];
  disabled?: boolean;
}

interface UploadedFile {
  id: string;
  fileName: string;
  originalFileName: string;
  filePath: string;
  fileUrl: string | null;
  mimeType: string;
  fileSize: number;
  fileType: string;
  description: string | null;
  tags: string[];
  createdAt: string;
}

interface FileWithPreview extends File {
  preview?: string;
}

export const FileUpload: React.FC<FileUploadProps> = ({
  entityType,
  entityId,
  onUploadComplete,
  maxFiles = 10,
  maxFileSize = 10, // 10MB
  acceptedTypes = ['image/*', 'application/pdf', 'text/*'],
  disabled = false,
}) => {
  const [files, setFiles] = useState<FileWithPreview[]>([]);
  const [uploadedFiles, setUploadedFiles] = useState<UploadedFile[]>([]);
  const [uploading, setUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [openDialog, setOpenDialog] = useState(false);
  const [selectedFile, setSelectedFile] = useState<UploadedFile | null>(null);
  const [fileDescription, setFileDescription] = useState('');
  const [fileTags, setFileTags] = useState<string[]>([]);
  
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Load existing files
  const loadFiles = useCallback(async () => {
    try {
      const token = localStorage.getItem('auth_token');
      const response = await fetch(
        `http://localhost:3015/api/v1/file-upload/${entityType}/${entityId}`,
        {
          headers: {
            'Authorization': `Bearer ${token}`,
          },
        }
      );

      if (response.ok) {
        const data = await response.json();
        setUploadedFiles(data.data?.files || []);
      }
    } catch (error) {
      console.error('Error loading files:', error);
    }
  }, [entityType, entityId]);

  // Load files on mount
  React.useEffect(() => {
    loadFiles();
  }, [loadFiles]);

  const handleFileSelect = (event: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFiles = Array.from(event.target.files || []);
    
    // Validate files
    const validFiles: FileWithPreview[] = [];
    const errors: string[] = [];

    selectedFiles.forEach((file) => {
      // Check file size
      if (file.size > maxFileSize * 1024 * 1024) {
        errors.push(`${file.name} is too large (max ${maxFileSize}MB)`);
        return;
      }

      // Check file type
      const isValidType = acceptedTypes.some(type => {
        if (type.endsWith('/*')) {
          return file.type.startsWith(type.slice(0, -1));
        }
        return file.type === type;
      });

      if (!isValidType) {
        errors.push(`${file.name} has an invalid file type`);
        return;
      }

      // Check max files
      if (files.length + validFiles.length >= maxFiles) {
        errors.push(`Maximum ${maxFiles} files allowed`);
        return;
      }

      // Create preview for images
      const fileWithPreview = file as FileWithPreview;
      if (file.type.startsWith('image/')) {
        fileWithPreview.preview = URL.createObjectURL(file);
      }

      validFiles.push(fileWithPreview);
    });

    if (errors.length > 0) {
      setError(errors.join(', '));
      return;
    }

    setFiles(prev => [...prev, ...validFiles]);
    setError(null);
  };

  const removeFile = (index: number) => {
    setFiles(prev => {
      const newFiles = [...prev];
      const file = newFiles[index];
      
      // Clean up preview URL
      if (file.preview) {
        URL.revokeObjectURL(file.preview);
      }
      
      newFiles.splice(index, 1);
      return newFiles;
    });
  };

  const uploadFiles = async () => {
    if (files.length === 0) return;

    setUploading(true);
    setUploadProgress(0);
    setError(null);

    try {
      const formData = new FormData();
      
      files.forEach((file, index) => {
        formData.append(`files`, file);
        formData.append(`descriptions`, fileDescription || '');
        formData.append(`tags`, JSON.stringify(fileTags));
      });

      const token = localStorage.getItem('auth_token');
      const response = await fetch(
        `http://localhost:3015/api/v1/file-upload/${entityType}/${entityId}`,
        {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${token}`,
          },
          body: formData,
        }
      );

      if (response.ok) {
        const data = await response.json();
        setUploadedFiles(prev => [...prev, ...data.data.files]);
        setFiles([]);
        setFileDescription('');
        setFileTags([]);
        setSuccess(`${files.length} file(s) uploaded successfully`);
        
        if (onUploadComplete) {
          onUploadComplete(data.data.files);
        }
      } else {
        const errorData = await response.json();
        setError(errorData.error?.message || 'Upload failed');
      }
    } catch (error) {
      setError('Upload failed: ' + (error as Error).message);
    } finally {
      setUploading(false);
      setUploadProgress(0);
    }
  };

  const deleteFile = async (fileId: string) => {
    try {
      const token = localStorage.getItem('auth_token');
      const response = await fetch(
        `http://localhost:3015/api/v1/file-upload/${fileId}`,
        {
          method: 'DELETE',
          headers: {
            'Authorization': `Bearer ${token}`,
          },
        }
      );

      if (response.ok) {
        setUploadedFiles(prev => prev.filter(f => f.id !== fileId));
        setSuccess('File deleted successfully');
      } else {
        setError('Failed to delete file');
      }
    } catch (error) {
      setError('Failed to delete file: ' + (error as Error).message);
    }
  };

  const downloadFile = async (file: UploadedFile) => {
    try {
      const token = localStorage.getItem('auth_token');
      const response = await fetch(
        `http://localhost:3015/api/v1/file-upload/${file.id}/download`,
        {
          headers: {
            'Authorization': `Bearer ${token}`,
          },
        }
      );

      if (response.ok) {
        const blob = await response.blob();
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = file.originalFileName;
        document.body.appendChild(a);
        a.click();
        window.URL.revokeObjectURL(url);
        document.body.removeChild(a);
      } else {
        setError('Failed to download file');
      }
    } catch (error) {
      setError('Failed to download file: ' + (error as Error).message);
    }
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
      {/* Upload Section */}
      <Box sx={{ mb: 3 }}>
        <input
          ref={fileInputRef}
          type="file"
          multiple
          accept={acceptedTypes.join(',')}
          onChange={handleFileSelect}
          style={{ display: 'none' }}
          disabled={disabled}
        />
        
        <Button
          variant="outlined"
          startIcon={<UploadIcon />}
          onClick={() => fileInputRef.current?.click()}
          disabled={disabled || files.length >= maxFiles}
          sx={{ mb: 2 }}
        >
          Select Files
        </Button>

        {files.length > 0 && (
          <Box sx={{ mb: 2 }}>
            <Typography variant="subtitle2" gutterBottom>
              Selected Files ({files.length}/{maxFiles}):
            </Typography>
            <List dense>
              {files.map((file, index) => (
                <ListItem key={index}>
                  <ListItemText
                    primary={file.name}
                    secondary={formatFileSize(file.size)}
                  />
                  <ListItemSecondaryAction>
                    <IconButton
                      edge="end"
                      onClick={() => removeFile(index)}
                      disabled={uploading}
                    >
                      <DeleteIcon />
                    </IconButton>
                  </ListItemSecondaryAction>
                </ListItem>
              ))}
            </List>

            <TextField
              fullWidth
              label="Description (optional)"
              value={fileDescription}
              onChange={(e) => setFileDescription(e.target.value)}
              sx={{ mb: 2 }}
            />

            <Button
              variant="contained"
              onClick={uploadFiles}
              disabled={uploading}
              startIcon={<UploadIcon />}
            >
              Upload Files
            </Button>
          </Box>
        )}

        {uploading && (
          <Box sx={{ mb: 2 }}>
            <Typography variant="body2" gutterBottom>
              Uploading files...
            </Typography>
            <LinearProgress variant="determinate" value={uploadProgress} />
          </Box>
        )}
      </Box>

      {/* Messages */}
      {error && (
        <Alert severity="error" sx={{ mb: 2 }} onClose={() => setError(null)}>
          {error}
        </Alert>
      )}

      {success && (
        <Alert severity="success" sx={{ mb: 2 }} onClose={() => setSuccess(null)}>
          {success}
        </Alert>
      )}

      {/* Uploaded Files */}
      {uploadedFiles.length > 0 && (
        <Box>
          <Typography variant="h6" gutterBottom>
            <AttachFileIcon sx={{ mr: 1, verticalAlign: 'middle' }} />
            Attached Files ({uploadedFiles.length})
          </Typography>
          <List>
            {uploadedFiles.map((file) => (
              <ListItem key={file.id} divider>
                <ListItemText
                  primary={file.originalFileName}
                  secondary={
                    <Box>
                      <Typography variant="body2" color="text.secondary">
                        {formatFileSize(file.fileSize)} • {file.mimeType}
                      </Typography>
                      {file.description && (
                        <Typography variant="body2" color="text.secondary">
                          {file.description}
                        </Typography>
                      )}
                      {file.tags.length > 0 && (
                        <Box sx={{ mt: 1 }}>
                          {file.tags.map((tag, index) => (
                            <Chip
                              key={index}
                              label={tag}
                              size="small"
                              sx={{ mr: 0.5, mb: 0.5 }}
                            />
                          ))}
                        </Box>
                      )}
                    </Box>
                  }
                />
                <ListItemSecondaryAction>
                  <IconButton
                    edge="end"
                    onClick={() => downloadFile(file)}
                    title="Download"
                  >
                    <DownloadIcon />
                  </IconButton>
                  <IconButton
                    edge="end"
                    onClick={() => {
                      setSelectedFile(file);
                      setOpenDialog(true);
                    }}
                    title="View Details"
                  >
                    <ViewIcon />
                  </IconButton>
                  <IconButton
                    edge="end"
                    onClick={() => deleteFile(file.id)}
                    title="Delete"
                    color="error"
                  >
                    <DeleteIcon />
                  </IconButton>
                </ListItemSecondaryAction>
              </ListItem>
            ))}
          </List>
        </Box>
      )}

      {/* File Details Dialog */}
      <Dialog open={openDialog} onClose={() => setOpenDialog(false)} maxWidth="md" fullWidth>
        <DialogTitle>File Details</DialogTitle>
        <DialogContent>
          {selectedFile && (
            <Box>
              <Typography variant="h6" gutterBottom>
                {selectedFile.originalFileName}
              </Typography>
              <Typography variant="body2" color="text.secondary" gutterBottom>
                Size: {formatFileSize(selectedFile.fileSize)}
              </Typography>
              <Typography variant="body2" color="text.secondary" gutterBottom>
                Type: {selectedFile.mimeType}
              </Typography>
              <Typography variant="body2" color="text.secondary" gutterBottom>
                Uploaded: {new Date(selectedFile.createdAt).toLocaleString()}
              </Typography>
              {selectedFile.description && (
                <Typography variant="body2" gutterBottom>
                  Description: {selectedFile.description}
                </Typography>
              )}
              {selectedFile.tags.length > 0 && (
                <Box sx={{ mt: 2 }}>
                  <Typography variant="subtitle2" gutterBottom>
                    Tags:
                  </Typography>
                  {selectedFile.tags.map((tag, index) => (
                    <Chip
                      key={index}
                      label={tag}
                      size="small"
                      sx={{ mr: 0.5, mb: 0.5 }}
                    />
                  ))}
                </Box>
              )}
            </Box>
          )}
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setOpenDialog(false)}>Close</Button>
          {selectedFile && (
            <Button
              variant="contained"
              startIcon={<DownloadIcon />}
              onClick={() => downloadFile(selectedFile)}
            >
              Download
            </Button>
          )}
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default FileUpload;

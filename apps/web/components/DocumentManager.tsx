'use client';

import React, { useState, useEffect } from 'react';
import {
  Box,
  Typography,
  Card,
  CardContent,
  Button,
  IconButton,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Chip,
  Grid,
  List,
  ListItem,
  ListItemText,
  ListItemSecondaryAction,
  Avatar,
  Tooltip,
  Alert,
  Snackbar,
  Tabs,
  Tab,
  Paper,
  Divider,
  Badge,
} from '@mui/material';
import {
  Upload as UploadIcon,
  Download as DownloadIcon,
  Delete as DeleteIcon,
  Edit as EditIcon,
  Visibility as ViewIcon,
  Share as ShareIcon,
  Folder as FolderIcon,
  Description as DocumentIcon,
  Image as ImageIcon,
  PictureAsPdf as PdfIcon,
  TableChart as ExcelIcon,
  Code as CodeIcon,
  VideoFile as VideoIcon,
  AudioFile as AudioIcon,
  Archive as ArchiveIcon,
  Search as SearchIcon,
  FilterList as FilterIcon,
  Sort as SortIcon,
  GridView as GridViewIcon,
  ViewList as ListViewIcon,
} from '@mui/icons-material';
import FileUpload from './FileUpload';

interface Document {
  id: string;
  name: string;
  originalName: string;
  type: string;
  mimeType: string;
  size: number;
  url?: string;
  thumbnailUrl?: string;
  description?: string;
  tags: string[];
  category: string;
  uploadedBy: string;
  uploadedAt: string;
  lastModified: string;
  isPublic: boolean;
  downloadCount: number;
  version: number;
  parentId?: string;
  metadata?: Record<string, any>;
}

interface DocumentManagerProps {
  entityType: 'issue' | 'product' | 'service_operation' | 'shipment' | 'company' | 'user';
  entityId: string;
  readOnly?: boolean;
  showCategories?: boolean;
  allowBulkUpload?: boolean;
}

export const DocumentManager: React.FC<DocumentManagerProps> = ({
  entityType,
  entityId,
  readOnly = false,
  showCategories = true,
  allowBulkUpload = true,
}) => {
  const [documents, setDocuments] = useState<Document[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [openUploadDialog, setOpenUploadDialog] = useState(false);
  const [openEditDialog, setOpenEditDialog] = useState(false);
  const [openViewDialog, setOpenViewDialog] = useState(false);
  const [selectedDocument, setSelectedDocument] = useState<Document | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [filterCategory, setFilterCategory] = useState('');
  const [sortBy, setSortBy] = useState<'name' | 'date' | 'size' | 'type'>('date');
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('desc');
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
  const [activeTab, setActiveTab] = useState(0);

  const categories = [
    'Genel',
    'Teknik Dokümantasyon',
    'Resimler',
    'Raporlar',
    'Sözleşmeler',
    'Faturalar',
    'Garanti Belgeleri',
    'Test Sonuçları',
    'Kullanım Kılavuzları',
    'Diğer',
  ];

  // Load documents
  useEffect(() => {
    loadDocuments();
  }, [entityType, entityId]);

  const loadDocuments = async () => {
    try {
      setLoading(true);
      const token = localStorage.getItem('auth_token');
      const response = await fetch(
        `http://localhost:3015/api/v1/documents/${entityType}/${entityId}`,
        {
          headers: {
            'Authorization': `Bearer ${token}`,
          },
        }
      );

      if (response.ok) {
        const data = await response.json();
        setDocuments(data.data || []);
      } else {
        throw new Error('Dokümanlar yüklenemedi');
      }
    } catch (error) {
      console.error('Error loading documents:', error);
      setError('Dokümanlar yüklenirken hata oluştu');
    } finally {
      setLoading(false);
    }
  };

  const handleUpload = async (files: any[]) => {
    try {
      const token = localStorage.getItem('auth_token');
      const formData = new FormData();
      
      files.forEach((file, index) => {
        formData.append(`files`, file);
        formData.append(`categories`, 'Genel');
        formData.append(`descriptions`, '');
        formData.append(`tags`, JSON.stringify([]));
      });

      const response = await fetch(
        `http://localhost:3015/api/v1/documents/${entityType}/${entityId}`,
        {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${token}`,
          },
          body: formData,
        }
      );

      if (response.ok) {
        setSuccess(`${files.length} dosya başarıyla yüklendi`);
        loadDocuments();
        setOpenUploadDialog(false);
      } else {
        throw new Error('Dosya yükleme başarısız');
      }
    } catch (error) {
      console.error('Upload error:', error);
      setError('Dosya yüklenirken hata oluştu');
    }
  };

  const handleDelete = async (documentId: string) => {
    if (window.confirm('Bu dokümanı silmek istediğinizden emin misiniz?')) {
      try {
        const token = localStorage.getItem('auth_token');
        const response = await fetch(
          `http://localhost:3015/api/v1/documents/${documentId}`,
          {
            method: 'DELETE',
            headers: {
              'Authorization': `Bearer ${token}`,
            },
          }
        );

        if (response.ok) {
          setSuccess('Doküman başarıyla silindi');
          loadDocuments();
        } else {
          throw new Error('Doküman silinemedi');
        }
      } catch (error) {
        console.error('Delete error:', error);
        setError('Doküman silinirken hata oluştu');
      }
    }
  };

  const handleDownload = async (document: Document) => {
    try {
      const token = localStorage.getItem('auth_token');
      const response = await fetch(
        `http://localhost:3015/api/v1/documents/${document.id}/download`,
        {
          headers: {
            'Authorization': `Bearer ${token}`,
          },
        }
      );

      if (response.ok) {
        const blob = await response.blob();
        const url = window.URL.createObjectURL(blob);
        const a = window.document.createElement('a');
        a.href = url;
        a.download = document.originalName;
        window.document.body.appendChild(a);
        a.click();
        window.URL.revokeObjectURL(url);
        window.document.body.removeChild(a);
      } else {
        throw new Error('Dosya indirilemedi');
      }
    } catch (error) {
      console.error('Download error:', error);
      setError('Dosya indirilirken hata oluştu');
    }
  };

  const getFileIcon = (mimeType: string) => {
    if (mimeType.startsWith('image/')) return <ImageIcon />;
    if (mimeType === 'application/pdf') return <PdfIcon />;
    if (mimeType.includes('excel') || mimeType.includes('spreadsheet')) return <ExcelIcon />;
    if (mimeType.startsWith('video/')) return <VideoIcon />;
    if (mimeType.startsWith('audio/')) return <AudioIcon />;
    if (mimeType.includes('zip') || mimeType.includes('rar')) return <ArchiveIcon />;
    if (mimeType.includes('text/') || mimeType.includes('code/')) return <CodeIcon />;
    return <DocumentIcon />;
  };

  const formatFileSize = (bytes: number) => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  const filteredDocuments = documents
    .filter(doc => {
      const matchesSearch = doc.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
                           doc.description?.toLowerCase().includes(searchQuery.toLowerCase()) ||
                           doc.tags.some(tag => tag.toLowerCase().includes(searchQuery.toLowerCase()));
      const matchesCategory = !filterCategory || doc.category === filterCategory;
      return matchesSearch && matchesCategory;
    })
    .sort((a, b) => {
      let comparison = 0;
      switch (sortBy) {
        case 'name':
          comparison = a.name.localeCompare(b.name);
          break;
        case 'date':
          comparison = new Date(a.uploadedAt).getTime() - new Date(b.uploadedAt).getTime();
          break;
        case 'size':
          comparison = a.size - b.size;
          break;
        case 'type':
          comparison = a.mimeType.localeCompare(b.mimeType);
          break;
      }
      return sortOrder === 'asc' ? comparison : -comparison;
    });

  const renderGridView = () => (
    <Grid container spacing={2}>
      {filteredDocuments.map((doc) => (
        <Grid item xs={12} sm={6} md={4} lg={3} key={doc.id}>
          <Card 
            sx={{ 
              height: '100%',
              display: 'flex',
              flexDirection: 'column',
              '&:hover': { boxShadow: 3 }
            }}
          >
            <CardContent sx={{ flexGrow: 1, p: 2 }}>
              <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                <Avatar sx={{ bgcolor: 'primary.main', mr: 2 }}>
                  {getFileIcon(doc.mimeType)}
                </Avatar>
                <Box sx={{ flexGrow: 1, minWidth: 0 }}>
                  <Typography variant="subtitle2" noWrap>
                    {doc.name}
                  </Typography>
                  <Typography variant="caption" color="text.secondary">
                    {formatFileSize(doc.size)}
                  </Typography>
                </Box>
              </Box>
              
              {doc.description && (
                <Typography variant="body2" color="text.secondary" sx={{ mb: 1 }}>
                  {doc.description}
                </Typography>
              )}
              
              <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 0.5, mb: 2 }}>
                <Chip label={doc.category} size="small" />
                {doc.tags.slice(0, 2).map((tag, index) => (
                  <Chip key={index} label={tag} size="small" variant="outlined" />
                ))}
                {doc.tags.length > 2 && (
                  <Chip label={`+${doc.tags.length - 2}`} size="small" variant="outlined" />
                )}
              </Box>
              
              <Typography variant="caption" color="text.secondary">
                {new Date(doc.uploadedAt).toLocaleDateString('tr-TR')}
              </Typography>
            </CardContent>
            
            <Box sx={{ p: 1, borderTop: 1, borderColor: 'divider' }}>
              <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
                <Tooltip title="İndir">
                  <IconButton size="small" onClick={() => handleDownload(doc)}>
                    <DownloadIcon />
                  </IconButton>
                </Tooltip>
                <Tooltip title="Görüntüle">
                  <IconButton size="small" onClick={() => {
                    setSelectedDocument(doc);
                    setOpenViewDialog(true);
                  }}>
                    <ViewIcon />
                  </IconButton>
                </Tooltip>
                {!readOnly && (
                  <Tooltip title="Sil">
                    <IconButton size="small" onClick={() => handleDelete(doc.id)} color="error">
                      <DeleteIcon />
                    </IconButton>
                  </Tooltip>
                )}
              </Box>
            </Box>
          </Card>
        </Grid>
      ))}
    </Grid>
  );

  const renderListView = () => (
    <List>
      {filteredDocuments.map((doc) => (
        <ListItem key={doc.id} divider>
          <Avatar sx={{ bgcolor: 'primary.main', mr: 2 }}>
            {getFileIcon(doc.mimeType)}
          </Avatar>
          <ListItemText
            primary={doc.name}
            secondary={
              <Box>
                <Typography variant="body2" color="text.secondary">
                  {formatFileSize(doc.size)} • {doc.category} • {new Date(doc.uploadedAt).toLocaleDateString('tr-TR')}
                </Typography>
                {doc.description && (
                  <Typography variant="body2" color="text.secondary">
                    {doc.description}
                  </Typography>
                )}
                {doc.tags.length > 0 && (
                  <Box sx={{ mt: 0.5 }}>
                    {doc.tags.map((tag, index) => (
                      <Chip key={index} label={tag} size="small" sx={{ mr: 0.5, mb: 0.5 }} />
                    ))}
                  </Box>
                )}
              </Box>
            }
          />
          <ListItemSecondaryAction>
            <Box sx={{ display: 'flex', gap: 1 }}>
              <Tooltip title="İndir">
                <IconButton size="small" onClick={() => handleDownload(doc)}>
                  <DownloadIcon />
                </IconButton>
              </Tooltip>
              <Tooltip title="Görüntüle">
                <IconButton size="small" onClick={() => {
                  setSelectedDocument(doc);
                  setOpenViewDialog(true);
                }}>
                  <ViewIcon />
                </IconButton>
              </Tooltip>
              {!readOnly && (
                <Tooltip title="Sil">
                  <IconButton size="small" onClick={() => handleDelete(doc.id)} color="error">
                    <DeleteIcon />
                  </IconButton>
                </Tooltip>
              )}
            </Box>
          </ListItemSecondaryAction>
        </ListItem>
      ))}
    </List>
  );

  return (
    <Box>
      <Card sx={{ borderRadius: 2, boxShadow: 1 }}>
        <CardContent>
          {/* Header */}
          <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
            <Typography variant="h6">
              Doküman Yönetimi ({documents.length})
            </Typography>
            {!readOnly && (
              <Button
                variant="contained"
                startIcon={<UploadIcon />}
                onClick={() => setOpenUploadDialog(true)}
                sx={{ borderRadius: 2 }}
              >
                Yükle
              </Button>
            )}
          </Box>

          {/* Filters and Controls */}
          <Box sx={{ display: 'flex', gap: 2, mb: 3, flexWrap: 'wrap', alignItems: 'center' }}>
            <TextField
              size="small"
              placeholder="Doküman ara..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              InputProps={{
                startAdornment: <SearchIcon sx={{ mr: 1, color: 'text.secondary' }} />
              }}
              sx={{ minWidth: 200 }}
            />
            
            {showCategories && (
              <FormControl size="small" sx={{ minWidth: 150 }}>
                <InputLabel>Kategori</InputLabel>
                <Select
                  value={filterCategory}
                  onChange={(e) => setFilterCategory(e.target.value)}
                  label="Kategori"
                >
                  <MenuItem value="">Tümü</MenuItem>
                  {categories.map((category) => (
                    <MenuItem key={category} value={category}>
                      {category}
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>
            )}
            
            <FormControl size="small" sx={{ minWidth: 120 }}>
              <InputLabel>Sırala</InputLabel>
              <Select
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value as any)}
                label="Sırala"
              >
                <MenuItem value="name">İsim</MenuItem>
                <MenuItem value="date">Tarih</MenuItem>
                <MenuItem value="size">Boyut</MenuItem>
                <MenuItem value="type">Tür</MenuItem>
              </Select>
            </FormControl>
            
            <IconButton
              onClick={() => setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc')}
              title={`Sıralama: ${sortOrder === 'asc' ? 'Artan' : 'Azalan'}`}
            >
              <SortIcon />
            </IconButton>
            
            <Box sx={{ ml: 'auto', display: 'flex', gap: 1 }}>
              <Tooltip title="Grid Görünümü">
                <IconButton
                  color={viewMode === 'grid' ? 'primary' : 'default'}
                  onClick={() => setViewMode('grid')}
                >
                  <GridViewIcon />
                </IconButton>
              </Tooltip>
              <Tooltip title="Liste Görünümü">
                <IconButton
                  color={viewMode === 'list' ? 'primary' : 'default'}
                  onClick={() => setViewMode('list')}
                >
                  <ListViewIcon />
                </IconButton>
              </Tooltip>
            </Box>
          </Box>

          {/* Documents */}
          {loading ? (
            <Box sx={{ display: 'flex', justifyContent: 'center', p: 4 }}>
              <Typography>Yükleniyor...</Typography>
            </Box>
          ) : filteredDocuments.length === 0 ? (
            <Paper sx={{ p: 4, textAlign: 'center' }}>
              <DocumentIcon sx={{ fontSize: 64, color: 'text.secondary', mb: 2 }} />
              <Typography variant="h6" color="text.secondary" gutterBottom>
                Henüz doküman yok
              </Typography>
              <Typography variant="body2" color="text.secondary">
                İlk dokümanınızı yüklemek için yukarıdaki "Yükle" butonunu kullanın.
              </Typography>
            </Paper>
          ) : (
            viewMode === 'grid' ? renderGridView() : renderListView()
          )}
        </CardContent>
      </Card>

      {/* Upload Dialog */}
      <Dialog open={openUploadDialog} onClose={() => setOpenUploadDialog(false)} maxWidth="md" fullWidth>
        <DialogTitle>Doküman Yükle</DialogTitle>
        <DialogContent>
          <FileUpload
            entityType={entityType as "issue" | "product" | "shipment" | "service_operation"}
            entityId={entityId}
            onUploadComplete={handleUpload}
            maxFiles={10}
            maxFileSize={50}
            acceptedTypes={['*/*']}
          />
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setOpenUploadDialog(false)}>Kapat</Button>
        </DialogActions>
      </Dialog>

      {/* View Dialog */}
      <Dialog open={openViewDialog} onClose={() => setOpenViewDialog(false)} maxWidth="md" fullWidth>
        <DialogTitle>Doküman Detayları</DialogTitle>
        <DialogContent>
          {selectedDocument && (
            <Box>
              <Box sx={{ display: 'flex', alignItems: 'center', mb: 3 }}>
                <Avatar sx={{ bgcolor: 'primary.main', mr: 2, width: 64, height: 64 }}>
                  {getFileIcon(selectedDocument.mimeType)}
                </Avatar>
                <Box>
                  <Typography variant="h6">{selectedDocument.name}</Typography>
                  <Typography variant="body2" color="text.secondary">
                    {formatFileSize(selectedDocument.size)} • {selectedDocument.mimeType}
                  </Typography>
                </Box>
              </Box>
              
              <Grid container spacing={2}>
                <Grid item xs={12} md={6}>
                  <Typography variant="subtitle2" gutterBottom>Kategori</Typography>
                  <Chip label={selectedDocument.category} />
                </Grid>
                <Grid item xs={12} md={6}>
                  <Typography variant="subtitle2" gutterBottom>Yüklenme Tarihi</Typography>
                  <Typography variant="body2">
                    {new Date(selectedDocument.uploadedAt).toLocaleString('tr-TR')}
                  </Typography>
                </Grid>
                <Grid item xs={12} md={6}>
                  <Typography variant="subtitle2" gutterBottom>İndirme Sayısı</Typography>
                  <Typography variant="body2">{selectedDocument.downloadCount}</Typography>
                </Grid>
                <Grid item xs={12} md={6}>
                  <Typography variant="subtitle2" gutterBottom>Versiyon</Typography>
                  <Typography variant="body2">{selectedDocument.version}</Typography>
                </Grid>
                {selectedDocument.description && (
                  <Grid item xs={12}>
                    <Typography variant="subtitle2" gutterBottom>Açıklama</Typography>
                    <Typography variant="body2">{selectedDocument.description}</Typography>
                  </Grid>
                )}
                {selectedDocument.tags.length > 0 && (
                  <Grid item xs={12}>
                    <Typography variant="subtitle2" gutterBottom>Etiketler</Typography>
                    <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 0.5 }}>
                      {selectedDocument.tags.map((tag, index) => (
                        <Chip key={index} label={tag} size="small" />
                      ))}
                    </Box>
                  </Grid>
                )}
              </Grid>
            </Box>
          )}
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setOpenViewDialog(false)}>Kapat</Button>
          {selectedDocument && (
            <Button
              variant="contained"
              startIcon={<DownloadIcon />}
              onClick={() => handleDownload(selectedDocument)}
            >
              İndir
            </Button>
          )}
        </DialogActions>
      </Dialog>

      {/* Messages */}
      {error && (
        <Snackbar
          open={!!error}
          autoHideDuration={4000}
          onClose={() => setError(null)}
          anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}
        >
          <Alert severity="error" onClose={() => setError(null)}>
            {error}
          </Alert>
        </Snackbar>
      )}

      {success && (
        <Snackbar
          open={!!success}
          autoHideDuration={4000}
          onClose={() => setSuccess(null)}
          anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}
        >
          <Alert severity="success" onClose={() => setSuccess(null)}>
            {success}
          </Alert>
        </Snackbar>
      )}
    </Box>
  );
};

export default DocumentManager;

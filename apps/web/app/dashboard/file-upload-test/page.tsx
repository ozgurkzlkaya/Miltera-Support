'use client';

import React, { useState } from 'react';
import {
  Box,
  Card,
  CardContent,
  Typography,
  Tabs,
  Tab,
  TextField,
  Button,
  Alert,
  Grid,
  Divider,
} from '@mui/material';
import { FileUploadZone } from '../../../components/file-upload/FileUploadZone';
import { FileAttachmentsList } from '../../../components/file-upload/FileAttachmentsList';

interface TabPanelProps {
  children?: React.ReactNode;
  index: number;
  value: number;
}

function TabPanel(props: TabPanelProps) {
  const { children, value, index, ...other } = props;

  return (
    <div
      role="tabpanel"
      hidden={value !== index}
      id={`file-upload-tabpanel-${index}`}
      aria-labelledby={`file-upload-tab-${index}`}
      {...other}
    >
      {value === index && <Box sx={{ p: 3 }}>{children}</Box>}
    </div>
  );
}

export default function FileUploadTestPage() {
  const [tabValue, setTabValue] = useState(0);
  const [entityId, setEntityId] = useState('550e8400-e29b-41d4-a716-446655440000'); // Test UUID
  const [uploadSuccess, setUploadSuccess] = useState<string | null>(null);
  const [uploadError, setUploadError] = useState<string | null>(null);

  const handleTabChange = (event: React.SyntheticEvent, newValue: number) => {
    setTabValue(newValue);
  };

  const handleUploadSuccess = (files: any[]) => {
    setUploadSuccess(`${files.length} dosya başarıyla yüklendi!`);
    setUploadError(null);
    // 3 saniye sonra mesajı temizle
    setTimeout(() => setUploadSuccess(null), 3000);
  };

  const handleUploadError = (error: string) => {
    setUploadError(error);
    setUploadSuccess(null);
    // 5 saniye sonra mesajı temizle
    setTimeout(() => setUploadError(null), 5000);
  };

  const handleDelete = (attachmentId: string) => {
    console.log('Dosya eki silindi:', attachmentId);
  };

  const entityTypes = [
    { value: 'issue', label: 'Arıza Kaydı' },
    { value: 'product', label: 'Ürün' },
    { value: 'shipment', label: 'Sevkiyat' },
    { value: 'service_operation', label: 'Servis Operasyonu' },
  ];

  const currentEntityType = entityTypes[tabValue].value as any;

  return (
    <Box sx={{ p: 3 }}>
      <Typography variant="h4" gutterBottom>
        Dosya Yükleme Test
      </Typography>

      <Card sx={{ mb: 3 }}>
        <CardContent>
          <Typography variant="h6" gutterBottom>
            Test Ayarları
          </Typography>
          <Grid container spacing={2} alignItems="center">
            <Grid item xs={12} md={6}>
              <TextField
                fullWidth
                label="Entity ID (Test UUID)"
                value={entityId}
                onChange={(e) => setEntityId(e.target.value)}
                helperText="Test için kullanılacak entity ID"
              />
            </Grid>
            <Grid item xs={12} md={6}>
              <Typography variant="body2" color="text.secondary">
                Mevcut Entity Type: <strong>{entityTypes[tabValue].label}</strong>
              </Typography>
            </Grid>
          </Grid>
        </CardContent>
      </Card>

      {/* Success/Error Messages */}
      {uploadSuccess && (
        <Alert severity="success" sx={{ mb: 2 }}>
          {uploadSuccess}
        </Alert>
      )}
      {uploadError && (
        <Alert severity="error" sx={{ mb: 2 }}>
          {uploadError}
        </Alert>
      )}

      {/* Tabs */}
      <Card>
        <Box sx={{ borderBottom: 1, borderColor: 'divider' }}>
          <Tabs value={tabValue} onChange={handleTabChange} aria-label="file upload tabs">
            {entityTypes.map((type, index) => (
              <Tab key={type.value} label={type.label} />
            ))}
          </Tabs>
        </Box>

        <TabPanel value={tabValue} index={0}>
          <Typography variant="h6" gutterBottom>
            Arıza Kaydı Dosya Yükleme
          </Typography>
          <Divider sx={{ mb: 3 }} />
          
          <Grid container spacing={3}>
            <Grid item xs={12} md={6}>
              <Typography variant="subtitle1" gutterBottom>
                Dosya Yükleme Alanı
              </Typography>
              <FileUploadZone
                entityType="issue"
                entityId={entityId}
                onUploadSuccess={handleUploadSuccess}
                onUploadError={handleUploadError}
                maxFiles={5}
                maxFileSize={5}
              />
            </Grid>
            <Grid item xs={12} md={6}>
              <Typography variant="subtitle1" gutterBottom>
                Yüklenen Dosyalar
              </Typography>
              <FileAttachmentsList
                entityType="issue"
                entityId={entityId}
                onDelete={handleDelete}
                maxHeight={400}
              />
            </Grid>
          </Grid>
        </TabPanel>

        <TabPanel value={tabValue} index={1}>
          <Typography variant="h6" gutterBottom>
            Ürün Dosya Yükleme
          </Typography>
          <Divider sx={{ mb: 3 }} />
          
          <Grid container spacing={3}>
            <Grid item xs={12} md={6}>
              <Typography variant="subtitle1" gutterBottom>
                Dosya Yükleme Alanı
              </Typography>
              <FileUploadZone
                entityType="product"
                entityId={entityId}
                onUploadSuccess={handleUploadSuccess}
                onUploadError={handleUploadError}
                maxFiles={10}
                maxFileSize={10}
              />
            </Grid>
            <Grid item xs={12} md={6}>
              <Typography variant="subtitle1" gutterBottom>
                Yüklenen Dosyalar
              </Typography>
              <FileAttachmentsList
                entityType="product"
                entityId={entityId}
                onDelete={handleDelete}
                maxHeight={400}
              />
            </Grid>
          </Grid>
        </TabPanel>

        <TabPanel value={tabValue} index={2}>
          <Typography variant="h6" gutterBottom>
            Sevkiyat Dosya Yükleme
          </Typography>
          <Divider sx={{ mb: 3 }} />
          
          <Grid container spacing={3}>
            <Grid item xs={12} md={6}>
              <Typography variant="subtitle1" gutterBottom>
                Dosya Yükleme Alanı
              </Typography>
              <FileUploadZone
                entityType="shipment"
                entityId={entityId}
                onUploadSuccess={handleUploadSuccess}
                onUploadError={handleUploadError}
                maxFiles={3}
                maxFileSize={15}
              />
            </Grid>
            <Grid item xs={12} md={6}>
              <Typography variant="subtitle1" gutterBottom>
                Yüklenen Dosyalar
              </Typography>
              <FileAttachmentsList
                entityType="shipment"
                entityId={entityId}
                onDelete={handleDelete}
                maxHeight={400}
              />
            </Grid>
          </Grid>
        </TabPanel>

        <TabPanel value={tabValue} index={3}>
          <Typography variant="h6" gutterBottom>
            Servis Operasyonu Dosya Yükleme
          </Typography>
          <Divider sx={{ mb: 3 }} />
          
          <Grid container spacing={3}>
            <Grid item xs={12} md={6}>
              <Typography variant="subtitle1" gutterBottom>
                Dosya Yükleme Alanı
              </Typography>
              <FileUploadZone
                entityType="service_operation"
                entityId={entityId}
                onUploadSuccess={handleUploadSuccess}
                onUploadError={handleUploadError}
                maxFiles={8}
                maxFileSize={8}
              />
            </Grid>
            <Grid item xs={12} md={6}>
              <Typography variant="subtitle1" gutterBottom>
                Yüklenen Dosyalar
              </Typography>
              <FileAttachmentsList
                entityType="service_operation"
                entityId={entityId}
                onDelete={handleDelete}
                maxHeight={400}
              />
            </Grid>
          </Grid>
        </TabPanel>
      </Card>

      {/* Instructions */}
      <Card sx={{ mt: 3 }}>
        <CardContent>
          <Typography variant="h6" gutterBottom>
            Test Talimatları
          </Typography>
          <Typography variant="body2" paragraph>
            1. <strong>Dosya Yükleme:</strong> Yukarıdaki alanlara dosya sürükleyip bırakın veya tıklayarak seçin
          </Typography>
          <Typography variant="body2" paragraph>
            2. <strong>Desteklenen Formatlar:</strong> Resim (JPEG, PNG, GIF, WebP), PDF, Word, Excel, ZIP, RAR
          </Typography>
          <Typography variant="body2" paragraph>
            3. <strong>Dosya Boyutu:</strong> Her entity type için farklı maksimum boyutlar ayarlanmıştır
          </Typography>
          <Typography variant="body2" paragraph>
            4. <strong>Görüntüleme:</strong> Yüklenen dosyalar sağ tarafta listelenir, resimler lightbox ile görüntülenebilir
          </Typography>
          <Typography variant="body2" paragraph>
            5. <strong>Silme:</strong> Dosya eklerini çöp kutusu ikonuna tıklayarak silebilirsiniz
          </Typography>
        </CardContent>
      </Card>
    </Box>
  );
}

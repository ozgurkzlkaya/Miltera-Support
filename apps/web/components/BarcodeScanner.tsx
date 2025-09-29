'use client';

import React, { useRef, useEffect, useState } from 'react';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  Box,
  Typography,
  Alert,
  IconButton,
  Paper
} from '@mui/material';
import {
  Close as CloseIcon,
  QrCodeScanner as QrCodeIcon,
  CameraAlt as CameraIcon
} from '@mui/icons-material';
import { BrowserMultiFormatReader } from '@zxing/browser';

interface BarcodeScannerProps {
  open: boolean;
  onClose: () => void;
  onScan: (result: string) => void;
  title?: string;
  description?: string;
}

export const BarcodeScanner: React.FC<BarcodeScannerProps> = ({
  open,
  onClose,
  onScan,
  title = "Barkod/QR Kod Tarayıcı",
  description = "Kamerayı barkod veya QR koda doğrultun"
}) => {
  const videoRef = useRef<HTMLVideoElement>(null);
  const [isScanning, setIsScanning] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [hasPermission, setHasPermission] = useState<boolean | null>(null);
  const readerRef = useRef<BrowserMultiFormatReader | null>(null);

  useEffect(() => {
    if (open) {
      initializeScanner();
    } else {
      stopScanning();
    }

    return () => {
      stopScanning();
    };
  }, [open]);

  const initializeScanner = async () => {
    try {
      setError(null);
      setIsScanning(false);
      setHasPermission(null);

      // Check if camera is available
      const devices = await navigator.mediaDevices.enumerateDevices();
      const videoDevices = devices.filter(device => device.kind === 'videoinput');
      
      if (videoDevices.length === 0) {
        setError('Kamera bulunamadı. Lütfen bir kamera bağladığınızdan emin olun.');
        setHasPermission(false);
        return;
      }

      // Request camera permission
      try {
        const stream = await navigator.mediaDevices.getUserMedia({ 
          video: { 
            facingMode: 'environment', // Use back camera if available
            width: { ideal: 1280 },
            height: { ideal: 720 }
          } 
        });
        setHasPermission(true);
        stream.getTracks().forEach(track => track.stop()); // Stop the test stream
      } catch (permissionError) {
        setError('Kamera erişim izni verilmedi. Lütfen tarayıcı ayarlarından kamera iznini etkinleştirin.');
        setHasPermission(false);
        return;
      }

      // Initialize ZXing reader
      readerRef.current = new BrowserMultiFormatReader();
      
      // Start scanning
      await startScanning();
    } catch (err) {
      console.error('Scanner initialization error:', err);
      setError('Tarayıcı başlatılırken hata oluştu.');
      setHasPermission(false);
    }
  };

  const startScanning = async () => {
    if (!readerRef.current || !videoRef.current) return;

    try {
      setIsScanning(true);
      setError(null);

      await readerRef.current.decodeFromVideoDevice(
        undefined, // Use default camera
        videoRef.current,
        (result, error) => {
          if (result) {
            const text = result.getText();
            console.log('Barcode detected:', text);
            onScan(text);
            stopScanning();
            onClose();
          }
          
          if (error && error.name !== 'NotFoundException') {
            console.error('Scanning error:', error);
            setError('Tarama sırasında hata oluştu.');
          }
        }
      );
    } catch (err) {
      console.error('Start scanning error:', err);
      setError('Tarama başlatılırken hata oluştu.');
      setIsScanning(false);
    }
  };

  const stopScanning = () => {
    if (readerRef.current) {
      // BrowserMultiFormatReader doesn't have reset method, just set to null
      readerRef.current = null;
    }
    setIsScanning(false);
  };

  const handleRetry = () => {
    setError(null);
    initializeScanner();
  };

  const handleManualInput = () => {
    const manualCode = prompt('Manuel olarak barkod/QR kod girin:');
    if (manualCode && manualCode.trim()) {
      onScan(manualCode.trim());
      onClose();
    }
  };

  return (
    <Dialog 
      open={open} 
      onClose={onClose} 
      maxWidth="md" 
      fullWidth
      PaperProps={{
        sx: { minHeight: '500px' }
      }}
    >
      <DialogTitle>
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
            <QrCodeIcon />
            <Typography variant="h6">{title}</Typography>
          </Box>
          <IconButton onClick={onClose} size="small">
            <CloseIcon />
          </IconButton>
        </Box>
      </DialogTitle>
      
      <DialogContent>
        <Box sx={{ textAlign: 'center', mb: 2 }}>
          <Typography variant="body2" color="text.secondary">
            {description}
          </Typography>
        </Box>

        {error && (
          <Alert severity="error" sx={{ mb: 2 }}>
            {error}
          </Alert>
        )}

        {hasPermission === false && (
          <Alert severity="warning" sx={{ mb: 2 }}>
            Kamera erişimi gerekli. Lütfen tarayıcı ayarlarından kamera iznini etkinleştirin.
          </Alert>
        )}

        <Box sx={{ position: 'relative', width: '100%', maxWidth: '500px', mx: 'auto' }}>
          <Paper 
            elevation={3} 
            sx={{ 
              position: 'relative',
              overflow: 'hidden',
              borderRadius: 2,
              backgroundColor: '#000'
            }}
          >
            <video
              ref={videoRef}
              style={{
                width: '100%',
                height: '300px',
                objectFit: 'cover',
                display: hasPermission === true ? 'block' : 'none'
              }}
              autoPlay
              playsInline
              muted
            />
            
            {hasPermission === null && (
              <Box 
                sx={{ 
                  height: '300px', 
                  display: 'flex', 
                  alignItems: 'center', 
                  justifyContent: 'center',
                  backgroundColor: '#f5f5f5'
                }}
              >
                <Typography color="text.secondary">
                  Kamera başlatılıyor...
                </Typography>
              </Box>
            )}

            {hasPermission === false && (
              <Box 
                sx={{ 
                  height: '300px', 
                  display: 'flex', 
                  alignItems: 'center', 
                  justifyContent: 'center',
                  backgroundColor: '#f5f5f5',
                  flexDirection: 'column',
                  gap: 2
                }}
              >
                <CameraIcon sx={{ fontSize: 48, color: 'text.secondary' }} />
                <Typography color="text.secondary" textAlign="center">
                  Kamera erişimi gerekli
                </Typography>
              </Box>
            )}

            {/* Scanning overlay */}
            {isScanning && hasPermission === true && (
              <Box
                sx={{
                  position: 'absolute',
                  top: 0,
                  left: 0,
                  right: 0,
                  bottom: 0,
                  pointerEvents: 'none',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center'
                }}
              >
                <Box
                  sx={{
                    width: '200px',
                    height: '200px',
                    border: '2px solid #4caf50',
                    borderRadius: 2,
                    position: 'relative',
                    '&::before': {
                      content: '""',
                      position: 'absolute',
                      top: '-2px',
                      left: '-2px',
                      right: '-2px',
                      bottom: '-2px',
                      border: '2px solid rgba(76, 175, 80, 0.3)',
                      borderRadius: 2,
                      animation: 'pulse 2s infinite'
                    }
                  }}
                />
              </Box>
            )}
          </Paper>

          {isScanning && (
            <Typography 
              variant="body2" 
              color="text.secondary" 
              textAlign="center" 
              sx={{ mt: 2 }}
            >
              Tarama yapılıyor... Barkod/QR kodu kameraya doğrultun
            </Typography>
          )}
        </Box>
      </DialogContent>

      <DialogActions sx={{ p: 2, gap: 1 }}>
        <Button onClick={handleManualInput} variant="outlined">
          Manuel Giriş
        </Button>
        {error && (
          <Button onClick={handleRetry} variant="outlined" color="primary">
            Tekrar Dene
          </Button>
        )}
        <Button onClick={onClose} variant="contained">
          Kapat
        </Button>
      </DialogActions>

      <style jsx>{`
        @keyframes pulse {
          0% {
            transform: scale(1);
            opacity: 1;
          }
          50% {
            transform: scale(1.05);
            opacity: 0.7;
          }
          100% {
            transform: scale(1);
            opacity: 1;
          }
        }
      `}</style>
    </Dialog>
  );
};

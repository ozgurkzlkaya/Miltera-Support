"use client";

import { useEffect } from "react";
import { 
  Box, 
  Typography, 
  Paper, 
  Button, 
  Stack,
  Alert,
  Container
} from "@mui/material";
import { 
  Error as ErrorIcon, 
  Refresh as RefreshIcon,
  Home as HomeIcon 
} from "@mui/icons-material";
import { useRouter } from "next/navigation";
import Image from "next/image";

export default function Error({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  const router = useRouter();

  useEffect(() => {
    console.error(error);
  }, [error]);

  return (
    <Container maxWidth="md">
      <Box
        sx={{
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          justifyContent: "center",
          minHeight: "90vh",
          p: 3,
        }}
      >
        <Paper
          elevation={3}
          sx={{
            p: 4,
            textAlign: "center",
            maxWidth: 500,
            width: "100%",
          }}
        >
          <Box sx={{ mb: 3 }}>
            <Image
              src="/miltera-logo.png"
              alt="Miltera Logo"
              width={120}
              height={40}
              style={{
                width: "auto",
                height: "auto",
                maxWidth: "100%",
              }}
              priority
            />
          </Box>
          
          <ErrorIcon 
            sx={{ 
              fontSize: 64, 
              color: "error.main", 
              mb: 2 
            }} 
          />
          
          <Typography variant="h4" gutterBottom color="error">
            Something went wrong!
          </Typography>
          
          <Typography variant="body1" color="text.secondary" sx={{ mb: 3 }}>
            We encountered an unexpected error. Please try refreshing the page or contact support if the problem persists.
          </Typography>

          {process.env.NODE_ENV === 'development' && (
            <Alert severity="error" sx={{ mb: 3, textAlign: "left" }}>
              <Typography variant="caption" component="div">
                <strong>Error:</strong> {error.message}
              </Typography>
              {error.digest && (
                <Typography variant="caption" component="div">
                  <strong>Digest:</strong> {error.digest}
                </Typography>
              )}
            </Alert>
          )}

          <Stack direction="row" spacing={2} justifyContent="center">
            <Button
              variant="contained"
              startIcon={<RefreshIcon />}
              onClick={reset}
              size="large"
            >
              Try Again
            </Button>
            
            <Button
              variant="outlined"
              startIcon={<HomeIcon />}
              onClick={() => router.push("/dashboard")}
              size="large"
            >
              Go to Dashboard
            </Button>
          </Stack>
        </Paper>
      </Box>
    </Container>
  );
}

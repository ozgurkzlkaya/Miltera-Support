"use client";

import { useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import {
  Box,
  Card,
  CardContent,
  TextField,
  Button,
  Typography,
  Alert,
  Container,
  Stack,
} from "@mui/material";
import { useMutation } from "@tanstack/react-query";

interface ChangePasswordFormData {
  currentPassword: string;
  newPassword: string;
  confirmPassword: string;
}

export default function ChangePasswordPage() {
  const [formData, setFormData] = useState<ChangePasswordFormData>({
    currentPassword: "",
    newPassword: "",
    confirmPassword: "",
  });
  const [validationError, setValidationError] = useState<string>("");
  const router = useRouter();
  const searchParams = useSearchParams();
  const email = searchParams.get("email") || "";

  const changePasswordMutation = useMutation({
    mutationFn: async (data: ChangePasswordFormData & { email: string }) => {
      // Mock API call - in real implementation, this would call the backend
      return new Promise((resolve, reject) => {
        setTimeout(() => {
          // Mock validation
          if (data.currentPassword !== "admin123" && data.currentPassword !== "tsp123") {
            reject(new Error("Current password is incorrect"));
            return;
          }
          
          if (data.newPassword.length < 6) {
            reject(new Error("New password must be at least 6 characters"));
            return;
          }
          
          // Mock success response
          resolve({
            success: true,
            message: "Password changed successfully",
            token: "mock-jwt-token",
          });
        }, 1000);
      });
    },
    onSuccess: (data: any) => {
      // Store auth token if provided
      if (data.token) {
        localStorage.setItem("authToken", data.token);
      }
      // Redirect to dashboard after successful password change
      router.push("/dashboard");
    },
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setValidationError("");

    // Client-side validation
    if (formData.newPassword !== formData.confirmPassword) {
      setValidationError("New passwords do not match");
      return;
    }

    if (formData.newPassword.length < 6) {
      setValidationError("New password must be at least 6 characters");
      return;
    }

    if (formData.newPassword === formData.currentPassword) {
      setValidationError("New password must be different from current password");
      return;
    }

    changePasswordMutation.mutate({
      ...formData,
      email,
    });
  };

  const handleInputChange = (field: keyof ChangePasswordFormData) => (
    e: React.ChangeEvent<HTMLInputElement>
  ) => {
    setFormData((prev) => ({
      ...prev,
      [field]: e.target.value,
    }));
    // Clear validation error when user starts typing
    if (validationError) {
      setValidationError("");
    }
  };

  const error = changePasswordMutation.error || validationError;
  const isLoading = changePasswordMutation.isPending;

  return (
    <Container maxWidth="sm" sx={{ minHeight: "100vh", display: "flex", alignItems: "center" }}>
      <Card sx={{ width: "100%", maxWidth: 400, mx: "auto" }}>
        <CardContent sx={{ p: 4 }}>
          <Box sx={{ textAlign: "center", mb: 4 }}>
            <Typography variant="h4" component="h1" gutterBottom>
              Change Password
            </Typography>
            <Typography variant="body2" color="text.secondary">
              You must change your password before continuing
            </Typography>
            {email && (
              <Typography variant="body2" sx={{ mt: 1, fontWeight: 500 }}>
                {email}
              </Typography>
            )}
          </Box>

          {error && (
            <Alert severity="error" sx={{ mb: 3 }}>
              {error instanceof Error ? error.message : error}
            </Alert>
          )}

          <Box component="form" onSubmit={handleSubmit}>
            <Stack spacing={3}>
              <TextField
                fullWidth
                label="Current Password"
                type="password"
                value={formData.currentPassword}
                onChange={handleInputChange("currentPassword")}
                required
                disabled={isLoading}
                helperText="Use 'admin123' or 'tsp123' for demo"
              />
              <TextField
                fullWidth
                label="New Password"
                type="password"
                value={formData.newPassword}
                onChange={handleInputChange("newPassword")}
                required
                disabled={isLoading}
                helperText="Minimum 6 characters"
              />
              <TextField
                fullWidth
                label="Confirm New Password"
                type="password"
                value={formData.confirmPassword}
                onChange={handleInputChange("confirmPassword")}
                required
                disabled={isLoading}
              />
              <Button
                type="submit"
                fullWidth
                variant="contained"
                size="large"
                disabled={isLoading}
                sx={{ py: 1.5 }}
              >
                {isLoading ? "Changing Password..." : "Change Password"}
              </Button>
            </Stack>
          </Box>
        </CardContent>
      </Card>
    </Container>
  );
} 
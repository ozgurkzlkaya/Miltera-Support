"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
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
  Link,
} from "@mui/material";
import { useMutation } from "@tanstack/react-query";

interface LoginFormData {
  email: string;
  password: string;
}

interface ForgotPasswordData {
  email: string;
}

export default function AuthPage() {
  const [formData, setFormData] = useState<LoginFormData>({
    email: "",
    password: "",
  });
  const [forgotPasswordEmail, setForgotPasswordEmail] = useState("");
  const [showForgotPassword, setShowForgotPassword] = useState(false);
  const [forgotPasswordSent, setForgotPasswordSent] = useState(false);
  const router = useRouter();

  const loginMutation = useMutation({
    mutationFn: async (data: LoginFormData) => {
      // Mock authentication logic - replace with actual API call later
      return new Promise<any>((resolve, reject) => {
        setTimeout(() => {
          // Mock user database
          const mockUsers = [
            {
              email: "admin@example.com",
              password: "admin123",
              mustChangePassword: true,
              user: {
                id: "1",
                email: "admin@example.com",
                firstName: "Admin",
                lastName: "User",
                role: "ADMIN",
              },
            },
            {
              email: "tsp@example.com", 
              password: "tsp123",
              mustChangePassword: true,
              user: {
                id: "2",
                email: "tsp@example.com",
                firstName: "TSP",
                lastName: "User", 
                role: "TSP",
              },
            },
            {
              email: "customer@example.com",
              password: "customer123", 
              mustChangePassword: false,
              user: {
                id: "3",
                email: "customer@example.com",
                firstName: "Customer",
                lastName: "User",
                role: "CUSTOMER",
              },
            },
          ];

          const user = mockUsers.find(
            (u) => u.email === data.email && u.password === data.password
          );

          if (!user) {
            reject(new Error("Invalid email or password"));
            return;
          }

          resolve({
            success: true,
            message: "Login successful",
            mustChangePassword: user.mustChangePassword,
            token: user.mustChangePassword ? undefined : "mock-jwt-token",
            user: user.user,
          });
        }, 1000);
      });
    },
    onSuccess: (data) => {
      if (data.mustChangePassword) {
        // Redirect to change password page with email parameter
        router.push(`/auth/change-password?email=${encodeURIComponent(formData.email)}`);
      } else {
        // Store auth token and redirect to dashboard
        if (data.token) {
          localStorage.setItem("authToken", data.token);
        }
        router.push("/dashboard");
      }
    },
  });

  const forgotPasswordMutation = useMutation({
    mutationFn: async (data: ForgotPasswordData) => {
      // TODO: Replace with actual forgot password endpoint when available
      const response = await fetch("/api/auth/forgot-password", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(data),
      });
      
      if (!response.ok) {
        throw new Error("Failed to send reset email");
      }
      
      return response.json();
    },
    onSuccess: () => {
      setForgotPasswordSent(true);
    },
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    loginMutation.mutate(formData);
  };

  const handleForgotPasswordSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    forgotPasswordMutation.mutate({ email: forgotPasswordEmail });
  };

  const handleInputChange = (field: keyof LoginFormData) => (
    e: React.ChangeEvent<HTMLInputElement>
  ) => {
    setFormData((prev) => ({
      ...prev,
      [field]: e.target.value,
    }));
  };

  const handleBackToLogin = () => {
    setShowForgotPassword(false);
    setForgotPasswordSent(false);
    setForgotPasswordEmail("");
    forgotPasswordMutation.reset();
  };

  const error = loginMutation.error || forgotPasswordMutation.error;
  const isLoading = loginMutation.isPending || forgotPasswordMutation.isPending;

  return (
    <Container maxWidth="sm" sx={{ minHeight: "100vh", display: "flex", alignItems: "center" }}>
      <Card sx={{ width: "100%", maxWidth: 400, mx: "auto" }}>
        <CardContent sx={{ p: 4 }}>
          <Box sx={{ textAlign: "center", mb: 4 }}>
            <Typography variant="h4" component="h1" gutterBottom>
              {showForgotPassword ? "Reset Password" : "Sign In"}
            </Typography>
            <Typography variant="body2" color="text.secondary">
              {showForgotPassword
                ? "Enter your email to receive a password reset link"
                : "Welcome back! Please sign in to continue"}
            </Typography>
          </Box>

          {error && (
            <Alert severity="error" sx={{ mb: 3 }}>
              {error instanceof Error ? error.message : "Authentication failed"}
            </Alert>
          )}

          {forgotPasswordSent && (
            <Alert severity="success" sx={{ mb: 3 }}>
              Password reset link has been sent to your email address.
            </Alert>
          )}

          {!showForgotPassword ? (
            <Box component="form" onSubmit={handleSubmit}>
              <Stack spacing={3}>
                <TextField
                  fullWidth
                  label="Email"
                  type="email"
                  value={formData.email}
                  onChange={handleInputChange("email")}
                  required
                  disabled={isLoading}
                />
                <TextField
                  fullWidth
                  label="Password"
                  type="password"
                  value={formData.password}
                  onChange={handleInputChange("password")}
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
                  {isLoading ? "Signing In..." : "Sign In"}
                </Button>
                
                <Box sx={{ textAlign: "center", mt: 2 }}>
                  <Link
                    component="button"
                    type="button"
                    variant="body2"
                    onClick={() => setShowForgotPassword(true)}
                    sx={{ cursor: "pointer" }}
                  >
                    Forgot your password?
                  </Link>
                </Box>
              </Stack>
            </Box>
          ) : (
            <Box component="form" onSubmit={handleForgotPasswordSubmit}>
              <Stack spacing={3}>
                <TextField
                  fullWidth
                  label="Email"
                  type="email"
                  value={forgotPasswordEmail}
                  onChange={(e) => setForgotPasswordEmail(e.target.value)}
                  required
                  disabled={isLoading || forgotPasswordSent}
                />
                <Button
                  type="submit"
                  fullWidth
                  variant="contained"
                  size="large"
                  disabled={isLoading || forgotPasswordSent}
                  sx={{ py: 1.5 }}
                >
                  {isLoading ? "Sending..." : "Send Reset Link"}
                </Button>
                
                <Box sx={{ textAlign: "center", mt: 2 }}>
                  <Link
                    component="button"
                    type="button"
                    variant="body2"
                    onClick={handleBackToLogin}
                    sx={{ cursor: "pointer" }}
                  >
                    Back to Sign In
                  </Link>
                </Box>
              </Stack>
            </Box>
          )}
        </CardContent>
      </Card>
    </Container>
  );
} 
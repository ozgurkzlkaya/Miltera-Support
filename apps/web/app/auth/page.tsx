"use client";

import { startTransition, useEffect, useState } from "react";
import {
  Box,
  Card,
  CardContent,
  TextField,
  Button,
  Typography,
  Alert,
  Stack,
  Link,
  CircularProgress,
} from "@mui/material";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { authClient, signIn } from "../../features/auth/auth.service";
import { useAuth } from "../../features/auth/useAuth";

interface LoginFormData {
  email: string;
  password: string;
}

interface ForgotPasswordData {
  email: string;
}

export default function AuthPage() {
  const router = useRouter();
  const auth = useAuth();

  const { register, handleSubmit, formState } = useForm({
    defaultValues: {
      email: "",
      password: "",
    },
  });

  const isSubmitting = formState.isSubmitting;
  const isLoading = formState.isLoading || isSubmitting;

  const onSubmit = async (data: LoginFormData) => {
    return new Promise<void>((resolve, reject) => {
      signIn.email(
        {
          email: data.email,
          password: data.password,
        },
        {
          onSuccess: () => {
            router.push("/dashboard");
            resolve();
          },
          onError: (error) => {
            reject(error);
          },
        }
      );
    });
  };

  useEffect(() => {
    if (auth.isAuthenticated) {
      router.push("/dashboard");
    }
  }, [auth.isAuthenticated]);

  return (
    <Card sx={{ width: "100%", maxWidth: 400, mx: "auto" }}>
      <CardContent sx={{ p: 4 }}>
        <Box sx={{ textAlign: "center", mb: 4 }}>
          <Typography variant="h4" component="h1" gutterBottom>
            Sign In
          </Typography>
          <Typography variant="body2" color="text.secondary">
            Welcome back! Please sign in to continue
          </Typography>
        </Box>

        <Box component="form" onSubmit={handleSubmit(onSubmit)}>
          {formState.errors.root && (
            <Alert severity="error" sx={{ mb: 3 }}>
              {formState.errors.root.message}
            </Alert>
          )}

          <Stack spacing={3}>
            <TextField
              fullWidth
              label="Email"
              type="email"
              {...register("email", {
                required: true,
              })}
              disabled={isLoading}
            />
            <TextField
              fullWidth
              label="Password"
              type="password"
              {...register("password", {
                required: true,
              })}
              disabled={isLoading}
            />

            <Button
              type="submit"
              fullWidth
              variant="contained"
              size="large"
              disabled={isLoading}
              sx={{ py: 1.5 }}
              startIcon={
                isSubmitting ? <CircularProgress size={16} /> : undefined
              }
            >
              {isSubmitting ? "Signing In..." : "Sign In"}
            </Button>

            <Box sx={{ textAlign: "center", mt: 2 }}>
              <Link
                component="button"
                type="button"
                variant="body2"
                onClick={() => router.push("/auth/forgot-password")}
                sx={{ cursor: "pointer" }}
              >
                Forgot your password?
              </Link>
            </Box>
          </Stack>
        </Box>
      </CardContent>
    </Card>
  );
}

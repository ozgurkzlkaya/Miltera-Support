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
  CircularProgress,
} from "@mui/material";
import { useMutation } from "@tanstack/react-query";
import { useAuth } from "../../../features/auth/useAuth";
import { useForm } from "react-hook-form";
import { authClient } from "../../../features/auth/auth.service";

interface ChangePasswordFormData {
  currentPassword: string;
  newPassword: string;
  confirmPassword: string;
}

export default function ChangePasswordPage() {
  const router = useRouter();
  const auth = useAuth();
  const searchParams = useSearchParams();

  const token = searchParams.get("token");
  const reason = searchParams.get("reason");

  const { register, handleSubmit, formState, getValues } = useForm({
    defaultValues: {
      currentPassword: "",
      newPassword: "",
      confirmPassword: "",
    },
  });

  const isSubmitting = formState.isSubmitting;
  const isLoading = formState.isLoading || isSubmitting;

  const onSubmit = async (data: ChangePasswordFormData) => {
    if (!token) {
      throw new Error('Token is required');
    }
    
    return new Promise<void>((resolve, reject) => {
      authClient.resetPassword({
        newPassword: data.newPassword,
        token,
      })
      .then(() => {
        router.push("/auth");
        resolve();
      })
      .catch((error) => {
        reject(error);
      });
    });
  };

  const errors = formState.errors;

  return (
    <Card sx={{ width: "100%", maxWidth: 400, mx: "auto" }}>
      <CardContent sx={{ p: 4 }}>
        <Box sx={{ textAlign: "center", mb: 4 }}>
          <Typography variant="h4" component="h1" gutterBottom>
            Change Password
          </Typography>
          <Typography variant="body2" color="text.secondary">
            You must change your password before continuing
          </Typography>
          {/* {email && (
              <Typography variant="body2" sx={{ mt: 1, fontWeight: 500 }}>
                {email}
              </Typography>
            )} */}
        </Box>

        {/* {error && (
            <Alert severity="error" sx={{ mb: 3 }}>
              {error instanceof Error ? error.message : error}
            </Alert>
          )} */}

        <Box component="form" onSubmit={handleSubmit(onSubmit)}>
          <Stack spacing={3}>
            {reason !== "forgot" && (
              <TextField
                fullWidth
                label="Current Password"
                type="password"
                {...register("currentPassword", { required: true })}
                disabled={isLoading}
              />
            )}
            <TextField
              fullWidth
              label="New Password"
              type="password"
              {...register("newPassword", { required: true })}
              required
              disabled={isLoading}
              helperText="Minimum 6 characters"
            />
            <TextField
              fullWidth
              label="Confirm New Password"
              type="password"
              {...register("confirmPassword", {
                required: true,
                validate: (value) =>
                  value === getValues("newPassword") ||
                  "Passwords should match!",
              })}
              required
              disabled={isLoading}
            />
            {errors.confirmPassword && (
              <Typography variant="body2" color="error">
                {errors.confirmPassword.message}
              </Typography>
            )}
            <Button
              type="submit"
              fullWidth
              variant="contained"
              size="large"
              disabled={isLoading}
              sx={{ py: 1.5 }}
              startIcon={isLoading ? <CircularProgress size={20} /> : undefined}
            >
              {isLoading ? "Changing Password..." : "Change Password"}
            </Button>
          </Stack>
        </Box>
      </CardContent>
    </Card>
  );
}

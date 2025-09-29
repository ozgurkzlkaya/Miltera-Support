"use client";

import { useEffect, useState } from "react";
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
} from "@mui/material";
import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { authClient } from "../../../features/auth/auth.service";
import { useAuth } from "../../../features/auth/useAuth";

const ForgotPasswordPage = () => {
  const router = useRouter();
  const auth = useAuth();

  const { register, handleSubmit, formState } = useForm({
    defaultValues: {
      email: "",
    },
  });

  const [forgotPasswordSent, setForgotPasswordSent] = useState(false);

  const isSubmitting = formState.isSubmitting;
  const isLoading = formState.isLoading || isSubmitting;

  const onSubmit = (data: any) => {
    return new Promise<void>((resolve, reject) => {
      authClient.requestPasswordReset({
        email: data.email,
        redirectTo: "/auth/change-password?reason=forgot",
      })
      .then(() => {
        resolve();
      })
      .catch((error) => {
        reject(error);
      });
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
            Reset Password
          </Typography>
          <Typography variant="body2" color="text.secondary">
            Enter your email to receive a password reset link
          </Typography>
        </Box>

        {forgotPasswordSent && (
          <Alert severity="success" sx={{ mb: 3 }}>
            Password reset link has been sent to your email address.
          </Alert>
        )}

        <Box component="form" onSubmit={handleSubmit(onSubmit)}>
          <Stack spacing={3}>
            <TextField
              fullWidth
              label="Email"
              type="email"
              {...register("email", {
                required: true,
              })}
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
              {isSubmitting ? "Sending..." : "Send Reset Link"}
            </Button>

            <Box sx={{ textAlign: "center", mt: 2 }}>
              <Link
                component="button"
                type="button"
                variant="body2"
                onClick={() => router.push("/auth")}
                sx={{ cursor: "pointer" }}
              >
                Back to Sign In
              </Link>
            </Box>
          </Stack>
        </Box>
      </CardContent>
    </Card>
  );
};

export default ForgotPasswordPage;

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
  Tabs,
  Tab,
  CircularProgress,
  InputAdornment,
  IconButton,
} from "@mui/material";
import { Visibility, VisibilityOff } from "@mui/icons-material";
import { useRouter } from "next/navigation";
import { signIn, signUp, useLogin } from "../../features/auth/auth.service";

interface LoginFormData {
  email: string;
  password: string;
}

interface SignUpFormData {
  email: string;
  password: string;
  name: string;
}

export default function AuthPage() {
  const router = useRouter();
  const [tabValue, setTabValue] = useState(0);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [shouldRedirect, setShouldRedirect] = useState(false);
  
  // Password visibility states
  const [showLoginPassword, setShowLoginPassword] = useState(false);
  const [showSignUpPassword, setShowSignUpPassword] = useState(false);
  
  // useLogin hook'unu kullan
  const loginMutation = useLogin();
  
  // Form data states
  const [loginData, setLoginData] = useState<LoginFormData>({
    email: "admin@miltera.com",
    password: "Admin123!"
  });
  
  const [signUpData, setSignUpData] = useState<SignUpFormData>({
    email: "admin@miltera.com",
    password: "Admin123!",
    name: "Admin User"
  });

  // Handle tab change
  const handleTabChange = (event: React.SyntheticEvent, newValue: number) => {
    setTabValue(newValue);
    setError(null);
    setSuccess(null);
  };

  // Handle login form submission
  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setSuccess(null);

    console.log('=== LOGIN FORM SUBMISSION ===');
    console.log('Login data:', loginData);
    
    // useLogin hook'unu kullan
    loginMutation.mutate({
      email: loginData.email,
      password: loginData.password,
    }, {
      onSuccess: (data) => {
        console.log('=== LOGIN SUCCESS ===');
        console.log('Login result:', data);
        setSuccess("Giriş başarılı! Dashboard'a yönlendiriliyorsunuz...");
        // useLogin hook'u zaten localStorage'a kaydediyor ve yönlendiriyor
      },
      onError: (error: any) => {
        console.error('=== LOGIN CATCH ERROR ===', error);
        setError(error.message || "E-posta veya şifre hatalı. Lütfen bilgilerinizi kontrol edin.");
      }
    });
  };

  // Handle signup form submission
  const handleSignUp = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError(null);
    setSuccess(null);

    try {
      console.log('=== SIGNUP FORM SUBMISSION ===');
      console.log('SignUp data:', signUpData);
      
      const result = await signUp({
        email: signUpData.email,
        password: signUpData.password,
        name: signUpData.name,
        role: "user"
      });
      
      console.log('SignUp result:', result);
      setSuccess("Kayıt başarılı! Şimdi giriş yapabilirsiniz.");
      
      // Switch to login tab
      setTimeout(() => {
        setTabValue(0);
        setLoginData({
          email: signUpData.email,
          password: signUpData.password
        });
      }, 1500);
      
    } catch (error: any) {
      console.error('=== SIGNUP CATCH ERROR ===', error);
      setError(error.message || "Kayıt olunamadı. Lütfen bilgilerinizi kontrol edin.");
    } finally {
      setIsLoading(false);
    }
  };

  // Handle input changes
  const handleLoginInputChange = (field: keyof LoginFormData) => (e: React.ChangeEvent<HTMLInputElement>) => {
    setLoginData(prev => ({
      ...prev,
      [field]: e.target.value
    }));
  };

  const handleSignUpInputChange = (field: keyof SignUpFormData) => (e: React.ChangeEvent<HTMLInputElement>) => {
    setSignUpData(prev => ({
      ...prev,
      [field]: e.target.value
    }));
  };

  // Password visibility toggle functions
  const toggleLoginPasswordVisibility = () => {
    setShowLoginPassword(!showLoginPassword);
  };

  const toggleSignUpPasswordVisibility = () => {
    setShowSignUpPassword(!showSignUpPassword);
  };

  // Yönlendirme için useEffect
  useEffect(() => {
    if (shouldRedirect) {
      console.log('useEffect: Yönlendirme başlatılıyor...');
      setTimeout(() => {
        try {
          // window.location.replace kullan - en güvenilir yöntem
          console.log('Backup yönlendirme: window.location.replace');
          window.location.replace("/dashboard");
        } catch (error) {
          console.error('window.location.replace hatası:', error);
          console.log('Son çare: router.push');
          router.push("/dashboard");
        }
      }, 1000);
    }
  }, [shouldRedirect, router]);

  return (
    <Box
      sx={{
        minHeight: "100vh",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        bgcolor: "background.default",
        p: 2,
      }}
    >
      <Card sx={{ width: "100%", maxWidth: 400 }}>
        <CardContent sx={{ p: 4 }}>
          <Box sx={{ textAlign: "center", mb: 4 }}>
            <Typography variant="h4" component="h1" gutterBottom color="primary">
              FixLog
            </Typography>
            <Typography variant="body2" color="text.secondary">
              Teknik Servis Yönetim Sistemi
            </Typography>
          </Box>

          {/* Error/Success Messages */}
          {error && (
            <Alert severity="error" sx={{ mb: 3 }}>
              {error}
            </Alert>
          )}
          {success && (
            <Alert severity="success" sx={{ mb: 3 }}>
              {success}
            </Alert>
          )}

          {/* Tabs */}
          <Tabs value={tabValue} onChange={handleTabChange} centered sx={{ mb: 3 }}>
            <Tab label="Giriş Yap" />
            <Tab label="Kayıt Ol" />
          </Tabs>

          {/* Login Form */}
          {tabValue === 0 && (
            <Box component="form" onSubmit={handleLogin}>
              <Stack spacing={3}>
                <TextField
                  fullWidth
                  label="Email"
                  type="email"
                  value={loginData.email}
                  onChange={handleLoginInputChange("email")}
                  disabled={isLoading}
                  required
                  autoComplete="email"
                />
                <TextField
                  fullWidth
                  label="Şifre"
                  type={showLoginPassword ? "text" : "password"}
                  value={loginData.password}
                  onChange={handleLoginInputChange("password")}
                  disabled={isLoading}
                  required
                  autoComplete="current-password"
                  InputProps={{
                    endAdornment: (
                      <InputAdornment position="end">
                        <IconButton
                          aria-label="toggle password visibility"
                          onClick={toggleLoginPasswordVisibility}
                          onMouseDown={(e) => e.preventDefault()}
                          edge="end"
                          disabled={isLoading}
                        >
                          {showLoginPassword ? <VisibilityOff /> : <Visibility />}
                        </IconButton>
                      </InputAdornment>
                    ),
                  }}
                />
                <Button
                  type="submit"
                  fullWidth
                  variant="contained"
                  size="large"
                  disabled={loginMutation.isPending}
                  sx={{ py: 1.5 }}
                >
                  {loginMutation.isPending ? (
                    <CircularProgress size={24} color="inherit" />
                  ) : (
                    "Giriş Yap"
                  )}
                </Button>
              </Stack>
            </Box>
          )}

          {/* SignUp Form */}
          {tabValue === 1 && (
            <Box component="form" onSubmit={handleSignUp}>
              <Stack spacing={3}>
                <TextField
                  fullWidth
                  label="Ad Soyad"
                  value={signUpData.name}
                  onChange={handleSignUpInputChange("name")}
                  disabled={isLoading}
                  required
                  autoComplete="name"
                />
                <TextField
                  fullWidth
                  label="Email"
                  type="email"
                  value={signUpData.email}
                  onChange={handleSignUpInputChange("email")}
                  disabled={isLoading}
                  required
                  autoComplete="email"
                />
                <TextField
                  fullWidth
                  label="Şifre"
                  type={showSignUpPassword ? "text" : "password"}
                  value={signUpData.password}
                  onChange={handleSignUpInputChange("password")}
                  disabled={isLoading}
                  required
                  autoComplete="new-password"
                  helperText="En az 8 karakter olmalıdır"
                  InputProps={{
                    endAdornment: (
                      <InputAdornment position="end">
                        <IconButton
                          aria-label="toggle password visibility"
                          onClick={toggleSignUpPasswordVisibility}
                          onMouseDown={(e) => e.preventDefault()}
                          edge="end"
                          disabled={isLoading}
                        >
                          {showSignUpPassword ? <VisibilityOff /> : <Visibility />}
                        </IconButton>
                      </InputAdornment>
                    ),
                  }}
                />
                <Button
                  type="submit"
                  fullWidth
                  variant="contained"
                  size="large"
                  disabled={isLoading}
                  sx={{ py: 1.5 }}
                >
                  {isLoading ? (
                    <CircularProgress size={24} color="inherit" />
                  ) : (
                    "Kayıt Ol"
                  )}
                </Button>
              </Stack>
            </Box>
          )}

          {/* Test Info */}
          <Box sx={{ mt: 4, p: 2, bgcolor: "grey.50", borderRadius: 1 }}>
            <Typography variant="caption" color="text.secondary" display="block" textAlign="center">
              Test için hazır kullanıcı: testuser6@gmail.com / OZGUR2004
            </Typography>
          </Box>
        </CardContent>
      </Card>
    </Box>
  );
}

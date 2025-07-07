"use client";

import Image from "next/image";
import { Box, CircularProgress, Container } from "@mui/material";
import { useAuth } from "../../features/auth/useAuth";

const AuthLayout = ({ children }: { children: React.ReactNode }) => {
  const auth = useAuth();

  return (
    <Container
      maxWidth="sm"
      sx={{
        minHeight: "100vh",
        display: "flex",
        justifyContent: "center",
        alignItems: "center",
        flexDirection: "column",
      }}
    >
      {auth.isLoading ? (
        <CircularProgress />
      ) : (
        <>
          <Box sx={{ mb: 3 }}>
            <Image
              src="/miltera-logo.png"
              alt="Miltera Logo"
              width={150}
              height={26}
              style={{
                maxWidth: "100%",
                height: "auto",
              }}
              priority
            />
          </Box>
          {children}
        </>
      )}
    </Container>
  );
};

export default AuthLayout;

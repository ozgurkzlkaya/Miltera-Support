import { Typography, Grid, Paper, Box } from "@mui/material";
import { Layout } from "../../components/Layout";
import { getAuth } from "../../features/auth/getAuth";
import AdvancedCustomerPortal from "../../components/AdvancedCustomerPortal";
import AdvancedDashboardAnalytics from "../../components/AdvancedDashboardAnalytics";

const DashboardPage = async () => {
  const auth = await getAuth();

  if (auth.user.role === "CUSTOMER") {
    return <AdvancedCustomerPortal />;
  }

  return (
    <Box>
      <Box sx={{ p: 3 }}>
        <AdvancedDashboardAnalytics />
      </Box>
    </Box>
  );
};

export default DashboardPage;

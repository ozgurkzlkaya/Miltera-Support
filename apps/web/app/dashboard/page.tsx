import { Typography, Grid, Paper, Box } from "@mui/material";
import { Layout } from "../../components/Layout";
import { getAuth } from "../../features/auth/getAuth";
import CustomerPortalPage from "../../components/CustomerPortalPage";

// Mock data for demonstration
const mockStats = {
  totalProducts: 150,
  activeIssues: 12,
  pendingShipments: 5,
  completedRepairs: 45,
};

const mockRecentIssues = [
  {
    id: 1,
    product: "Gateway-2000",
    status: "In Progress",
    assignedTo: "John Doe",
  },
  {
    id: 2,
    product: "Energy Analyzer",
    status: "Pending",
    assignedTo: "Jane Smith",
  },
  {
    id: 3,
    product: "VPN Router",
    status: "Completed",
    assignedTo: "Mike Johnson",
  },
];

const DashboardPage = async () => {
  const auth = await getAuth();

  if (auth.role === "customer") {
    return <CustomerPortalPage />;
  }

  return (
    <Layout title="Overview">
      <Box sx={{ p: 3 }}>
        <Grid container spacing={3} sx={{ mb: 4 }}>
          <Grid size={{ xs: 12, sm: 6, md: 3 }}>
            <Paper sx={{ p: 2, textAlign: "center" }}>
              <Typography variant="h6">Total Products</Typography>
              <Typography variant="h4">{mockStats.totalProducts}</Typography>
            </Paper>
          </Grid>
          <Grid size={{ xs: 12, sm: 6, md: 3 }}>
            <Paper sx={{ p: 2, textAlign: "center" }}>
              <Typography variant="h6">Active Issues</Typography>
              <Typography variant="h4">{mockStats.activeIssues}</Typography>
            </Paper>
          </Grid>
          <Grid size={{ xs: 12, sm: 6, md: 3 }}>
            <Paper sx={{ p: 2, textAlign: "center" }}>
              <Typography variant="h6">Pending Shipments</Typography>
              <Typography variant="h4">{mockStats.pendingShipments}</Typography>
            </Paper>
          </Grid>
          <Grid size={{ xs: 12, sm: 6, md: 3 }}>
            <Paper sx={{ p: 2, textAlign: "center" }}>
              <Typography variant="h6">Completed Repairs</Typography>
              <Typography variant="h4">{mockStats.completedRepairs}</Typography>
            </Paper>
          </Grid>
        </Grid>

        {/* Recent Issues */}
        <Paper sx={{ p: 2 }}>
          <Typography variant="h6" gutterBottom>
            Recent Issues
          </Typography>
          <Grid container spacing={2}>
            {mockRecentIssues.map((issue) => (
              <Grid size={12} key={issue.id}>
                <Paper sx={{ p: 2, bgcolor: "background.default" }}>
                  <Grid container spacing={2}>
                    <Grid size={{ xs: 12, sm: 4 }}>
                      <Typography variant="subtitle1">
                        {issue.product}
                      </Typography>
                    </Grid>
                    <Grid size={{ xs: 12, sm: 4 }}>
                      <Typography variant="body2" color="text.secondary">
                        Status: {issue.status}
                      </Typography>
                    </Grid>
                    <Grid size={{ xs: 12, sm: 4 }}>
                      <Typography variant="body2" color="text.secondary">
                        Assigned to: {issue.assignedTo}
                      </Typography>
                    </Grid>
                  </Grid>
                </Paper>
              </Grid>
            ))}
          </Grid>
        </Paper>
      </Box>
    </Layout>
  );
};

export default DashboardPage;

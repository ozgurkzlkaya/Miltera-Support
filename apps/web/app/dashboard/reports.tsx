import { Typography, Box, Grid, Paper } from "@mui/material";

const mockStats = [
  { label: "Total Products", value: 150 },
  { label: "Active Issues", value: 12 },
  { label: "Completed Repairs", value: 45 },
  { label: "Shipments", value: 8 },
];

export default function ReportsPage() {
  return (
    <Box sx={{ p: 3 }}>
      <Typography variant="h4" gutterBottom>
        Reports & Analytics
      </Typography>
      <Grid container spacing={3} sx={{ mb: 4 }}>
        {mockStats.map((stat, idx) => (
          <Grid size={{ xs: 12, sm: 6, md: 3 }} key={idx}>
            <Paper sx={{ p: 2, textAlign: "center" }}>
              <Typography variant="h6">{stat.label}</Typography>
              <Typography variant="h4">{stat.value}</Typography>
            </Paper>
          </Grid>
        ))}
      </Grid>
      <Paper sx={{ p: 4, minHeight: 300, textAlign: "center" }}>
        <Typography variant="h6" color="text.secondary">
          [Charts and analytics will be displayed here]
        </Typography>
      </Paper>
    </Box>
  );
} 
import { Typography, Paper, Box, Table, TableBody, TableCell, TableContainer, TableHead, TableRow, Button } from "@mui/material";

const mockIssues = [
  { id: 1, number: "240601-01", product: "Gateway-2000", status: "In Progress", priority: "High" },
  { id: 2, number: "240601-02", product: "Energy Analyzer", status: "Pending", priority: "Medium" },
  { id: 3, number: "240601-03", product: "VPN Router", status: "Completed", priority: "Low" },
];

export default function IssuesPage() {
  return (
    <Box sx={{ p: 3 }}>
      <Typography variant="h4" gutterBottom>
        Issues
      </Typography>
      <TableContainer component={Paper}>
        <Table>
          <TableHead>
            <TableRow>
              <TableCell>Issue Number</TableCell>
              <TableCell>Product</TableCell>
              <TableCell>Status</TableCell>
              <TableCell>Priority</TableCell>
              <TableCell>Actions</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {mockIssues.map((issue) => (
              <TableRow key={issue.id}>
                <TableCell>{issue.number}</TableCell>
                <TableCell>{issue.product}</TableCell>
                <TableCell>{issue.status}</TableCell>
                <TableCell>{issue.priority}</TableCell>
                <TableCell>
                  <Button size="small" variant="outlined">Details</Button>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </TableContainer>
    </Box>
  );
} 
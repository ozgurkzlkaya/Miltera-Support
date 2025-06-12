import { Typography, Paper, Box, Table, TableBody, TableCell, TableContainer, TableHead, TableRow, Button } from "@mui/material";

const mockCustomers = [
  { id: 1, name: "Ali Veli", email: "ali@example.com", company: "ABC Enerji", status: "Active" },
  { id: 2, name: "Ayşe Yılmaz", email: "ayse@example.com", company: "XYZ Elektrik", status: "Inactive" },
  { id: 3, name: "Mehmet Can", email: "mehmet@example.com", company: "Miltera", status: "Active" },
];

export default function CustomersPage() {
  return (
    <Box sx={{ p: 3 }}>
      <Typography variant="h4" gutterBottom>
        Customers
      </Typography>
      <TableContainer component={Paper}>
        <Table>
          <TableHead>
            <TableRow>
              <TableCell>Customer Name</TableCell>
              <TableCell>Email</TableCell>
              <TableCell>Company</TableCell>
              <TableCell>Status</TableCell>
              <TableCell>Actions</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {mockCustomers.map((customer) => (
              <TableRow key={customer.id}>
                <TableCell>{customer.name}</TableCell>
                <TableCell>{customer.email}</TableCell>
                <TableCell>{customer.company}</TableCell>
                <TableCell>{customer.status}</TableCell>
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
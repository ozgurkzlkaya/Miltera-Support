import { Typography, Paper, Box, Table, TableBody, TableCell, TableContainer, TableHead, TableRow, Button } from "@mui/material";

const mockShipments = [
  { id: 1, number: "SHP-001", type: "SALES", status: "Shipped", estimated: "2025-06-10" },
  { id: 2, number: "SHP-002", type: "SERVICE_RETURN", status: "Preparing", estimated: "2025-06-12" },
  { id: 3, number: "SHP-003", type: "SERVICE_SEND", status: "Delivered", estimated: "2025-06-08" },
];

export default function ShipmentsPage() {
  return (
    <Box sx={{ p: 3 }}>
      <Typography variant="h4" gutterBottom>
        Shipments
      </Typography>
      <TableContainer component={Paper}>
        <Table>
          <TableHead>
            <TableRow>
              <TableCell>Shipment Number</TableCell>
              <TableCell>Type</TableCell>
              <TableCell>Status</TableCell>
              <TableCell>Estimated Delivery</TableCell>
              <TableCell>Actions</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {mockShipments.map((shipment) => (
              <TableRow key={shipment.id}>
                <TableCell>{shipment.number}</TableCell>
                <TableCell>{shipment.type}</TableCell>
                <TableCell>{shipment.status}</TableCell>
                <TableCell>{shipment.estimated}</TableCell>
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
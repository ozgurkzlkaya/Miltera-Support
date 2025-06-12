"use client";

import {
  Typography,
  Paper,
  Box,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Button,
} from "@mui/material";
import { Layout } from "../../../components/Layout";

const mockProducts = [
  {
    id: 1,
    name: "Gateway-2000",
    serial: "SN123456",
    status: "Active",
    warranty: "2025-12-31",
  },
  {
    id: 2,
    name: "Energy Analyzer",
    serial: "SN654321",
    status: "In Repair",
    warranty: "2026-03-15",
  },
  {
    id: 3,
    name: "VPN Router",
    serial: "SN987654",
    status: "Shipped",
    warranty: "2025-09-10",
  },
];

export default function ProductsPage() {
  return (
    <Layout title="Products" menuItems={[]}>
      <Box sx={{ p: 3 }}>
        <Typography variant="h4" gutterBottom>
          Products
        </Typography>
        <TableContainer component={Paper}>
          <Table>
            <TableHead>
              <TableRow>
                <TableCell>Product Name</TableCell>
                <TableCell>Serial Number</TableCell>
                <TableCell>Status</TableCell>
                <TableCell>Warranty</TableCell>
                <TableCell>Actions</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {mockProducts.map((product) => (
                <TableRow key={product.id}>
                  <TableCell>{product.name}</TableCell>
                  <TableCell>{product.serial}</TableCell>
                  <TableCell>{product.status}</TableCell>
                  <TableCell>{product.warranty}</TableCell>
                  <TableCell>
                    <Button size="small" variant="outlined">
                      Details
                    </Button>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </TableContainer>
      </Box>
    </Layout>
  );
}

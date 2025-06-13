"use client";

import { Button } from "@miltera/ui/Button";
import { Box, Typography, Card, CardContent } from "@mui/material";
import { useRouter } from "next/navigation";

type Product = {
  id: string;
  name: string;
  modelName?: string;
  serialNumber?: string;
  [key: string]: any;
};

type ProductProps = {
  products: Product[];
};

const Products = ({ products }: ProductProps) => {
  const router = useRouter();

  return (
    <Box sx={{ p: 3 }}>
      <Typography variant="h4" gutterBottom>
        Welcome to Miltera
      </Typography>
      <Typography variant="body1" paragraph>
        Manage your products, track issues, handle shipments, and more.
      </Typography>
      
      <Box sx={{ display: "flex", gap: 2, mb: 4 }}>
        <Button 
          variant="contained" 
          color="primary"
          onClick={() => router.push("/dashboard")}
        >
          Go to Dashboard
        </Button>
        <Button 
          variant="outlined" 
          onClick={() => router.push("/dashboard/products")}
        >
          View All Products
        </Button>
      </Box>

      <Typography variant="h6" gutterBottom>
        Recent Products ({products.length})
      </Typography>
      
      {products.length > 0 ? (
        <Box sx={{ display: "grid", gap: 2, gridTemplateColumns: "repeat(auto-fill, minmax(300px, 1fr))" }}>
          {products.slice(0, 6).map((product) => (
            <Card key={product.id}>
              <CardContent>
                <Typography variant="h6">{product.name}</Typography>
                <Typography variant="body2" color="text.secondary">
                  Model: {product.modelName}
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  Serial: {product.serialNumber}
                </Typography>
              </CardContent>
            </Card>
          ))}
        </Box>
      ) : (
        <Typography variant="body2" color="text.secondary">
          No products available
        </Typography>
      )}
    </Box>
  );
};

export { Products };

"use client";

import { useState } from "react";
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  Typography,
  Box,
  CircularProgress,
  type DialogProps,
} from "@mui/material";
import { Warning as WarningIcon } from "@mui/icons-material";

interface DataTableConfirmDialogProps {
  open: boolean;
  title: string;
  message: string;
  severity?: "error" | "warning" | "info";
  onClose: () => void;
  onConfirm: () => Promise<void>;
  dialogProps?: Partial<DialogProps>;
}

const DataTableConfirmDialog = ({
  open,
  title,
  message,
  severity,
  onClose,
  onConfirm,
  dialogProps,
}: DataTableConfirmDialogProps) => {
  const [isSubmitting, setIsSubmitting] = useState(false);

  return (
    <Dialog
      maxWidth="sm"
      fullWidth
      {...dialogProps}
      open={open}
      onClose={onClose}
    >
      <DialogTitle>
        <Box display="flex" alignItems="center" gap={1}>
          {severity === "error" && <WarningIcon color="error" />}
          {severity === "warning" && <WarningIcon color="warning" />}
          {title}
        </Box>
      </DialogTitle>
      <DialogContent>
        <Typography>{message}</Typography>
      </DialogContent>
      <DialogActions>
        <Button onClick={onClose} color="inherit" disabled={isSubmitting}>
          Cancel
        </Button>
        <Button
          onClick={() => {
            setIsSubmitting(true);
            onConfirm().finally(() => setIsSubmitting(false));
          }}
          color={severity === "error" ? "error" : "primary"}
          variant="contained"
          startIcon={isSubmitting ? <CircularProgress size={20} /> : null}
          disabled={isSubmitting}
        >
          {isSubmitting ? "Processing..." : "Confirm"}
        </Button>
      </DialogActions>
    </Dialog>
  );
};

export { DataTableConfirmDialog };
export type { DataTableConfirmDialogProps };

"use client";

import { useEffect } from "react";

import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  CircularProgress,
  IconButton,
  type DialogProps,
} from "@mui/material";
import { Close as CloseIcon } from "@mui/icons-material";
import { FormRenderer } from "../form/FormRenderer";
import { useForm } from "../form/useForm";
import type { FormField } from "../form/types";

interface DataTableFormDialogProps {
  open: boolean;
  mode: "create" | "edit";
  title: string;
  formFields: FormField[];
  initialData?: any;
  onClose: () => void;
  onSubmit: (data: any) => void;
  dialogProps?: Partial<DialogProps>;
}

const DataTableFormDialog = ({
  open,
  mode,
  title,
  formFields,
  initialData,
  onClose,
  onSubmit,
  dialogProps,
}: DataTableFormDialogProps) => {
  const form = useForm({
    fields: formFields,
  });

  const isSubmitting = form.formState.isSubmitting;

  // Reset form when modal opens/closes or data changes
  useEffect(() => {
    if (open) {
      const defaultValues = form.defaultValues(initialData);
      form.reset(defaultValues);
    }
  }, [open]);

  const handleClose = () => {
    if (!isSubmitting) {
      onClose();
    }
  };

  return (
    <Dialog
      maxWidth="md"
      fullWidth
      disableEscapeKeyDown={isSubmitting || dialogProps?.disableEscapeKeyDown}
      {...dialogProps}
      open={open}
      onClose={handleClose}
    >
      <DialogTitle>{title}</DialogTitle>
      <IconButton
        aria-label="close"
        onClick={handleClose}
        sx={(theme) => ({
          position: "absolute",
          right: 8,
          top: 8,
          color: theme.palette.grey[500],
        })}
      >
        <CloseIcon />
      </IconButton>
      <DialogContent>
        <FormRenderer form={form} mode={mode} onSubmit={onSubmit} />
      </DialogContent>
      <DialogActions>
        <Button onClick={handleClose} disabled={isSubmitting} color="inherit">
          Cancel
        </Button>
        <Button
          onClick={form.handleSubmit(onSubmit)}
          disabled={isSubmitting}
          variant="contained"
          startIcon={isSubmitting ? <CircularProgress size={20} /> : null}
        >
          {isSubmitting ? "Saving..." : mode === "create" ? "Create" : "Save"}
        </Button>
      </DialogActions>
    </Dialog>
  );
};

export { DataTableFormDialog };
export type { DataTableFormDialogProps };

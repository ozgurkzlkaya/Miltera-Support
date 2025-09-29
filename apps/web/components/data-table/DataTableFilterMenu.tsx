"use client";

import { useState } from "react";
import {
  Button,
  Box,
  Typography,
  TextField,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Chip,
  Checkbox,
  Menu,
  ListItemText,
  Divider,
} from "@mui/material";
import { Clear as ClearIcon } from "@mui/icons-material";

import { TableColumn } from "./types";

interface DataTableFilterMenuProps {
  columns: TableColumn[];
  columnFilters: any[];
  filterMenuAnchor: HTMLElement | null;
  setFilterMenuAnchor: (anchor: HTMLElement | null) => void;
  handleFiltersChange: (filters: any[]) => void;
  handleGlobalFilterChange: (filter: string) => void;
}

const DataTableFilterMenu = ({
  columns,
  columnFilters,
  filterMenuAnchor,
  setFilterMenuAnchor,
  handleFiltersChange,
  handleGlobalFilterChange,
}: DataTableFilterMenuProps) => {
  const handleClose = () => {
    setFilterMenuAnchor(null);
  };


  return (
    <Menu
      anchorEl={filterMenuAnchor}
      open={Boolean(filterMenuAnchor)}
      onClose={() => setFilterMenuAnchor(null)}
    >
      <Box sx={{ p: 2, minWidth: 200, maxWidth: 400 }}>
        <Typography variant="subtitle2" gutterBottom>
          Column Filters
          {/* TODO */}
          {/* {filterTimeouts.size > 0 && (
            <Chip
              label={`${filterTimeouts.size} pending`}
              size="small"
              color="primary"
              sx={{ ml: 1 }}
            />
          )} */}
        </Typography>
        <Divider sx={{ mb: 1 }} />
        {columns
          .filter((col) => col.filterable !== false)
          .map((column) => {
            const currentFilter = columnFilters.find((f) => f.id === column.id);
            const filterValue = currentFilter?.value || "";

            const handleColumnFilterChange = (value: any) => {
              const newFilters = columnFilters.filter(
                (f) => f.id !== column.id
              );
              if (value && value !== "") {
                newFilters.push({
                  id: column.id,
                  value: String(value),
                });
              }
              handleFiltersChange(newFilters);
            };

            // Render based on column filterType
            switch (column.filterType) {
              case "select":
                return (
                  <FormControl
                    key={column.id}
                    size="small"
                    fullWidth
                    margin="dense"
                  >
                    <InputLabel>{column.label}</InputLabel>
                    <Select
                      value={filterValue}
                      onChange={(e) => handleColumnFilterChange(e.target.value)}
                      label={column.label}
                    >
                      <MenuItem value="">
                        <em>All</em>
                      </MenuItem>
                      {column.filterOptions?.map((option) => (
                        <MenuItem key={option.value} value={option.value}>
                          {option.label}
                        </MenuItem>
                      ))}
                    </Select>
                  </FormControl>
                );

              case "multiselect":
                return (
                  <FormControl
                    key={column.id}
                    size="small"
                    fullWidth
                    margin="dense"
                  >
                    <InputLabel>{column.label}</InputLabel>
                    <Select
                      multiple
                      value={filterValue ? String(filterValue).split(",") : []}
                      onChange={(e) =>
                        handleColumnFilterChange(
                          Array.isArray(e.target.value)
                            ? e.target.value.join(",")
                            : e.target.value
                        )
                      }
                      label={column.label}
                      renderValue={(selected) => (
                        <Box
                          sx={{ display: "flex", flexWrap: "wrap", gap: 0.5 }}
                        >
                          {(selected as string[]).map((value) => (
                            <Chip key={value} label={value} size="small" />
                          ))}
                        </Box>
                      )}
                    >
                      {column.filterOptions?.map((option) => (
                        <MenuItem key={option.value} value={option.value}>
                          <Checkbox
                            checked={
                              filterValue
                                ? String(filterValue)
                                    .split(",")
                                    .includes(String(option.value))
                                : false
                            }
                          />
                          <ListItemText primary={option.label} />
                        </MenuItem>
                      ))}
                    </Select>
                  </FormControl>
                );

              case "boolean":
                return (
                  <FormControl
                    key={column.id}
                    size="small"
                    fullWidth
                    margin="dense"
                  >
                    <InputLabel>{column.label}</InputLabel>
                    <Select
                      value={filterValue}
                      onChange={(e) => handleColumnFilterChange(e.target.value)}
                      label={column.label}
                    >
                      <MenuItem value="">
                        <em>All</em>
                      </MenuItem>
                      <MenuItem value="true">Yes</MenuItem>
                      <MenuItem value="false">No</MenuItem>
                    </Select>
                  </FormControl>
                );

              case "number":
                return (
                  <TextField
                    key={column.id}
                    size="small"
                    fullWidth
                    type="number"
                    label={column.label}
                    margin="dense"
                    value={filterValue}
                    onChange={(e) => handleColumnFilterChange(e.target.value)}
                  />
                );

              case "range":
                const [minValue, maxValue] = filterValue
                  ? String(filterValue).split(",")
                  : ["", ""];
                return (
                  <Box key={column.id} sx={{ display: "flex", gap: 1 }}>
                    <TextField
                      size="small"
                      type="number"
                      label={`${column.label} Min`}
                      margin="dense"
                      value={minValue}
                      onChange={(e) =>
                        handleColumnFilterChange(
                          `${e.target.value},${maxValue}`
                        )
                      }
                    />
                    <TextField
                      size="small"
                      type="number"
                      label={`${column.label} Max`}
                      margin="dense"
                      value={maxValue}
                      onChange={(e) =>
                        handleColumnFilterChange(
                          `${minValue},${e.target.value}`
                        )
                      }
                    />
                  </Box>
                );

              case "date":
                return (
                  <TextField
                    key={column.id}
                    size="small"
                    fullWidth
                    type="date"
                    label={column.label}
                    margin="dense"
                    value={filterValue}
                    onChange={(e) => handleColumnFilterChange(e.target.value)}
                    InputLabelProps={{
                      shrink: true,
                    }}
                  />
                );

              case "datetime":
                return (
                  <TextField
                    key={column.id}
                    size="small"
                    fullWidth
                    type="datetime-local"
                    label={column.label}
                    margin="dense"
                    value={filterValue}
                    onChange={(e) => handleColumnFilterChange(e.target.value)}
                    InputLabelProps={{
                      shrink: true,
                    }}
                  />
                );

              case "dateRange":
                const [fromDate, toDate] = filterValue
                  ? String(filterValue).split(",")
                  : ["", ""];
                return (
                  <Box
                    key={column.id}
                    sx={{ display: "flex", flexDirection: "column", gap: 1 }}
                  >
                    <TextField
                      size="small"
                      type="date"
                      label={`${column.label} From`}
                      margin="dense"
                      value={formatDateForInput(fromDate || "")}
                      onChange={(e) => {
                        const newValue = e.target.value;
                        // Clear 'to' date if 'from' date is after it
                        const newToDate =
                          newValue &&
                          toDate &&
                          new Date(newValue) > new Date(toDate)
                            ? ""
                            : toDate;
                        handleColumnFilterChange(
                          `${newValue},${newToDate || ""}`
                        );
                      }}
                      InputLabelProps={{
                        shrink: true,
                      }}
                      helperText={
                        fromDate &&
                        toDate &&
                        new Date(fromDate) > new Date(toDate)
                          ? "From date must be before To date"
                          : ""
                      }
                      error={Boolean(
                        fromDate &&
                          toDate &&
                          new Date(fromDate) > new Date(toDate)
                      )}
                    />
                    <TextField
                      size="small"
                      type="date"
                      label={`${column.label} To`}
                      margin="dense"
                      value={formatDateForInput(toDate || "")}
                      onChange={(e) => {
                        const newValue = e.target.value;
                        // Clear 'from' date if 'to' date is before it
                        const newFromDate =
                          newValue &&
                          fromDate &&
                          new Date(fromDate) > new Date(newValue)
                            ? ""
                            : fromDate;
                        handleColumnFilterChange(
                          `${newFromDate || ""},${newValue}`
                        );
                      }}
                      InputLabelProps={{
                        shrink: true,
                      }}
                      inputProps={{
                        min: fromDate ? formatDateForInput(fromDate) : "",
                      }}
                    />
                  </Box>
                );

              case "dateTimeRange":
                const [fromDateTime, toDateTime] = filterValue
                  ? String(filterValue).split(",")
                  : ["", ""];
                return (
                  <Box
                    key={column.id}
                    sx={{ display: "flex", flexDirection: "column", gap: 1 }}
                  >
                    <TextField
                      size="small"
                      type="datetime-local"
                      label={`${column.label} From`}
                      margin="dense"
                      value={formatDateTimeForInput(fromDateTime || "")}
                      onChange={(e) => {
                        const newValue = e.target.value;
                        const newToDateTime =
                          newValue &&
                          toDateTime &&
                          new Date(newValue) > new Date(toDateTime)
                            ? ""
                            : toDateTime;
                        handleColumnFilterChange(
                          `${newValue},${newToDateTime || ""}`
                        );
                      }}
                      InputLabelProps={{
                        shrink: true,
                      }}
                      helperText={
                        fromDateTime &&
                        toDateTime &&
                        new Date(fromDateTime) > new Date(toDateTime)
                          ? "From date must be before To date"
                          : ""
                      }
                      error={Boolean(
                        fromDateTime &&
                          toDateTime &&
                          new Date(fromDateTime) > new Date(toDateTime)
                      )}
                    />
                    <TextField
                      size="small"
                      type="datetime-local"
                      label={`${column.label} To`}
                      margin="dense"
                      value={formatDateTimeForInput(toDateTime || "")}
                      onChange={(e) => {
                        const newValue = e.target.value;
                        const newFromDateTime =
                          newValue &&
                          fromDateTime &&
                          new Date(fromDateTime) > new Date(newValue)
                            ? ""
                            : fromDateTime;
                        handleColumnFilterChange(
                          `${newFromDateTime || ""},${newValue}`
                        );
                      }}
                      InputLabelProps={{
                        shrink: true,
                      }}
                      inputProps={{
                        min: fromDateTime
                          ? formatDateTimeForInput(fromDateTime)
                          : "",
                      }}
                    />
                  </Box>
                );

              case "contains":
                return (
                  <TextField
                    key={column.id}
                    size="small"
                    fullWidth
                    label={`${column.label} (contains)`}
                    margin="dense"
                    value={filterValue}
                    onChange={(e) => handleColumnFilterChange(e.target.value)}
                    placeholder="Search..."
                  />
                );

              case "startsWith":
                return (
                  <TextField
                    key={column.id}
                    size="small"
                    fullWidth
                    label={`${column.label} (starts with)`}
                    margin="dense"
                    value={filterValue}
                    onChange={(e) => handleColumnFilterChange(e.target.value)}
                    placeholder="Starts with..."
                  />
                );

              case "endsWith":
                return (
                  <TextField
                    key={column.id}
                    size="small"
                    fullWidth
                    label={`${column.label} (ends with)`}
                    margin="dense"
                    value={filterValue}
                    onChange={(e) => handleColumnFilterChange(e.target.value)}
                    placeholder="Ends with..."
                  />
                );

              default: // "text" or undefined
                return (
                  <TextField
                    key={column.id}
                    size="small"
                    fullWidth
                    label={column.label}
                    margin="dense"
                    value={filterValue}
                    onChange={(e) => handleColumnFilterChange(e.target.value)}
                    placeholder="Search..."
                  />
                );
            }
          })}
        <Box sx={{ mt: 2, display: "flex", justifyContent: "space-between" }}>
          <Button
            size="small"
            startIcon={<ClearIcon />}
            onClick={() => {
              handleFiltersChange([]);
              handleGlobalFilterChange("");
            }}
          >
            Clear All
          </Button>
        </Box>
      </Box>
    </Menu>
  );
};

// Helper function to format date for display
const formatDateForInput = (dateString: string) => {
  if (!dateString) return "";
  const date = new Date(dateString);
  return date.toISOString().split("T")[0];
};

// Helper function to format datetime for display
const formatDateTimeForInput = (dateString: string) => {
  if (!dateString) return "";
  const date = new Date(dateString);
  return date.toISOString().slice(0, 16);
};

export { DataTableFilterMenu };

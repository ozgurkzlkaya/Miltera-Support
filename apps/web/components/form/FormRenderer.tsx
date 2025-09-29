import {
  Control,
  FieldValues,
  Controller,
  FieldError,
  ControllerRenderProps,
  useWatch,
} from "react-hook-form";

import {
  Autocomplete,
  TextField,
  CircularProgress,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  FormHelperText,
  Box,
  UseAutocompleteProps,
} from "@mui/material";

import type { UseFormReturn } from "./useForm";
import type { FormField, FormFieldOption } from "./types";
import { useCallback, useEffect, useState } from "react";
// import { debounce } from "lodash-es";
import { formatDateMuiInput } from "../../utils/mui";

interface FormRendererProps<T extends FieldValues = FieldValues> {
  form: UseFormReturn<T>;
  mode: "create" | "edit";
  onSubmit: (data: T) => void;
}

interface FormFieldRendererProps<T extends FieldValues = FieldValues> {
  field: FormField;
  mode: "create" | "edit";
  control: Control<T>;
  rules: ReturnType<UseFormReturn["getRules"]>;
}

const FormRenderer = <T extends FieldValues = FieldValues>({
  form,
  mode,
  onSubmit,
}: FormRendererProps<T>) => {
  const { control, handleSubmit, getRules, fields } = form;

  // Render form fields with layout support
  const isEdit = mode === "edit";

  // Filter fields based on visibility conditions
  const visibleFields = fields.filter((field) => {
    const showInCreateMode = field.showInCreateMode !== false;
    const showInEditMode = field.showInEditMode !== false;

    if (!isEdit && !showInCreateMode) return false;
    if (isEdit && !showInEditMode) return false;

    return true;
  });

  // Group fields by row or render as single column if no layout is specified
  const hasLayout = visibleFields.some((field) => field.layout);

  const getFieldRules = (field: FormField) => {
    return getRules({
      required: field.required,
      minLength: field.validation?.minLength,
      maxLength: field.validation?.maxLength,
      min: field.validation?.min,
      max: field.validation?.max,
      pattern: field.validation?.pattern,
      validate: field.validation?.validate,
    });
  };

  if (!hasLayout) {
    // Fallback to original single-column layout
    return visibleFields.map((field) => (
      <FormFieldRenderer
        key={field.id}
        field={field}
        mode={mode}
        control={control}
        rules={getFieldRules(field)}
      />
    ));
  }

  // Group visible fields by row
  const rowGroups: { [key: number]: FormField[] } = {};
  visibleFields.forEach((field) => {
    const row = field.layout?.row ?? 0;
    if (!rowGroups[row]) {
      rowGroups[row] = [];
    }
    rowGroups[row].push(field);
  });

  // Sort fields within each row by column
  Object.keys(rowGroups).forEach((rowKey) => {
    const row = parseInt(rowKey);
    const fieldsInRow = rowGroups[row];
    if (fieldsInRow) {
      fieldsInRow.sort(
        (a, b) => (a.layout?.column ?? 0) - (b.layout?.column ?? 0)
      );
    }
  });

  // Render each row
  return (
    <Box component="form" onSubmit={handleSubmit(onSubmit)}>
      {Object.keys(rowGroups)
        .sort((a, b) => parseInt(a) - parseInt(b))
        .map((rowKey) => {
          const row = parseInt(rowKey);
          const fieldsInRow = rowGroups[row];

          if (!fieldsInRow || fieldsInRow.length === 0) {
            return null;
          }

          // Calculate grid sizes
          const totalFields = fieldsInRow.length;

          return (
            <Box
              key={`row-${row}`}
              sx={{
                display: "grid",
                gridTemplateColumns: `repeat(${totalFields}, 1fr)`,
                gap: 2,
                mb: 1,
              }}
            >
              {fieldsInRow.map((field) => (
                <Box key={field.id}>
                  <FormFieldRenderer
                    field={field}
                    control={control}
                    mode={mode}
                    rules={getFieldRules(field)}
                  />
                </Box>
              ))}
            </Box>
          );
        })}
    </Box>
  );
};

const FormFieldRenderer = <T extends FieldValues = FieldValues>({
  field,
  mode,
  control,
  rules,
}: FormFieldRendererProps<T>) => {
  const isEdit = mode === "edit";
  const value = useWatch({ control, name: field.id as any });
  const [options, setOptions] = useState<FormFieldOption[]>(
    field.options || []
  );

  useEffect(() => {
    if (field.loadOptions) {
      field.loadOptions().then((options) => {
        if (options) {
          setOptions(options);
        }
      });
    }
  }, []);

  const handleInputChange: UseAutocompleteProps<
    FormFieldOption,
    false,
    false,
    false
  >["onInputChange"] = (_, value, reason) => {
    if (reason !== "input" && reason !== "clear") {
      return;
    }

    if (field.loadOptions && !isDisabled) {
      field.loadOptions(value).then((options) => {
        if (options) {
          setOptions(options);
        }
      });
    }
  };

  const debouncedHandleInputChange = useCallback(
    (() => {
      let timeoutId: NodeJS.Timeout;
      return (value: any) => {
        clearTimeout(timeoutId);
        timeoutId = setTimeout(() => handleInputChange(null as any, value, "input"), 300);
      };
    })(),
    []
  );

  // Calculate disabled state (only get values when needed)
  const isDisabled =
    typeof field.disabled === "function"
      ? field.disabled(isEdit, value)
      : field.disabled || false;

  return (
    <Controller
      key={field.id}
      name={field.id as any}
      control={control}
      rules={rules as any}
      render={({
        field: controllerField,
        fieldState,
      }: {
        field: ControllerRenderProps<T, any>;
        fieldState: { error?: FieldError };
      }) => {
        const helperText = fieldState.error?.message || field.helperText;

        const commonProps = {
          fullWidth: true,
          margin: "normal" as const,
          error: !!fieldState.error,
          label: field.label,
          required: field.required,
          disabled: isDisabled,
        };

        switch (field.type) {
          case "autocomplete":
          case "multiselect":
            const isLoading = false;

            const multiple = field.type === "multiselect";

            return (
              <Autocomplete
                multiple={multiple}
                options={options}
                getOptionLabel={(option) => option.label}
                disabled={isDisabled}
                loading={isLoading}
                value={
                  multiple
                    ? options.filter((opt) =>
                        (controllerField.value as any[] || []).includes(opt.value)
                      )
                    : options.find(
                        (opt) => opt.value === controllerField.value
                      ) || null
                }
                onChange={(_, newValue) => {
                  if (isDisabled) return;

                  if (Array.isArray(newValue)) {
                    controllerField.onChange(newValue.map((v) => v.value));
                  } else {
                    controllerField.onChange(newValue?.value);
                  }
                }}
                onInputChange={debouncedHandleInputChange}
                filterOptions={(options, state) => {
                  // If using loadOptions, don't filter client-side
                  if (field.loadOptions) {
                    return options;
                  }

                  // Otherwise, use default filtering
                  return options.filter((option) =>
                    option.label
                      .toLowerCase()
                      .includes(state.inputValue.toLowerCase())
                  );
                }}
                noOptionsText={
                  field.loadOptions
                    ? isLoading
                      ? "Loading..."
                      : 
                        // :
                        // state.inputValue.length === 0
                        //   ? "Type to search..."
                        "No options found"
                    : "No options"
                }
                renderInput={(params) => (
                  <TextField
                    {...params}
                    {...commonProps}
                    helperText={helperText}
                    placeholder={
                      field.placeholder ||
                      (field.loadOptions ? "Type to search..." : "")
                    }
                    InputProps={{
                      ...params.InputProps,
                      endAdornment: (
                        <>
                          {isLoading && (
                            <CircularProgress color="inherit" size={20} />
                          )}
                          {params.InputProps.endAdornment}
                        </>
                      ),
                    }}
                  />
                )}
              />
            );

          case "select":
            return (
              <FormControl {...commonProps}>
                <InputLabel>{field.label}</InputLabel>
                <Select
                  {...controllerField}
                  label={field.label}
                  disabled={isDisabled}
                >
                  {field.options?.map((option) => (
                    <MenuItem
                      key={option.value}
                      value={option.value}
                      disabled={option.disabled}
                    >
                      {option.label}
                    </MenuItem>
                  ))}
                </Select>
                {fieldState.error && (
                  <FormHelperText>{fieldState.error.message}</FormHelperText>
                )}
              </FormControl>
            );

          case "number":
            return (
              <TextField
                {...controllerField}
                {...commonProps}
                helperText={helperText}
                type="number"
                placeholder={field.placeholder}
                onChange={(event) =>
                  controllerField.onChange?.(parseInt(event.target.value, 10))
                }
              />
            );

          case "date":
          case "datetime-local":
            return (
              <TextField
                {...controllerField}
                {...commonProps}
                helperText={helperText}
                type={field.type}
                InputLabelProps={{ shrink: true }}
                value={formatDateMuiInput(controllerField.value)}
              />
            );

          case "custom":
            const displayValue = field.customDisplayValue
              ? field.customDisplayValue(controllerField.value)
              : controllerField.value?.toString() || field.placeholder || "";

            return (
              <TextField
                {...commonProps}
                helperText={helperText}
                value={displayValue}
                onClick={() => {
                  if (!isDisabled && field.onCustomClick) {
                    field.onCustomClick(controllerField.value, (newValue) => {
                      controllerField.onChange(newValue);
                    });
                  }
                }}
                InputProps={{
                  readOnly: true,
                  sx: { cursor: "pointer" },
                }}
              />
            );

          default:
            return (
              <TextField
                {...controllerField}
                {...commonProps}
                helperText={helperText}
                type={field.type}
                placeholder={field.placeholder}
              />
            );
        }
      }}
    />
  );
};

export { FormRenderer, FormFieldRenderer };

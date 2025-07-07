interface FormFieldOption {
  value: string | number;
  label: string;
  disabled?: boolean;
}

interface FormField<T extends any = any> {
  id: string;
  accessorKey?: string;
  label: string;
  type:
    | "text"
    | "email"
    | "number"
    | "select"
    | "autocomplete"
    | "multiselect"
    | "date"
    | "datetime-local"
    | "custom";

  defaultValue?: T;

  required?: boolean;

  options?: FormFieldOption[];
  loadOptions?: (query?: string) => Promise<FormFieldOption[]>;

  disabled?: boolean | ((isEdit: boolean, formData: any) => boolean);
  multiple?: boolean;

  validation?: {
    pattern?: RegExp;
    min?: number;
    max?: number;
    minLength?: number;
    maxLength?: number;
    validate?: (value: any) => string | boolean;
  };

  placeholder?: string;
  helperText?: string;

  // Layout configuration for multiple inputs per row
  layout?: {
    row: number; // Which row this field belongs to (0-based)
    column: number; // Which column in the row (0-based)
  };

  showInCreateMode?: boolean;
  showInEditMode?: boolean;

  customDisplayValue?: (value: any) => string;
  onCustomClick?: (
    currentValue: any,
    onValueChange: (value: any) => void
  ) => void;
}

export type { FormField, FormFieldOption };

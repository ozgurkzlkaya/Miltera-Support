import { useCallback } from "react";
import {
  FieldValues,
  useForm as _useForm,
  UseFormProps,
  UseFormRegister,
  UseFormReturn as _UseFormReturn,
  UseControllerProps,
} from "react-hook-form";

// import { get, set } from "lodash-es";
import type { FormField } from "./types";

interface UseFormReturn<
  TFieldValues extends FieldValues = FieldValues,
  TContext extends object = object,
> extends _UseFormReturn<TFieldValues, TContext> {
  fields: FormField[];
  defaultValues: (item?: any) => FieldValues;
  getRules: GetRules;
}

type GetRules = (
  rules?: UseControllerProps["rules"]
) => UseControllerProps["rules"];

const useForm = <
  TFieldValues extends FieldValues = FieldValues,
  TContext extends object = object,
>({
  fields,
  config,
}: {
  fields: FormField[];
  config?: UseFormProps<TFieldValues, TContext>;
}): UseFormReturn<TFieldValues, TContext> => {
  // Create default values for react-hook-form
  const defaultValues = useCallback(
    (item?: any) => {
      const defaultValues: FieldValues = {};
      fields.forEach((field) => {
        const fieldValue = item
          ? (item as any)[field.accessorKey || field.id]
          : field.defaultValue;

        (defaultValues as any)[field.id] = fieldValue;
      });
      return defaultValues;
    },
    [fields]
  );

  const { register: register_, ...rest } = _useForm({
    defaultValues: defaultValues(),
    mode: "onBlur", // Only validate on blur to reduce lag
    ...config,
  } as UseFormProps<TFieldValues, TContext>);

  const getRules = ((options) => {
    return {
      required:
        options?.required === true
          ? {
              value: true,
              message: "This field is required",
            }
          : options?.required,
      minLength:
        typeof options?.minLength === "number"
          ? {
              value: options.minLength,
              message: `This field length must be greater than ${options.minLength}`,
            }
          : options?.minLength,
      maxLength:
        typeof options?.maxLength === "number"
          ? {
              value: options.maxLength,
              message: `This field length must be less than ${options.maxLength}`,
            }
          : options?.maxLength,
      min:
        typeof options?.min === "number"
          ? {
              value: options.min,
              message: `This field must be greater than ${options.min}`,
            }
          : options?.min,
      max:
        typeof options?.max === "number"
          ? {
              value: options.max,
              message: `This field must be less than ${options.max}`,
            }
          : options?.max,
    };
  }) satisfies GetRules;

  const register: UseFormRegister<TFieldValues> = (name, options) =>
    register_(name, {
      ...options,
      ...(options ? getRules(options as any) : {}),
    });

  return {
    register,
    getRules,
    defaultValues,
    fields,
    ...rest,
  };
};

export { useForm };
export type { UseFormReturn };

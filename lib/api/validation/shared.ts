import type { ZodError, ZodSchema } from "zod"

type ValidationResult<T> =
  | { success: true; data: T }
  | { success: false; fieldErrors: Record<string, string> }

export function flattenZodFieldErrors(error: ZodError) {
  const fieldErrors: Record<string, string> = {}

  for (const issue of error.issues) {
    const key = issue.path.join(".") || "body"

    if (!fieldErrors[key]) {
      fieldErrors[key] = issue.message
    }
  }

  return fieldErrors
}

export function validateWithSchema<T>(
  schema: ZodSchema<T>,
  payload: unknown
): ValidationResult<T> {
  const result = schema.safeParse(payload)

  if (!result.success) {
    return {
      success: false,
      fieldErrors: flattenZodFieldErrors(result.error),
    }
  }

  return {
    success: true,
    data: result.data,
  }
}

export function validateIdentifierParam(value: string, fieldName: string) {
  const trimmedValue = value.trim()

  if (!trimmedValue) {
    return `${fieldName} is required.`
  }

  if (trimmedValue.length > 120) {
    return `${fieldName} looks too long.`
  }

  return null
}

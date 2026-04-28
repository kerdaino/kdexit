const TRUE_VALUES = new Set(["1", "true", "yes", "on", "enabled"])

export function readBooleanEnvFlag(
  value: string | undefined,
  defaultValue: boolean
): boolean {
  if (!value) {
    return defaultValue
  }

  return TRUE_VALUES.has(value.trim().toLowerCase())
}

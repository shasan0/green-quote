interface ErrorNode {
  errors: string[];
  properties?: Record<string, ErrorNode>;
}

export function parseAPIError(details: ErrorNode): Record<string, string> {
  const errors: Record<string, string> = {};

  if (details && details.properties) {
    for (const [key, value] of Object.entries(details.properties)) {
      if (value?.errors && value.errors.length > 0) {
        errors[key] = value.errors[0];
      }
    }
  }

  return errors;
}

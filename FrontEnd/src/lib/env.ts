function required(name: 'VITE_API_URL'): string {
  const value = import.meta.env[name];
  if (!value) {
    throw new Error(
      `${name} is not defined. Copy FrontEnd/.env.example to FrontEnd/.env.local and set it.`,
    );
  }
  return value.replace(/\/+$/, '');
}

/** Validated runtime configuration. The API URL is never hard-coded elsewhere. */
export const env = {
  apiUrl: required('VITE_API_URL'),
} as const;

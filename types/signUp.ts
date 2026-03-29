export type SignUpResult = {
  error?: { status?: number } | null;
  [key: string]: unknown;
} | null;

export type SignUpError = {
  status?: number;
  code?: string;
  message?: string;
} & Error;

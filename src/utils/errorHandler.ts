import type { AxiosError } from 'axios';

export interface ApiError {
  message: string;
  error?: string;
}

export function handleApiError(error: unknown): string {
  if (isAxiosError(error)) {
    // Handle Axios errors
    if (error.response?.data?.error) {
      return error.response.data.error;
    }
    if (error.response?.status) {
      return `Request failed with status ${error.response.status}`;
    }
    if (error.request) {
      return 'No response received from server. Please check if the backend is running on port 8000.';
    }
  }
  
  if (error instanceof Error) {
    return error.message;
  }
  
  return 'An unexpected error occurred';
}

function isAxiosError(error: unknown): error is AxiosError<ApiError> {
  return (
    typeof error === 'object' &&
    error !== null &&
    'isAxiosError' in error &&
    error.isAxiosError === true
  );
}


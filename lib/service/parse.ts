import { AxiosError } from "axios";

type BackendError = {
  errorId?: string;
  message?: string;
};

export function parseAxiosError(error: unknown): BackendError {
  if (
    typeof error === "object" &&
    error !== null &&
    "response" in error &&
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    typeof (error as any).response?.data === "object"
  ) {
    return (error as AxiosError).response?.data as BackendError;
  }

  return { message: "Erro inesperado." };
}

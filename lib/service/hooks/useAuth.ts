// /lib/service/hooks/useAuth.ts
import axios from "axios";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import {
  RegisterDto,
  LoginDto,
  SignupResponse,
  SigninResponse,
  ValidateTokenResponse,
  ValidateTokenRawResponse,
} from "../user/service";

/**
 * Helpers de token:
 */
const saveToken = (token: string | null) => {
  try {
    if (typeof window !== "undefined") {
      if (token) localStorage.setItem("accessToken", token);
      else localStorage.removeItem("accessToken");
    }
  } catch (_e) {
    // ignore
  }
};

/**
 * request helper para /api (usa axios do browser)
 */
async function nextApiPost<T>(path: string, body: unknown): Promise<T> {
  const resp = await axios.post<T>(path, body, { withCredentials: true });
  return resp.data;
}

export function useSignUp() {
  const queryClient = useQueryClient();
  return useMutation<SignupResponse, unknown, RegisterDto>({
    mutationFn: (dto) => nextApiPost<SignupResponse>("/api/auth/signup", dto),
    onSuccess: (_data) => {
      queryClient.invalidateQueries({ queryKey: ["auth", "user"] });
    },
  });
}

type UseSignInOptions = {
  saveToken?: boolean;
  onSuccess?: (data: SigninResponse) => void;
};

export function useSignIn(opts?: UseSignInOptions) {
  const queryClient = useQueryClient();

  return useMutation<SigninResponse, unknown, LoginDto>({
    mutationFn: (dto) => nextApiPost<SigninResponse>("/api/auth/signin", dto),
    onSuccess: (data) => {
      if (opts?.saveToken ?? true) {
        if (data?.accessToken) saveToken(data.accessToken);
      }
      if (data?.user) queryClient.setQueryData(["auth", "user"], data.user);
      if (opts?.onSuccess) opts.onSuccess(data);
    },
    onError: () => {
      // não remove token automaticamente aqui
    },
  });
}

type UseValidateTokenOptions = {
  enabled?: boolean;
  onSuccess?: (data: ValidateTokenResponse) => void;
};

export function useValidateToken(opts?: UseValidateTokenOptions) {
  return useQuery<ValidateTokenResponse, unknown>({
    queryKey: ["auth", "validate-token"],
    queryFn: async () => {
      const r = await axios.get<ValidateTokenResponse>(
        "/api/auth/validate-token",
        {
          withCredentials: true,
        }
      );
      return r.data;
    },
    enabled: opts?.enabled ?? true,
  });
}

export function useValidateTokenRaw() {
  return useMutation<ValidateTokenRawResponse, unknown, string>({
    mutationFn: (token) =>
      axios
        .post<ValidateTokenRawResponse>(
          "/api/auth/validate-token-raw",
          { token },
          { withCredentials: true }
        )
        .then((r) => r.data),
  });
}

/**
 * logout helper
 */
export async function logout() {
  try {
    await axios.post("/api/auth/logout", {}, { withCredentials: true });
  } catch (_e) {
    // ignore
  } finally {
    saveToken(null);
  }
}

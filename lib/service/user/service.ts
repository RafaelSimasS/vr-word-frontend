// /lib/service/user/service.ts
import axiosClient from "../adapter/axiosClient";

type User = {
  id: string;
  email: string;
};

export type RegisterDto = {
  email: string;
  password: string;
};

export type LoginDto = {
  email: string;
  password: string;
};

export type SignupResponse = {
  id: string;
  email: string;
  createdAt: string | Date;
};

export type SigninResponse = {
  accessToken: string;
  user: {
    id: string;
    email: string;
  };
};

export type ValidateTokenResponse = {
  user: User;
};

export type ValidateTokenRawResponse = {
  valid: boolean;
  user?: User;
};

/**
 * Chamadas HTTP
 */

export async function signup(dto: RegisterDto): Promise<SignupResponse> {
  const res = await axiosClient.post("/auth/signup", dto);
  return res.data as SignupResponse;
}

export async function signin(dto: LoginDto): Promise<SigninResponse> {
  const res = await axiosClient.post("/auth/signin", dto);
  return res.data as SigninResponse;
}

/**
 * Chama endpoint GET /auth/validate-token protegido por guard (usa cookie ou Authorization header).
 * Se backend usar cookie httpOnly, comCredentials:true -> o cookie será enviado automaticamente.
 */
export async function validateToken(): Promise<ValidateTokenResponse> {
  const res = await axiosClient.get("/auth/validate-token");
  return res.data as ValidateTokenResponse;
}

/**
 * Chama POST /auth/validate-token-raw com header Authorization.
 * Use quando tiver token raw (por exemplo, token que está em memória/localStorage).
 */
export async function validateTokenRaw(
  token: string
): Promise<ValidateTokenRawResponse> {
  const res = await axiosClient.post("/auth/validate-token-raw", null, {
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });
  return res.data as ValidateTokenRawResponse;
}

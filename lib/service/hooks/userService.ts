import type { AxiosResponse } from "axios";
import axiosClient from "../adapter/axiosClient";

type BackendResponse = {
  status: number;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  data: any;
  setCookie?: string | string[] | undefined;
};

function forwardAxiosResponse(resp: AxiosResponse): BackendResponse {
  const setCookie = resp.headers ? resp.headers["set-cookie"] : undefined;
  return {
    status: resp.status,
    data: resp.data,
    setCookie,
  };
}

async function safeGet(
  url: string,
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  options: any = {}
): Promise<BackendResponse> {
  try {
    const resp = await axiosClient.get(url, options);
    return forwardAxiosResponse(resp);
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
  } catch (err: any) {
    if (err.response) {
      return forwardAxiosResponse(err.response);
    }
    throw err;
  }
}

async function safePost(
  url: string,
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  body: any,
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  options: any = {}
): Promise<BackendResponse> {
  try {
    const resp = await axiosClient.post(url, body, options);
    return forwardAxiosResponse(resp);
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
  } catch (err: any) {
    if (err.response) {
      return forwardAxiosResponse(err.response);
    }
    throw err;
  }
}

export async function serverSignIn(
  dto: unknown,
  cookie?: string
): Promise<BackendResponse> {
  const headers: Record<string, string> = {};
  if (cookie) headers.cookie = cookie;
  return await safePost("/auth/signin", dto, {
    headers,
    withCredentials: true,
  });
}
export async function serverSignUp(
  dto: unknown,
  cookie?: string
): Promise<BackendResponse> {
  const headers: Record<string, string> = {};
  if (cookie) headers.cookie = cookie;
  return await safePost("/auth/signup", dto, {
    headers,
    withCredentials: true,
  });
}

export async function serverValidateToken(
  cookie?: string
): Promise<BackendResponse> {
  const headers: Record<string, string> = {};
  if (cookie) headers.cookie = cookie;

  return await safeGet("/auth/validate-token", {
    headers,
    withCredentials: true,
  });
}

export async function serverValidateTokenRaw(
  authorization?: string
): Promise<BackendResponse> {
  const headers: Record<string, string> = {};
  if (authorization) headers.authorization = authorization;
  return await safePost(
    "/auth/validate-token-raw",
    {},
    { headers, withCredentials: true }
  );
}

export async function serverLogout(cookie?: string): Promise<BackendResponse> {
  const headers: Record<string, string> = {};
  if (cookie) headers.cookie = cookie;
  return await safePost("/auth/logout", {}, { headers, withCredentials: true });
}

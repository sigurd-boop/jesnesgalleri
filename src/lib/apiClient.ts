import { getFirebaseAuth } from './firebase';

const DEFAULT_API_BASE_URL = '';

const buildBaseUrl = () => {
  const configured = (import.meta.env.VITE_API_BASE_URL ?? '').trim();
  if (configured) {
    return configured.replace(/\/+$/, '');
  }
  return DEFAULT_API_BASE_URL;
};

const API_BASE_URL = buildBaseUrl();

export class ApiError extends Error {
  status: number;

  constructor(message: string, status: number) {
    super(message);
    this.name = 'ApiError';
    this.status = status;
  }
}

type RequestOptions = {
  path: string;
  method?: string;
  body?: unknown;
  headers?: HeadersInit;
  auth?: boolean;
  signal?: AbortSignal;
};

export const apiRequest = async <T = unknown>({
  path,
  method = 'GET',
  body,
  headers,
  auth = false,
  signal,
}: RequestOptions): Promise<T> => {
  const resolvedHeaders = new Headers(headers ?? {});
  if (!resolvedHeaders.has('Accept')) {
    resolvedHeaders.set('Accept', 'application/json');
  }

  let requestBody: BodyInit | undefined;
  if (body !== undefined) {
    requestBody = JSON.stringify(body);
    resolvedHeaders.set('Content-Type', 'application/json');
  }

  if (auth) {
    const token = await requireAuthToken();
    resolvedHeaders.set('Authorization', `Bearer ${token}`);
  }

  const response = await fetch(`${API_BASE_URL}${path}`, {
    method,
    body: requestBody,
    headers: resolvedHeaders,
    signal,
  });

  if (!response.ok) {
    throw new ApiError(await extractErrorMessage(response), response.status);
  }

  if (response.status === 204) {
    return undefined as T;
  }

  const text = await response.text();
  if (!text) {
    return undefined as T;
  }

  try {
    return JSON.parse(text) as T;
  } catch {
    return text as T;
  }
};

type FormRequestOptions = {
  path: string;
  formData: FormData;
  auth?: boolean;
  signal?: AbortSignal;
  method?: string;
};

export const apiFormRequest = async <T = unknown>({
  path,
  formData,
  auth = false,
  signal,
  method = 'POST',
}: FormRequestOptions): Promise<T> => {
  const headers = new Headers();
  if (auth) {
    const token = await requireAuthToken();
    headers.set('Authorization', `Bearer ${token}`);
  }

  const response = await fetch(`${API_BASE_URL}${path}`, {
    method,
    body: formData,
    headers,
    signal,
  });

  if (!response.ok) {
    throw new ApiError(await extractErrorMessage(response), response.status);
  }

  const text = await response.text();
  if (!text) {
    return undefined as T;
  }

  try {
    return JSON.parse(text) as T;
  } catch {
    return text as T;
  }
};

const requireAuthToken = async () => {
  const auth = getFirebaseAuth();
  const currentUser = auth?.currentUser;
  if (!currentUser) {
    throw new Error('Du må være innlogget for å utføre denne handlingen.');
  }
  return currentUser.getIdToken();
};

const extractErrorMessage = async (response: Response) => {
  const payload = await response.text().catch(() => '');
  if (!payload) {
    return response.statusText;
  }

  try {
    const body = JSON.parse(payload);
    if (typeof body === 'string') {
      return body;
    }
    if (body?.message) {
      return body.message;
    }
    if (body?.title) {
      return body.title;
    }
    return JSON.stringify(body);
  } catch {
    return payload;
  }
};

export const getApiBaseUrl = () => API_BASE_URL;

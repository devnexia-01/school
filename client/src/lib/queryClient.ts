import { QueryClient, QueryFunction } from "@tanstack/react-query";

const TENANT_ID_KEY = 'superadmin_viewing_tenant';

function getTenantIdFromUrl(): string | null {
  if (typeof window === 'undefined') return null;
  const params = new URLSearchParams(window.location.search);
  const urlTenantId = params.get('tenantId');
  
  if (urlTenantId) {
    sessionStorage.setItem(TENANT_ID_KEY, urlTenantId);
    return urlTenantId;
  }
  
  return sessionStorage.getItem(TENANT_ID_KEY);
}

export function clearTenantContext() {
  if (typeof window !== 'undefined') {
    sessionStorage.removeItem(TENANT_ID_KEY);
  }
}

function appendTenantIdToUrl(url: string): string {
  const tenantId = getTenantIdFromUrl();
  if (!tenantId) return url;
  
  const separator = url.includes('?') ? '&' : '?';
  return `${url}${separator}tenantId=${tenantId}`;
}

async function throwIfResNotOk(res: Response) {
  if (!res.ok) {
    const text = (await res.text()) || res.statusText;
    throw new Error(`${res.status}: ${text}`);
  }
}

export async function apiRequest(
  url: string,
  options?: RequestInit
): Promise<Response> {
  const urlWithTenant = appendTenantIdToUrl(url);
  const res = await fetch(urlWithTenant, {
    ...options,
    headers: {
      "Content-Type": "application/json",
      ...options?.headers,
    },
    credentials: "include",
  });

  await throwIfResNotOk(res);
  return res;
}

type UnauthorizedBehavior = "returnNull" | "throw";
export const getQueryFn: <T>(options: {
  on401: UnauthorizedBehavior;
}) => QueryFunction<T> =
  ({ on401: unauthorizedBehavior }) =>
  async ({ queryKey }) => {
    const url = appendTenantIdToUrl(queryKey.join("/") as string);
    const res = await fetch(url, {
      credentials: "include",
    });

    if (unauthorizedBehavior === "returnNull" && res.status === 401) {
      return null;
    }

    await throwIfResNotOk(res);
    return await res.json();
  };

export const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      queryFn: getQueryFn({ on401: "throw" }),
      refetchInterval: false,
      refetchOnWindowFocus: false,
      staleTime: Infinity,
      retry: false,
    },
    mutations: {
      retry: false,
    },
  },
});

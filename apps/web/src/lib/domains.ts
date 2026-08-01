const API_BASE_URL =
  process.env.NEXT_PUBLIC_API_BASE_URL?.replace(/\/$/, "") ?? "http://localhost:4000";

export type DomainAvailability = {
  available: boolean;
  reason?: string;
};

export type DomainInstructions = {
  recordType: string;
  host: string;
  value?: string | string[];
};

export type DomainProject = {
  id: string;
  domainType?: string | null;
  domain?: string | null;
  domainStatus?: string | null;
  domainError?: string | null;
};

export type ConnectCustomDomainResult = DomainProject & {
  instructions: DomainInstructions;
};

export type DomainStatus = {
  domain: string | null;
  domainStatus: string;
  domainError?: string | null;
};

async function requestJson<T>(
  path: string,
  apiToken: string,
  init?: RequestInit
): Promise<T> {
  const response = await fetch(`${API_BASE_URL}${path}`, {
    ...init,
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${apiToken}`,
      ...(init?.headers ?? {}),
    },
    cache: "no-store",
  });

  const body = (await response.json().catch(() => null)) as (T & { error?: string; message?: string }) | null;
  if (!response.ok) {
    const error = new Error(body?.message ?? body?.error ?? "Request failed");
    (error as Error & { code?: string; status?: number }).code = body?.error;
    (error as Error & { code?: string; status?: number }).status = response.status;
    throw error;
  }

  return body as T;
}

export async function checkSubdomainAvailability(
  apiToken: string,
  projectId: string,
  value: string
): Promise<DomainAvailability> {
  return requestJson<DomainAvailability>(
    `/projects/${projectId}/domain/subdomain-availability?value=${encodeURIComponent(value)}`,
    apiToken
  );
}

export async function claimSubdomain(
  apiToken: string,
  projectId: string,
  subdomain: string
): Promise<DomainProject> {
  return requestJson<DomainProject>(`/projects/${projectId}/domain/subdomain`, apiToken, {
    method: "POST",
    body: JSON.stringify({ subdomain }),
  });
}

export async function connectCustomDomain(
  apiToken: string,
  projectId: string,
  domain: string
): Promise<ConnectCustomDomainResult> {
  return requestJson<ConnectCustomDomainResult>(`/projects/${projectId}/domain/custom`, apiToken, {
    method: "POST",
    body: JSON.stringify({ domain }),
  });
}

export async function fetchDomainStatus(apiToken: string, projectId: string): Promise<DomainStatus> {
  return requestJson<DomainStatus>(`/projects/${projectId}/domain/status`, apiToken);
}

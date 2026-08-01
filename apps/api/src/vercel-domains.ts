type VercelVerificationChallenge = {
  type: string;
  domain: string;
  value: string;
  reason: string;
};

type AddDomainResult = {
  name: string;
  apexName: string;
  verified: boolean;
  verification?: VercelVerificationChallenge[];
};

type ProjectDomainResult = {
  name: string;
  apexName: string;
  verified: boolean;
  verification?: VercelVerificationChallenge[];
};

type DomainConfigResult = {
  misconfigured: boolean;
  recommendedCNAME?: { rank: number; value: string }[];
  recommendedIPv4?: { rank: number; value: string[] }[];
};

export class VercelApiError extends Error {
  status: number;
  code?: string;

  constructor(status: number, message: string, code?: string) {
    super(message);
    this.name = "VercelApiError";
    this.status = status;
    this.code = code;
  }
}

type VercelDomainsClient = {
  addDomain(name: string): Promise<AddDomainResult>;
  getDomainConfig(name: string): Promise<DomainConfigResult>;
  getProjectDomain(name: string): Promise<ProjectDomainResult>;
  verifyDomain(name: string): Promise<ProjectDomainResult>;
  removeDomain(name: string): Promise<void>;
};

const VERCEL_API_BASE = "https://api.vercel.com";

let cachedClient: VercelDomainsClient | null = null;
let cachedConfigKey: string | null = null;

export const getVercelDomainsClient = (): VercelDomainsClient | null => {
  const token = process.env.VERCEL_API_TOKEN;
  const projectId = process.env.VERCEL_PROJECT_ID;
  const teamId = process.env.VERCEL_TEAM_ID;

  if (!token || !projectId) {
    return null;
  }

  const configKey = `${token}:${projectId}:${teamId ?? ""}`;
  if (cachedClient && cachedConfigKey === configKey) {
    return cachedClient;
  }

  const withTeamQuery = (path: string, extra: Record<string, string> = {}) => {
    const url = new URL(`${VERCEL_API_BASE}${path}`);
    if (teamId) {
      url.searchParams.set("teamId", teamId);
    }
    for (const [key, value] of Object.entries(extra)) {
      url.searchParams.set(key, value);
    }
    return url.toString();
  };

  const request = async <T>(url: string, init?: RequestInit): Promise<T> => {
    const response = await fetch(url, {
      ...init,
      headers: {
        Authorization: `Bearer ${token}`,
        "Content-Type": "application/json",
        ...(init?.headers ?? {}),
      },
    });

    if (!response.ok) {
      const body = (await response.json().catch(() => null)) as { error?: { code?: string; message?: string } } | null;
      throw new VercelApiError(
        response.status,
        body?.error?.message ?? `Vercel API request failed with status ${response.status}`,
        body?.error?.code
      );
    }

    if (response.status === 204) {
      return undefined as T;
    }

    return (await response.json()) as T;
  };

  cachedClient = {
    addDomain: (name) =>
      request<AddDomainResult>(withTeamQuery(`/v10/projects/${projectId}/domains`), {
        method: "POST",
        body: JSON.stringify({ name }),
      }),

    getDomainConfig: (name) =>
      request<DomainConfigResult>(withTeamQuery(`/v6/domains/${encodeURIComponent(name)}/config`, { projectIdOrName: projectId })),

    getProjectDomain: (name) =>
      request<ProjectDomainResult>(withTeamQuery(`/v9/projects/${projectId}/domains/${encodeURIComponent(name)}`)),

    verifyDomain: (name) =>
      request<ProjectDomainResult>(withTeamQuery(`/v9/projects/${projectId}/domains/${encodeURIComponent(name)}/verify`), {
        method: "POST",
      }),

    removeDomain: (name) =>
      request<void>(withTeamQuery(`/v9/projects/${projectId}/domains/${encodeURIComponent(name)}`), {
        method: "DELETE",
      }),
  };
  cachedConfigKey = configKey;

  return cachedClient;
};

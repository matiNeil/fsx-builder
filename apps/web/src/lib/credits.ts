export type CreditCosts = Record<string, number>;

export type CreditBalance = {
  plan: { key: string; name: string; monthlyCredits: number | null };
  creditsRemaining: number;
  creditsUsedThisPeriod: number;
  currentPeriodEnd: string;
};

export type UsageBreakdown = {
  website: number;
  poster: number;
  image: number;
};

const API_BASE_URL =
  process.env.NEXT_PUBLIC_API_BASE_URL?.replace(/\/$/, "") ?? "http://localhost:4000";

export async function fetchCreditCosts(): Promise<CreditCosts> {
  const response = await fetch(`${API_BASE_URL}/credits/costs`);
  if (!response.ok) {
    throw new Error("Failed to load credit costs");
  }
  return (await response.json()) as CreditCosts;
}

export async function fetchBalance(apiToken: string): Promise<CreditBalance> {
  const response = await fetch(`${API_BASE_URL}/credits/balance`, {
    headers: { Authorization: `Bearer ${apiToken}` },
    cache: "no-store",
  });
  if (!response.ok) {
    throw new Error("Failed to load credit balance");
  }
  return (await response.json()) as CreditBalance;
}

export async function fetchUsageBreakdown(apiToken: string): Promise<UsageBreakdown> {
  const response = await fetch(`${API_BASE_URL}/credits/usage-breakdown`, {
    headers: { Authorization: `Bearer ${apiToken}` },
    cache: "no-store",
  });
  if (!response.ok) {
    throw new Error("Failed to load usage breakdown");
  }
  return (await response.json()) as UsageBreakdown;
}

export function canAfford(
  creditsRemaining: number,
  action: string,
  costs: CreditCosts
): { ok: boolean; required: number } {
  const required = costs[action] ?? 0;
  return { ok: creditsRemaining >= required, required };
}

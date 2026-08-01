const API_BASE_URL =
  process.env.NEXT_PUBLIC_API_BASE_URL?.replace(/\/$/, "") ?? "http://localhost:4000";

export type CheckoutResponse = {
  redirectUrl: string;
  reference: string;
};

export type PaymentStatus = {
  status: string;
  kind: "plan" | "credits" | "hosting";
  label?: string;
  credits?: number;
  hostingExpiresAt?: string | null;
};

export type CreditPack = {
  key: string;
  name: string;
  credits: number;
  priceCents: number;
};

async function postCheckout(path: string, apiToken: string, body: Record<string, string>) {
  const response = await fetch(`${API_BASE_URL}${path}`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${apiToken}`,
    },
    body: JSON.stringify(body),
  });

  const responseBody = (await response.json().catch(() => null)) as
    | (CheckoutResponse & { error?: string; message?: string })
    | null;

  if (!response.ok || !responseBody?.redirectUrl) {
    throw new Error(responseBody?.message ?? responseBody?.error ?? "Failed to start checkout");
  }

  return { redirectUrl: responseBody.redirectUrl, reference: responseBody.reference };
}

export async function startCheckout(apiToken: string, planKey: string): Promise<CheckoutResponse> {
  return postCheckout("/billing/checkout", apiToken, { planKey });
}

export async function startCreditCheckout(apiToken: string, packKey: string): Promise<CheckoutResponse> {
  return postCheckout("/billing/checkout/credits", apiToken, { packKey });
}

export async function startHostingCheckout(apiToken: string, projectId: string): Promise<CheckoutResponse> {
  return postCheckout("/billing/checkout/hosting", apiToken, { projectId });
}

export async function fetchPaymentStatus(apiToken: string, reference: string): Promise<PaymentStatus> {
  const response = await fetch(`${API_BASE_URL}/billing/status/${encodeURIComponent(reference)}`, {
    headers: { Authorization: `Bearer ${apiToken}` },
    cache: "no-store",
  });

  if (!response.ok) {
    throw new Error("Failed to load payment status");
  }

  return (await response.json()) as PaymentStatus;
}

export async function fetchCreditPacks(): Promise<CreditPack[]> {
  const response = await fetch(`${API_BASE_URL}/billing/credit-packs`, { cache: "no-store" });
  if (!response.ok) {
    throw new Error("Failed to load credit packs");
  }
  return (await response.json()) as CreditPack[];
}

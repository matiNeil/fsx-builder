import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { auth } from "@/auth";
import { SiteNav } from "@/components/marketing/site-nav";
import { startCheckout } from "@/lib/billing";

type Plan = {
  key: string;
  name: string;
  priceLabel: string;
  credits: string;
  features: string[];
  highlighted?: boolean;
  purchasable: boolean;
};

const PLANS: Plan[] = [
  {
    key: "free",
    name: "Free",
    priceLabel: "$0/mo",
    credits: "50 credits / month",
    features: ["FSX subdomain", "All three tools"],
    purchasable: false,
  },
  {
    key: "starter",
    name: "Starter",
    priceLabel: "$19/mo",
    credits: "500 credits / month",
    features: ["Custom domains", "All three tools"],
    purchasable: true,
  },
  {
    key: "pro",
    name: "Pro",
    priceLabel: "$49/mo",
    credits: "2,000 credits / month",
    features: ["Custom domains", "Priority generation"],
    highlighted: true,
    purchasable: true,
  },
  {
    key: "business",
    name: "Business",
    priceLabel: "$99/mo",
    credits: "6,000 credits / month",
    features: ["Custom domains", "Priority generation", "Team workspace"],
    purchasable: true,
  },
  {
    key: "enterprise",
    name: "Enterprise",
    priceLabel: "Custom pricing",
    credits: "Custom credit allotment",
    features: ["Everything in Business", "Dedicated support"],
    purchasable: false,
  },
];

async function checkoutAction(formData: FormData) {
  "use server";
  const planKey = formData.get("planKey");
  if (typeof planKey !== "string" || !planKey) {
    return;
  }

  const session = await auth();
  if (!session?.apiToken) {
    redirect(`/login?callbackUrl=/pricing`);
  }

  let redirectUrl: string | null = null;
  try {
    const result = await startCheckout(session.apiToken, planKey);
    redirectUrl = result.redirectUrl;
    (await cookies()).set("fsx_pending_payment", result.reference, {
      httpOnly: true,
      sameSite: "lax",
      maxAge: 60 * 30,
      path: "/",
    });
  } catch {
    redirectUrl = null;
  }

  if (!redirectUrl) {
    redirect("/pricing?checkoutError=1");
  }

  redirect(redirectUrl);
}

export default async function PricingPage({
  searchParams,
}: {
  searchParams: Promise<{ checkoutError?: string }>;
}) {
  const session = await auth();
  const { checkoutError } = await searchParams;

  return (
    <>
      <SiteNav />
      <main className="mx-auto flex w-full max-w-5xl flex-1 flex-col gap-10 px-6 py-16 sm:px-10">
        <div className="space-y-3 text-center">
          <h1 className="text-4xl font-semibold tracking-tight">Simple, credit-based pricing</h1>
          <p className="mx-auto max-w-xl text-zinc-600 dark:text-zinc-400">
            Start free. Upgrade any time for more monthly credits and custom domains.
          </p>
        </div>
        {checkoutError ? (
          <p className="mx-auto max-w-xl rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-center text-sm text-red-700 dark:border-red-900 dark:bg-red-950/40 dark:text-red-300">
            We couldn&apos;t start checkout with Paynow. Please try again in a moment.
          </p>
        ) : null}
        <div className="grid gap-5 lg:grid-cols-5">
          {PLANS.map((plan) => (
            <div
              key={plan.key}
              className={`flex flex-col rounded-2xl border p-5 ${
                plan.highlighted
                  ? "border-blue-500 shadow-lg shadow-blue-500/10"
                  : "border-zinc-200 dark:border-zinc-800"
              }`}
            >
              <h2 className="text-lg font-medium">{plan.name}</h2>
              <p className="mt-2 text-2xl font-semibold">{plan.priceLabel}</p>
              <p className="mt-1 text-sm text-zinc-500 dark:text-zinc-400">{plan.credits}</p>
              <ul className="mt-4 flex-1 space-y-2 text-sm text-zinc-600 dark:text-zinc-400">
                {plan.features.map((feature) => (
                  <li key={feature} className="flex items-center gap-2">
                    <span className="text-emerald-500">✓</span>
                    {feature}
                  </li>
                ))}
              </ul>
              {plan.purchasable && session?.apiToken ? (
                <form action={checkoutAction} className="mt-6">
                  <input type="hidden" name="planKey" value={plan.key} />
                  <button
                    type="submit"
                    className="btn-gradient w-full rounded-lg px-4 py-2 text-center text-sm font-medium text-white"
                  >
                    Buy
                  </button>
                </form>
              ) : (
                <a
                  href={plan.purchasable ? "/register" : plan.key === "enterprise" ? "/contact" : "/register"}
                  className="btn-gradient mt-6 rounded-lg px-4 py-2 text-center text-sm font-medium text-white"
                >
                  {plan.key === "enterprise" ? "Contact sales" : "Get started"}
                </a>
              )}
            </div>
          ))}
        </div>
      </main>
    </>
  );
}

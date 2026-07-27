import { SiteNav } from "@/components/marketing/site-nav";

type Plan = {
  key: string;
  name: string;
  priceLabel: string;
  credits: string;
  features: string[];
  highlighted?: boolean;
};

const PLANS: Plan[] = [
  {
    key: "free",
    name: "Free",
    priceLabel: "$0/mo",
    credits: "50 credits / month",
    features: ["FSX subdomain", "All three tools"],
  },
  {
    key: "starter",
    name: "Starter",
    priceLabel: "$19/mo",
    credits: "500 credits / month",
    features: ["Custom domains", "All three tools"],
  },
  {
    key: "pro",
    name: "Pro",
    priceLabel: "$49/mo",
    credits: "2,000 credits / month",
    features: ["Custom domains", "Priority generation"],
    highlighted: true,
  },
  {
    key: "business",
    name: "Business",
    priceLabel: "$99/mo",
    credits: "6,000 credits / month",
    features: ["Custom domains", "Priority generation", "Team workspace"],
  },
  {
    key: "enterprise",
    name: "Enterprise",
    priceLabel: "Custom pricing",
    credits: "Custom credit allotment",
    features: ["Everything in Business", "Dedicated support"],
  },
];

export default function PricingPage() {
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
              {plan.key === "free" ? (
                <a
                  href="/register"
                  className="btn-gradient mt-6 rounded-lg px-4 py-2 text-center text-sm font-medium text-white"
                >
                  Get started
                </a>
              ) : (
                <span className="mt-6 rounded-lg border border-zinc-300 px-4 py-2 text-center text-sm font-medium text-zinc-500 dark:border-zinc-700 dark:text-zinc-500">
                  Coming soon
                </span>
              )}
            </div>
          ))}
        </div>
      </main>
    </>
  );
}

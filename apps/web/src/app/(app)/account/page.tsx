import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { auth, signOut } from "@/auth";
import { fetchBalance } from "@/lib/credits";
import { fetchCreditPacks, startCreditCheckout } from "@/lib/billing";

async function buyCreditsAction(formData: FormData) {
  "use server";
  const packKey = formData.get("packKey");
  if (typeof packKey !== "string" || !packKey) {
    return;
  }

  const session = await auth();
  if (!session?.apiToken) {
    redirect("/login");
  }

  let redirectUrl: string | null = null;
  try {
    const result = await startCreditCheckout(session.apiToken, packKey);
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
    redirect("/account?checkoutError=1");
  }

  redirect(redirectUrl);
}

export default async function AccountPage({
  searchParams,
}: {
  searchParams: Promise<{ checkoutError?: string }>;
}) {
  const session = await auth();
  if (!session?.apiToken) {
    redirect("/login");
  }

  const { checkoutError } = await searchParams;
  const [balance, creditPacks] = await Promise.all([
    fetchBalance(session.apiToken),
    fetchCreditPacks().catch(() => []),
  ]);

  return (
    <main className="mx-auto flex w-full max-w-2xl flex-col gap-8 px-6 py-16">
      <div className="space-y-1">
        <h1 className="text-2xl font-semibold">Account</h1>
        <p className="text-sm text-zinc-600 dark:text-zinc-400">{session.user?.email}</p>
      </div>

      {checkoutError ? (
        <p className="rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700 dark:border-red-900 dark:bg-red-950/40 dark:text-red-300">
          We couldn&apos;t start checkout with Paynow. Please try again in a moment.
        </p>
      ) : null}

      <section className="rounded-xl border border-zinc-200 p-6 dark:border-zinc-800">
        <dl className="grid grid-cols-2 gap-4 text-sm">
          <div>
            <dt className="text-zinc-500 dark:text-zinc-400">Plan</dt>
            <dd className="font-medium">{balance.plan.name}</dd>
          </div>
          <div>
            <dt className="text-zinc-500 dark:text-zinc-400">Credits remaining</dt>
            <dd className="font-medium">{balance.creditsRemaining}</dd>
          </div>
          <div>
            <dt className="text-zinc-500 dark:text-zinc-400">Used this period</dt>
            <dd className="font-medium">{balance.creditsUsedThisPeriod}</dd>
          </div>
          <div>
            <dt className="text-zinc-500 dark:text-zinc-400">Next reset</dt>
            <dd className="font-medium">{new Date(balance.currentPeriodEnd).toLocaleDateString()}</dd>
          </div>
        </dl>
      </section>

      <a
        href="/pricing"
        className="btn-gradient self-start rounded-lg px-4 py-2 text-sm font-medium text-white"
      >
        Upgrade plan
      </a>

      {creditPacks.length > 0 ? (
        <section className="space-y-3">
          <h2 className="text-lg font-medium">Buy more credits</h2>
          <p className="text-sm text-zinc-600 dark:text-zinc-400">
            Top up your balance any time without changing your plan.
          </p>
          <div className="grid gap-4 sm:grid-cols-3">
            {creditPacks.map((pack) => (
              <div
                key={pack.key}
                className="flex flex-col gap-3 rounded-xl border border-zinc-200 p-4 dark:border-zinc-800"
              >
                <div>
                  <p className="text-lg font-semibold">{pack.credits.toLocaleString()} credits</p>
                  <p className="text-sm text-zinc-500 dark:text-zinc-400">
                    ${(pack.priceCents / 100).toFixed(2)}
                  </p>
                </div>
                <form action={buyCreditsAction}>
                  <input type="hidden" name="packKey" value={pack.key} />
                  <button
                    type="submit"
                    className="btn-gradient w-full rounded-lg px-4 py-2 text-center text-sm font-medium text-white"
                  >
                    Buy
                  </button>
                </form>
              </div>
            ))}
          </div>
        </section>
      ) : null}

      <form
        action={async () => {
          "use server";
          await signOut({ redirectTo: "/login" });
        }}
      >
        <button
          type="submit"
          className="rounded-lg border border-zinc-300 px-4 py-2 text-sm font-medium hover:bg-zinc-50 dark:border-zinc-700 dark:hover:bg-zinc-900"
        >
          Sign out
        </button>
      </form>
    </main>
  );
}

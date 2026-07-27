import { redirect } from "next/navigation";
import { auth, signOut } from "@/auth";
import { fetchBalance } from "@/lib/credits";

export default async function AccountPage() {
  const session = await auth();
  if (!session?.apiToken) {
    redirect("/login");
  }

  const balance = await fetchBalance(session.apiToken);

  return (
    <main className="mx-auto flex w-full max-w-2xl flex-col gap-8 px-6 py-16">
      <div className="space-y-1">
        <h1 className="text-2xl font-semibold">Account</h1>
        <p className="text-sm text-zinc-600 dark:text-zinc-400">{session.user?.email}</p>
      </div>

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

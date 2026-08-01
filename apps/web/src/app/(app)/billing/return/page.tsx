import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { auth } from "@/auth";
import { SiteNav } from "@/components/marketing/site-nav";
import { fetchPaymentStatus } from "@/lib/billing";

const PAID_STATUSES = new Set(["paid", "awaiting delivery", "delivered"]);

export default async function BillingReturnPage() {
  const session = await auth();
  if (!session?.apiToken) {
    redirect("/login");
  }

  const cookieStore = await cookies();
  const reference = cookieStore.get("fsx_pending_payment")?.value;
  cookieStore.delete("fsx_pending_payment");

  if (!reference) {
    return (
      <>
        <SiteNav />
        <main className="mx-auto flex w-full max-w-lg flex-1 flex-col items-center gap-4 px-6 py-24 text-center">
          <h1 className="text-2xl font-semibold">No pending payment found</h1>
          <p className="text-sm text-zinc-600 dark:text-zinc-400">
            Check your account page to see your current plan and credits.
          </p>
          <a href="/account" className="btn-gradient rounded-lg px-4 py-2 text-sm font-medium text-white">
            Go to account
          </a>
        </main>
      </>
    );
  }

  let statusLabel = "Payment pending";
  let successMessage = "";
  let isPaid = false;
  try {
    const result = await fetchPaymentStatus(session.apiToken, reference);
    isPaid = PAID_STATUSES.has(result.status.toLowerCase());
    statusLabel = isPaid ? "Payment successful" : `Payment ${result.status.toLowerCase()}`;
    successMessage =
      result.kind === "credits"
        ? `${result.credits ?? ""} credits have been added to your account.`
        : result.kind === "hosting"
          ? `Hosting for "${result.label ?? "your site"}" is active until ${
              result.hostingExpiresAt ? new Date(result.hostingExpiresAt).toLocaleDateString() : "your next renewal"
            }.`
          : `Your account has been upgraded to the ${result.label ?? ""} plan and your credits are ready to use.`;
  } catch {
    statusLabel = "We couldn't confirm this payment yet";
  }

  return (
    <>
      <SiteNav />
      <main className="mx-auto flex w-full max-w-lg flex-1 flex-col items-center gap-4 px-6 py-24 text-center">
        <h1 className="text-2xl font-semibold">{statusLabel}</h1>
        <p className="text-sm text-zinc-600 dark:text-zinc-400">
          {isPaid
            ? successMessage
            : "If you completed payment on Paynow, it can take a minute to confirm. Refresh your account page shortly."}
        </p>
        <a href="/account" className="btn-gradient rounded-lg px-4 py-2 text-sm font-medium text-white">
          Go to account
        </a>
      </main>
    </>
  );
}

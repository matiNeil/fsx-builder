import { redirect } from "next/navigation";
import { auth } from "@/auth";
import { fetchBalance, fetchUsageBreakdown } from "@/lib/credits";
import { getInitials } from "@/lib/format";
import { DashboardSidebar } from "./_components/dashboard-sidebar";
import { DashboardTopbar } from "./_components/dashboard-topbar";
import { QuickActions } from "./_components/quick-actions";
import { RecentProjects, type DashboardProject } from "./_components/recent-projects";
import { UsageOverview } from "./_components/usage-overview";

const API_BASE_URL =
  process.env.NEXT_PUBLIC_API_BASE_URL?.replace(/\/$/, "") ?? "http://localhost:4000";

async function fetchProjects(apiToken: string): Promise<DashboardProject[]> {
  const response = await fetch(`${API_BASE_URL}/projects`, {
    headers: { Authorization: `Bearer ${apiToken}` },
    cache: "no-store",
  });
  if (!response.ok) {
    return [];
  }
  return (await response.json()) as DashboardProject[];
}

export default async function DashboardPage() {
  const session = await auth();
  if (!session?.apiToken) {
    redirect("/login");
  }

  const [balance, usage, projects] = await Promise.all([
    fetchBalance(session.apiToken),
    fetchUsageBreakdown(session.apiToken),
    fetchProjects(session.apiToken),
  ]);

  const displayName = session.user?.name ?? session.user?.email ?? "there";

  return (
    <div className="flex min-h-screen">
      <DashboardSidebar />
      <div className="flex-1">
        <DashboardTopbar
          name={displayName}
          initials={getInitials(session.user?.name ?? session.user?.email)}
          planName={balance.plan.name}
          creditsRemaining={balance.creditsRemaining}
        />
        <main className="mx-auto max-w-6xl space-y-8 px-6 py-8 sm:px-10">
          <QuickActions />
          <div className="grid gap-6 lg:grid-cols-[minmax(0,1fr)_320px]">
            <RecentProjects projects={projects} />
            <UsageOverview
              creditsUsed={balance.creditsUsedThisPeriod}
              monthlyCredits={balance.plan.monthlyCredits}
              breakdown={usage}
            />
          </div>
        </main>
      </div>
    </div>
  );
}

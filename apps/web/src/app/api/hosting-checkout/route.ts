import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import { auth } from "@/auth";
import { startHostingCheckout } from "@/lib/billing";

export async function POST(request: Request) {
  const session = await auth();
  if (!session?.apiToken) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const body = (await request.json().catch(() => null)) as { projectId?: string } | null;
  if (!body?.projectId) {
    return NextResponse.json({ error: "Missing projectId" }, { status: 400 });
  }

  try {
    const result = await startHostingCheckout(session.apiToken, body.projectId);
    (await cookies()).set("fsx_pending_payment", result.reference, {
      httpOnly: true,
      sameSite: "lax",
      maxAge: 60 * 30,
      path: "/",
    });
    return NextResponse.json({ redirectUrl: result.redirectUrl });
  } catch (error) {
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Failed to start checkout" },
      { status: 502 }
    );
  }
}

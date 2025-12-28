import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";

export async function GET(req: Request) {
  try {
    // forward headers so better-auth can read cookies
    const session = await auth.api.getSession({ headers: req.headers });

    if (!session) {
      return NextResponse.json({ authenticated: false });
    }

    return NextResponse.json({ authenticated: true, user: session.user });
  } catch {
    return NextResponse.json({ authenticated: false });
  }
}

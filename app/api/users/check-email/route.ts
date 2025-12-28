import prisma from "@/lib/db";
import { NextResponse } from "next/server";

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const email = body?.email;

    if (!email || typeof email !== "string") {
      return NextResponse.json(
        { message: "Email is required" },
        { status: 400 },
      );
    }

    const user = await prisma.user.findFirst({ where: { email } });

    if (!user) {
      return NextResponse.json({ exists: false, emailVerified: false });
    }

    return NextResponse.json({
      exists: true,
      emailVerified: !!user.emailVerified,
    });
  } catch {
    return NextResponse.json({ message: "Internal error" }, { status: 500 });
  }
}

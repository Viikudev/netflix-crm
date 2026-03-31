import prisma from "@/shared/lib/db";
import { NextResponse } from "next/server";

export async function GET() {
  try {
    const bankEarnings = await prisma.bankEarnings.findUnique({
      where: { id: 1 },
    });

    return NextResponse.json({
      total: bankEarnings?.total ?? 0,
      totalUsdt: bankEarnings?.totalUsdt ?? 0,
    });
  } catch (error) {
    console.error("Error fetching bank earnings:", error);
    return NextResponse.json({ message: "Internal error" }, { status: 500 });
  }
}
